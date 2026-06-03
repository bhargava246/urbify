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

// ---- client-broker-pages.jsx ----
// client-broker-pages.jsx — Tenant/buyer dashboard + Broker portal

const CLIENT_USER = { initials:"?", name:"Loading…", role:"Tenant", color:'var(--accent-500)' };
const BROKER_USER = { initials:"?", name:"Loading…", role:"Broker", color:'var(--text)' };

const CLIENT_NAV = () => [
  { id:'clientDash',    label:'Dashboard',    icon:'◧' },
  { id:'clientShort',   label:'Shortlisted',  icon:'♡' },
  { id:'clientTx',      label:'Transactions', icon:'≡' },
  { id:'clientSearches',label:'Saved searches', icon:'⌕' },
  { divider:'account' },
  { id:'settings', label:'Profile', icon:'◌' },
  { id:'home', label:'Back to site', icon:'↗' },
];

const BROKER_NAV = () => [
  { id:'brokerDash',  label:'Dashboard',  icon:'◧' },
  { id:'brokerList',  label:'Portfolio',  icon:'⊞', badge:'24' },
  { id:'brokerInq',   label:'Leads',      icon:'◐', badge:'12', badgeTone:'danger' },
  { id:'brokerCommission', label:'Commission', icon:'₹' },
  { id:'ownerNew',    label:'Add listing', icon:'＋' },
  { divider:'account' },
  { id:'settings', label:'Settings', icon:'⚙' },
  { id:'home', label:'Back to site', icon:'↗' },
];

