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
import { LocationAutocomplete, Footer } from './home';

function SearchPage({nav, savedIds, onSave, onUnlock, initialSearchParams}) {
  const [bhkSel, setBhkSel] = useState(() => {
    const b = initialSearchParams?.bhk;
    if (!b || b === 'Any') return [1,2,3,4];
    const n = parseInt(b);
    return isNaN(n) ? [1,2,3,4] : [n];
  });
  const [price, setPrice] = useState([10, 150]); // in ₹k
  const [furn, setFurn] = useState({Unfurnished:false, "Semi-furnished":false, "Fully furnished":false});
  const [type, setType] = useState({Apartment:true, "Independent house":false, Villa:false, "PG / Hostel":false});
  const [sort, setSort] = useState("Newest");
  const [showMap, setShowMap] = useState(true);
  const [searchQ, setSearchQ] = useState(initialSearchParams?.q || "");
  const [apiResults, setApiResults] = useState(null); // null = not yet fetched
  const [isSearching, setIsSearching] = useState(false);

  const { listings: ctxListings } = useAppData();

  // ─── Live API search with debounce ────────────────────────────────────────
  useEffect(() => {
    const sortMap = { Newest:'NEWEST', 'Price low':'PRICE_ASC', 'Price high':'PRICE_DESC', Area:'AREA_ASC' };
    const furnMap  = {'Semi-furnished':'SEMI_FURNISHED', 'Fully furnished':'FULLY_FURNISHED', Unfurnished:'UNFURNISHED'};
    const activeFurn = Object.entries(furn).filter(([,v])=>v).map(([k])=>furnMap[k]);
    const params = new URLSearchParams();
    params.set('sortBy', sortMap[sort] || 'NEWEST');
    params.set('minPrice', String(price[0] * 1000));
    params.set('maxPrice', String(price[1] * 1000));
    params.set('limit', '24');
    if (searchQ) params.set('q', searchQ);
    if (bhkSel.length === 1) params.set('bhk', String(bhkSel[0]));
    if (activeFurn.length === 1) params.set('furnishingStatus', activeFurn[0]);

    const timer = setTimeout(() => {
      setIsSearching(true);
      fetch(`/api/v1/properties?${params}`)
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data && Array.isArray(data.data)) {
            setApiResults(data.data.map(normalizeApiListing));
          }
        })
        .catch(() => {})
        .finally(() => setIsSearching(false));
    }, 350);
    return () => clearTimeout(timer);
  }, [bhkSel, price, furn, sort, searchQ]);

  // Fall back to context listings (from initial fetch) if API hasn't responded yet
  const baseListings = apiResults ?? ctxListings;

  const filtered = useMemo(()=>{
    let r = baseListings.filter(l => bhkSel.includes(l.bhk) && l.rentK >= price[0] && l.rentK <= price[1]);
    const anyFurn = Object.values(furn).some(Boolean);
    if (anyFurn) r = r.filter(l => furn[l.furnishing]);
    if (sort === "Price low") r = [...r].sort((a,b)=>a.rentK-b.rentK);
    if (sort === "Price high") r = [...r].sort((a,b)=>b.rentK-a.rentK);
    if (sort === "Area") r = [...r].sort((a,b)=>b.area-a.area);
    return r;
  }, [baseListings, bhkSel, price, furn, sort]);

  return (
    <div>
      {/* breadcrumb / search header */}
      <div style={{borderBottom:'1px solid var(--border)', background:'var(--surface)', padding:'18px 28px'}}>
        <div style={{maxWidth:1440, margin:'0 auto', display:'flex', alignItems:'center', gap:14, flexWrap:'wrap'}}>
          <div style={{fontSize:12, color:'var(--text-muted)'}}>
            <span style={{cursor:'pointer'}} onClick={()=>nav('home')}>Home</span> / Rent / <span style={{color:'var(--text)'}}>Bangalore</span>
          </div>
          <div style={{flex:1}}/>
          <div style={{display:'flex', gap:8, alignItems:'center', minWidth:380}}>
            <div style={{flex:1, position:'relative'}}>
              <LocationAutocomplete value={searchQ} onChange={setSearchQ} placeholder="Search locality, city, landmark…"/>
            </div>
            <button className="btn btn-primary" style={{flexShrink:0}}>{isSearching ? 'Searching…' : <><Icon.search/> Search</>}</button>
          </div>
        </div>
      </div>

      <div style={{maxWidth:1440, margin:'0 auto', padding:'24px 28px', display:'grid', gridTemplateColumns: showMap ? '280px 1fr 420px' : '280px 1fr', gap:24, alignItems:'start'}}>

        {/* ─── Filters ──────────────────────────────────── */}
        <aside style={{position:'sticky', top:88, maxHeight:'calc(100vh - 100px)', overflow:'auto', paddingRight:4}}>
          <div className="card" style={{padding:0, overflow:'hidden'}}>
            <div style={{padding:'14px 18px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <div style={{fontSize:13, fontWeight:600}}>Filters</div>
              <button className="btn btn-ghost btn-sm" onClick={()=>{setBhkSel([1,2,3,4]); setPrice([10,150]); setFurn({Unfurnished:false,"Semi-furnished":false,"Fully furnished":false});}}>Clear</button>
            </div>

            <FilterSection title="Property type">
              {Object.keys(type).map(k=>(
                <Checkbox key={k} checked={type[k]} onChange={v=>setType({...type, [k]:v})}>{k}</Checkbox>
              ))}
            </FilterSection>

            <FilterSection title="BHK">
              <div style={{display:'flex', gap:6, flexWrap:'wrap'}}>
                {[1,2,3,4,"4+"].map(n=>{
                  const num = n === "4+" ? 4 : n;
                  const active = bhkSel.includes(num);
                  return (
                    <button key={n} onClick={()=>setBhkSel(active ? bhkSel.filter(x=>x!==num) : [...bhkSel, num])}
                      style={{
                        padding:'8px 14px', borderRadius:'var(--r-pill)',
                        border:'1px solid var(--border-strong)',
                        background: active ? 'var(--text)' : 'transparent',
                        color: active ? 'var(--bg)' : 'var(--text)',
                        fontSize:13, fontWeight:600, cursor:'pointer',
                      }}>{n} BHK</button>
                  );
                })}
              </div>
            </FilterSection>

            <FilterSection title="Monthly rent">
              <RangeSlider min={10} max={150} value={price} onChange={setPrice} format={(v)=>`₹${v}k`}/>
            </FilterSection>

            <FilterSection title="Furnishing">
              {Object.keys(furn).map(k=>(
                <Checkbox key={k} checked={furn[k]} onChange={v=>setFurn({...furn, [k]:v})}>{k}</Checkbox>
              ))}
            </FilterSection>

            <FilterSection title="Area (sq ft)">
              <RangeSlider min={300} max={3000} value={[500, 2000]} onChange={()=>{}} format={(v)=>v}/>
            </FilterSection>

            <FilterSection title="Available from" last>
              <div style={{display:'flex', flexWrap:'wrap', gap:6}}>
                {["Immediate","< 15 days","< 30 days","Any time"].map((o,i)=>(
                  <button key={o} className="chip" style={{cursor:'pointer', background: i===0?'var(--text)':'transparent', color: i===0?'var(--bg)':'var(--text)', border: i===0?0:'1px solid var(--border-strong)'}}>{o}</button>
                ))}
              </div>
            </FilterSection>
          </div>

          <button className="btn btn-outline btn-block" style={{marginTop:12}}>Save this search</button>
        </aside>

        {/* ─── Results ─────────────────────────────────── */}
        <main>
          <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:16, gap:16, flexWrap:'wrap'}}>
            <div>
              <h1 className="font-display" style={{fontSize:28, fontWeight:800, letterSpacing:'-0.03em', margin:0}}>
                {filtered.length} homes for rent in Bangalore
              </h1>
              <div style={{display:'flex', gap:8, marginTop:10, flexWrap:'wrap'}}>
                {bhkSel.map(b=><span key={b} className="chip">{b} BHK <Icon.close/></span>)}
                <span className="chip">₹{price[0]}k – ₹{price[1]}k <Icon.close/></span>
                {Object.entries(furn).filter(([,v])=>v).map(([k])=><span key={k} className="chip">{k} <Icon.close/></span>)}
              </div>
            </div>
            <div style={{display:'flex', gap:8, alignItems:'center'}}>
              <button className={`btn btn-sm ${showMap ? 'btn-outline' : 'btn-primary'}`} onClick={()=>setShowMap(!showMap)}>
                {showMap ? "Hide map" : "Show map"}
              </button>
              <select className="input select btn-sm" style={{height:34, padding:'0 36px 0 12px', fontSize:13}} value={sort} onChange={e=>setSort(e.target.value)}>
                <option>Newest</option><option>Price low</option><option>Price high</option><option>Area</option>
              </select>
            </div>
          </div>

          <div style={{display:'grid', gridTemplateColumns: showMap ? '1fr 1fr' : 'repeat(3, 1fr)', gap:18}}>
            {filtered.map(l=>(
              <ListingCard key={l.id} listing={l}
                onOpen={()=>nav('detail', l.id)}
                onUnlock={onUnlock}
                saved={savedIds.includes(l.id)}
                onSave={onSave}/>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="card" style={{textAlign:'center', padding:'56px 24px'}}>
              <div style={{fontSize:40, marginBottom:8}}>🔍</div>
              <div className="font-display" style={{fontSize:20, fontWeight:700}}>Nothing matches — yet.</div>
              <div style={{color:'var(--text-muted)', marginTop:8}}>Loosen a filter or save this search to get alerts.</div>
            </div>
          )}

          {filtered.length > 0 && (
            <div style={{display:'flex', justifyContent:'center', marginTop:32}}>
              <button className="btn btn-outline">Load more →</button>
            </div>
          )}
        </main>

        {/* ─── Map ────────────────────────────────────── */}
        {showMap && (
          <aside style={{position:'sticky', top:88, height:'calc(100vh - 100px)'}}>
            <MapPanel listings={filtered}/>
          </aside>
        )}
      </div>

      <Footer nav={nav}/>
    </div>
  );
}

