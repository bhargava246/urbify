// @ts-nocheck
"use client";
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';

// OlaMap — dynamically imported to avoid SSR issues (Ola Maps SDK needs browser globals)
export const OlaMap = dynamic(
  () => import('@/components/maps/OlaMap').then(m => m.OlaMap),
  { ssr: false, loading: () => <div style={{height:280,background:'#e8ede9',borderRadius:'var(--r-md)',display:'grid',placeItems:'center',color:'#9ca3af',fontSize:13}}>Loading map…</div> }
);

// ---- data.jsx ----
// data.jsx — mock listings + cities for Urbify

const CITIES = [
  { name: "Bangalore", count: 247, avgRent: "₹38k" },
  { name: "Mumbai",    count: 312, avgRent: "₹62k" },
  { name: "Delhi NCR", count: 198, avgRent: "₹41k" },
  { name: "Pune",      count: 156, avgRent: "₹32k" },
  { name: "Hyderabad", count: 142, avgRent: "₹29k" },
  { name: "Chennai",   count: 108, avgRent: "₹27k" },
];

const LOCALITIES = [
  "Koramangala", "Indiranagar", "HSR Layout", "Whitefield", "Jayanagar",
  "Bandra West", "Powai", "Andheri East", "Lower Parel", "Versova",
  "Gurugram Sector 56", "Hauz Khas", "Saket"
];

// real estate photos from unsplash
const PHOTOS = [
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1567496898669-ee935f5f647a?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&q=80&auto=format&fit=crop",
];

const INTERIORS = [
  "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=1600&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1600&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=1600&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=1600&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=1600&q=80&auto=format&fit=crop",
];

const FURNISHING = ["Unfurnished", "Semi-furnished", "Fully furnished"];
const FACINGS = ["East", "West", "North", "South", "North-East", "South-East"];

const AMENITIES = [
  { id: "parking", label: "Parking" },
  { id: "lift",    label: "Lift" },
  { id: "gym",     label: "Gym" },
  { id: "pool",    label: "Pool" },
  { id: "security",label: "24/7 Security" },
  { id: "power",   label: "Power backup" },
  { id: "garden",  label: "Garden" },
  { id: "play",    label: "Kids play area" },
  { id: "petfr",   label: "Pet friendly" },
  { id: "wifi",    label: "Wi-Fi" },
];

function makeListing(i) {
  const bhk = (i % 4) + 1;
  const baseRent = [22, 32, 48, 72, 95][bhk - 1] || 38;
  const rentK = baseRent + ((i * 7) % 18);
  const photo = PHOTOS[i % PHOTOS.length];
  const locality = LOCALITIES[i % LOCALITIES.length];
  const city = i % 3 === 0 ? "Mumbai" : i % 3 === 1 ? "Bangalore" : "Pune";
  const area = 480 + ((i * 53) % 1200);
  const floor = (i % 14) + 1;
  const total = floor + ((i * 3) % 6) + 1;
  const furn = FURNISHING[i % 3];
  const facing = FACINGS[i % FACINGS.length];
  const isBroker = i % 4 === 0;
  const fee = Math.round((rentK * 1000 / 30) * 7.5);
  const feeGST = Math.round(fee * 1.18);

  return {
    id: `URB-${1000 + i}`,
    bhk,
    title: `${bhk} BHK ${bhk === 1 ? "Studio" : bhk >= 3 ? "Residence" : "Apartment"} in ${locality}`,
    locality, city,
    rentK, area, floor, total,
    furnishing: furn, facing,
    age: ["New", "<1 yr", "1-5 yr", "5-10 yr"][i % 4],
    available: ["Immediate", "1 Dec", "15 Dec", "1 Jan"][i % 4],
    photo,
    photos: [photo, ...INTERIORS.slice(0, 4)],
    isBroker,
    listedBy: isBroker ? `Verified Broker · RERA MH${20000 + i}` : "Direct Owner",
    amenities: AMENITIES.filter((_, k) => (k + i) % 3 !== 0).slice(0, 6).map(a => a.id),
    fee, feeGST,
    deposit: rentK * 2,
    posted: ["2h ago", "Today", "Yesterday", "3 days ago", "1 week ago"][i % 5],
    isNew: i % 5 === 0,
    pop: 40 + ((i * 11) % 60),
  };
}