// ─── CLIENT DASHBOARD ─────────────────────────────────────────────────────
function ClientDashPage({nav}) {
  const { authUser, listings: ctxListings, shortlistIds } = useAppData();
  const [unlocks, setUnlocks] = useState([]);
  const [loadingUnlocks, setLoadingUnlocks] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('urb_access');
    if (!token) return;
    fetch('/api/v1/users/me/unlocks', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : [])
      .then(data => setUnlocks(Array.isArray(data) ? data : (data.data || [])))
      .catch(() => {})
      .finally(() => setLoadingUnlocks(false));
  }, []);

  const saved = ctxListings.filter(l => shortlistIds.includes(l.id));
  const transactions = unlocks.map(u => ({
    id: u.id,
    listing: normalizeApiListing(u.listing || { id: u.listingId, title: 'Listing', locality: '', city: '', rentOrPrice: u.amountPaid }),
    date: new Date(u.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }),
    amount: u.amountPaid,
    status: u.status === 'SUCCESS' ? 'completed' : u.status === 'REFUNDED' ? 'refunded' : 'pending',
  }));

  const firstName = authUser?.clientProfile?.fullName?.split(' ')[0] || authUser?.ownerProfile?.fullName?.split(' ')[0] || 'there';
  const portalUser = authUser ? {
    initials: firstName.slice(0,2).toUpperCase(),
    name: authUser?.clientProfile?.fullName || firstName,
    role: 'Tenant',
    color: 'var(--accent-500)',
  } : CLIENT_USER;

  return (
    <PortalShell user={portalUser} navItems={CLIENT_NAV()} current="clientDash" onNav={(id)=>nav(id)}>
      <DashHeader title={`Hi ${firstName}.`}
        subtitle="Where you left off in your house hunt."
        actions={<button className="btn btn-brand btn-sm" onClick={()=>nav('search')}>＋ New search</button>}/>

      <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:14, marginBottom:24}}>
        <StatCard label="Shortlisted" value={String(saved.length)} sub="properties saved"/>
        <StatCard label="Unlocked" value={loadingUnlocks ? '…' : String(transactions.filter(t=>t.status==='completed').length)} sub="contacts"/>
        <StatCard label="Transactions" value={loadingUnlocks ? '…' : String(transactions.length)} sub="total"/>
        <StatCard label="Profile" value="—" sub="complete" color="var(--accent-500)"/>
      </div>

      {/* profile completion banner */}
      <div className="card" style={{padding:'18px 22px', display:'flex', alignItems:'center', gap:18, marginBottom:24, background:'var(--brand-50)', border:0}}>
        <div style={{width:48, height:48, borderRadius:'50%', background:'var(--brand-500)', color:'#fff', display:'grid', placeItems:'center', fontSize:20}}>◌</div>
        <div style={{flex:1}}>
          <div style={{fontSize:14, fontWeight:600, color:'var(--brand-900)'}}>Complete your profile to get owners' attention</div>
          <div style={{fontSize:12, color:'var(--brand-700)', marginTop:2}}>Verified tenants get replies 2.3× faster. Add income proof & employment to finish.</div>
          <div style={{height:6, background:'rgba(255,255,255,.5)', borderRadius:99, marginTop:10, overflow:'hidden'}}>
            <div style={{height:'100%', width:'10%', background:'var(--brand-500)', borderRadius:99}}/>
          </div>
        </div>
        <button className="btn btn-brand btn-sm">Complete</button>
      </div>

      {/* shortlisted */}
      <div style={{marginBottom:32}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:14}}>
          <div className="font-display" style={{fontSize:18, fontWeight:700, letterSpacing:'-0.02em'}}>Your shortlist</div>
          <button className="btn btn-ghost btn-sm" onClick={()=>nav('clientShort')}>See all {saved.length} →</button>
        </div>
        {saved.length === 0 ? (
          <div className="card" style={{padding:28, textAlign:'center'}}>
            <div style={{fontSize:24, marginBottom:8}}>🏠</div>
            <div style={{fontWeight:600}}>No saved properties yet</div>
            <p style={{color:'var(--text-muted)', fontSize:13, marginTop:6}}>Tap the heart on any listing to shortlist it.</p>
            <button className="btn btn-brand btn-sm" style={{marginTop:14}} onClick={()=>nav('search')}>Browse homes</button>
          </div>
        ) : (
          <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:14}}>
            {saved.slice(0,4).map(l=>(
              <ListingCard key={l.id} listing={l}
                onOpen={()=>nav('detail', l.id)}
                onUnlock={(li)=>nav('unlock', li.id)}
                saved={true}
                onSave={()=>{}}/>
            ))}
          </div>
        )}
      </div>

      {/* saved searches */}
      <div style={{marginBottom:32}}>
        <div className="font-display" style={{fontSize:18, fontWeight:700, letterSpacing:'-0.02em', marginBottom:14}}>Saved searches</div>
        <div className="card" style={{padding:32, textAlign:'center'}}>
          <div style={{fontSize:28, marginBottom:8}}>🔍</div>
          <div style={{fontWeight:600}}>No saved searches yet</div>
          <p style={{color:'var(--text-muted)', fontSize:13, marginTop:6}}>Search for homes and save your filters to get alerts on new matches.</p>
          <button className="btn btn-brand btn-sm" style={{marginTop:14}} onClick={()=>nav('search')}>Start searching</button>
        </div>
      </div>

      {/* transaction history */}
      <div>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:14}}>
          <div className="font-display" style={{fontSize:18, fontWeight:700, letterSpacing:'-0.02em'}}>Transaction history</div>
          <button className="btn btn-ghost btn-sm" onClick={()=>nav('clientTx')}>View all →</button>
        </div>
        <div className="card" style={{padding:0, overflow:'hidden'}}>
          <table style={{width:'100%', borderCollapse:'collapse', fontSize:13}}>
            <thead>
              <tr style={{textAlign:'left', color:'var(--text-muted)', fontSize:11, textTransform:'uppercase', letterSpacing:'.08em', fontWeight:600}}>
                <th style={{padding:'12px 22px'}}>Property</th>
                <th style={{padding:'12px 22px'}}>Date</th>
                <th style={{padding:'12px 22px'}}>Amount</th>
                <th style={{padding:'12px 22px'}}>Status</th>
                <th style={{padding:'12px 22px', textAlign:'right'}}>Invoice</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 && (
                <tr><td colSpan={5} style={{padding:'32px 22px', textAlign:'center', color:'var(--text-muted)', fontSize:13}}>No transactions yet</td></tr>
              )}
              {transactions.map(t=>(
                <tr key={t.id} style={{borderTop:'1px solid var(--border)'}}>
                  <td style={{padding:'14px 22px'}}>
                    <div style={{display:'flex', alignItems:'center', gap:12}}>
                      <Img src={t.listing.photo} style={{width:40, height:40, borderRadius:'var(--r-sm)'}}/>
                      <div>
                        <div style={{fontWeight:600}}>{t.listing.bhk} BHK · {t.listing.locality}</div>
                        <div style={{fontSize:11, color:'var(--text-muted)', fontFamily:'var(--f-mono)'}}>{t.id}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{padding:'14px 22px', color:'var(--text-muted)'}}>{t.date}</td>
                  <td style={{padding:'14px 22px', fontWeight:700, fontVariantNumeric:'tabular-nums'}}>₹{t.amount.toLocaleString("en-IN")}</td>
                  <td style={{padding:'14px 22px'}}>{t.status === 'refunded' ? <span style={{fontSize:11, color:'var(--text-muted)', fontWeight:600}}>↺ Refunded</span> : <span style={{fontSize:11, color:'var(--success)', fontWeight:600}}>✓ Completed</span>}</td>
                  <td style={{padding:'14px 22px', textAlign:'right'}}>
                    <button className="btn btn-ghost btn-sm"><Icon.download/> PDF</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PortalShell>
  );
}