function FilterSection({title, children, last}) {
  return (
    <div style={{padding:'14px 18px', borderBottom: last ? 0 : '1px solid var(--border)'}}>
      <div style={{fontSize:12, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.08em', fontWeight:600, marginBottom:10}}>{title}</div>
      <div style={{display:'flex', flexDirection:'column', gap:8}}>{children}</div>
    </div>
  );
}

function Checkbox({checked, onChange, children}) {
  return (
    <label style={{display:'flex', alignItems:'center', gap:10, cursor:'pointer', fontSize:14}}>
      <span style={{
        width:18, height:18, borderRadius:5,
        border:'1.5px solid', borderColor: checked ? 'var(--text)' : 'var(--border-strong)',
        background: checked ? 'var(--text)' : 'transparent',
        display:'grid', placeItems:'center', color:'var(--bg)',
        transition:'all .15s',
      }}>
        {checked && <span style={{fontSize:11}}><Icon.check/></span>}
      </span>
      <input type="checkbox" checked={checked} onChange={e=>onChange(e.target.checked)} style={{position:'absolute', opacity:0, pointerEvents:'none'}}/>
      <span>{children}</span>
    </label>
  );
}

// Dual-thumb range slider
function RangeSlider({min, max, value, onChange, format}) {
  const [a, b] = value;
  const pct = (v) => ((v - min) / (max - min)) * 100;
  return (
    <div style={{paddingTop:6}}>
      <div style={{display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:8}}>
        <span style={{fontWeight:600}}>{format(a)}</span>
        <span style={{fontWeight:600}}>{format(b)}</span>
      </div>
      <div style={{position:'relative', height:24}}>
        <div style={{position:'absolute', top:11, left:0, right:0, height:3, background:'var(--border)', borderRadius:99}}/>
        <div style={{position:'absolute', top:11, left:`${pct(a)}%`, right:`${100-pct(b)}%`, height:3, background:'var(--text)', borderRadius:99}}/>
        <input type="range" min={min} max={max} value={a} onChange={e=>onChange([+e.target.value, b])}
          style={{position:'absolute', inset:0, width:'100%', appearance:'none', background:'transparent', pointerEvents:'none'}}
          className="range-thumb"/>
        <input type="range" min={min} max={max} value={b} onChange={e=>onChange([a, +e.target.value])}
          style={{position:'absolute', inset:0, width:'100%', appearance:'none', background:'transparent', pointerEvents:'none'}}
          className="range-thumb"/>
      </div>
    </div>
  );
}

// Map panel — real Ola Maps with listing pins
function MapPanel({listings}) {
  // Build markers from listings that have lat/lng; fall back to city-centre coords
  // for listings without coordinates (privacy: only locality is known publicly)
  const CITY_CENTRES = {
    Bangalore: [77.5946, 12.9716],
    Mumbai:    [72.8777, 19.0760],
    Pune:      [73.8567, 18.5204],
    'Delhi NCR': [77.1025, 28.7041],
    Hyderabad: [78.4867, 17.3850],
    Chennai:   [80.2707, 13.0827],
  };

  const markers = listings.map((l, i) => {
    // Small random scatter so overlapping pins don't stack exactly
    const scatter = 0.003;
    const base = CITY_CENTRES[l.city] ?? [77.5946, 12.9716];
    return {
      lng: (l.longitude ?? base[0]) + (Math.random() - 0.5) * scatter,
      lat: (l.latitude  ?? base[1]) + (Math.random() - 0.5) * scatter,
      price: l.price ? `₹${Math.round(l.price / 1000)}k` : undefined,
      label: `${l.locality || l.city} · ${l.bhk ? l.bhk + " BHK" : l.type || ""}`,
      color: "#0D7C66",
    };
  });

  // Centre map on first listing or Bangalore
  const first = markers[0];
  const center = first ? [first.lng, first.lat] : [77.5946, 12.9716];

  return (
    <div style={{position:'relative', height:'100%', borderRadius:'var(--r-lg)', overflow:'hidden'}}>
      <OlaMap
        center={center}
        zoom={markers.length === 1 ? 14 : 12}
        markers={markers}
        height="100%"
      />
      <div style={{position:'absolute', top:12, left:12}}>
        <span className="chip" style={{background:'rgba(255,255,255,.95)', border:0, fontWeight:600}}>
          📍 {markers.length} listing{markers.length !== 1 ? 's' : ''} · locality only shown
        </span>
      </div>
    </div>
  );
}

// ---- detail.jsx ----

export { SearchPage };
