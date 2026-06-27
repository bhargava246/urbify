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
  PortalShell, StatCard, StatusBadge, DashHeader, Footer, MiniMap,
} from '../_shared';

function DetailPage({nav, listingId, savedIds, onSave, onUnlock}) {
  const [visitRequested, setVisitRequested] = React.useState(false);
  const { listings: ctxListings } = useAppData();
  const [apiListing, setApiListing] = useState(null);
  const [loadingListing, setLoadingListing] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);
  const [carouselPaused, setCarouselPaused] = useState(false);

  useEffect(() => {
    if (!listingId) return;
    setLoadingListing(true);
    fetch(`/api/v1/properties/${listingId}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        // Backend wraps all responses in {success, data, timestamp}
        const listing = data?.data ?? data;
        if (listing?.id) setApiListing(normalizeApiListing(listing));
      })
      .catch(() => {})
      .finally(() => setLoadingListing(false));
  }, [listingId]);

  // Use fresh API data when available, fall back to context listing
  const listing = apiListing || ctxListings.find(l => l.id === listingId) || null;

  // Auto-slide carousel every 5 s, pause on hover
  useEffect(() => {
    const photos = listing?.photos;
    if (!photos?.length || photos.length <= 1 || carouselPaused) return;
    const timer = setInterval(() => setActivePhoto(i => (i + 1) % photos.length), 5000);
    return () => clearInterval(timer);
  }, [listing?.photos, carouselPaused]);

  const fmt = (n) => n.toLocaleString("en-IN");
  const amenityLookup = Object.fromEntries(AMENITIES.map(a=>[a.id, a.label]));

  if (loadingListing) {
    return (
      <div style={{minHeight:'60vh', display:'grid', placeItems:'center', fontSize:15, color:'var(--text-muted)'}}>
        Loading property…
      </div>
    );
  }

  if (!listing) {
    return (
      <div style={{minHeight:'60vh', display:'grid', placeItems:'center', textAlign:'center'}}>
        <div>
          <div style={{fontSize:40, marginBottom:12}}>🏠</div>
          <div className="font-display" style={{fontSize:22, fontWeight:700}}>Property not found</div>
          <div style={{color:'var(--text-muted)', marginTop:8, marginBottom:20}}>This listing may have been removed or is no longer active.</div>
          <button className="btn btn-brand" onClick={()=>nav('search')}>Browse listings</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{maxWidth:1440, margin:'0 auto', padding:'24px 28px'}}>
        <div style={{display:'flex', alignItems:'center', gap:14, marginBottom:18}}>
          <button className="btn btn-ghost btn-sm" onClick={()=>nav('search')}><Icon.back/> Back to results</button>
          <div style={{flex:1}}/>
          <button className="btn btn-outline btn-sm" onClick={()=>onSave(listing.id)}>
            <Icon.heart filled={savedIds.includes(listing.id)}/> {savedIds.includes(listing.id) ? "Shortlisted" : "Shortlist"}
          </button>
          <button className="btn btn-outline btn-sm">Share</button>
        </div>

        {/* gallery — carousel */}
        {(() => {
          const photos = listing.photos || [];

          if (photos.length === 0) {
            return (
              <div style={{height:480, borderRadius:'var(--r-xl)', overflow:'hidden', background:'var(--surface-sunken)', display:'grid', placeItems:'center', color:'var(--text-faint)', fontSize:14}}>
                No photos available
              </div>
            );
          }

          const prev = () => setActivePhoto(i => (i - 1 + photos.length) % photos.length);
          const next = () => setActivePhoto(i => (i + 1) % photos.length);
          const cur  = Math.min(activePhoto, photos.length - 1);

          const btnStyle: React.CSSProperties = {
            position:'absolute', top:'50%', transform:'translateY(-50%)',
            background:'rgba(0,0,0,.45)', backdropFilter:'blur(4px)',
            border:'none', color:'#fff', borderRadius:'50%',
            width:44, height:44, cursor:'pointer', fontSize:22, fontWeight:300,
            display:'flex', alignItems:'center', justifyContent:'center',
            zIndex:2, transition:'background .2s',
          };

          return (
            <div style={{borderRadius:'var(--r-xl)', overflow:'hidden', userSelect:'none'}}
              onMouseEnter={() => setCarouselPaused(true)}
              onMouseLeave={() => setCarouselPaused(false)}>

              {/* Main slide */}
              <div style={{position:'relative', height:480, background:'#000'}}>
                <Img
                  key={cur}
                  src={photos[cur]}
                  style={{width:'100%', height:'100%', objectFit:'cover', transition:'opacity .35s'}}
                />

                {/* Counter badge */}
                <div style={{
                  position:'absolute', top:16, right:16, zIndex:2,
                  background:'rgba(0,0,0,.55)', backdropFilter:'blur(4px)',
                  color:'#fff', padding:'5px 12px', borderRadius:99,
                  fontSize:12, fontWeight:600, display:'flex', alignItems:'center', gap:6,
                }}>
                  <Icon.camera/> {cur + 1} / {photos.length}
                </div>

                {/* Prev / Next */}
                {photos.length > 1 && <>
                  <button onClick={prev} style={{...btnStyle, left:14}}>‹</button>
                  <button onClick={next} style={{...btnStyle, right:14}}>›</button>
                </>}

                {/* Dot indicators */}
                {photos.length > 1 && (
                  <div style={{
                    position:'absolute', bottom:16, left:'50%', transform:'translateX(-50%)',
                    display:'flex', gap:6, zIndex:2,
                  }}>
                    {photos.map((_, i) => (
                      <button key={i} onClick={() => setActivePhoto(i)} style={{
                        padding:0, border:'none', cursor:'pointer', borderRadius:99,
                        width: i === cur ? 22 : 8, height:8,
                        background: i === cur ? '#fff' : 'rgba(255,255,255,.45)',
                        transition:'all .25s',
                      }}/>
                    ))}
                  </div>
                )}

                {/* Auto-slide progress bar */}
                {photos.length > 1 && !carouselPaused && (
                  <div style={{position:'absolute', bottom:0, left:0, right:0, height:3, background:'rgba(255,255,255,.2)', zIndex:2}}>
                    <div key={`${cur}-${carouselPaused}`} style={{
                      height:'100%', background:'var(--brand-500)',
                      animation:'carousel-progress 5s linear forwards',
                    }}/>
                  </div>
                )}
              </div>

              {/* Thumbnail strip */}
              {photos.length > 1 && (
                <div style={{display:'flex', gap:6, padding:'8px 0', overflowX:'auto'}}>
                  {photos.map((p, i) => (
                    <div key={i} onClick={() => setActivePhoto(i)} style={{
                      flexShrink:0, width:80, height:58, borderRadius:'var(--r-sm)', overflow:'hidden',
                      cursor:'pointer', border:'2px solid', transition:'border-color .2s',
                      borderColor: i === cur ? 'var(--brand-500)' : 'transparent',
                    }}>
                      <img src={p} alt="" style={{width:'100%', height:'100%', objectFit:'cover'}}/>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );

        })()}

        <div className="detail-main-grid" style={{display:'grid', gridTemplateColumns:'1fr 380px', gap:48, marginTop:36, alignItems:'start'}}>
          {/* LEFT COLUMN */}
          {/* minWidth:0 lets this grid item shrink below the intrinsic width of the
              "Similar homes" horizontal-scroll row below — without it, that row's
              content (6 × 280px cards) forces the whole grid (and page) wider than
              the viewport, causing a page-level horizontal scrollbar. */}
          <div style={{minWidth:0}}>
            <div style={{display:'flex', gap:10, marginBottom:14, flexWrap:'wrap'}}>
              {listing.isNew && <span className="chip chip-dark">NEW · {listing.posted}</span>}
              <span className="chip"><Icon.pin/> {listing.locality}, {listing.city}</span>
              <span className="chip chip-brand">
                <Icon.shield/> {listing.listedBy}
              </span>
            </div>

            <h1 className="font-display" style={{fontSize:'clamp(32px, 4vw, 48px)', fontWeight:800, letterSpacing:'-0.035em', margin:0, lineHeight:1.05}}>
              {listing.title}
            </h1>

            <div style={{marginTop:14, fontSize:15, color:'var(--text-muted)'}}>
              Posted {listing.posted} · Listing ID <span className="font-mono">{listing.id}</span> · {Math.floor(listing.pop * 4.2)} views this week
            </div>

            {/* the privacy callout */}
            <div style={{marginTop:24, padding:'14px 18px', background:'var(--brand-50)', borderRadius:'var(--r-md)', display:'flex', gap:14, alignItems:'center'}}>
              <span style={{fontSize:22, color:'var(--brand-500)'}}><Icon.lock/></span>
              <div style={{fontSize:13, color:'var(--brand-900)', fontWeight:500, flex:1}}>
                <strong style={{fontWeight:700}}>Address hidden for privacy.</strong>{' '}
                We show locality only. Pay <strong>₹{fmt(listing.feeGST)}</strong> to unlock the full address & owner's number.
              </div>
            </div>

            {/* specs grid */}
            <div style={{marginTop:36}}>
              <SectionTitle>Property details</SectionTitle>
              <div className="detail-spec-grid" style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:16, marginTop:16}}>
                <Spec icon={<Icon.bed/>} label="Configuration" value={`${listing.bhk} BHK`}/>
                <Spec icon={<Icon.area/>} label="Carpet area" value={`${fmt(listing.area)} sq ft`}/>
                <Spec icon={<Icon.floor/>} label="Floor" value={`${listing.floor} of ${listing.total}`}/>
                <Spec icon={<Icon.sparkle/>} label="Facing" value={listing.facing}/>
                <Spec label="Furnishing" value={listing.furnishing}/>
                <Spec label="Age" value={listing.age}/>
                <Spec label="Available" value={listing.available}/>
                <Spec label="Deposit" value={`₹${listing.deposit}k`}/>
              </div>
            </div>

            {/* amenities */}
            <div style={{marginTop:40}}>
              <SectionTitle>Amenities</SectionTitle>
              <div className="detail-amenities-grid" style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:10, marginTop:16}}>
                {AMENITIES.map(a=>{
                  const has = listing.amenities.includes(a.id);
                  return (
                    <div key={a.id} style={{
                      display:'flex', alignItems:'center', gap:10,
                      padding:'10px 14px', borderRadius:'var(--r-sm)',
                      background: has ? 'var(--surface-sunken)' : 'transparent',
                      color: has ? 'var(--text)' : 'var(--text-faint)',
                      textDecoration: has ? 'none' : 'line-through',
                      fontSize:14,
                    }}>
                      <span style={{
                        width:24, height:24, borderRadius:6,
                        background: has ? 'var(--text)' : 'transparent',
                        color: 'var(--bg)',
                        border: has ? 0 : '1px dashed var(--border-strong)',
                        display:'grid', placeItems:'center', fontSize:12,
                      }}>{has && <Icon.check/>}</span>
                      {a.label}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* description */}
            {listing.description && (
              <div style={{marginTop:40}}>
                <SectionTitle>About this home</SectionTitle>
                <p style={{fontSize:16, lineHeight:1.7, color:'var(--text)', marginTop:16, whiteSpace:'pre-wrap'}}>
                  {listing.description}
                </p>
              </div>
            )}

            {/* locality */}
            <div style={{marginTop:40}}>
              <SectionTitle>The neighbourhood</SectionTitle>
              <div style={{borderRadius:'var(--r-lg)', overflow:'hidden', height:260, marginTop:16, border:'1px solid var(--border)'}}>
                <MiniMap label={listing.locality} lat={listing._api?.latitude} lng={listing._api?.longitude}/>
              </div>
              <div style={{marginTop:10, fontSize:13, color:'var(--text-muted)'}}>
                <Icon.pin/> {listing.locality}, {listing.city}{listing.state ? `, ${listing.state}` : ''}
                {listing._api?.pincode ? ` – ${listing._api.pincode}` : ''}
              </div>
            </div>

            {/* similar */}
            {ctxListings.filter(l=>l.id!==listing.id).length > 0 && (
              <div style={{marginTop:48}}>
                <SectionTitle>Similar homes nearby</SectionTitle>
                <div className="scroll-x" style={{display:'flex', gap:16, marginTop:18, paddingBottom:8}}>
                  {ctxListings.filter(l=>l.id!==listing.id).slice(0,6).map(l=>(
                    <div key={l.id} style={{minWidth:280, maxWidth:280}}>
                      <ListingCard listing={l}
                        onOpen={()=>nav('detail', l.id)}
                        onUnlock={onUnlock}
                        saved={savedIds.includes(l.id)}
                        onSave={onSave}/>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN — sticky pricing */}
          <aside style={{position:'sticky', top:88}}>
            <div className="card" style={{padding:24, boxShadow:'var(--sh-2)'}}>
              <div style={{display:'flex', alignItems:'baseline', gap:6}}>
                <div className="font-display" style={{fontSize:40, fontWeight:800, letterSpacing:'-0.04em'}}>₹{listing.rentK}k</div>
                <div style={{color:'var(--text-muted)', fontSize:14}}>/ month</div>
              </div>
              <div style={{fontSize:13, color:'var(--text-muted)', marginTop:4}}>
                Deposit ₹{listing.deposit}k · {listing.furnishing}
              </div>

              {/* fee breakdown */}
              <div style={{marginTop:24, padding:'18px 18px', background:'var(--surface-sunken)', borderRadius:'var(--r-md)'}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
                  <div style={{fontSize:12, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.08em'}}>To unlock</div>
                  <span className="chip" style={{background:'var(--text)', color:'var(--bg)', border:0, height:22, fontSize:11}}>FLAT FEE</span>
                </div>
                <div style={{display:'flex', flexDirection:'column', gap:6, fontSize:13}}>
                  <div style={{display:'flex', justifyContent:'space-between', color:'var(--text-muted)'}}>
                    <span>₹{listing.rentK}k ÷ 30 × 50% of market rate</span>
                    <span className="font-mono">₹{fmt(listing.fee)}</span>
                  </div>
                  <div style={{display:'flex', justifyContent:'space-between', color:'var(--text-muted)'}}>
                    <span>GST (18%)</span>
                    <span className="font-mono">₹{fmt(listing.feeGST - listing.fee)}</span>
                  </div>
                  <div style={{height:1, background:'var(--border)', margin:'6px 0'}}/>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline'}}>
                    <span style={{fontWeight:600}}>Total to pay</span>
                    <span className="font-display" style={{fontWeight:800, fontSize:22, letterSpacing:'-0.02em'}}>₹{fmt(listing.feeGST)}</span>
                  </div>
                </div>
              </div>

              {/* First-visit banner */}
              <div style={{
                background:'linear-gradient(135deg,#E6F3F0,#F0FAF7)',
                border:'1.5px solid var(--brand-200,#A7D9CE)',
                borderRadius:'var(--r-md)',
                padding:'14px 20px',
                marginBottom:16,
                display:'flex',
                alignItems:'center',
                gap:12,
              }}>
                <span style={{fontSize:24}}>🏠</span>
                <div>
                  <div style={{fontWeight:700,fontSize:15,color:'var(--brand-700,#0D7C66)'}}>First, visit the flat. Then pay.</div>
                  <div style={{fontSize:13,color:'var(--text-muted)',marginTop:2}}>Schedule a free visit — our team will coordinate. Pay only after you've seen it.</div>
                </div>
              </div>

              {/* Schedule a Visit button */}
              <button
                onClick={()=>setVisitRequested(true)}
                style={{width:'100%',padding:'11px 0',borderRadius:'var(--r-md)',background:'var(--surface-sunken)',border:'1.5px solid var(--border-strong)',color:'var(--text)',fontWeight:600,fontSize:14,cursor:'pointer',marginBottom:10}}
              >
                📅 Schedule a Visit
              </button>
              {visitRequested && (
                <div style={{marginBottom:10,padding:'10px 14px',background:'#F0FDF4',border:'1px solid #86EFAC',borderRadius:'var(--r-md)',fontSize:13,color:'#166534'}}>
                  ✓ Our team will reach out within 2 hours. No payment needed to visit.
                </div>
              )}

              <button className="btn btn-brand btn-lg btn-block" style={{marginTop:18}} onClick={()=>onUnlock(listing)}>
                <Icon.unlock/> Unlock contact & address
              </button>

              <div style={{marginTop:12, padding:'10px 12px', background:'transparent', display:'flex', gap:10, alignItems:'flex-start', fontSize:12, color:'var(--text-muted)', lineHeight:1.5}}>
                <span style={{color:'var(--success)', fontSize:14, flexShrink:0}}><Icon.shield/></span>
                <div>
                  Address revealed instantly after payment.
                  Full refund within 24 hours if details turn out to be invalid.
                </div>
              </div>

              <div style={{marginTop:18, paddingTop:18, borderTop:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <div style={{display:'flex', alignItems:'center', gap:10}}>
                  <div style={{width:36, height:36, borderRadius:'50%', background:'var(--brand-500)', color:'#fff', display:'grid', placeItems:'center', fontWeight:700, fontSize:14}}>
                    {listing.isBroker ? "VB" : "DO"}
                  </div>
                  <div>
                    <div style={{fontSize:13, fontWeight:600}}>{listing.isBroker ? "Verified Broker" : "Direct Owner"}</div>
                    <div style={{fontSize:11, color:'var(--text-muted)'}}>{listing.isBroker ? "RERA MH-234856" : "Member since 2024"}</div>
                  </div>
                </div>
                <span className="chip" style={{height:24, fontSize:11, background:'var(--success)', color:'#fff', border:0}}>✓ Verified</span>
              </div>
            </div>

            <div style={{marginTop:14, fontSize:12, textAlign:'center', color:'var(--text-faint)'}}>
              Listed {listing.posted}
              {listing._api?.expiresAt ? ` · Expires ${new Date(listing._api.expiresAt).toLocaleDateString('en-IN', {day:'numeric', month:'short'})}` : ''}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({children}) {
  return (
    <h3 className="font-display" style={{fontSize:22, fontWeight:700, letterSpacing:'-0.02em', margin:0}}>{children}</h3>
  );
}

function Spec({icon, label, value}) {
  return (
    <div style={{padding:'14px 16px', background:'var(--surface-sunken)', borderRadius:'var(--r-md)'}}>
      {icon && <div style={{fontSize:18, color:'var(--text-muted)', marginBottom:8}}>{icon}</div>}
      <div style={{fontSize:11, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.08em', fontWeight:600}}>{label}</div>
      <div className="font-display" style={{fontSize:18, fontWeight:700, letterSpacing:'-0.02em', marginTop:4}}>{value}</div>
    </div>
  );
}

function Stat({label, value}) {
  return (
    <div>
      <div style={{fontSize:11, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.06em'}}>{label}</div>
      <div className="font-display" style={{fontSize:18, fontWeight:700, marginTop:2}}>{value}</div>
    </div>
  );
}

// ---- unlock.jsx ----
// unlock.jsx — Urbify payment / unlock flow + how-it-works

export { DetailPage };