// ─── BROKER DASHBOARD ─────────────────────────────────────────────────────
function BrokerDashPage({nav}) {
  const { authUser } = useAppData();
  const [myListings, setMyListings] = useState([]);
  const [loadingBroker, setLoadingBroker] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('urb_access');
    if (!token) return;
    fetch('/api/v1/properties/my/listings', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        const arr = Array.isArray(data) ? data : (data.data || []);
        setMyListings(arr.map(l => ({
          ...normalizeApiListing(l),
          status: l.status === 'ACTIVE' ? 'live' : l.status === 'PENDING_REVIEW' ? 'pending' : l.status === 'RENTED' ? 'rented' : 'paused',
          unlocks: l.unlockCount || 0,
        })));
      })
      .catch(() => {})
      .finally(() => setLoadingBroker(false));
  }, []);

  const brokerName = authUser?.brokerProfile?.fullName || 'Broker';
  const firstName = brokerName.split(' ')[0];
  const reraIdDisplay = authUser?.brokerProfile?.reraId || '—';
  const activeCount = myListings.filter(l => l.status === 'live').length;
  const totalUnlocks = myListings.reduce((s, l) => s + (l.unlocks || 0), 0);

  const portalUser = authUser ? {
    initials: firstName.slice(0,2).toUpperCase(),
    name: brokerName,
    role: `Verified Broker · RERA ${reraIdDisplay}`,
    color: 'var(--text)',
  } : BROKER_USER;

  return (
    <PortalShell user={portalUser} navItems={BROKER_NAV()} current="brokerDash" onNav={(id)=>nav(id)}>
      <DashHeader title={`${firstName}'s desk`}
        subtitle={`${activeCount} active listings · ${loadingBroker ? '…' : myListings.length} total`}
        actions={
          <>
            <button className="btn btn-outline btn-sm">Download report</button>
            <button className="btn btn-brand btn-sm" onClick={()=>nav('ownerNew')}>＋ Add listing</button>
          </>
        }/>

      <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:14, marginBottom:24}}>
        <StatCard label="Active listings" value={loadingBroker ? '…' : String(activeCount)} sub="this month"/>
        <StatCard label="Total unlocks" value={loadingBroker ? '…' : String(totalUnlocks)} sub="all listings"/>
        <StatCard label="Total listings" value={loadingBroker ? '…' : String(myListings.length)} sub="portfolio"/>
        <StatCard label="RERA ID" value={reraIdDisplay !== '—' ? '✓' : '—'} sub={reraIdDisplay}/>
      </div>

      {/* RERA badge & growth */}
      <div style={{display:'grid', gridTemplateColumns:'1fr 1.4fr', gap:16, marginBottom:24}}>
        <div className="card" style={{padding:24, background:'var(--text)', color:'var(--bg)', border:0}}>
          <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:14}}>
            <span style={{fontSize:18, color:'var(--success)'}}><Icon.shield/></span>
            <div style={{fontSize:11, opacity:.7, fontWeight:600, textTransform:'uppercase', letterSpacing:'.08em'}}>RERA Verified</div>
          </div>
          <div className="font-display" style={{fontSize:24, fontWeight:800, letterSpacing:'-0.025em'}}>{reraIdDisplay}</div>
          <div style={{fontSize:13, opacity:.7, marginTop:6}}>{authUser?.brokerProfile?.isReraVerified ? 'Verified' : 'Pending verification'}</div>
          <div style={{height:1, background:'rgba(255,255,255,.12)', margin:'18px 0'}}/>
          <div className="font-display" style={{fontSize:14, fontWeight:600}}>Verified Broker badge active</div>
          <div style={{fontSize:12, opacity:.7, marginTop:4}}>Your listings get a green shield. Tenants trust them 4.2× more.</div>
        </div>

        <div className="card" style={{padding:24}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline'}}>
            <div>
              <div style={{fontSize:11, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.08em'}}>Commission earned · last 6 months</div>
              <div className="font-display" style={{fontSize:36, fontWeight:800, letterSpacing:'-0.035em', marginTop:4}}>₹12.4 Lakh</div>
              <div style={{fontSize:12, color:'var(--success)', fontWeight:600, marginTop:4}}>+34% vs previous 6 months</div>
            </div>
            <select className="input select btn-sm" style={{height:32, fontSize:12}}><option>6 months</option><option>12 months</option></select>
          </div>
          <div style={{display:'flex', alignItems:'flex-end', gap:6, height:120, marginTop:18}}>
            {[40, 55, 38, 72, 86, 110, 142, 138, 165, 188, 220, 248].map((v, i)=>(
              <div key={i} style={{flex:1, display:'flex', flexDirection:'column', justifyContent:'flex-end', height:'100%'}}>
                <div style={{height:`${(v/260)*100}%`, background: i === 11 ? 'var(--brand-500)' : 'var(--surface-sunken)', borderRadius:4, transition:'all .3s'}}/>
              </div>
            ))}
          </div>
          <div style={{display:'flex', justifyContent:'space-between', marginTop:6, fontSize:10, color:'var(--text-faint)'}}>
            <span>Jan</span><span>Mar</span><span>May</span><span>Jul</span><span>Sep</span><span>Nov</span>
          </div>
        </div>
      </div>

      {/* portfolio table */}
      <div className="card" style={{padding:0, overflow:'hidden'}}>
        <div style={{padding:'18px 22px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div className="font-display" style={{fontSize:18, fontWeight:700, letterSpacing:'-0.02em'}}>Your portfolio</div>
          <div style={{display:'flex', gap:8}}>
            <input className="input btn-sm" placeholder="Search listings…" style={{height:32, fontSize:12, width:220}}/>
            <select className="input select btn-sm" style={{height:32, fontSize:12}}><option>All cities</option><option>Bangalore</option><option>Mumbai</option></select>
          </div>
        </div>
        <table style={{width:'100%', borderCollapse:'collapse', fontSize:13}}>
          <thead>
            <tr style={{textAlign:'left', color:'var(--text-muted)', fontSize:11, textTransform:'uppercase', letterSpacing:'.08em', fontWeight:600}}>
              <th style={{padding:'12px 22px'}}>Property</th>
              <th style={{padding:'12px 22px'}}>Owner (internal)</th>
              <th style={{padding:'12px 22px'}}>Status</th>
              <th style={{padding:'12px 22px'}}>Unlocks</th>
              <th style={{padding:'12px 22px'}}>Commission</th>
              <th style={{padding:'12px 22px', textAlign:'right'}}></th>
            </tr>
          </thead>
          <tbody>
            {myListings.map(l=>(
              <tr key={l.id} style={{borderTop:'1px solid var(--border)'}}>
                <td style={{padding:'14px 22px'}}>
                  <div style={{display:'flex', alignItems:'center', gap:12}}>
                    <Img src={l.photo} style={{width:48, height:48, borderRadius:'var(--r-sm)'}}/>
                    <div>
                      <div style={{fontWeight:600}}>{l.bhk} BHK · {l.locality}</div>
                      <div style={{fontSize:11, color:'var(--text-muted)'}}>ID {l.id}</div>
                    </div>
                  </div>
                </td>
                <td style={{padding:'14px 22px', color:'var(--text-muted)'}}>{l.owner}</td>
                <td style={{padding:'14px 22px'}}><StatusBadge status={l.status}/></td>
                <td style={{padding:'14px 22px', fontWeight:600, fontVariantNumeric:'tabular-nums'}}>{Math.floor(l.pop/4)}</td>
                <td style={{padding:'14px 22px', fontWeight:700, color: l.commission > 0 ? 'var(--success)' : 'var(--text-muted)'}}>
                  {l.commission > 0 ? `+₹${l.commission.toLocaleString("en-IN")}` : "—"}
                </td>
                <td style={{padding:'14px 22px', textAlign:'right'}}>
                  <button className="btn btn-ghost btn-sm" onClick={()=>nav('detail', l.id)}>View →</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PortalShell>
  );
}

// ---- admin-pages.jsx ----
// admin-pages.jsx — Admin Dashboard + Moderation Queue


// ── Stubs for pages referenced in router but not yet implemented ──────────────

function ClientShortlistPage({nav, savedIds, onSave, onUnlock}) {
  const { listings } = useAppData();
  const saved = listings.filter(l => savedIds?.includes(l.id));
  return (
    <div style={{maxWidth:1440, margin:'0 auto', padding:'40px 28px'}}>
      <DashHeader title="Shortlisted homes" subtitle="Properties you’ve saved"/>
      {saved.length === 0 ? (
        <div className="card" style={{padding:48, textAlign:'center', marginTop:24}}>
          <div style={{fontSize:36, marginBottom:12}}>🏠</div>
          <div style={{fontWeight:600}}>No saved properties yet</div>
          <p style={{color:'var(--text-muted)', marginTop:8}}>Tap the heart on any listing to shortlist it.</p>
          <button className="btn btn-brand btn-sm" style={{marginTop:16}} onClick={()=>nav('search')}>Browse homes</button>
        </div>
      ) : (
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:20, marginTop:24}}>
          {saved.map(l => (
            <ListingCard key={l.id} listing={l}
              onOpen={()=>nav('detail', l.id)}
              onUnlock={()=>onUnlock(l)}
              saved={true} onSave={()=>onSave(l.id)}/>
          ))}
        </div>
      )}
    </div>
  );
}

function ClientSearchesPage({nav}) {
  return (
    <div style={{maxWidth:900, margin:'0 auto', padding:'40px 28px'}}>
      <DashHeader title="Saved searches" subtitle="Get alerts when new homes match your criteria"/>
      <div className="card" style={{padding:48, textAlign:'center', marginTop:24}}>
        <div style={{fontSize:36, marginBottom:12}}>🔍</div>
        <div style={{fontWeight:600, fontSize:16}}>No saved searches yet</div>
        <p style={{color:'var(--text-muted)', marginTop:8}}>
          Search for homes and click “Save this search” to get notified of new listings.
        </p>
        <button className="btn btn-brand btn-sm" style={{marginTop:16}} onClick={()=>nav('search')}>Start searching</button>
      </div>
    </div>
  );
}

export { ClientDashPage, BrokerDashPage, ClientShortlistPage, ClientSearchesPage };