// Skeleton data used for immediate render and API-down fallback
const LISTINGS = Array.from({ length: 18 }, (_, i) => makeListing(i));

// ─── API listing normalizer ───────────────────────────────────────────────────
// Converts the real backend API shape → the UI shape used throughout this file.

function furnishingLabel(s) {
  return s === 'SEMI_FURNISHED' ? 'Semi-furnished'
    : s === 'FULLY_FURNISHED' ? 'Fully furnished'
    : 'Unfurnished';
}

function facingLabel(s) {
  if (!s) return 'East';
  return s.replace(/_/g, '-').replace(/^\w/, c => c.toUpperCase())
          .replace(/-(\w)/g, (_, c) => ' ' + c.toUpperCase());
}

function ageLabel(years) {
  if (!years && years !== 0) return 'N/A';
  if (years === 0) return 'New';
  if (years < 1) return '<1 yr';
  if (years <= 5) return '1-5 yr';
  return '5-10 yr';
}

function postedLabel(iso) {
  if (!iso) return 'Recently';
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 172800) return 'Yesterday';
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
  return '1 week+ ago';
}

function normalizeApiListing(l) {
  const rentOrPrice = l.rentOrPrice || 0;
  const rentK = Math.round(rentOrPrice / 1000);
  const dailyRent = rentOrPrice / 30;
  const fee = Math.round(dailyRent * 7.5);
  const feeGST = Math.round(fee * 1.18);
  const photos = (l.photos || []).map(p => p.s3Url || p).filter(Boolean);
  const photo = photos[0] || PHOTOS[0];
  const allPhotos = photos.length >= 5
    ? photos
    : [...photos, ...INTERIORS.slice(0, Math.max(0, 5 - photos.length))];

  const secDep = l.securityDeposit || rentOrPrice * 2;
  const deposit = Math.round(secDep / 1000);

  return {
    id: l.id,
    bhk: l.bhk || 0,
    title: l.title || `${l.bhk || ''} BHK in ${l.locality}`,
    locality: l.locality,
    city: l.city,
    state: l.state || '',
    rentK,
    rentOrPrice,
    area: l.areaSqFt || 0,
    floor: l.floor || 0,
    total: l.totalFloors || l.floor || 1,
    furnishing: furnishingLabel(l.furnishingStatus),
    facing: facingLabel(l.facing),
    age: ageLabel(l.propertyAge),
    available: l.availableFrom ? new Date(l.availableFrom).toLocaleDateString('en-IN', { day:'numeric', month:'short' }) : 'Immediate',
    photo,
    photos: allPhotos,
    isBroker: l.isBrokerListing,
    listedBy: l.isBrokerListing
      ? `Verified Broker${l.owner?.brokerProfile?.reraId ? ' · RERA ' + l.owner.brokerProfile.reraId : ''}`
      : 'Direct Owner',
    amenities: (l.amenities || []).map(a => (typeof a === 'string' ? a : a.name)),
    fee,
    feeGST,
    deposit,
    posted: postedLabel(l.createdAt),
    isNew: l.createdAt && (Date.now() - new Date(l.createdAt).getTime()) < 7 * 86400 * 1000,
    pop: l.viewCount || 0,
    // preserve full API fields
    _api: l,
  };
}

// ─── App-wide data context ────────────────────────────────────────────────────

const AppDataContext = React.createContext({
  listings: LISTINGS,
  cities:   [],
  shortlistIds: [],
  addShortlist: (_id) => {},
  removeShortlist: (_id) => {},
  isLoadingListings: false,
  isLoadingCities: false,
  authUser: null,
  refreshAuth: async () => {},
  doLogout: async () => {},
});

