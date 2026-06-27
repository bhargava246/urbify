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
  PortalShell, StatCard, StatusBadge, DashHeader, Footer,
} from '../_shared';

function ComparePage({nav, savedIds, onSave, onUnlock}) {
  const { listings } = useAppData();
  const [pickerOpen, setPickerOpen] = useState(false);
  // Pre-populate from shortlist page if compare IDs were stored in sessionStorage
  const [picked, setPicked] = useState(() => {
    try {
      const stored = sessionStorage.getItem('urbify_compare_ids');
      if (stored) { sessionStorage.removeItem('urbify_compare_ids'); return JSON.parse(stored); }
    } catch {}
    return [];
  });

  const items = picked.map(id => listings.find(l=>l.id === id)).filter(Boolean);
  const cols = items.length;

  const fmt = (n) => n.toLocaleString("en-IN");
  const all = (vals) => vals.every(v => v === vals[0]);
  const min = (vals) => Math.min(...vals);
  const max = (vals) => Math.max(...vals);

  const remove = (id) => setPicked(p => p.filter(x => x !== id));
  const add = (id) => { if (picked.length < 3 && !picked.includes(id)) setPicked([...picked, id]); setPickerOpen(false); };

  // helper: highlight cell with winner / loser styling
  const cell = (val, type, vals, more='') => {
    let tone = null;
    if (type === 'min' && vals.length > 1 && !all(vals)) {
      if (val === min(vals)) tone = 'best';
      else if (val === max(vals)) tone = 'worst';
    }
    if (type === 'max' && vals.length > 1 && !all(vals)) {
      if (val === max(vals)) tone = 'best';
      else if (val === min(vals)) tone = 'worst';
    }
    return (
      <div style={{
        padding:'12px 16px',
        background: tone === 'best' ? 'color-mix(in oklab, var(--success) 12%, transparent)' : 'transparent',
        borderRadius:'var(--r-sm)',
      }}>
        <div style={{fontSize:15, fontWeight: tone ? 700 : 500, color: tone === 'worst' ? 'var(--text-muted)' : 'var(--text)', display:'flex', alignItems:'center', gap:8}}>
          {tone === 'best' && <span style={{fontSize:12, color:'var(--success)'}}>✓</span>}
          {val}
        </div>
        {more && <div style={{fontSize:11, color:'var(--text-faint)', marginTop:2}}>{more}</div>}
      </div>
    );
  };

  // amenity-feature comparison
  const amenityRow = (key, label) => {
    const vals = items.map(l => l.amenities.includes(key));
    return (
      <RowFrame label={label} cols={cols}>
        {vals.map((v, i)=>(
          <div key={i} style={{padding:'12px 16px', display:'flex', alignItems:'center', gap:8, fontSize:14, color: v ? 'var(--text)' : 'var(--text-faint)'}}>
            {v ? <span style={{color:'var(--success)', fontWeight:700}}>✓</span> : <span style={{color:'var(--text-faint)'}}>—</span>}
            <span>{v ? label : 'Not included'}</span>
          </div>
        ))}
      </RowFrame>
    );
  };

  // table column template
  const tplCols = `220px repeat(${cols}, 1fr)`;

  return (
    <div>
      <div style={{padding:'16px 28px', maxWidth:1440, margin:'0 auto'}}>
        <button className="btn btn-ghost btn-sm" onClick={()=>nav('search')}><Icon.back/> Back to search</button>
      </div>
      <section style={{padding:'16px 28px 24px', maxWidth:1440, margin:'0 auto'}}>
        <div style={{fontSize:12, color:'var(--text-muted)', marginBottom:18}}>
          <span style={{cursor:'pointer'}} onClick={()=>nav('clientDash')}>Dashboard</span> / <span style={{color:'var(--text)'}}>Compare</span>
        </div>

        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-end', gap:16, flexWrap:'wrap'}}>
          <div>
            <div className="chip" style={{background:'transparent', border:'1px solid var(--border-strong)', marginBottom:16}}>Compare · {cols} of 3</div>
            <h1 className="font-display" style={{fontSize:'clamp(36px, 5vw, 56px)', fontWeight:800, letterSpacing:'-0.04em', lineHeight:1, margin:0}}>
              Side by side.
            </h1>
            <p className="muted" style={{fontSize:16, marginTop:12, maxWidth:480}}>
              Lock-in the differences before you unlock anything. The winning cell on each row is highlighted.
            </p>
          </div>
          <div style={{display:'flex', gap:8}}>
            <button className="btn btn-outline">Save comparison</button>
            <button className="btn btn-outline"><Icon.download/> Export</button>
          </div>
        </div>
      </section>

      <section style={{padding:'24px 28px 80px', maxWidth:1440, margin:'0 auto'}}>
        <div className="card" style={{padding:0, overflow:'hidden'}}>
          {/* Header row — listing cards */}
          <div style={{display:'grid', gridTemplateColumns: tplCols, alignItems:'stretch', background:'var(--surface)', borderBottom:'1px solid var(--border)'}}>
            <div style={{padding:'20px 22px', display:'flex', alignItems:'flex-end'}}>
              <div style={{fontSize:11, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.08em', fontWeight:700}}>Compare {cols} homes</div>
            </div>
            {items.map((l, i)=>(
              <div key={l.id} style={{borderLeft:'1px solid var(--border)', position:'relative'}}>
                <button onClick={()=>remove(l.id)} style={{
                  position:'absolute', top:10, right:10, zIndex:2,
                  width:28, height:28, borderRadius:'50%',
                  background:'rgba(255,255,255,.92)', border:0, cursor:'pointer',
                  display:'grid', placeItems:'center', fontSize:11,
                }}><Icon.close/></button>
                <div style={{position:'relative', aspectRatio:'16/10'}}>
                  <Img src={l.photo} style={{width:'100%', height:'100%'}}/>
                  <div style={{position:'absolute', left:12, bottom:10, color:'#fff', textShadow:'0 1px 8px rgba(0,0,0,.4)'}}>
                    <div style={{fontSize:11, opacity:.85, fontWeight:600, display:'flex', alignItems:'center', gap:4}}><Icon.pin/> {l.locality}</div>
                  </div>
                </div>
                <div style={{padding:'14px 18px'}}>
                  <div className="font-display" style={{fontSize:16, fontWeight:700, letterSpacing:'-0.02em', lineHeight:1.25}}>{l.bhk} BHK in {l.locality}</div>
                  <div className="font-display" style={{fontSize:28, fontWeight:800, letterSpacing:'-0.03em', marginTop:8}}>₹{l.rentK}k<span style={{fontSize:12, color:'var(--text-muted)', fontWeight:500}}>/mo</span></div>
                  <button className="btn btn-brand btn-sm btn-block" style={{marginTop:10}} onClick={()=>onUnlock(l)}>
                    <Icon.unlock/> Unlock · ₹{fmt(l.feeGST)}
                  </button>
                  <button className="btn btn-ghost btn-sm btn-block" onClick={()=>nav('detail', l.id)}>View listing →</button>
                </div>
              </div>
            ))}
            {cols < 3 && (
              <div style={{borderLeft:'1px solid var(--border)', padding:28, display:'flex', alignItems:'center', justifyContent:'center'}}>
                <button onClick={()=>setPickerOpen(true)} style={{
                  width:'100%', minHeight:200,
                  border:'2px dashed var(--border-strong)', borderRadius:'var(--r-md)',
                  background:'transparent', cursor:'pointer', display:'flex',
                  flexDirection:'column', alignItems:'center', justifyContent:'center', gap:10,
                  color:'var(--text-muted)', fontWeight:600, fontSize:14,
                }}>
                  <div style={{fontSize:32}}>＋</div>
                  Add another to compare
                </button>
              </div>
            )}
          </div>

          {/* Group: Basics */}
          <GroupHeader>Basics</GroupHeader>
          <CompareRow label="Configuration" tpl={tplCols}>
            {items.map((l, i) => cell(`${l.bhk} BHK`, null))}
          </CompareRow>
          <CompareRow label="Carpet area" tpl={tplCols}>
            {items.map((l, i) => cell(`${fmt(l.area)} sq ft`, 'max', items.map(x=>x.area)))}
          </CompareRow>
          <CompareRow label="Monthly rent" tpl={tplCols}>
            {items.map((l, i) => cell(`₹${l.rentK}k`, 'min', items.map(x=>x.rentK), `per sq ft: ₹${Math.round(l.rentK*1000/l.area)}`))}
          </CompareRow>
          <CompareRow label="Deposit" tpl={tplCols}>
            {items.map((l, i) => cell(`₹${l.deposit}k`, 'min', items.map(x=>x.deposit)))}
          </CompareRow>
          <CompareRow label="Unlock fee" tpl={tplCols} last>
            {items.map((l, i) => cell(`₹${fmt(l.feeGST)}`, 'min', items.map(x=>x.feeGST), 'incl. 18% GST'))}
          </CompareRow>

          {/* Group: Property */}
          <GroupHeader>Property</GroupHeader>
          <CompareRow label="Floor" tpl={tplCols}>{items.map((l,i)=>cell(`${l.floor} of ${l.total}`, null))}</CompareRow>
          <CompareRow label="Facing" tpl={tplCols}>{items.map((l,i)=>cell(l.facing, null))}</CompareRow>
          <CompareRow label="Furnishing" tpl={tplCols}>{items.map((l,i)=>cell(l.furnishing, null))}</CompareRow>
          <CompareRow label="Age" tpl={tplCols}>{items.map((l,i)=>cell(l.age, null))}</CompareRow>
          <CompareRow label="Available from" tpl={tplCols} last>{items.map((l,i)=>cell(l.available, null))}</CompareRow>

          {/* Group: Amenities */}
          <GroupHeader>Amenities</GroupHeader>
          {AMENITIES.map((a, idx) => (
            <RowFrame key={a.id} label={a.label} tpl={tplCols} last={idx === AMENITIES.length - 1}>
              {items.map((l, i)=>{
                const has = l.amenities.includes(a.id);
                return (
                  <div key={i} style={{padding:'12px 16px', display:'flex', alignItems:'center', gap:8, fontSize:14, color: has ? 'var(--text)' : 'var(--text-faint)'}}>
                    {has ? <span style={{color:'var(--success)', fontWeight:700}}>✓</span> : <span style={{color:'var(--text-faint)'}}>—</span>}
                    <span>{has ? 'Included' : '—'}</span>
                  </div>
                );
              })}
            </RowFrame>
          ))}

          {/* Group: Listed by */}
          <GroupHeader>Listed by</GroupHeader>
          <CompareRow label="Listing party" tpl={tplCols}>
            {items.map((l, i)=>(
              <div key={i} style={{padding:'12px 16px', fontSize:14}}>
                <div style={{display:'flex', alignItems:'center', gap:8}}>
                  <div style={{width:24, height:24, borderRadius:'50%', background: l.isBroker ? 'var(--brand-500)' : 'var(--text)', color:'#fff', display:'grid', placeItems:'center', fontSize:10, fontWeight:700}}>
                    {l.isBroker ? 'VB' : 'DO'}
                  </div>
                  <span style={{fontWeight:600}}>{l.isBroker ? 'Verified Broker' : 'Direct Owner'}</span>
                </div>
                {l.isBroker && <div style={{fontSize:11, color:'var(--text-muted)', marginTop:4, fontFamily:'var(--f-mono)'}}>{l.listedBy.replace('Verified Broker · ', '')}</div>}
              </div>
            ))}
          </CompareRow>
          <CompareRow label="Posted" tpl={tplCols} last>{items.map((l,i)=>cell(l.posted, null))}</CompareRow>

          {/* Verdict row */}
          <div style={{padding:'24px 22px', background:'var(--surface-sunken)', borderTop:'1px solid var(--border)'}}>
            <div style={{display:'grid', gridTemplateColumns: tplCols, alignItems:'center'}}>
              <div style={{fontSize:11, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.08em', fontWeight:700}}>Quick take</div>
              {items.map((l, i)=>{
                const isCheapest = l.rentK === min(items.map(x=>x.rentK));
                const isBiggest = l.area === max(items.map(x=>x.area));
                let tag = null, tone = null;
                if (isCheapest && cols > 1) { tag = 'Cheapest option'; tone = 'success'; }
                else if (isBiggest && cols > 1) { tag = 'Most spacious'; tone = 'brand'; }
                else { tag = 'Solid all-rounder'; tone = 'muted'; }
                return (
                  <div key={i} style={{padding:'0 16px'}}>
                    <span className="chip" style={{
                      background: tone === 'success' ? 'var(--success)' : tone === 'brand' ? 'var(--brand-500)' : 'var(--surface)',
                      color: tone === 'muted' ? 'var(--text)' : '#fff',
                      border: tone === 'muted' ? '1px solid var(--border)' : 0,
                      height:24, fontSize:11, fontWeight:700,
                    }}>{tag}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Picker modal */}
        {pickerOpen && (
          <Modal open={pickerOpen} onClose={()=>setPickerOpen(false)} width={720}>
            <div style={{padding:'24px 28px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <div>
                <div className="font-display" style={{fontSize:20, fontWeight:700, letterSpacing:'-0.02em'}}>Add to compare</div>
                <div style={{fontSize:13, color:'var(--text-muted)', marginTop:4}}>Pick from your shortlist</div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={()=>setPickerOpen(false)}><Icon.close/></button>
            </div>
            <div style={{padding:20, maxHeight:480, overflow:'auto'}}>
              {listings.filter(l => !picked.includes(l.id)).slice(0, 8).map(l=>(
                <div key={l.id} onClick={()=>add(l.id)} style={{
                  display:'flex', alignItems:'center', gap:14, padding:12, borderRadius:'var(--r-md)',
                  cursor:'pointer', transition:'background .15s',
                }}
                onMouseEnter={e=>e.currentTarget.style.background='var(--surface-sunken)'}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <Img src={l.photo} style={{width:64, height:64, borderRadius:'var(--r-sm)'}}/>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:600}}>{l.bhk} BHK · {l.locality}</div>
                    <div style={{fontSize:12, color:'var(--text-muted)', marginTop:2}}>{l.area} sq ft · {l.furnishing}</div>
                  </div>
                  <div className="font-display" style={{fontSize:18, fontWeight:800}}>₹{l.rentK}k</div>
                  <button className="btn btn-brand btn-sm">＋ Add</button>
                </div>
              ))}
            </div>
          </Modal>
        )}
      </section>
    </div>
  );
}

function GroupHeader({children}) {
  return (
    <div style={{padding:'14px 22px', background:'var(--surface-sunken)', borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)', fontSize:11, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.1em', fontWeight:700}}>
      {children}
    </div>
  );
}

function CompareRow({label, children, tpl, last}) {
  return (
    <div style={{display:'grid', gridTemplateColumns:tpl, alignItems:'stretch', borderBottom: last ? 0 : '1px solid var(--border)'}}>
      <div style={{padding:'12px 22px', fontSize:13, color:'var(--text-muted)', fontWeight:500, display:'flex', alignItems:'center'}}>{label}</div>
      {children.map((c, i)=><div key={i} style={{borderLeft:'1px solid var(--border)', display:'flex', alignItems:'center'}}>{React.cloneElement(c, {style:{...c.props.style, width:'100%'}})}</div>)}
    </div>
  );
}

function RowFrame({label, children, tpl, last}) {
  return (
    <div style={{display:'grid', gridTemplateColumns:tpl, alignItems:'stretch', borderBottom: last ? 0 : '1px solid var(--border)'}}>
      <div style={{padding:'12px 22px', fontSize:13, color:'var(--text-muted)', fontWeight:500, display:'flex', alignItems:'center'}}>{label}</div>
      {children.map((c, i)=><div key={i} style={{borderLeft:'1px solid var(--border)'}}>{c}</div>)}
    </div>
  );
}

// ---- notifications-page.jsx ----
// notifications-page.jsx — Notifications inbox


export { ComparePage };
