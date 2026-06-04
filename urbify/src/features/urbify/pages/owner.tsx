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

const OWNER_USER = { initials:"?", name:"Loading…", role:"Owner", color:'var(--brand-500)' };

const OWNER_NAV = (current, onNav, navMain) => [
  { id:'ownerDash',     label:'Dashboard',  icon:'◧' },
  { id:'ownerList',     label:'My listings', icon:'⊞', badge:'4' },
  { id:'ownerInquiries',label:'Inquiries',   icon:'◐', badge:'7', badgeTone:'danger' },
  { id:'ownerNew',      label:'Add listing', icon:'＋' },
  { divider:'account' },
  { id:'settings', label:'Settings', icon:'⚙' },
  { id:'home', label:'Back to site', icon:'↗' },
];

// ─── Owner Dashboard ──────────────────────────────────────────────────────
function OwnerDashPage({nav}) {
  const { authUser } = useAppData();
  const [myListings, setMyListings] = useState([]);
  const [loadingListings, setLoadingListings] = useState(true);

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
          daysLeft: l.expiresAt ? Math.max(0, Math.ceil((new Date(l.expiresAt) - Date.now()) / 86400000)) : '—',
        })));
      })
      .catch(() => {})
      .finally(() => setLoadingListings(false));
  }, []);

  const userName = authUser?.ownerProfile?.fullName || authUser?.brokerProfile?.fullName || 'there';
  const firstName = userName.split(' ')[0];
  const activeCount = myListings.filter(l => l.status === 'live').length;
  const unlocksThisMonth = myListings.reduce((s, l) => s + (l.unlocks || 0), 0);
  const expiringCount = myListings.filter(l => typeof l.daysLeft === 'number' && l.daysLeft <= 3).length;

  const items = OWNER_NAV(null, null);
  const portalUser = authUser ? {
    initials: firstName.slice(0,2).toUpperCase(),
    name: userName,
    role: 'Direct Owner',
    color: 'var(--brand-500)',
  } : OWNER_USER;

  return (
    <PortalShell user={portalUser} navItems={items} current="ownerDash" onNav={(id)=>nav(id)}>
      <DashHeader
        title={`Welcome back, ${firstName}.`}
        subtitle="Here's how your listings are doing."
        actions={
          <>
            <button className="btn btn-outline btn-sm">Export</button>
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
        <button className="btn btn-sm" style={{background:'#78350F', color:'#fff', border:0}}>Renew →</button>
      </div>
      )}

      {/* listings table */}
      <div className="card" style={{padding:0, overflow:'hidden'}}>
        <div style={{padding:'18px 22px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div className="font-display" style={{fontSize:18, fontWeight:700, letterSpacing:'-0.02em'}}>Your listings</div>
          <div style={{display:'flex', gap:6}}>
            {["All","Live","Pending","Rented"].map((t, i)=>(
              <button key={t} className="chip" style={{cursor:'pointer', background:i===0?'var(--text)':'transparent', color:i===0?'var(--bg)':'var(--text)', border:i===0?0:'1px solid var(--border)'}}>{t}</button>
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
            {myListings.map(l=>(
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
                <td style={{padding:'14px 22px', color:'var(--text-muted)', fontVariantNumeric:'tabular-nums'}}>{l.daysLeft}</td>
                <td style={{padding:'14px 22px', fontWeight:600}}>₹{l.rentK}k</td>
                <td style={{padding:'14px 22px', textAlign:'right'}}>
                  <div style={{display:'inline-flex', gap:4}}>
                    <button className="btn btn-ghost btn-sm" onClick={()=>nav('detail', l.id)}>View</button>
                    <button className="btn btn-outline btn-sm">Edit</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* activity feed */}
      <div style={{marginTop:24}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:14}}>
          <div className="font-display" style={{fontSize:18, fontWeight:700, letterSpacing:'-0.02em'}}>Recent activity</div>
          <button className="btn btn-ghost btn-sm" onClick={()=>nav('ownerInquiries')}>View all</button>
        </div>
        <div className="card" style={{padding:0, overflow:'hidden'}}>
          {[
            { who:"A tenant", what:`unlocked your 2 BHK in Koramangala`, when:"2 hours ago", money:"+₹6,250" },
            { who:"Tenant 'P. Mehta'", what:`marked your HSR Layout 3 BHK as their favourite`, when:"5 hours ago" },
            { who:"A tenant", what:`unlocked your studio in Indiranagar`, when:"yesterday", money:"+₹4,400" },
            { who:"System", what:`approved your new listing in Whitefield`, when:"yesterday" },
            { who:"A tenant", what:`unlocked your 2 BHK in Koramangala`, when:"2 days ago", money:"+₹6,250" },
          ].map((a, i)=>(
            <div key={i} style={{padding:'14px 22px', borderTop: i===0 ? 0 : '1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center', gap:14}}>
              <div style={{display:'flex', alignItems:'center', gap:12, fontSize:14}}>
                <div style={{width:34, height:34, borderRadius:'50%', background:'var(--surface-sunken)', display:'grid', placeItems:'center', fontSize:14}}>
                  {a.money ? <Icon.unlock/> : <Icon.heart filled/>}
                </div>
                <div>
                  <span style={{fontWeight:600}}>{a.who}</span> <span style={{color:'var(--text-muted)'}}>{a.what}</span>
                  <div style={{fontSize:11, color:'var(--text-faint)', marginTop:2}}>{a.when}</div>
                </div>
              </div>
              {a.money && <span style={{fontWeight:700, color:'var(--success)', fontSize:14}}>{a.money}</span>}
            </div>
          ))}
        </div>
      </div>
    </PortalShell>
  );
}

// ─── Owner Listings ───────────────────────────────────────────────────────
function OwnerListPage({nav}) {
  const { authUser } = useAppData();
  const [myListings, setMyListings] = useState([]);
  const [loadingList, setLoadingList] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('urb_access');
    if (!token) { setLoadingList(false); return; }
    fetch('/api/v1/properties/my/listings', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        const arr = Array.isArray(data) ? data : (data.data || []);
        setMyListings(arr.map(l => ({
          ...normalizeApiListing(l),
          status: l.status === 'ACTIVE' ? 'live' : l.status === 'PENDING_REVIEW' ? 'pending' : l.status === 'RENTED' ? 'rented' : l.status === 'EXPIRED' ? 'expired' : 'paused',
          unlocks: l.unlockCount || 0,
          viewCount: l.viewCount || 0,
        })));
      })
      .catch(() => {})
      .finally(() => setLoadingList(false));
  }, []);

  const firstName = authUser?.ownerProfile?.fullName?.split(' ')[0] || authUser?.brokerProfile?.fullName?.split(' ')[0] || '';
  const portalUser = authUser ? {
    initials: (firstName || 'U').slice(0,2).toUpperCase(),
    name: authUser?.ownerProfile?.fullName || authUser?.brokerProfile?.fullName || 'User',
    role: 'Direct Owner',
    color: 'var(--brand-500)',
  } : OWNER_USER;

  return (
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
                <div><div style={{fontSize:18, fontWeight:700, color:'var(--text)'}}>—</div>shortlists</div>
              </div>

              <div style={{display:'flex', gap:6, marginTop:14}}>
                <button className="btn btn-outline btn-sm" style={{flex:1}}>Edit</button>
                <button className="btn btn-outline btn-sm" style={{flex:1}}>Pause</button>
                <button className="btn btn-ghost btn-sm">⋯</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </PortalShell>
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

  useEffect(() => {
    setLoadingInquiries(true);
    const token = localStorage.getItem('urb_access');
    if (!token) { setLoadingInquiries(false); return; }
    fetch('/api/v1/properties/my/unlocks', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data && Array.isArray(data.items)) setInquiries(data.items);
        else if (Array.isArray(data)) setInquiries(data);
        else setInquiries([]);
      })
      .catch(() => setInquiries([]))
      .finally(() => setLoadingInquiries(false));
  }, []);

  const items = inquiries;
  return (
    <PortalShell user={portalUser} navItems={navItems} current={navCurrent} onNav={(id)=>nav(id)}>
      <DashHeader title="Inquiries"
        subtitle="A feed of everything that's happened on your listings."
        actions={<button className="btn btn-outline btn-sm">Mark all read</button>}/>

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
            <button className="btn btn-outline btn-sm">View →</button>
          </div>
        ))}
      </div>
    </PortalShell>
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
  });
  const patchForm = (patch) => setFormData(f => ({...f, ...patch}));

  const handleSubmit = async () => {
    setSubmitError(''); setSubmitting(true);
    const token = localStorage.getItem('urb_access');
    if (!token) { setSubmitError('Please sign in first'); setSubmitting(false); return; }

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
      const res = await fetch('/api/v1/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create listing');
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
        {step === 4 && <StepPhotos onNext={()=>setStep(5)} onBack={()=>setStep(3)}/>}
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
  return (
    <div>
      <h2 className="font-display" style={{fontSize:24, fontWeight:700, letterSpacing:'-0.02em', margin:'0 0 6px'}}>Tell us about the property</h2>

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

      <WizardNav onBack={onBack} onNext={onNext}/>
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

      <WizardNav onBack={onBack} onNext={onNext}/>
    </div>
  );
}