function useAppData() { return React.useContext(AppDataContext); }

// ---- components.jsx ----
// components.jsx — Urbify shared components

// ─── Icons (stroke, sized via fontSize) ────────────────────────────────────
const Icon = {
  search: () => <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>,
  heart: ({filled}) => <svg width="1em" height="1em" viewBox="0 0 24 24" fill={filled ? "currentColor":"none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  lock: () => <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>,
  unlock: () => <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 7.5-1.9"/></svg>,
  pin: () => <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s7-7.5 7-13a7 7 0 1 0-14 0c0 5.5 7 13 7 13z"/><circle cx="12" cy="9" r="2.5"/></svg>,
  bed: () => <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18V8M21 18v-4a3 3 0 0 0-3-3H3M3 14h18M7 11V8a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"/></svg>,
  area: () => <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>,
  floor: () => <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M6 21V11l6-4 6 4v10M10 21v-6h4v6"/></svg>,
  sparkle: () => <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l3 3M15 15l3 3M18 6l-3 3M9 15l-3 3"/></svg>,
  check: () => <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7"/></svg>,
  arrow: () => <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>,
  back: () => <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>,
  filter: () => <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16M7 12h10M10 18h4"/></svg>,
  camera: () => <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7h4l2-3h6l2 3h4v12H3z"/><circle cx="12" cy="13" r="3.5"/></svg>,
  shield: () => <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3 4 6v6c0 5 3.5 8.5 8 9 4.5-.5 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/></svg>,
  bolt: () => <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></svg>,
  upi: () => <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M7 4v16M17 4v16M7 12h10M11 8h6M7 16h6"/></svg>,
  card: () => <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h3"/></svg>,
  bank: () => <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9 12 4l9 5M5 9v9M19 9v9M9 9v9M15 9v9M3 21h18"/></svg>,
  wallet: () => <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 10h12a3 3 0 0 1 0 6H3"/><circle cx="15" cy="13" r="1.2" fill="currentColor"/></svg>,
  phone: () => <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8 9.6a16 16 0 0 0 6.4 6.4l1.2-1.2a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2z"/></svg>,
  download: () => <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4v12m0 0-4-4m4 4 4-4M4 20h16"/></svg>,
  close: () => <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 6l12 12M6 18 18 6"/></svg>,
  mobile: () => <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="2" width="12" height="20" rx="3"/><path d="M11 19h2"/></svg>,
};

// ─── Brand logo ────────────────────────────────────────────────────────────
function Logo({onClick}) {
  return (
    <div className="logo" onClick={onClick} style={{cursor:'pointer'}}>
      <div className="logo-mark">U</div>
      <span>urbify</span>
    </div>
  );
}

// ─── Inline image with shimmer fallback ────────────────────────────────────
function Img({src, alt, style, className}) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div style={{position:'relative', overflow:'hidden', ...style}} className={className}>
      {!loaded && <div className="shimmer" style={{position:'absolute', inset:0}}/>}
      <img src={src} alt={alt || ""}
        loading="lazy"
        onLoad={()=>setLoaded(true)}
        style={{width:'100%', height:'100%', objectFit:'cover', display:'block',
                opacity: loaded ? 1 : 0, transition:'opacity .3s'}}/>
    </div>
  );
}

// ─── Lock pill — the privacy-first moment ──────────────────────────────────
function LockedAddress({locked, fee, city, locality, onUnlock, compact}) {
  if (!locked) return null;
  return (
    <div style={{
      display:'inline-flex', alignItems:'center', gap: compact ? 6 : 10,
      padding: compact ? '4px 10px' : '8px 14px',
      borderRadius:'999px',
      background:'var(--surface-sunken)',
      border:'1px dashed var(--border-strong)',
      color:'var(--text-muted)',
      fontSize: compact ? 12 : 13,
      fontWeight: 500,
    }}>
      <span style={{fontSize: compact ? 13 : 16, color: 'var(--text)'}}><Icon.lock/></span>
      <span>Address hidden — <span style={{color:'var(--text)', fontWeight:600}}>{locality}, {city}</span></span>
    </div>
  );
}

