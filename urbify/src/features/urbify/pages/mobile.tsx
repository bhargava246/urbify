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

function MobilePreview({open, onClose, page, listing, savedIds}) {
  if (!open) return null;
  return (
    <div style={{
      position:'fixed', right:24, bottom:24, zIndex:1000,
      width:280, height:580,
      borderRadius:42, background:'#0F1614',
      padding:8,
      boxShadow:'0 30px 60px rgba(15,22,20,.25), 0 8px 20px rgba(15,22,20,.18)',
      transform:'scale(var(--dc-inv-zoom, 1))', transformOrigin:'bottom right',
    }}>
      <button onClick={onClose} aria-label="close mobile preview" style={{
        position:'absolute', top:-12, left:-12, width:28, height:28,
        borderRadius:'50%', background:'#0F1614', color:'#fff',
        border:'2px solid var(--bg)', cursor:'pointer', display:'grid', placeItems:'center', fontSize:11,
        zIndex:2,
      }}><Icon.close/></button>

      <div style={{
        position:'relative', width:'100%', height:'100%',
        borderRadius:36, overflow:'hidden', background:'var(--bg)',
        color:'var(--text)',
      }}>
        {/* Dynamic island */}
        <div style={{position:'absolute', top:8, left:'50%', transform:'translateX(-50%)', width:90, height:24, borderRadius:99, background:'#0F1614', zIndex:5}}/>

        {/* status bar */}
        <div style={{position:'relative', height:38, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 18px 0', fontSize:11, fontWeight:700}}>
          <span>9:41</span>
          <span style={{display:'flex', gap:5, alignItems:'center'}}>
            <span style={{display:'inline-block', width:14, height:9, border:'1px solid currentColor', borderRadius:2, padding:1, position:'relative'}}>
              <span style={{display:'block', width:9, height:5, background:'currentColor', borderRadius:1}}/>
            </span>
          </span>
        </div>

        <div style={{height:'calc(100% - 38px)', overflow:'auto'}}>
          {page === 'home' && <MobileHome/>}
          {page === 'search' && <MobileSearch savedIds={savedIds}/>}
          {page === 'detail' && <MobileDetail listing={listing}/>}
          {page === 'unlock' && <MobileSuccess listing={listing}/>}
          {page === 'how' && <MobileHow/>}
        </div>
      </div>
    </div>
  );
}

function MobileHome() {
  const { listings } = useAppData();
  return (
    <div style={{padding:'12px 16px 80px'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <Logo/>
        <button style={{width:30, height:30, borderRadius:8, background:'var(--surface-sunken)', border:0, fontSize:14}}>≡</button>
      </div>

      <h1 className="font-display" style={{fontSize:34, lineHeight:.95, letterSpacing:'-0.04em', fontWeight:800, margin:'16px 0 8px'}}>
        Skip the broker.<br/>
        <span style={{color:'var(--text-muted)'}}>Keep the </span>
        <span style={{color:'var(--brand-500)'}}>home.</span>
      </h1>
      <p style={{fontSize:12, color:'var(--text-muted)', margin:'8px 0 16px'}}>
        Owners list ₹0. Tenants pay 50% of market brokerage.
      </p>

      <div className="card" style={{padding:10}}>
        <div style={{display:'flex', gap:4, marginBottom:8}}>
          {["Rent","Buy","Land"].map((t,i)=>(
            <span key={t} className="chip" style={{height:24, padding:'0 12px', fontSize:11, background: i===0?'var(--text)':'transparent', color:i===0?'var(--bg)':'var(--text)', border:i===0?0:'1px solid var(--border)'}}>{t}</span>
          ))}
        </div>
        <div style={{padding:'8px 10px', background:'var(--surface-sunken)', borderRadius:6, fontSize:12, display:'flex', alignItems:'center', gap:6}}>
          <Icon.pin/> Bangalore, Koramangala
        </div>
        <button className="btn btn-brand btn-sm btn-block" style={{marginTop:8}}><Icon.search/> Search</button>
      </div>

      <div style={{marginTop:20}}>
        <div style={{fontSize:11, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.08em', fontWeight:600, marginBottom:8}}>Fresh today</div>
        {listings.slice(0,3).map(l=>(
          <div key={l.id} className="card" style={{padding:0, overflow:'hidden', marginBottom:10}}>
            <Img src={l.photo} style={{height:120}}/>
            <div style={{padding:12}}>
              <div style={{display:'flex', justifyContent:'space-between'}}>
                <div className="font-display" style={{fontSize:13, fontWeight:700}}>{l.bhk} BHK · {l.locality}</div>
                <div className="font-display" style={{fontSize:14, fontWeight:800}}>₹{l.rentK}k</div>
              </div>
              <div style={{fontSize:10, color:'var(--text-muted)', marginTop:4}}>{l.furnishing} · {l.area} sq ft</div>
              <button className="btn btn-brand btn-sm btn-block" style={{marginTop:8, height:30, fontSize:11}}>
                <Icon.lock/> Unlock · ₹{l.feeGST.toLocaleString("en-IN")}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MobileSearch({savedIds}) {
  const { listings } = useAppData();
  return (
    <div style={{padding:'12px 16px 80px'}}>
      <div style={{display:'flex', gap:6, alignItems:'center'}}>
        <button className="btn btn-ghost btn-sm" style={{padding:'0 6px', height:30}}><Icon.back/></button>
        <input className="input" defaultValue="Koramangala, BLR" style={{flex:1, height:32, fontSize:12, padding:'0 10px'}}/>
      </div>
      <div style={{display:'flex', gap:6, marginTop:10, overflowX:'auto'}} className="scroll-x">
        {["2-3 BHK","₹30-60k","Furnished","Pet ok","< 30d"].map((c,i)=>(
          <span key={c} className="chip" style={{height:26, padding:'0 10px', fontSize:11, whiteSpace:'nowrap', background:i===0?'var(--text)':'var(--surface-sunken)', color:i===0?'var(--bg)':'var(--text)', border:0}}>{c}</span>
        ))}
      </div>
      <div style={{fontSize:11, color:'var(--text-muted)', margin:'14px 0 8px', fontWeight:600}}>247 homes</div>
      {listings.slice(0,4).map(l=>(
        <div key={l.id} className="card" style={{padding:0, overflow:'hidden', marginBottom:10}}>
          <div style={{position:'relative'}}><Img src={l.photo} style={{height:130}}/>
            <button style={{position:'absolute', top:8, right:8, width:26, height:26, borderRadius:'50%', background:'rgba(255,255,255,.92)', border:0, fontSize:12}}>
              <Icon.heart filled={savedIds?.includes(l.id)}/>
            </button>
          </div>
          <div style={{padding:10}}>
            <div className="font-display" style={{fontSize:13, fontWeight:700}}>{l.bhk} BHK · {l.area} sq ft</div>
            <div style={{fontSize:10, color:'var(--text-muted)', marginTop:2}}>{l.locality} · {l.furnishing}</div>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:6}}>
              <div className="font-display" style={{fontSize:15, fontWeight:800}}>₹{l.rentK}k<span style={{fontSize:10, color:'var(--text-muted)', fontWeight:500}}>/mo</span></div>
              <button className="btn btn-brand btn-sm" style={{height:26, padding:'0 10px', fontSize:10}}>Unlock</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function MobileDetail({listing}) {
  const l = listing || LISTINGS[0];
  return (
    <div style={{paddingBottom:80}}>
      <div style={{position:'relative'}}>
        <Img src={l.photo} style={{height:200}}/>
        <button style={{position:'absolute', top:10, left:10, width:30, height:30, borderRadius:'50%', background:'rgba(255,255,255,.92)', border:0}}>
          <Icon.back/>
        </button>
        <span className="chip" style={{position:'absolute', top:10, right:10, height:24, background:'rgba(255,255,255,.92)', border:0, fontSize:10}}><Icon.camera/> 12</span>
      </div>
      <div style={{padding:'14px 16px'}}>
        <div className="font-display" style={{fontSize:18, fontWeight:800, letterSpacing:'-0.02em'}}>{l.bhk} BHK in {l.locality}</div>
        <div style={{fontSize:11, color:'var(--text-muted)', marginTop:2}}>{l.area} sq ft · Floor {l.floor}/{l.total} · {l.furnishing}</div>
        <div style={{marginTop:12, padding:'10px 12px', background:'var(--brand-50)', color:'var(--brand-900)', borderRadius:8, fontSize:11, display:'flex', gap:6, alignItems:'center'}}>
          <Icon.lock/> Address unlocks after payment
        </div>
        <div className="card" style={{padding:14, marginTop:14, boxShadow:'var(--sh-2)'}}>
          <div className="font-display" style={{fontSize:22, fontWeight:800}}>₹{l.rentK}k<span style={{fontSize:11, color:'var(--text-muted)', fontWeight:500}}>/mo</span></div>
          <div style={{fontSize:11, color:'var(--text-muted)', marginTop:2}}>Unlock fee · ₹{l.feeGST.toLocaleString("en-IN")} incl. GST</div>
          <button className="btn btn-brand btn-block" style={{marginTop:10, height:38}}>
            <Icon.unlock/> Unlock contact
          </button>
        </div>
      </div>
    </div>
  );
}

function MobileSuccess({listing}) {
  const l = listing || LISTINGS[0];
  return (
    <div>
      <div style={{background:'var(--brand-500)', color:'#fff', padding:'24px 18px', textAlign:'center'}}>
        <div style={{width:54, height:54, borderRadius:'50%', background:'rgba(255,255,255,.18)', display:'grid', placeItems:'center', margin:'0 auto', fontSize:22}}>
          <Icon.unlock/>
        </div>
        <div className="font-display" style={{fontSize:22, fontWeight:800, letterSpacing:'-0.02em', marginTop:12, lineHeight:1.1}}>Unlocked.</div>
        <div style={{fontSize:11, opacity:.8, marginTop:6}}>Paid ₹{(l.feeGST||0).toLocaleString("en-IN")}</div>
      </div>
      <div style={{padding:'16px'}}>
        <div className="card" style={{padding:14, background:'var(--surface-sunken)', marginBottom:10}}>
          <div style={{fontSize:10, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.08em', fontWeight:700}}>Full address</div>
          <div className="font-display" style={{fontSize:13, fontWeight:700, marginTop:4, lineHeight:1.4}}>
            {l.locality}, {l.city}
          </div>
        </div>
        <div className="card" style={{padding:14}}>
          <div style={{fontSize:10, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.08em', fontWeight:700}}>Owner contact</div>
          <div style={{fontSize:13, fontWeight:600, marginTop:6, display:'flex', alignItems:'center', gap:6}}>
            <Icon.phone/> Tap to call owner
          </div>
        </div>
      </div>
    </div>
  );
}


export { MobilePreview };
