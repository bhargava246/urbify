// @ts-nocheck
"use client";
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { reverseGeocode, autocomplete } from '@/lib/olamaps';
import {
  LISTINGS, CITIES, LOCALITIES, PHOTOS, INTERIORS, FURNISHING, FACINGS, AMENITIES,
  furnishingLabel, facingLabel, ageLabel, postedLabel, normalizeApiListing,
  AppDataContext, useAppData, OlaMap,
  Icon, Logo, Img, LockedAddress, ListingCard, Modal,
  PortalShell, StatCard, StatusBadge, DashHeader,
} from '../_shared';
import { authFetch } from '@/lib/authFetch';

const OWNER_USER = { initials:"?", name:"Loading…", role:"Owner", color:'var(--brand-500)' };

// Badges are passed dynamically from real data — no hardcoded numbers
const OWNER_NAV = (listingCount?: number, inquiryCount?: number) => [
  { id:'ownerDash',     label:'Dashboard',   icon:'◧' },
  { id:'ownerList',     label:'My listings', icon:'⊞', ...(listingCount ? {badge:String(listingCount)} : {}) },
  { id:'ownerInquiries',label:'Inquiries',   icon:'◐', ...(inquiryCount ? {badge:String(inquiryCount), badgeTone:'danger'} : {}) },
  { id:'ownerNew',      label:'Add listing', icon:'＋' },
  { divider:'account' },
  { id:'settings', label:'Settings', icon:'⚙' },
  { id:'home', label:'Back to site', icon:'↗' },
];