function StepPricing({formData, patchForm, onNext, onBack}) {
  const rent = formData.rentOrPrice || 0;
  const fee = Math.round((rent / 30) * 7.5 * 1.18);
  return (
    <div>
      <h2 className="font-display" style={{fontSize:24, fontWeight:700, letterSpacing:'-0.02em', margin:'0 0 6px'}}>Set your price</h2>

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

      <WizardNav onBack={onBack} onNext={onNext}/>
    </div>
  );
}

function StepPhotos({onNext, onBack}) {
  return (
    <div>
      <h2 className="font-display" style={{fontSize:24, fontWeight:700, letterSpacing:'-0.02em', margin:'0 0 6px'}}>Add photos</h2>
      <p className="muted" style={{margin:'0 0 20px', fontSize:14}}>Minimum 6 photos required. Listings with more photos get 3× more unlocks.</p>

      <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:12}}>
        {INTERIORS.slice(0, 3).map((src, i)=>(
          <div key={i} style={{position:'relative', aspectRatio:'4/3', borderRadius:'var(--r-md)', overflow:'hidden'}}>
            <Img src={src} style={{width:'100%', height:'100%'}}/>
            <button style={{position:'absolute', top:8, right:8, width:24, height:24, borderRadius:'50%', background:'rgba(15,22,20,.7)', color:'#fff', border:0, cursor:'pointer', fontSize:11}}>✕</button>
            {i === 0 && <span className="chip chip-dark" style={{position:'absolute', bottom:8, left:8, height:22, fontSize:10}}>COVER</span>}
          </div>
        ))}

        <button style={{
          aspectRatio:'4/3', borderRadius:'var(--r-md)',
          border:'2px dashed var(--border-strong)', background:'transparent',
          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8,
          cursor:'pointer', color:'var(--text-muted)',
          fontSize:13, fontWeight:500,
        }}>
          <div style={{fontSize:24}}>＋</div>
          Drop photos here
          <span style={{fontSize:11, color:'var(--text-faint)'}}>JPG, PNG · max 8MB each</span>
        </button>
      </div>

      <div style={{marginTop:18, padding:'14px 18px', background:'var(--surface-sunken)', borderRadius:'var(--r-md)', display:'flex', gap:14, alignItems:'flex-start'}}>
        <span style={{fontSize:18, color:'var(--accent-600)', marginTop:2}}><Icon.sparkle/></span>
        <div style={{fontSize:13, lineHeight:1.55}}>
          <strong>AI tips for your photos:</strong> <span style={{color:'var(--text-muted)'}}>Photo 2 appears slightly dark — try shooting in daylight. Photo 3 looks great. Add a balcony / view photo to boost engagement.</span>
        </div>
      </div>

      <Field label="Virtual tour link (optional)" style={{marginTop:24}}>
        <input className="input" placeholder="https://youtube.com/... or matterport URL"/>
      </Field>

      <WizardNav onBack={onBack} onNext={onNext} nextLabel="Continue"/>
    </div>
  );
}

function StepReview({formData, onNext, onBack, submitting}) {
  const loc = formData.location || {};
  return (
    <div>
      <h2 className="font-display" style={{fontSize:24, fontWeight:700, letterSpacing:'-0.02em', margin:'0 0 6px'}}>Review & submit</h2>
      <p className="muted" style={{margin:'0 0 24px', fontSize:14}}>Last look before your listing goes to our moderation team. We review in &lt; 2 hours.</p>

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
            <input type="checkbox" defaultChecked style={{marginTop:2}}/>
            I agree to Urbify's terms and confirm this property is mine to list.
          </label>
        </div>
      </div>

      <WizardNav onBack={onBack} onNext={onNext} nextLabel={submitting ? 'Submitting…' : 'Submit for review'}/>
    </div>
  );
}

function Field({label, children, style}) {
  return (
    <div style={style}>
      <label style={{fontSize:12, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.08em', display:'block', marginBottom:8}}>{label}</label>
      {children}
    </div>
  );
}


export { OwnerDashPage, OwnerListPage, OwnerInquiriesPage, OwnerNewPage };