// ─── Listing card ─────────────────────────────────────────────────────────
function ListingCard({listing, onOpen, onUnlock, saved, onSave, variant = "default"}) {
  const fmt = (n) => n.toLocaleString("en-IN");
  return (
    <div className="card" style={{
      padding: 0, overflow:'hidden',
      cursor:'pointer',
      transition:'transform .15s, box-shadow .2s',
      display:'flex', flexDirection:'column',
    }}
    onClick={onOpen}
    onMouseEnter={(e)=>{e.currentTarget.style.boxShadow='var(--sh-3)';e.currentTarget.style.transform='translateY(-2px)';}}
    onMouseLeave={(e)=>{e.currentTarget.style.boxShadow='';e.currentTarget.style.transform='';}}
    >
      <div style={{position:'relative', aspectRatio: variant === "wide" ? "16/9" : "5/4"}}>
        <Img src={listing.photo} alt={listing.title} style={{width:'100%', height:'100%'}}/>
        {/* top row chips */}
        <div style={{position:'absolute', top:12, left:12, right:12, display:'flex', justifyContent:'space-between', gap:8, pointerEvents:'none'}}>
          <div style={{display:'flex', gap:6}}>
            {listing.isNew && <span className="chip chip-dark" style={{height:24, padding:'0 10px', fontSize:11}}>NEW</span>}
            <span className="chip" style={{height:24, padding:'0 10px', fontSize:11, background:'rgba(255,255,255,.85)', color:'#0F1614', border:0, backdropFilter:'blur(6px)'}}>
              <span style={{fontSize:11}}><Icon.camera/></span> {listing.photos.length}
            </span>
          </div>
          <button onClick={(e)=>{e.stopPropagation(); onSave?.(listing.id);}} aria-label="save"
            style={{
              pointerEvents:'auto',
              width:32, height:32, borderRadius:'50%',
              border:0, background:'rgba(255,255,255,.92)',
              display:'grid', placeItems:'center', cursor:'pointer',
              color: saved ? '#EF4444' : '#0F1614',
              fontSize: 14,
            }}>
            <Icon.heart filled={saved}/>
          </button>
        </div>
        {/* locality strip */}
        <div style={{position:'absolute', left:12, bottom:12, color:'#fff', textShadow:'0 1px 8px rgba(0,0,0,.4)', fontSize:12, fontWeight:600, letterSpacing:'.02em', display:'flex', alignItems:'center', gap:4}}>
          <Icon.pin/> {listing.locality} · {listing.city}
        </div>
      </div>

      <div style={{padding:'var(--pad-card)', display:'flex', flexDirection:'column', gap:10, flex:1}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8}}>
          <div className="font-display" style={{fontSize: 17, fontWeight: 700, lineHeight:1.25, letterSpacing:'-0.02em'}}>
            {listing.bhk} BHK · {fmt(listing.area)} sq ft
          </div>
          <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end'}}>
            <div className="font-display" style={{fontSize: 20, fontWeight: 800, letterSpacing:'-0.03em'}}>
              ₹{listing.rentK}k<span style={{fontSize:11, color:'var(--text-muted)', fontWeight:500}}>/mo</span>
            </div>
          </div>
        </div>

        <div style={{display:'flex', flexWrap:'wrap', gap:6, fontSize:12, color:'var(--text-muted)'}}>
          <span>{listing.furnishing}</span><span>·</span>
          <span>Floor {listing.floor}/{listing.total}</span><span>·</span>
          <span>{listing.facing}-facing</span>
        </div>

        <div style={{marginTop:'auto', display:'flex', alignItems:'center', justifyContent:'space-between', gap:10, paddingTop:8, borderTop:'1px dashed var(--border)'}}>
          <div style={{display:'flex', alignItems:'center', gap:6, fontSize:11.5, color:'var(--text-muted)'}}>
            <span style={{display:'inline-flex', alignItems:'center', gap:4, fontSize:13, color:'var(--text)'}}><Icon.lock/></span>
            <span>address locked</span>
          </div>
          <button className="btn btn-brand btn-sm" onClick={(e)=>{e.stopPropagation(); onUnlock(listing);}}>
            Unlock · ₹{fmt(listing.feeGST)}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal shell ──────────────────────────────────────────────────────────
function Modal({open, onClose, children, width = 920, padding = 0}) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{
      position:'fixed', inset:0, zIndex:50,
      background:'rgba(15,22,20,.55)',
      backdropFilter:'blur(6px)', WebkitBackdropFilter:'blur(6px)',
      display:'grid', placeItems:'center',
      padding:'24px',
      animation:'pop-in .25s ease',
    }}>
      <div onClick={(e)=>e.stopPropagation()} className="pop-in"
        style={{
          background:'var(--surface)', color:'var(--text)',
          borderRadius:'var(--r-xl)',
          width:'100%', maxWidth: width,
          maxHeight:'calc(100vh - 48px)',
          overflow:'auto', boxShadow:'var(--sh-pop)',
          padding,
        }}>
        {children}
      </div>
    </div>
  );
}