// ─── Owner listing view / edit modal ──────────────────────────────────────
// Shown when an owner clicks "View" on one of their own listings. Used to
// just redirect straight to the public listing page (the same page a
// prospective tenant sees) — instead it now shows the listing's own details
// with an in-place "Edit listing" mode that PATCHes /properties/:id.
function OwnerListingModal({ listing, onClose, onSaved }) {
  const raw = listing.raw || listing;
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: raw.title || '',
    description: raw.description || '',
    rentOrPrice: raw.rentOrPrice || 0,
    securityDeposit: raw.securityDeposit ?? 0,
    isNegotiable: !!raw.isNegotiable,
    availableFrom: raw.availableFrom ? new Date(raw.availableFrom).toISOString().slice(0, 10) : '',
    furnishingStatus: raw.furnishingStatus || 'UNFURNISHED',
    bhk: raw.bhk || 1,
    areaSqFt: raw.areaSqFt || 0,
    facing: raw.facing || '',
    propertyAge: raw.propertyAge ?? 0,
    floor: raw.floor ?? '',
    totalFloors: raw.totalFloors ?? '',
  });
  const patch = (p) => setForm(f => ({ ...f, ...p }));

  const handleSave = async () => {
    if (!form.title || form.title.trim().length < 10) {
      setError('Title must be at least 10 characters.'); return;
    }
    if (!form.description || !form.description.trim()) {
      setError('Description cannot be empty.'); return;
    }
    if (!form.rentOrPrice || +form.rentOrPrice <= 0) {
      setError('Rent / price must be greater than 0.'); return;
    }
    if (!form.areaSqFt || +form.areaSqFt < 100) {
      setError('Carpet area must be at least 100 sq ft.'); return;
    }
    setError('');
    setSaving(true);
    try {
      const res = await authFetch(`/api/v1/properties/${raw.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim(),
          rentOrPrice: +form.rentOrPrice || 0,
          securityDeposit: form.securityDeposit === '' ? undefined : +form.securityDeposit,
          isNegotiable: form.isNegotiable,
          availableFrom: form.availableFrom || undefined,
          furnishingStatus: form.furnishingStatus || undefined,
          bhk: +form.bhk || undefined,
          areaSqFt: +form.areaSqFt || undefined,
          facing: form.facing || undefined,
          propertyAge: form.propertyAge === '' ? undefined : +form.propertyAge,
          floor: form.floor === '' ? undefined : +form.floor,
          totalFloors: form.totalFloors === '' ? undefined : +form.totalFloors,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.message || 'Failed to update listing');
      onSaved?.();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} width={680} padding={28}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
        <div>
          <div className="font-display" style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' }}>
            {editing ? 'Edit listing' : (listing.title || `${listing.bhk} BHK · ${listing.locality}`)}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>ID {raw.id}</div>
        </div>
        <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ padding: '4px 10px' }}>✕</button>
      </div>

      {error && (
        <div style={{ marginBottom: 16, padding: '10px 14px', background: '#fef2f2', borderRadius: 'var(--r-md)', fontSize: 13, color: 'var(--danger)' }}>
          {error}
        </div>
      )}

      {!editing ? (
        <div>
          <Img src={listing.photo} style={{ width: '100%', aspectRatio: '16/8', borderRadius: 'var(--r-md)', marginBottom: 16, objectFit: 'cover' }} />
          <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
            <StatusBadge status={listing.status} />
            <span className="chip">{listing.bhk} BHK</span>
            <span className="chip">{listing.area} sq ft</span>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em' }}>
            ₹{(raw.rentOrPrice || 0).toLocaleString('en-IN')}
            <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>/mo</span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{listing.locality}{listing.city ? `, ${listing.city}` : ''}</div>
          {raw.description && <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--text)', marginTop: 16 }}>{raw.description}</p>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16, fontSize: 13 }}>
            <div><span style={{ color: 'var(--text-muted)' }}>Security deposit</span><div style={{ fontWeight: 600, marginTop: 2 }}>₹{(raw.securityDeposit || 0).toLocaleString('en-IN')}</div></div>
            <div><span style={{ color: 'var(--text-muted)' }}>Furnishing</span><div style={{ fontWeight: 600, marginTop: 2 }}>{listing.furnishing || '—'}</div></div>
            <div><span style={{ color: 'var(--text-muted)' }}>Facing</span><div style={{ fontWeight: 600, marginTop: 2 }}>{raw.facing || '—'}</div></div>
            <div><span style={{ color: 'var(--text-muted)' }}>Available from</span><div style={{ fontWeight: 600, marginTop: 2 }}>{listing.available || '—'}</div></div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 24, paddingTop: 18, borderTop: '1px solid var(--border)' }}>
            <button className="btn btn-outline" onClick={onClose}>Close</button>
            <button className="btn btn-brand" onClick={() => setEditing(true)}>Edit listing</button>
          </div>
        </div>
      ) : (
        <div>
          <Field label="Title">
            <input className="input" value={form.title} onChange={e => patch({ title: e.target.value })} />
          </Field>
          <Field label="Description" style={{ marginTop: 14 }}>
            <textarea className="input" rows={3} value={form.description} onChange={e => patch({ description: e.target.value })} style={{ height: 'auto', padding: '12px 14px', resize: 'vertical', lineHeight: 1.5 }} />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 14 }}>
            <Field label="Monthly rent / price (₹)">
              <input className="input" type="number" value={form.rentOrPrice} onChange={e => patch({ rentOrPrice: e.target.value })} />
            </Field>
            <Field label="Security deposit (₹)">
              <input className="input" type="number" value={form.securityDeposit} onChange={e => patch({ securityDeposit: e.target.value })} />
            </Field>
            <Field label="BHK">
              <input className="input" type="number" min={1} max={10} value={form.bhk} onChange={e => patch({ bhk: e.target.value })} />
            </Field>
            <Field label="Carpet area (sq ft)">
              <input className="input" type="number" value={form.areaSqFt} onChange={e => patch({ areaSqFt: e.target.value })} />
            </Field>
            <Field label="Furnishing">
              <select className="input select" value={form.furnishingStatus} onChange={e => patch({ furnishingStatus: e.target.value })}>
                <option value="UNFURNISHED">Unfurnished</option>
                <option value="SEMI_FURNISHED">Semi-furnished</option>
                <option value="FULLY_FURNISHED">Fully furnished</option>
              </select>
            </Field>
            <Field label="Facing">
              <select className="input select" value={form.facing || ''} onChange={e => patch({ facing: e.target.value })}>
                <option value="">— Select —</option>
                <option value="EAST">East</option><option value="WEST">West</option><option value="NORTH">North</option><option value="SOUTH">South</option>
              </select>
            </Field>
            <Field label="Available from">
              <input className="input" type="date" value={form.availableFrom} onChange={e => patch({ availableFrom: e.target.value })} />
            </Field>
            <Field label="Negotiable?">
              <select className="input select" value={form.isNegotiable ? 'yes' : 'no'} onChange={e => patch({ isNegotiable: e.target.value === 'yes' })}>
                <option value="no">No</option><option value="yes">Yes</option>
              </select>
            </Field>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 24, paddingTop: 18, borderTop: '1px solid var(--border)' }}>
            <button className="btn btn-outline" onClick={() => { setEditing(false); setError(''); }} disabled={saving}>Cancel</button>
            <button className="btn btn-brand" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
          </div>
        </div>
      )}
    </Modal>
  );
}

// ─── Owner Dashboard ──────────────────────────────────────────────────────
function OwnerDashPage({nav}) {
  const { authUser } = useAppData();
  const [myListings, setMyListings] = useState([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [viewListing, setViewListing] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  const loadListings = useCallback(() => {
    if (!localStorage.getItem('urb_access')) { setLoadingListings(false); return; }
    authFetch('/api/v1/properties/my/listings')
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        const arr = Array.isArray(data) ? data : (data.data || []);
        setMyListings(arr.map(l => ({
          ...normalizeApiListing(l),
          // Keep the raw DB record too — normalizeApiListing only keeps
          // display-friendly fields, but the edit form needs the originals
          // (rentOrPrice, securityDeposit, furnishingStatus, etc.).
          raw: l,
          status: l.status === 'ACTIVE' ? 'live' : l.status === 'PENDING_REVIEW' ? 'pending' : l.status === 'RENTED' ? 'rented' : 'paused',
          unlocks: l.unlockCount || 0,
          daysLeft: l.expiresAt ? Math.max(0, Math.ceil((new Date(l.expiresAt) - Date.now()) / 86400000)) : '—',
        })));
      })
      .catch(() => {})
      .finally(() => setLoadingListings(false));
  }, []);

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  const handleTogglePause = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'paused' ? 'ACTIVE' : 'PAUSED';
    try {
      const res = await authFetch(`/api/v1/properties/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) loadListings();
    } catch(e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    try {
      const res = await authFetch(`/api/v1/properties/${id}`, { method: 'DELETE' });
      if (res.ok) loadListings();
    } catch(e) { console.error(e); }
  };

  const handleExport = () => {
    const headers = ['ID', 'Property', 'Status', 'Unlocks', 'Days Left', 'Rent (₹/mo)'];
    const rows = myListings.map(l => [
      l.id,
      `${l.bhk} BHK · ${l.locality}`,
      l.status,
      l.unlocks,
      l.daysLeft,
      l.raw?.rentOrPrice || 0,
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'my-listings.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const userName = authUser?.ownerProfile?.fullName || authUser?.brokerProfile?.fullName || 'there';
  const firstName = userName.split(' ')[0];
  const activeCount = myListings.filter(l => l.status === 'live').length;
  const unlocksThisMonth = myListings.reduce((s, l) => s + (l.unlocks || 0), 0);
  const expiringCount = myListings.filter(l => typeof l.daysLeft === 'number' && l.daysLeft <= 3).length;
  const filteredListings = statusFilter === 'all' ? myListings : myListings.filter(l => l.status === statusFilter);

  const navItems = OWNER_NAV(myListings.length || undefined, undefined);
  const portalUser = authUser ? {
    initials: firstName.slice(0,2).toUpperCase(),
    name: userName,
    role: 'Direct Owner',
    color: 'var(--brand-500)',
    avatarUrl: authUser.avatarUrl || null,
  } : OWNER_USER;

  return (
    <>
    <PortalShell user={portalUser} navItems={navItems} current="ownerDash" onNav={(id)=>nav(id)}>
      <DashHeader
        title={`Welcome back, ${firstName}.`}
        subtitle="Here's how your listings are doing."
        actions={
          <>
            <button className="btn btn-outline btn-sm" onClick={handleExport} disabled={myListings.length === 0}>Export CSV</button>
            <button className="btn btn-brand btn-sm" onClick={()=>nav('ownerNew')}>＋ New listing</button>
          </>
        }/>

      <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:14, marginBottom:24}}>
        <StatCard label="Active listings" value={loadingListings ? '…' : String(activeCount)} sub="this month"/>
        <StatCard label="Unlocks total" value={loadingListings ? '…' : String(unlocksThisMonth)} sub="all listings"/>
        <StatCard label="Total listings" value={loadingListings ? '…' : String(myListings.length)} sub="lifetime"/>
        <StatCard label="Expiring soon" value={loadingListings ? '…' : String(expiringCount)} sub="renew within 3 days" color="var(--warning)"/>
      </div>

      {expiringCount > 0 && (
      <div className="card" style={{padding:18, background:'#FEF3C7', display:'flex', justifyContent:'space-between', alignItems:'center', border:0, marginBottom:24, gap:16}}>
        <div style={{display:'flex', alignItems:'center', gap:12}}>
          <div style={{width:36, height:36, borderRadius:'var(--r-sm)', background:'#FCD34D', color:'#78350F', display:'grid', placeItems:'center', fontSize:18}}><Icon.bolt/></div>
          <div>
            <div style={{fontSize:14, fontWeight:600, color:'#78350F'}}>{expiringCount} listing{expiringCount!==1?'s':''} expiring in 3 days.</div>
            <div style={{fontSize:12, color:'#92400E'}}>Renew now to keep them live and visible to new tenants.</div>
          </div>
        </div>
        <button className="btn btn-sm" style={{background:'#78350F', color:'#fff', border:0}} onClick={()=>nav('ownerList')}>View listings →</button>
      </div>
      )}

      {/* listings table */}
      <div className="card" style={{padding:0, overflow:'hidden'}}>
        <div style={{padding:'18px 22px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div className="font-display" style={{fontSize:18, fontWeight:700, letterSpacing:'-0.02em'}}>Your listings</div>
          <div style={{display:'flex', gap:6}}>
            {([['All','all'],['Live','live'],['Pending','pending'],['Rented','rented'],['Paused','paused']] as [string,string][]).map(([label, val])=>(
              <button key={val} className="chip" onClick={()=>setStatusFilter(val)} style={{cursor:'pointer', background:statusFilter===val?'var(--text)':'transparent', color:statusFilter===val?'var(--bg)':'var(--text)', border:statusFilter===val?0:'1px solid var(--border)'}}>{label}</button>
            ))}
          </div>
        </div>
        <table style={{width:'100%', borderCollapse:'collapse', fontSize:13}}>
          <thead>
            <tr style={{textAlign:'left', color:'var(--text-muted)', fontSize:11, textTransform:'uppercase', letterSpacing:'.08em', fontWeight:600}}>
              <th style={{padding:'12px 22px'}}>Property</th>
              <th style={{padding:'12px 22px'}}>Status</th>
              <th style={{padding:'12px 22px'}}>Unlocks</th>
              <th style={{padding:'12px 22px'}}>Days left</th>
              <th style={{padding:'12px 22px'}}>Rent</th>
              <th style={{padding:'12px 22px', textAlign:'right'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loadingListings ? (
              <tr><td colSpan={6} style={{padding:'32px 22px', textAlign:'center', color:'var(--text-muted)', fontSize:14}}>Loading…</td></tr>
            ) : filteredListings.length === 0 ? (
              <tr><td colSpan={6} style={{padding:'32px 22px', textAlign:'center', color:'var(--text-muted)', fontSize:14}}>
                {myListings.length === 0 ? 'No listings yet. Add your first listing to get started.' : `No ${statusFilter} listings.`}
              </td></tr>
            ) : filteredListings.map(l=>(
              <tr key={l.id} style={{borderTop:'1px solid var(--border)'}}>
                <td style={{padding:'14px 22px'}}>
                  <div style={{display:'flex', alignItems:'center', gap:12}}>
                    <Img src={l.photo} style={{width:48, height:48, borderRadius:'var(--r-sm)'}}/>
                    <div>
                      <div style={{fontWeight:600}}>{l.bhk} BHK · {l.locality}</div>
                      <div style={{fontSize:11, color:'var(--text-muted)'}}>ID {l.id} · {l.area} sq ft</div>
                    </div>
                  </div>
                </td>
                <td style={{padding:'14px 22px'}}><StatusBadge status={l.status}/></td>
                <td style={{padding:'14px 22px', fontWeight:600, fontVariantNumeric:'tabular-nums'}}>{l.unlocks}</td>
                <td style={{padding:'14px 22px', color: typeof l.daysLeft === 'number' && l.daysLeft <= 3 ? 'var(--warning)' : 'var(--text-muted)', fontVariantNumeric:'tabular-nums', fontWeight: typeof l.daysLeft === 'number' && l.daysLeft <= 3 ? 600 : 400}}>{l.daysLeft}</td>
                <td style={{padding:'14px 22px', fontWeight:600}}>₹{l.rentK}k</td>
                <td style={{padding:'14px 22px', textAlign:'right'}}>
                  <div style={{display:'inline-flex', gap:4}}>
                    <button className="btn btn-ghost btn-sm" onClick={()=>setViewListing(l)}>View</button>
                    {(l.status === 'live' || l.status === 'paused') && (
                      <button className="btn btn-outline btn-sm" onClick={() => handleTogglePause(l.id, l.status)}>{l.status === 'paused' ? 'Resume' : 'Pause'}</button>
                    )}
                    <button className="btn btn-outline btn-sm" style={{color:'var(--danger)', borderColor:'var(--danger)'}} onClick={() => handleDelete(l.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* activity feed — built from real listings data */}
      <div style={{marginTop:24}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:14}}>
          <div className="font-display" style={{fontSize:18, fontWeight:700, letterSpacing:'-0.02em'}}>Recent activity</div>
          <button className="btn btn-ghost btn-sm" onClick={()=>nav('ownerInquiries')}>View all</button>
        </div>
        <div className="card" style={{padding:0, overflow:'hidden'}}>
          {myListings.length === 0 ? (
            <div style={{padding:'32px 22px', textAlign:'center', color:'var(--text-muted)', fontSize:14}}>
              {loadingListings ? 'Loading…' : 'No activity yet. Add your first listing to get started.'}
            </div>
          ) : (
            myListings.slice(0,5).map((l, i)=>(
              <div key={l.id} style={{padding:'14px 22px', borderTop: i===0 ? 0 : '1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center', gap:14}}>
                <div style={{display:'flex', alignItems:'center', gap:12, fontSize:14}}>
                  <div style={{width:34, height:34, borderRadius:'50%', background:'var(--surface-sunken)', display:'grid', placeItems:'center', fontSize:14}}>
                    {l.status === 'live' ? <Icon.unlock/> : <Icon.bolt/>}
                  </div>
                  <div>
                    <span style={{fontWeight:600}}>{l.bhk} BHK · {l.locality}</span>
                    <span style={{color:'var(--text-muted)'}}> — </span>
                    <span style={{color:'var(--text-muted)'}}>
                      {l.status === 'live' ? `Live · ${l.unlocks || 0} unlock${l.unlocks !== 1 ? 's' : ''}` :
                       l.status === 'pending' ? 'Pending review' :
                       l.status === 'rented' ? 'Rented / sold' : 'Paused'}
                    </span>
                    <div style={{fontSize:11, color:'var(--text-faint)', marginTop:2}}>₹{l.rentK}k/mo</div>
                  </div>
                </div>
                <StatusBadge status={l.status}/>
              </div>
            ))
          )}
        </div>
      </div>
    </PortalShell>
    {viewListing && (
      <OwnerListingModal
        listing={viewListing}
        onClose={()=>setViewListing(null)}
        onSaved={()=>{ setViewListing(null); loadListings(); }}
      />
    )}
    </>
  );
}

// ─── Owner Listings ───────────────────────────────────────────────────────
function OwnerListPage({nav}) {
  const { authUser } = useAppData();
  const [myListings, setMyListings] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [viewListing, setViewListing] = useState(null);

  const loadListings = useCallback(() => {
    const token = localStorage.getItem('urb_access');
    if (!token) { setLoadingList(false); return; }
    authFetch('/api/v1/properties/my/listings')
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        const arr = Array.isArray(data) ? data : (data.data || []);
        setMyListings(arr.map(l => ({
          ...normalizeApiListing(l),
          raw: l,
          status: l.status === 'ACTIVE' ? 'live' : l.status === 'PENDING_REVIEW' ? 'pending' : l.status === 'RENTED' ? 'rented' : l.status === 'EXPIRED' ? 'expired' : 'paused',
          unlocks: l.unlockCount || 0,
          viewCount: l.viewCount || 0,
        })));
      })
      .catch(() => {})
      .finally(() => setLoadingList(false));
  }, []);

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  const handleTogglePause = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'paused' ? 'ACTIVE' : 'PAUSED';
    try {
      const res = await authFetch(`/api/v1/properties/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) loadListings();
    } catch(e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    try {
      const res = await authFetch(`/api/v1/properties/${id}`, { method: 'DELETE' });
      if (res.ok) loadListings();
    } catch(e) { console.error(e); }
  };

  const firstName = authUser?.ownerProfile?.fullName?.split(' ')[0] || authUser?.brokerProfile?.fullName?.split(' ')[0] || '';
  const portalUser = authUser ? {
    initials: (firstName || 'U').slice(0,2).toUpperCase(),
    name: authUser?.ownerProfile?.fullName || authUser?.brokerProfile?.fullName || 'User',
    role: 'Direct Owner',
    color: 'var(--brand-500)',
  } : OWNER_USER;

  return (
    <>
    <PortalShell user={portalUser} navItems={OWNER_NAV()} current="ownerList" onNav={(id)=>nav(id)}>
      <DashHeader title="My listings"
        subtitle={loadingList ? 'Loading…' : `${myListings.length} listings · ${myListings.filter(l=>l.status==='live').length} live`}
        actions={<button className="btn btn-brand btn-sm" onClick={()=>nav('ownerNew')}>＋ New listing</button>}/>

      <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:16}}>
        {myListings.map(l=>(
          <div key={l.id} className="card" style={{padding:0, overflow:'hidden'}}>
            <div style={{position:'relative'}}>
              <Img src={l.photo} style={{aspectRatio:'5/3'}}/>
              <div style={{position:'absolute', top:10, left:10}}><StatusBadge status={l.status}/></div>
            </div>
            <div style={{padding:16}}>
              <div className="font-display" style={{fontSize:16, fontWeight:700, letterSpacing:'-0.02em'}}>{l.bhk} BHK · {l.locality}</div>
              <div style={{fontSize:12, color:'var(--text-muted)', marginTop:2}}>ID {l.id} · ₹{l.rentK}k/mo</div>

              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginTop:14, fontSize:11, color:'var(--text-muted)'}}>
                <div><div style={{fontSize:18, fontWeight:700, color:'var(--text)'}}>{l.unlocks ?? 0}</div>unlocks</div>
                <div><div style={{fontSize:18, fontWeight:700, color:'var(--text)'}}>{l.viewCount ?? l.pop ?? 0}</div>views</div>
                <div><div style={{fontSize:18, fontWeight:700, color:'var(--text)'}}>{l.raw?.shortlistCount ?? 0}</div>shortlists</div>
              </div>

              <div style={{display:'flex', gap:6, marginTop:14}}>
                <button className="btn btn-outline btn-sm" onClick={() => setViewListing(l)} style={{flex:1}}>View</button>
                <button className="btn btn-outline btn-sm" onClick={() => handleTogglePause(l.id, l.status)} style={{flex:1}}>{l.status === 'paused' ? 'Resume' : 'Pause'}</button>
                <button className="btn btn-outline btn-sm" onClick={() => handleDelete(l.id)} style={{flex:1, color:'var(--danger)', borderColor:'var(--danger)'}}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </PortalShell>
    {viewListing && (
      <OwnerListingModal
        listing={viewListing}
        onClose={()=>setViewListing(null)}
        onSaved={()=>{ setViewListing(null); loadListings(); }}
      />
    )}
    </>
  );
}

// ─── Owner Inquiries ──────────────────────────────────────────────────────
function OwnerInquiriesPage({nav, navItems: navItemsProp = null, navCurrent = 'ownerInquiries', roleLabel = 'Direct Owner'}) {
  const { authUser } = useAppData();
  const _ownerName = authUser?.ownerProfile?.fullName || authUser?.brokerProfile?.fullName || 'Owner';
  const _ownerInitials = _ownerName.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
  const portalUser = { initials: _ownerInitials, name: _ownerName, role: roleLabel, color: 'var(--brand-500)' };
  const navItems = navItemsProp || OWNER_NAV();

  const [inquiries, setInquiries] = useState([]);
  const [loadingInquiries, setLoadingInquiries] = useState(true);
  const [viewListing, setViewListing] = useState(null);
  const [markingRead, setMarkingRead] = useState(false);

  const formatWhen = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    const now = Date.now();
    const diff = now - d.getTime();
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const maskPhone = (phone) => {
    if (!phone) return 'Tenant';
    const s = String(phone);
    if (s.length <= 4) return s;
    return s.slice(0, -4).replace(/\d/g, '•') + s.slice(-4);
  };

  const normalizeUnlock = (item) => ({
    kind: 'unlock',
    who: item.user?.name || maskPhone(item.user?.phone) || 'Tenant',
    listing: {
      photo: item.property?.photos?.[0] || '',
      bhk: item.property?.bhk ?? '?',
      locality: item.property?.locality || '—',
      id: item.propertyId || item.property?.id,
    },
    when: formatWhen(item.createdAt),
    amount: item.amount,
    propertyId: item.propertyId || item.property?.id,
    raw: item,
  });

  useEffect(() => {
    setLoadingInquiries(true);
    if (!localStorage.getItem('urb_access')) { setLoadingInquiries(false); return; }
    authFetch('/api/v1/properties/my/unlocks')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        const arr = Array.isArray(data) ? data : (data?.items || data?.data || []);
        setInquiries(arr.map(normalizeUnlock));
      })
      .catch(() => setInquiries([]))
      .finally(() => setLoadingInquiries(false));
  }, []);

  const handleMarkAllRead = async () => {
    setMarkingRead(true);
    try {
      await authFetch('/api/v1/notifications/read-all', { method: 'POST' });
    } catch(e) { console.error(e); }
    finally { setMarkingRead(false); }
  };

  const handleViewListing = async (propertyId) => {
    if (!propertyId) return;
    try {
      const res = await authFetch(`/api/v1/properties/${propertyId}`);
      if (res.ok) {
        const body = await res.json();
        const raw = body?.data ?? body;
        setViewListing({
          ...normalizeApiListing(raw),
          raw,
          status: raw.status === 'ACTIVE' ? 'live' : raw.status === 'PENDING_REVIEW' ? 'pending' : raw.status === 'RENTED' ? 'rented' : 'paused',
        });
      }
    } catch(e) { console.error(e); }
  };

  const items = inquiries;
  return (
    <>
    <PortalShell user={portalUser} navItems={navItems} current={navCurrent} onNav={(id)=>nav(id)}>
      <DashHeader title="Inquiries"
        subtitle={`${items.length} unlock${items.length !== 1 ? 's' : ''} on your listings.`}
        actions={<button className="btn btn-outline btn-sm" onClick={handleMarkAllRead} disabled={markingRead}>{markingRead ? 'Marking…' : 'Mark all read'}</button>}/>

      <div className="card" style={{padding:0, overflow:'hidden'}}>
        {loadingInquiries ? (
          <div style={{padding:'32px 22px', textAlign:'center', color:'var(--text-muted)', fontSize:14}}>Loading inquiries…</div>
        ) : items.length === 0 ? (
          <div style={{padding:'32px 22px', textAlign:'center', color:'var(--text-muted)', fontSize:14}}>No inquiries yet.</div>
        ) : items.map((a, i)=>(
          <div key={i} style={{padding:'18px 22px', borderTop: i===0 ? 0 : '1px solid var(--border)', display:'flex', alignItems:'center', gap:14}}>
            <div style={{width:42, height:42, borderRadius:'50%', display:'grid', placeItems:'center',
              background: a.kind==='unlock' ? 'var(--brand-500)' : 'var(--surface-sunken)',
              color: a.kind==='unlock' ? '#fff' : 'var(--text)',
              fontSize:16,
            }}>{a.kind==='unlock' ? <Icon.unlock/> : a.kind==='shortlist' ? <Icon.heart filled/> : '👁'}</div>
            <Img src={a.listing.photo} style={{width:54, height:54, borderRadius:'var(--r-sm)'}}/>
            <div style={{flex:1, minWidth:0}}>
              <div style={{fontSize:14}}>
                <span style={{fontWeight:600, fontFamily:'var(--f-mono)'}}>{a.who}</span>
                <span style={{color:'var(--text-muted)'}}> {a.kind==='unlock' ? 'unlocked' : a.kind==='shortlist' ? 'shortlisted' : 'viewed'} </span>
                <span style={{fontWeight:600}}>{a.listing.bhk} BHK in {a.listing.locality}</span>
              </div>
              <div style={{fontSize:11, color:'var(--text-faint)', marginTop:2}}>{a.when}</div>
            </div>
            {a.amount && <div style={{fontWeight:700, color:'var(--success)', fontSize:15}}>+₹{a.amount.toLocaleString("en-IN")}</div>}
            <button className="btn btn-outline btn-sm" onClick={()=>handleViewListing(a.propertyId)}>View →</button>
          </div>
        ))}
      </div>
    </PortalShell>
    {viewListing && (
      <OwnerListingModal
        listing={viewListing}
        onClose={()=>setViewListing(null)}
        onSaved={()=>setViewListing(null)}
      />
    )}
    </>
  );
}

// ─── Create Listing wizard ────────────────────────────────────────────────
function OwnerNewPage({nav}) {
  const { authUser } = useAppData();
  const _ownerName2 = authUser?.ownerProfile?.fullName || authUser?.brokerProfile?.fullName || 'Owner';
  const _ownerInitials2 = _ownerName2.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
  const portalUser = { initials: _ownerInitials2, name: _ownerName2, role: 'Direct Owner', color: 'var(--brand-500)' };

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  // Photos are uploaded to S3 immediately (for instant preview) by StepPhotos,
  // but the listing doesn't exist yet at that point — so we hold onto the
  // resulting {key, url} pairs here and attach them to the listing once it's
  // created in handleSubmit. Without this, uploads succeed but never get
  // linked to any listing in the DB.
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const steps = ["Type","Details","Location","Pricing","Photos","Review"];

  // Shared form state — all steps read/write here
  const [formData, setFormData] = useState({
    listingType: 'RESIDENTIAL_RENTAL',
    bhk: 2,
    areaSqFt: 1200,
    floor: null,
    totalFloors: null,
    furnishingStatus: 'UNFURNISHED',
    propertyAge: 0,
    facing: null,
    propertySubType: 'apartment',
    availableFrom: new Date().toISOString().slice(0,10),
    rentOrPrice: 35000,
    securityDeposit: 70000,
    isNegotiable: false,
    amenities: [],
    location: {},
    tourUrl: '',
  });
  const patchForm = (patch) => setFormData(f => ({...f, ...patch}));

  const handleSubmit = async () => {
    setSubmitError(''); setSubmitting(true);
    const token = localStorage.getItem('urb_access');
    if (!token) { window.location.href = '/auth'; return; }

    const loc = formData.location || {};
    const payload = {
      listingType:      formData.listingType,
      locality:         loc.locality || 'Unknown',
      city:             loc.city     || 'Bangalore',
      state:            loc.state    || 'Karnataka',
      pincode:          loc.pincode  || '560001',
      fullAddress:      loc.fullAddress || loc.locality || 'Address not specified',
      latitude:         loc.lat  || undefined,
      longitude:        loc.lng  || undefined,
      landmark:         loc.landmark || undefined,
      title:            `${formData.bhk} BHK ${formData.propertySubType} for ${formData.listingType === 'RESIDENTIAL_RENTAL' ? 'Rent' : 'Sale'} in ${loc.locality || 'Bangalore'}`,
      description:      `Spacious ${formData.bhk} BHK ${formData.propertySubType} in ${loc.locality || 'Bangalore'}. ${formData.furnishingStatus?.replace(/_/g,' ')}. Available from ${formData.availableFrom}.`,
      propertySubType:  formData.propertySubType,
      bhk:              formData.bhk,
      areaSqFt:         formData.areaSqFt,
      floor:            formData.floor || undefined,
      totalFloors:      formData.totalFloors || undefined,
      furnishingStatus: formData.furnishingStatus || undefined,
      facing:           formData.facing || undefined,
      propertyAge:      formData.propertyAge ?? undefined,
      rentOrPrice:      formData.rentOrPrice,
      securityDeposit:  formData.securityDeposit || undefined,
      availableFrom:    formData.availableFrom,
      isNegotiable:     formData.isNegotiable,
      amenities:        formData.amenities,
    };

    try {
      const res = await authFetch('/api/v1/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const raw = await res.json();
      const data = raw?.data ?? raw;
      if (!res.ok) throw new Error(raw.message || data.message || 'Failed to create listing');

      // Attach any photos uploaded during the Photos step to the new listing.
      const readyPhotos = uploadedPhotos.filter(p => p.url && p.key);
      if (data?.id && readyPhotos.length) {
        try {
          await authFetch(`/api/v1/properties/${data.id}/photos/attach`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              photos: readyPhotos.map(p => ({ s3Key: p.key, s3Url: p.url })),
            }),
          });
        } catch {
          // Listing is already created; don't block navigation on a photo-attach hiccup.
        }
      }

      // listing created — navigate to dashboard
      nav('ownerDash');
    } catch(e) {
      setSubmitError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PortalShell user={portalUser} navItems={OWNER_NAV()} current="ownerNew" onNav={(id)=>nav(id)}>
      <DashHeader title="New listing"
        subtitle={`Step ${step+1} of ${steps.length} · ${steps[step]}`}/>

      {/* progress bar */}
      <div style={{display:'grid', gridTemplateColumns:`repeat(${steps.length}, 1fr)`, gap:6, marginBottom:32}}>
        {steps.map((s, i)=>(
          <div key={s} onClick={()=>i < step && setStep(i)} style={{cursor: i < step ? 'pointer' : 'default'}}>
            <div style={{height:4, background: i <= step ? 'var(--text)' : 'var(--border)', borderRadius:99}}/>
            <div style={{fontSize:11, marginTop:8, fontWeight:600, color: i <= step ? 'var(--text)' : 'var(--text-muted)'}}>0{i+1} · {s}</div>
          </div>
        ))}
      </div>

      {submitError && (
        <div style={{marginBottom:16, padding:'12px 16px', background:'#fef2f2', borderRadius:'var(--r-md)', fontSize:13, color:'var(--danger)'}}>
          {submitError}
        </div>
      )}

      <div className="card" style={{padding:36, maxWidth:880}}>
        {step === 0 && <StepType formData={formData} patchForm={patchForm} onNext={()=>setStep(1)}/>}
        {step === 1 && <StepDetails formData={formData} patchForm={patchForm} onNext={()=>setStep(2)} onBack={()=>setStep(0)}/>}
        {step === 2 && <StepLocation onNext={()=>setStep(3)} onBack={()=>setStep(1)} formData={formData} setFormData={setFormData}/>}
        {step === 3 && <StepPricing formData={formData} patchForm={patchForm} onNext={()=>setStep(4)} onBack={()=>setStep(2)}/>}
        {step === 4 && <StepPhotos onNext={()=>setStep(5)} onBack={()=>setStep(3)} photos={uploadedPhotos} setPhotos={setUploadedPhotos} formData={formData} patchForm={patchForm}/>}
        {step === 5 && <StepReview formData={formData} onNext={handleSubmit} onBack={()=>setStep(4)} submitting={submitting}/>}
      </div>
    </PortalShell>
  );
}

function WizardNav({onBack, onNext, nextLabel = "Continue"}) {
  return (
    <div style={{display:'flex', justifyContent:'space-between', marginTop:32, paddingTop:24, borderTop:'1px solid var(--border)'}}>
      <button className="btn btn-outline" onClick={onBack} disabled={!onBack} style={{visibility: onBack ? 'visible' : 'hidden'}}>← Back</button>
      <button className="btn btn-brand" onClick={onNext}>{nextLabel} <Icon.arrow/></button>
    </div>
  );
}

function StepType({formData, patchForm, onNext}) {
  const typeMap = { 'res-rent':'RESIDENTIAL_RENTAL', 'com-rent':'COMMERCIAL_RENTAL', 'res-sale':'RESIDENTIAL_SALE', 'com-sale':'COMMERCIAL_SALE', 'land':'LAND', 'pg':'RESIDENTIAL_RENTAL' };
  const subTypeMap = { 'res-rent':'apartment', 'com-rent':'office', 'res-sale':'apartment', 'com-sale':'office', 'land':'land', 'pg':'pg' };
  const types = [
    { id:"res-rent", title:"Residential rental", sub:"Apartment, house, villa to let", emoji:"🏠" },
    { id:"com-rent", title:"Commercial rental", sub:"Office, shop, warehouse", emoji:"🏢" },
    { id:"res-sale", title:"Residential sale", sub:"Sell a home or villa", emoji:"🏡" },
    { id:"com-sale", title:"Commercial sale", sub:"Sell a commercial space", emoji:"🏬" },
    { id:"land",     title:"Land / plot", sub:"Sell or lease land", emoji:"🌳" },
    { id:"pg",       title:"PG / hostel", sub:"Shared accommodation", emoji:"🛏" },
  ];
  const sel = Object.keys(typeMap).find(k => typeMap[k] === formData.listingType && subTypeMap[k] === formData.propertySubType) || 'res-rent';
  return (
    <div>
      <h2 className="font-display" style={{fontSize:24, fontWeight:700, letterSpacing:'-0.02em', margin:'0 0 6px'}}>What are you listing?</h2>
      <p className="muted" style={{margin:0, fontSize:14}}>Pick the category that fits best — you can change details later.</p>

      <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:12, marginTop:24}}>
        {types.map(t=>(
          <button key={t.id} onClick={()=>patchForm({ listingType: typeMap[t.id], propertySubType: subTypeMap[t.id] })} style={{
            padding:'22px 18px', borderRadius:'var(--r-md)',
            border:'1.5px solid', borderColor: sel===t.id ? 'var(--text)' : 'var(--border)',
            background: sel===t.id ? 'var(--surface-sunken)' : 'transparent',
            textAlign:'left', cursor:'pointer', font:'inherit', color:'var(--text)',
          }}>
            <div style={{fontSize:28}}>{t.emoji}</div>
            <div style={{marginTop:10, fontSize:15, fontWeight:700}}>{t.title}</div>
            <div style={{fontSize:12, color:'var(--text-muted)', marginTop:4}}>{t.sub}</div>
          </button>
        ))}
      </div>

      <WizardNav onNext={onNext}/>
    </div>
  );
}

function StepDetails({formData, patchForm, onNext, onBack}) {
  const [error, setError] = useState('');

  const handleNext = () => {
    if (!formData.areaSqFt || formData.areaSqFt < 100) {
      setError('Carpet area must be at least 100 sq ft.'); return;
    }
    if (formData.floor != null && formData.totalFloors != null && formData.floor > formData.totalFloors) {
      setError('Floor number cannot be greater than total floors.'); return;
    }
    if (!formData.availableFrom) {
      setError('Please pick an availability date.'); return;
    }
    setError('');
    onNext();
  };

  return (
    <div>
      <h2 className="font-display" style={{fontSize:24, fontWeight:700, letterSpacing:'-0.02em', margin:'0 0 6px'}}>Tell us about the property</h2>
      {error && <div style={{marginTop:14, padding:'10px 14px', background:'#fef2f2', borderRadius:'var(--r-md)', fontSize:13, color:'var(--danger)'}}>{error}</div>}

      <div style={{marginTop:20}}>
        <label style={{fontSize:12, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.08em'}}>Configuration</label>
        <div style={{display:'flex', gap:6, marginTop:8, flexWrap:'wrap'}}>
          {[1,2,3,4,"4+"].map(n=>{
            const v = n==='4+' ? 5 : n;
            const a = formData.bhk === v;
            return <button key={n} onClick={()=>patchForm({bhk:v})} style={{padding:'10px 16px', borderRadius:'var(--r-pill)', border:'1.5px solid', borderColor: a?'var(--text)':'var(--border)', background: a?'var(--text)':'transparent', color: a?'var(--bg)':'var(--text)', fontWeight:600, fontSize:13, cursor:'pointer'}}>{n} BHK</button>;
          })}
        </div>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginTop:24}}>
        <Field label="Carpet area">
          <div style={{display:'flex', alignItems:'center', gap:6}}>
            <input className="input" type="number" value={formData.areaSqFt} onChange={e=>patchForm({areaSqFt:+e.target.value||0})} style={{flex:1}}/>
            <span className="muted" style={{fontSize:13}}>sq ft</span>
          </div>
        </Field>
        <Field label="Total floors / your floor">
          <div style={{display:'flex', gap:8}}>
            <input className="input" type="number" value={formData.floor||''} onChange={e=>patchForm({floor:+e.target.value||null})} placeholder="Floor" style={{flex:1}}/>
            <input className="input" type="number" value={formData.totalFloors||''} onChange={e=>patchForm({totalFloors:+e.target.value||null})} placeholder="Total" style={{flex:1}}/>
          </div>
        </Field>
        <Field label="Facing">
          <select className="input select" value={formData.facing||''} onChange={e=>patchForm({facing:e.target.value||null})}>
            <option value="">— Select —</option>
            <option value="EAST">East</option><option value="WEST">West</option><option value="NORTH">North</option><option value="SOUTH">South</option>
          </select>
        </Field>
        <Field label="Property age (years)">
          <input className="input" type="number" value={formData.propertyAge??''} onChange={e=>patchForm({propertyAge:+e.target.value||0})} placeholder="0 = new construction"/>
        </Field>
        <Field label="Furnishing">
          <select className="input select" value={formData.furnishingStatus||'UNFURNISHED'} onChange={e=>patchForm({furnishingStatus:e.target.value})}>
            <option value="UNFURNISHED">Unfurnished</option>
            <option value="SEMI_FURNISHED">Semi-furnished</option>
            <option value="FULLY_FURNISHED">Fully furnished</option>
          </select>
        </Field>
        <Field label="Available from">
          <input className="input" type="date" value={formData.availableFrom} onChange={e=>patchForm({availableFrom:e.target.value})}/>
        </Field>
      </div>

      <WizardNav onBack={onBack} onNext={handleNext}/>
    </div>
  );
}

function StepLocation({onNext, onBack, formData, setFormData}) {
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const acTimer = useRef(null);

  const loc = formData?.location ?? {};
  const setLoc = (patch) => setFormData?.(f => ({ ...f, location: { ...f.location, ...patch } }));
  const [locError, setLocError] = useState('');

  const handleNext = () => {
    if (!loc.city || !loc.city.trim()) { setLocError('City is required.'); return; }
    if (!loc.state || !loc.state.trim()) { setLocError('State is required.'); return; }
    if (!loc.locality || !loc.locality.trim()) { setLocError('Locality / area is required.'); return; }
    if (!loc.pincode || !/^\d{6}$/.test(loc.pincode.trim())) { setLocError('Pincode must be a valid 6-digit number.'); return; }
    if (!loc.fullAddress || loc.fullAddress.trim().length < 10) { setLocError('Please enter the full address (at least 10 characters) — it stays encrypted and hidden from tenants.'); return; }
    setLocError('');
    onNext();
  };

  // ── GPS detect ───────────────────────────────────────────────────────────
  const detectLocation = async () => {
    setGpsError("");
    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser.");
      return;
    }
    setGpsLoading(true);
    try {
      const pos = await new Promise((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, rej, { timeout: 10000 })
      );
      const { latitude: lat, longitude: lng } = pos.coords;
      const geo = await reverseGeocode(lat, lng);
      setLoc({
        lat, lng,
        city: geo.city,
        locality: geo.locality,
        pincode: geo.pincode,
        state: geo.state,
        fullAddress: geo.fullAddress,
      });
    } catch (e) {
      setGpsError(
        e.code === 1
          ? "Location permission denied. Please allow access and try again."
          : "Could not detect location. Try again or enter manually."
      );
    } finally {
      setGpsLoading(false);
    }
  };

  // ── Locality autocomplete ────────────────────────────────────────────────
  const handleLocalityChange = (val) => {
    setLoc({ locality: val });
    clearTimeout(acTimer.current);
    if (val.length < 3) { setSuggestions([]); return; }
    acTimer.current = setTimeout(async () => {
      const results = await autocomplete(val);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    }, 350);
  };

  const pickSuggestion = (s) => {
    setLoc({
      locality: s.mainText,
      fullAddress: s.description,
      ...(s.lat && { lat: s.lat, lng: s.lng }),
    });
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // ── Pin drop on map ──────────────────────────────────────────────────────
  const handlePinDrop = useCallback(async (lat, lng) => {
    setLoc({ lat, lng });
    try {
      const geo = await reverseGeocode(lat, lng);
      setLoc({
        lat, lng,
        city: geo.city || loc.city,
        locality: geo.locality || loc.locality,
        pincode: geo.pincode || loc.pincode,
        state: geo.state || loc.state,
        fullAddress: geo.fullAddress || loc.fullAddress,
      });
    } catch (_) {}
  }, [loc.city, loc.locality, loc.pincode, loc.state, loc.fullAddress]);

  const mapCenter = (loc.lng && loc.lat) ? [loc.lng, loc.lat] : [77.6177, 12.9352];

  return (
    <div>
      <h2 className="font-display" style={{fontSize:24, fontWeight:700, letterSpacing:'-0.02em', margin:'0 0 6px'}}>Where is it located?</h2>
      <p className="muted" style={{margin:'0 0 20px', fontSize:14}}>Drop a pin or detect your GPS location to auto-fill the address.</p>
      {locError && <div style={{margin:'0 0 16px', padding:'10px 14px', background:'#fef2f2', borderRadius:'var(--r-md)', fontSize:13, color:'var(--danger)'}}>{locError}</div>}

      {/* GPS button */}
      <button
        onClick={detectLocation}
        disabled={gpsLoading}
        style={{
          display:'flex', alignItems:'center', gap:8, padding:'10px 18px',
          borderRadius:'var(--r-pill)', border:'1.5px solid var(--border-strong)',
          background:'var(--surface-sunken)', cursor:'pointer', font:'inherit',
          fontSize:13, fontWeight:600, color:'var(--text)', marginBottom:16,
          opacity: gpsLoading ? 0.6 : 1,
        }}
      >
        <span style={{fontSize:16}}>📍</span>
        {gpsLoading ? 'Detecting…' : 'Detect my location'}
      </button>
      {gpsError && <p style={{color:'#dc2626', fontSize:12, marginBottom:12, marginTop:-8}}>{gpsError}</p>}

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
        <Field label="City">
          <input
            className="input"
            value={loc.city || ''}
            onChange={e => setLoc({ city: e.target.value })}
            placeholder="e.g. Bangalore"
          />
        </Field>
        <Field label="State">
          <input
            className="input"
            value={loc.state || ''}
            onChange={e => setLoc({ state: e.target.value })}
            placeholder="e.g. Karnataka"
          />
        </Field>
      </div>

      <div style={{marginTop:16, position:'relative'}}>
        <Field label="Locality / Area">
          <input
            className="input"
            value={loc.locality || ''}
            onChange={e => handleLocalityChange(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            placeholder="e.g. Koramangala 4th Block"
            autoComplete="off"
          />
        </Field>
        {showSuggestions && suggestions.length > 0 && (
          <div style={{
            position:'absolute', top:'100%', left:0, right:0, zIndex:50,
            background:'var(--bg)', border:'1px solid var(--border)',
            borderRadius:'var(--r-md)', boxShadow:'0 8px 24px rgba(0,0,0,.1)',
            maxHeight:220, overflowY:'auto', marginTop:4,
          }}>
            {suggestions.map((s, i) => (
              <button
                key={s.placeId || i}
                onMouseDown={() => pickSuggestion(s)}
                style={{
                  display:'block', width:'100%', textAlign:'left',
                  padding:'10px 14px', border:0, borderBottom:'1px solid var(--border)',
                  background:'transparent', cursor:'pointer', font:'inherit',
                }}
              >
                <div style={{fontSize:13, fontWeight:600}}>{s.mainText}</div>
                <div style={{fontSize:11, color:'var(--text-muted)', marginTop:2}}>{s.secondaryText}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginTop:16}}>
        <Field label="Pincode">
          <input
            className="input"
            value={loc.pincode || ''}
            onChange={e => setLoc({ pincode: e.target.value })}
            placeholder="e.g. 560034"
            maxLength={6}
          />
        </Field>
        <Field label="Landmark (optional)">
          <input
            className="input"
            value={loc.landmark || ''}
            onChange={e => setLoc({ landmark: e.target.value })}
            placeholder="e.g. Near Forum Mall"
          />
        </Field>
      </div>

      <div style={{marginTop:16}}>
        <Field label="Full address (encrypted & hidden from tenants)">
          <textarea
            className="input"
            rows={3}
            value={loc.fullAddress || ''}
            onChange={e => setLoc({ fullAddress: e.target.value })}
            placeholder="Building no., street, locality, city, pincode"
            style={{height:'auto', padding:'12px 14px', resize:'vertical', lineHeight:1.5}}
          />
        </Field>
      </div>

      {/* Privacy callout */}
      <div style={{marginTop:14, padding:'14px 18px', background:'var(--brand-50)', borderRadius:'var(--r-md)', display:'flex', gap:14, alignItems:'flex-start'}}>
        <span style={{fontSize:18, color:'var(--brand-500)', marginTop:2}}><Icon.shield/></span>
        <div style={{fontSize:13, color:'var(--brand-900)', lineHeight:1.55}}>
          <strong>Your full address is encrypted and hidden.</strong> Tenants only see the locality name until they pay the platform fee. That's how we protect you from spam.
        </div>
      </div>

      {/* Live map with draggable pin */}
      <div style={{marginTop:20, height:280, borderRadius:'var(--r-md)', overflow:'hidden', border:'1px solid var(--border)'}}>
        <OlaMap
          center={mapCenter}
          zoom={15}
          draggablePin={true}
          onPinDrop={handlePinDrop}
          height={280}
        />
      </div>
      <p style={{fontSize:11, color:'var(--text-muted)', marginTop:6, textAlign:'center'}}>
        Drag the pin or click anywhere on the map to refine the location.
      </p>

      <WizardNav onBack={onBack} onNext={handleNext}/>
    </div>
  );
}

function StepPricing({formData, patchForm, onNext, onBack}) {
  const rent = formData.rentOrPrice || 0;
  const fee = Math.round((rent / 30) * 7.5 * 1.18);
  const [error, setError] = useState('');

  const handleNext = () => {
    if (!formData.rentOrPrice || formData.rentOrPrice <= 0) {
      setError('Monthly rent / price must be greater than 0.'); return;
    }
    if (formData.securityDeposit != null && formData.securityDeposit < 0) {
      setError('Security deposit cannot be negative.'); return;
    }
    setError('');
    onNext();
  };

  return (
    <div>
      <h2 className="font-display" style={{fontSize:24, fontWeight:700, letterSpacing:'-0.02em', margin:'0 0 6px'}}>Set your price</h2>
      {error && <div style={{marginTop:14, padding:'10px 14px', background:'#fef2f2', borderRadius:'var(--r-md)', fontSize:13, color:'var(--danger)'}}>{error}</div>}

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginTop:20}}>
        <Field label="Monthly rent (₹)">
          <div style={{display:'flex', alignItems:'center', gap:6}}>
            <span className="muted" style={{fontSize:14, fontWeight:600}}>₹</span>
            <input className="input" type="number" value={rent} onChange={e=>patchForm({rentOrPrice:+e.target.value||0})} style={{flex:1}}/>
          </div>
        </Field>
        <Field label="Security deposit (₹)">
          <div style={{display:'flex', alignItems:'center', gap:6}}>
            <span className="muted" style={{fontSize:14, fontWeight:600}}>₹</span>
            <input className="input" type="number" value={formData.securityDeposit||''} onChange={e=>patchForm({securityDeposit:+e.target.value||0})} style={{flex:1}}/>
          </div>
        </Field>
        <Field label="Negotiable?">
          <select className="input select" value={formData.isNegotiable?'yes':'no'} onChange={e=>patchForm({isNegotiable:e.target.value==='yes'})}>
            <option value="yes">Yes</option><option value="no">No</option>
          </select>
        </Field>
      </div>

      <div style={{marginTop:24, padding:'18px 22px', background:'var(--surface-sunken)', borderRadius:'var(--r-md)', display:'flex', justifyContent:'space-between', alignItems:'center', gap:18}}>
        <div>
          <div style={{fontSize:11, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.08em'}}>Platform fee (paid by tenant)</div>
          <div style={{fontSize:13, color:'var(--text-muted)', marginTop:4}}>You keep ₹{rent.toLocaleString('en-IN')} rent + ₹{(formData.securityDeposit||0).toLocaleString('en-IN')} deposit.</div>
        </div>
        <div style={{textAlign:'right'}}>
          <div style={{fontSize:11, color:'var(--text-muted)'}}>Tenant pays</div>
          <div className="font-display" style={{fontSize:28, fontWeight:800, letterSpacing:'-0.03em'}}>₹{fee.toLocaleString("en-IN")}</div>
        </div>
      </div>

      <WizardNav onBack={onBack} onNext={handleNext}/>
    </div>
  );
}

function StepPhotos({onNext, onBack, photos, setPhotos, formData = {}, patchForm = (_p) => {}}) {
  // photos/setPhotos are lifted to the parent wizard so the uploaded S3
  // keys/URLs survive into handleSubmit and get attached to the listing
  // once it's created. Shape: [{id, preview, file, uploading, url, key, error}]
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  const addFiles = async (files) => {
    const valid = Array.from(files).filter(f => {
      if (!['image/jpeg','image/png','image/webp'].includes(f.type)) return false;
      if (f.size > 8 * 1024 * 1024) return false;
      return true;
    });
    if (!valid.length) { setUploadError('Only JPG/PNG/WEBP under 8 MB accepted'); return; }
    setUploadError('');
    const token = localStorage.getItem('urb_access');

    const newPhotos = valid.map(f => ({
      id: Math.random().toString(36).slice(2),
      file: f,
      preview: URL.createObjectURL(f),
      uploading: true,
      url: null,
      error: null,
    }));
    setPhotos(p => [...p, ...newPhotos]);

    // Upload each file
    for (const photo of newPhotos) {
      try {
        const form = new FormData();
        form.append('file', photo.file);
        const res = await authFetch('/api/v1/uploads/image?folder=listings', {
          method:'POST', body:form,
        });
        const raw = await res.json();
        const uploaded = raw?.data ?? raw ?? {};
        const url = uploaded.s3Url;
        const key = uploaded.s3Key;
        setPhotos(p => p.map(ph => ph.id === photo.id ? {...ph, uploading:false, url, key} : ph));
      } catch(e) {
        setPhotos(p => p.map(ph => ph.id === photo.id ? {...ph, uploading:false, error:'Upload failed'} : ph));
      }
    }
  };

  const removePhoto = (id) => setPhotos(p => p.filter(ph => ph.id !== id));

  const handleDrop = (e) => { e.preventDefault(); addFiles(e.dataTransfer.files); };

  const uploadedCount = photos.filter(p => p.url).length;
  const stillUploading = photos.some(p => p.uploading);

  const handleNext = () => {
    if (stillUploading) { setUploadError('Please wait for all photos to finish uploading.'); return; }
    if (uploadedCount < 3) { setUploadError('Add at least 3 photos before continuing.'); return; }
    setUploadError('');
    onNext();
  };

  return (
    <div>
      <h2 className="font-display" style={{fontSize:24, fontWeight:700, letterSpacing:'-0.02em', margin:'0 0 6px'}}>Add photos</h2>
      <p className="muted" style={{margin:'0 0 20px', fontSize:14}}>
        Add at least 3 photos. Listings with more photos get 3× more unlocks.
        {uploadedCount > 0 && <strong style={{color:'var(--text)'}}> {uploadedCount} uploaded ✓</strong>}
      </p>

      {/* hidden file input */}
      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp"
        multiple style={{display:'none'}} onChange={e => addFiles(e.target.files)}/>

      <div
        style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:12}}
        onDragOver={e=>e.preventDefault()} onDrop={handleDrop}
      >
        {photos.map((ph, i) => (
          <div key={ph.id} style={{position:'relative', aspectRatio:'4/3', borderRadius:'var(--r-md)', overflow:'hidden', background:'var(--surface-sunken)'}}>
            <img src={ph.preview} style={{width:'100%', height:'100%', objectFit:'cover'}}/>
            {ph.uploading && (
              <div style={{position:'absolute', inset:0, background:'rgba(0,0,0,.45)', display:'grid', placeItems:'center', color:'#fff', fontSize:11, fontWeight:600}}>
                Uploading…
              </div>
            )}
            {ph.error && (
              <div style={{position:'absolute', inset:0, background:'rgba(220,38,38,.7)', display:'grid', placeItems:'center', color:'#fff', fontSize:11, fontWeight:600}}>
                Failed
              </div>
            )}
            {!ph.uploading && (
              <button onClick={()=>removePhoto(ph.id)} style={{position:'absolute', top:8, right:8, width:24, height:24, borderRadius:'50%', background:'rgba(15,22,20,.75)', color:'#fff', border:0, cursor:'pointer', fontSize:11}}>✕</button>
            )}
            {i === 0 && <span className="chip chip-dark" style={{position:'absolute', bottom:8, left:8, height:22, fontSize:10}}>COVER</span>}
          </div>
        ))}

        {/* Drop zone */}
        <button
          onClick={()=>fileInputRef.current?.click()}
          style={{
            aspectRatio:'4/3', borderRadius:'var(--r-md)',
            border:'2px dashed var(--border-strong)', background:'transparent',
            display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8,
            cursor:'pointer', color:'var(--text-muted)', fontSize:13, fontWeight:500,
          }}
        >
          <div style={{fontSize:24}}>＋</div>
          {photos.length === 0 ? 'Click or drop photos' : 'Add more'}
          <span style={{fontSize:11, color:'var(--text-faint)'}}>JPG, PNG · max 8MB each</span>
        </button>
      </div>

      {uploadError && <div style={{marginTop:10, fontSize:13, color:'var(--error)'}}>{uploadError}</div>}

      <div style={{marginTop:18, padding:'14px 18px', background:'var(--surface-sunken)', borderRadius:'var(--r-md)', display:'flex', gap:14, alignItems:'flex-start'}}>
        <span style={{fontSize:18, color:'var(--brand-500)', marginTop:2}}><Icon.sparkle/></span>
        <div style={{fontSize:13, lineHeight:1.55, color:'var(--text-muted)'}}>
          <strong style={{color:'var(--text)'}}>Tips:</strong> Use natural light, shoot from corners to show space, include kitchen, bathrooms, and any standout features like a balcony or garden.
        </div>
      </div>

      <Field label="Virtual tour link (optional)" style={{marginTop:24}}>
        <input className="input" placeholder="https://youtube.com/... or Matterport URL"
          value={formData.tourUrl || ''} onChange={e=>patchForm({tourUrl:e.target.value})}/>
      </Field>

      <WizardNav onBack={onBack} onNext={handleNext} nextLabel="Continue"/>
    </div>
  );
}

function StepReview({formData, onNext, onBack, submitting}) {
  const loc = formData.location || {};
  const [agreed, setAgreed] = useState(true);
  const [error, setError] = useState('');

  const handleNext = () => {
    if (!agreed) { setError("Please confirm you agree to Urbify's terms before submitting."); return; }
    setError('');
    onNext();
  };

  return (
    <div>
      <h2 className="font-display" style={{fontSize:24, fontWeight:700, letterSpacing:'-0.02em', margin:'0 0 6px'}}>Review & submit</h2>
      <p className="muted" style={{margin:'0 0 24px', fontSize:14}}>Last look before your listing goes to our moderation team. We review in &lt; 2 hours.</p>
      {error && <div style={{margin:'0 0 20px', padding:'10px 14px', background:'#fef2f2', borderRadius:'var(--r-md)', fontSize:13, color:'var(--danger)'}}>{error}</div>}

      <div style={{display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:18}}>
        <div className="card" style={{padding:20}}>
          <div style={{display:'flex', gap:8, marginBottom:10}}>
            <span className="chip chip-brand">Direct Owner</span>
            <span className="chip">Pending review</span>
          </div>
          <div className="font-display" style={{fontSize:20, fontWeight:800, letterSpacing:'-0.02em'}}>
            {formData.bhk} BHK · {loc.locality || 'Location not set'}
          </div>
          <div style={{display:'flex', gap:14, fontSize:13, color:'var(--text-muted)', marginTop:8, flexWrap:'wrap'}}>
            {formData.areaSqFt > 0 && <span>{formData.areaSqFt.toLocaleString('en-IN')} sq ft</span>}
            {formData.floor && <span>Floor {formData.floor}/{formData.totalFloors || '?'}</span>}
            {formData.facing && <span>{formData.facing}</span>}
            {formData.furnishingStatus && <span>{formData.furnishingStatus.replace(/_/g,' ')}</span>}
          </div>
          <div className="font-display" style={{fontSize:30, fontWeight:800, letterSpacing:'-0.03em', marginTop:14}}>
            ₹{(formData.rentOrPrice||0).toLocaleString('en-IN')}<span style={{fontSize:14, color:'var(--text-muted)', fontWeight:500}}>/mo</span>
          </div>
          <div style={{fontSize:12, color:'var(--text-muted)', marginTop:6}}>
            {loc.city && `${loc.city}, ${loc.state || ''} ${loc.pincode || ''}`}
          </div>
        </div>

        <div className="card" style={{padding:22}}>
          <div className="font-display" style={{fontSize:16, fontWeight:700, letterSpacing:'-0.02em'}}>What happens next?</div>
          <ol style={{paddingLeft:20, marginTop:14, marginBottom:0, display:'flex', flexDirection:'column', gap:10, fontSize:13, lineHeight:1.55, color:'var(--text-muted)'}}>
            <li>Submit for review</li>
            <li>A real human checks your listing (target &lt; 2 hrs)</li>
            <li>Listing goes live, visible to tenants</li>
            <li>You get a notification on every unlock</li>
          </ol>

          <label style={{display:'flex', alignItems:'flex-start', gap:10, marginTop:18, fontSize:12, color:'var(--text-muted)', cursor:'pointer'}}>
            <input type="checkbox" checked={agreed} onChange={e=>setAgreed(e.target.checked)} style={{marginTop:2}}/>
            I agree to Urbify's terms and confirm this property is mine to list.
          </label>
        </div>
      </div>

      <WizardNav onBack={onBack} onNext={handleNext} nextLabel={submitting ? 'Submitting…' : 'Submit for review'}/>
    </div>
  );
}

export function Field({label, children, style}: any) {
  return (
    <div style={style}>
      <label style={{fontSize:12, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.08em', display:'block', marginBottom:8}}>{label}</label>
      {children}
    </div>
  );
}


export { OwnerDashPage, OwnerListPage, OwnerInquiriesPage, OwnerNewPage };