// ---- portal-shell.jsx ----
// portal-shell.jsx — shared sidebar + topbar for dashboards

function PortalShell({user, navItems, current, onNav, children}) {
  return (
    <div style={{display:'grid', gridTemplateColumns:'248px 1fr', minHeight:'calc(100vh - 64px)', background:'var(--surface-sunken)'}}>
      <aside style={{
        background:'var(--surface)', borderRight:'1px solid var(--border)',
        padding:'24px 16px', display:'flex', flexDirection:'column',
        position:'sticky', top:64, height:'calc(100vh - 64px)',
      }}>
        {/* user card */}
        <div style={{display:'flex', alignItems:'center', gap:12, padding:'10px 12px', marginBottom:20}}>
          <div style={{
            width:40, height:40, borderRadius:'50%',
            background: user.color || 'var(--brand-500)',
            color:'#fff',
            display:'grid', placeItems:'center',
            fontWeight:700, fontSize:14,
          }}>{user.initials}</div>
          <div style={{minWidth:0, flex:1}}>
            <div style={{fontSize:13, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{user.name}</div>
            <div style={{fontSize:11, color:'var(--text-muted)'}}>{user.role}</div>
          </div>
        </div>

        <nav style={{display:'flex', flexDirection:'column', gap:2, flex:1}}>
          {navItems.map(item=>{
            if (item.divider) return <div key={item.divider} style={{fontSize:10, color:'var(--text-faint)', fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', padding:'14px 12px 6px'}}>{item.divider}</div>;
            const active = item.id === current;
            return (
              <button key={item.id} onClick={()=>onNav(item.id)} style={{
                display:'flex', alignItems:'center', gap:12,
                padding:'10px 12px', borderRadius:'var(--r-sm)',
                background: active ? 'var(--surface-sunken)' : 'transparent',
                border:0, cursor:'pointer', textAlign:'left',
                font:'inherit', color: active ? 'var(--text)' : 'var(--text-muted)',
                fontWeight: active ? 600 : 500, fontSize:14,
                transition:'background .15s',
              }}>
                <span style={{fontSize:16, color: active ? 'var(--text)' : 'var(--text-muted)'}}>{item.icon}</span>
                <span style={{flex:1}}>{item.label}</span>
                {item.badge && <span className="chip" style={{height:18, padding:'0 7px', fontSize:10, fontWeight:700, background: item.badgeTone === 'danger' ? 'var(--error)' : 'var(--text)', color:'#fff', border:0}}>{item.badge}</span>}
              </button>
            );
          })}
        </nav>

        <div className="card" style={{marginTop:'auto', padding:14, background:'var(--brand-50)', border:0}}>
          <div className="font-display" style={{fontSize:14, fontWeight:700, letterSpacing:'-0.01em', color:'var(--brand-900)'}}>Need help?</div>
          <div style={{fontSize:12, color:'var(--brand-700)', marginTop:4}}>Chat with our team 9 AM – 8 PM IST</div>
          <button className="btn btn-sm" style={{marginTop:10, background:'var(--brand-500)', color:'#fff', height:30, fontSize:12}}>Open chat</button>
        </div>
      </aside>

      <main style={{padding:'32px 36px', minWidth:0}}>{children}</main>
    </div>
  );
}

// ─── small dashboard components ───────────────────────────────────────────
function StatCard({label, value, trend, sub, color}) {
  return (
    <div className="card" style={{padding:22, display:'flex', flexDirection:'column', gap:8}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
        <div style={{fontSize:12, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.08em', fontWeight:600}}>{label}</div>
        {color && <span style={{width:10, height:10, borderRadius:'50%', background:color}}/>}
      </div>
      <div className="font-display" style={{fontSize:36, fontWeight:800, letterSpacing:'-0.035em', lineHeight:1, marginTop:4}}>{value}</div>
      <div style={{display:'flex', gap:8, alignItems:'baseline', marginTop:2, fontSize:12}}>
        {trend && <span style={{
          color: trend.startsWith('+') ? 'var(--success)' : 'var(--error)',
          fontWeight:600,
        }}>{trend}</span>}
        {sub && <span style={{color:'var(--text-muted)'}}>{sub}</span>}
      </div>
    </div>
  );
}

function StatusBadge({status}) {
  const map = {
    live:    { bg:'var(--success)', fg:'#fff', label:'Live'},
    pending: { bg:'#FEF3C7', fg:'#92400E', label:'Pending'},
    expired: { bg:'var(--surface-sunken)', fg:'var(--text-muted)', label:'Expired'},
    rented:  { bg:'var(--text)', fg:'var(--bg)', label:'Rented'},
    flagged: { bg:'#FEE2E2', fg:'#991B1B', label:'Flagged'},
    approved:{ bg:'var(--success)', fg:'#fff', label:'Approved'},
    rejected:{ bg:'#FEE2E2', fg:'#991B1B', label:'Rejected'},
  };
  const s = map[status] || map.live;
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:6,
      padding:'4px 10px', borderRadius:99,
      background:s.bg, color:s.fg,
      fontSize:11, fontWeight:600,
    }}>
      <span style={{width:6, height:6, borderRadius:'50%', background:s.fg, opacity: status === 'live' ? 1 : .5}}/>
      {s.label}
    </span>
  );
}

function DashHeader({title, subtitle, actions}) {
  return (
    <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:28, gap:16, flexWrap:'wrap'}}>
      <div>
        <h1 className="font-display" style={{fontSize:32, fontWeight:800, letterSpacing:'-0.035em', margin:0}}>{title}</h1>
        {subtitle && <div style={{fontSize:14, color:'var(--text-muted)', marginTop:6}}>{subtitle}</div>}
      </div>
      {actions && <div style={{display:'flex', gap:8}}>{actions}</div>}
    </div>
  );
}

// ---- owner-pages.jsx ----
// owner-pages.jsx — Owner Dashboard + Create Listing wizard + Listings + Inquiries



// ── Named exports ─────────────────────────────────────────────────────────────
export {
  // data
  CITIES, LOCALITIES, PHOTOS, INTERIORS, FURNISHING, FACINGS, AMENITIES,
  makeListing, LISTINGS,
  // helpers
  furnishingLabel, facingLabel, ageLabel, postedLabel, normalizeApiListing,
  // context
  AppDataContext, useAppData,
  // ui primitives
  Icon, Logo, Img, LockedAddress, ListingCard, Modal,
  // portal shell
  PortalShell, StatCard, StatusBadge, DashHeader,
};
