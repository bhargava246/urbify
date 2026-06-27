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

// ---- home.jsx ----
// home.jsx — Urbify homepage

function LocationAutocomplete({ value, onChange, onCoordsChange, placeholder = "City, locality or landmark…" }) {
  const [inputVal, setInputVal] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasFocused, setHasFocused] = useState(false);
  const ref = React.useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Debounced autocomplete — only after user has actively focused the input
  useEffect(() => {
    if (!hasFocused || inputVal.length < 2) { setSuggestions([]); setOpen(false); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const apiKey = (typeof window !== 'undefined' && window.__OLA_KEY__) || '';
        if (!apiKey) { setLoading(false); return; } // Ola Maps not configured — skip autocomplete
        const res = await fetch(
          `https://api.olamaps.io/places/v1/autocomplete?input=${encodeURIComponent(inputVal)}&api_key=${apiKey}`
        );
        const data = await res.json();
        const preds = (data.predictions || []).slice(0, 6).map(p => ({
          label: p.description || p.structured_formatting?.main_text || p.place_id,
          mainText: p.structured_formatting?.main_text || p.description || p.place_id,
          secondary: p.structured_formatting?.secondary_text || '',
          placeId: p.place_id,
          lat: p.geometry?.location?.lat,
          lng: p.geometry?.location?.lng,
        }));
        setSuggestions(preds);
        setOpen(preds.length > 0);
      } catch {
        // fallback: no suggestions
      } finally {
        setLoading(false);
      }
    }, 320);
    return () => clearTimeout(timer);
  }, [inputVal, hasFocused]);

  const select = async (item) => {
    setInputVal(item.label);
    setSuggestions([]);
    setOpen(false);
    // Use mainText (e.g. "Koramangala") not full description as the search term —
    // full label like "Koramangala, Bengaluru, Karnataka, India" won't match any DB field.
    const searchTerm = item.mainText || item.label;
    if (item.lat && item.lng) {
      // Coords available synchronously — pass both at once so coords win immediately
      onChange(searchTerm);
      onCoordsChange?.({ lat: item.lat, lng: item.lng });
    } else if (item.placeId && onCoordsChange) {
      // Coords need a Place Details fetch — suppress text search until they arrive
      // by NOT calling onChange yet; set the input display only.
      const apiKey = (typeof window !== 'undefined' && window.__OLA_KEY__) || '';
      if (apiKey) {
        try {
          const res = await fetch(`https://api.olamaps.io/places/v1/details?place_id=${encodeURIComponent(item.placeId)}&api_key=${apiKey}`);
          const data = await res.json();
          const loc = data?.result?.geometry?.location;
          onChange(searchTerm);
          if (loc?.lat && loc?.lng) onCoordsChange({ lat: loc.lat, lng: loc.lng });
        } catch {
          onChange(searchTerm); // fallback to text search on error
        }
      } else {
        onChange(searchTerm);
      }
    } else {
      onChange(searchTerm);
    }
  };

  return (
    <div ref={ref} style={{ position: 'relative', flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px', background: 'var(--surface-sunken)', borderRadius: 'var(--r-sm)', height: 'var(--row-h)' }}>
        <span style={{ fontSize: 16, color: 'var(--text-muted)', flexShrink: 0 }}><Icon.pin/></span>
        <input
          className="input"
          value={inputVal}
          onChange={e => { setInputVal(e.target.value); onChange(e.target.value); }}
          onFocus={() => { setHasFocused(true); if (suggestions.length > 0) setOpen(true); }}
          placeholder={placeholder}
          style={{ border: 0, background: 'transparent', padding: 0, height: 'auto', flex: 1 }}
          autoComplete="off"
        />
        {loading && <span style={{ fontSize: 11, color: 'var(--text-faint)', flexShrink: 0 }}>…</span>}
      </div>
      {open && suggestions.length > 0 && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 999,
          background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)',
          boxShadow: 'var(--sh-2)', overflow: 'hidden',
        }}>
          {suggestions.map((s, i) => (
            <div key={s.placeId || i}
              onMouseDown={() => select(s)}
              style={{
                padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 10,
                borderBottom: i < suggestions.length - 1 ? '1px solid var(--border)' : 'none',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-sunken)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ color: 'var(--text-muted)', marginTop: 2, flexShrink: 0 }}>
                <Icon.pin/>
              </span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{s.label}</div>
                {s.secondary && <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 1 }}>{s.secondary}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function HomePage({nav, savedIds, onSave, onUnlock}) {
  const [tab, setTab] = useState("rent");
  const [locationQ, setLocationQ] = useState("Jaipur");
  const [bhk, setBhk] = useState("Any");
  const [type, setType] = useState("Apartment");
  const [city, setCity] = useState("Jaipur");

  const { listings, cities, isLoadingListings } = useAppData();
  const featured = listings.slice(0, 8);

  const handleSearch = () => {
    const dest = tab === 'buy' ? 'buy' : 'search';
    nav(dest, null, { q: locationQ, bhk, type });
  };

  return (
    <div>
      {/* ─── HERO ─────────────────────────────────────────────────────── */}
      <section className="hero-section" style={{padding:'56px 28px 32px', maxWidth:1440, margin:'0 auto'}}>
        <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:24}}>
          <span className="chip" style={{background:'transparent', border:'1px solid var(--border-strong)'}}>
            <span style={{width:6, height:6, borderRadius:'50%', background:'var(--success)', display:'inline-block'}}/>
            Now live in Jaipur
          </span>
          <span className="chip" style={{background:'var(--brand-50,#E6F3F0)', border:'1.5px solid var(--brand-300,#7EC8BB)', color:'var(--brand-700,#0D7C66)', fontWeight:700}}>
            ₹0 to list · half of market rate
          </span>
        </div>

        <h1 className="font-display" style={{
          fontSize:'clamp(48px, 8vw, 120px)',
          lineHeight: 0.92,
          letterSpacing:'-0.05em',
          fontWeight: 800,
          margin: 0,
          maxWidth: 1280,
        }}>
          Skip the broker.<br/>
          <span style={{color:'var(--text-muted)'}}>Keep the </span>
          <span style={{position:'relative', display:'inline-block'}}>
            home<svg width="100%" height="22" viewBox="0 0 200 22" preserveAspectRatio="none" style={{position:'absolute', left:0, bottom:'-6px', width:'100%'}}><path d="M2 14 Q 50 2, 100 12 T 198 8" stroke="var(--accent-500)" strokeWidth="6" fill="none" strokeLinecap="round"/></svg>
          </span>.
        </h1>

        <p className="muted" style={{fontSize:20, maxWidth:680, marginTop:32, lineHeight:1.4}}>
          Owners list free. Tenants pay just <strong style={{color:'var(--text)'}}>half of market rate</strong> — one time, all in.
          Brokers keep <strong style={{color:'var(--text)'}}>every rupee</strong> of their commission.
        </p>

        {/* search */}
        <div className="card" style={{marginTop:40, padding: 18, boxShadow:'var(--sh-2)', maxWidth: 980}}>
          <div style={{display:'flex', gap:4, marginBottom:14}}>
            {[
              {id:'rent', label:'Rent'},
              {id:'buy', label:'Buy'},
              {id:'land', label:'Land'},
              {id:'commercial', label:'Commercial'},
            ].map(t => (
              <button key={t.id} onClick={()=>setTab(t.id)} className="btn btn-sm"
                style={{
                  background: tab===t.id ? 'var(--text)':'transparent',
                  color: tab===t.id ? 'var(--bg)':'var(--text-muted)',
                  borderRadius: 'var(--r-pill)', height: 36, padding:'0 16px',
                  border:0,
                }}>{t.label}</button>
            ))}
          </div>

          <div className="hero-search-grid" style={{display:'grid', gridTemplateColumns:'1.6fr 0.9fr 0.9fr auto', gap:10, alignItems:'stretch'}}>
            <LocationAutocomplete value={locationQ} onChange={setLocationQ} placeholder="City, locality or landmark…"/>
            <select className="input select" value={type} onChange={e=>setType(e.target.value)} style={{background:'var(--surface-sunken)', border:0}}>
              {["Apartment","Independent house","Villa","PG / Hostel","Plot / Land"].map(o=><option key={o}>{o}</option>)}
            </select>
            <select className="input select" value={bhk} onChange={e=>setBhk(e.target.value)} style={{background:'var(--surface-sunken)', border:0}}>
              {["Any BHK","1 BHK","2 BHK","3 BHK","4+ BHK"].map(o=><option key={o}>{o}</option>)}
            </select>
            <button className="btn btn-brand" onClick={handleSearch} style={{padding:'0 26px'}}>
              <Icon.search/> Search
            </button>
          </div>

          <div style={{display:'flex', gap:8, marginTop:14, flexWrap:'wrap', alignItems:'center'}}>
            <span style={{fontSize:12, color:'var(--text-faint)'}}>Popular:</span>
            {["Malviya Nagar", "C-Scheme", "Vaishali Nagar", "Mansarovar", "Jagatpura", "Tonk Road"].map(loc=>(
              <button key={loc} className="chip"
                onClick={()=>nav('search', null, { q: loc, bhk, type })}
                style={{cursor:'pointer', background:'transparent', height:26, padding:'0 10px'}}>{loc}</button>
            ))}
          </div>
        </div>

        {/* stats strip */}
        <div className="stats-strip-grid" style={{
          display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:0,
          marginTop:64, paddingTop:32, borderTop:'1px solid var(--border)'
        }}>
          {[
            {n:"1", l:"city live", sub:"Jaipur — more soon"},
            {n:"₹0", l:"owner fees", sub:"forever, period."},
          ].map((s, i)=>(
            <div key={i} style={{padding:'8px 24px 8px 0', borderLeft: i===0 ? 0 : '1px solid var(--border)', paddingLeft: i===0 ? 0 : 28}}>
              <div className="font-display" style={{fontSize: 'clamp(32px, 4vw, 48px)', fontWeight:800, letterSpacing:'-0.04em', lineHeight:1}}>{s.n}</div>
              <div style={{marginTop:8, fontSize:13, fontWeight:500}}>{s.l}</div>
              <div style={{fontSize:12, color:'var(--text-faint)', marginTop:2}}>{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── THE BIG IDEA ─────────────────────────────────────────────── */}
      <section className="section-big-idea" style={{padding:'72px 28px', background:'var(--surface-sunken)'}}>
        <div style={{maxWidth:1440, margin:'0 auto'}}>
          <div className="big-idea-grid" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:80, alignItems:'center'}}>
            <div>
              <div className="chip" style={{background:'var(--brand-50)', color:'var(--brand-700)', border:0, marginBottom:18}}>The privacy bit ↓</div>
              <h2 className="font-display" style={{fontSize:'clamp(36px, 5vw, 64px)', lineHeight:1, letterSpacing:'-0.04em', fontWeight:800, margin:0}}>
                Your address<br/>stays yours.<br/>
                <span style={{color:'var(--brand-500)'}}>Until you decide.</span>
              </h2>
              <p className="muted" style={{fontSize:17, marginTop:24, maxWidth:480, lineHeight:1.55}}>
                Every listing on Urbify hides the exact address. Tenants pay a small flat fee — half of market rate — to unlock it.
                That's how serious buyers reach serious owners, without spam.
              </p>
              <div style={{display:'flex', gap:12, marginTop:32}}>
                <button className="btn btn-primary btn-lg" onClick={()=>nav('how')}>How it works</button>
                <button className="btn btn-outline btn-lg" onClick={()=>nav('search')}>Browse homes <Icon.arrow/></button>
              </div>
            </div>

            <UnlockDemo onUnlock={()=>nav('unlock')}/>
          </div>
        </div>
      </section>

      {/* ─── FEATURED ─────────────────────────────────────────────────── */}
      <section className="section-featured" style={{padding:'72px 28px 24px', maxWidth:1440, margin:'0 auto'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'end', marginBottom:28}}>
          <div>
            <div style={{fontSize:13, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.08em', fontWeight:600}}>Fresh today</div>
            <h2 className="font-display" style={{fontSize:'clamp(28px, 3.4vw, 44px)', margin:'8px 0 0', fontWeight:800, letterSpacing:'-0.03em'}}>
              Homes worth a second look
            </h2>
          </div>
          {featured.length > 0 && <button className="btn btn-ghost" onClick={()=>nav('search')}>View all →</button>}
        </div>

        {isLoadingListings && (
          <div style={{textAlign:'center', padding:'40px 0', color:'var(--text-muted)'}}>Loading listings…</div>
        )}
        {!isLoadingListings && featured.length === 0 && (
          <div style={{textAlign:'center', padding:'48px 0', color:'var(--text-muted)'}}>
            <div style={{fontSize:36, marginBottom:12}}>🏠</div>
            <div style={{fontWeight:600, fontSize:16}}>No listings yet</div>
            <p style={{marginTop:8}}>Be the first to list your property — it's free for owners.</p>
            <button className="btn btn-brand btn-sm" style={{marginTop:16}} onClick={()=>nav('ownerNew')}>List your home</button>
          </div>
        )}
        {!isLoadingListings && featured.length > 0 && (
          <div className="scroll-x" style={{display:'flex', gap:18, paddingBottom:8, scrollSnapType:'x mandatory'}}>
            {featured.map(l => (
              <div key={l.id} style={{minWidth: 320, maxWidth:320, scrollSnapAlign:'start'}}>
                <ListingCard listing={l}
                  onOpen={()=>nav('detail', l.id)}
                  onUnlock={(li)=>onUnlock(li)}
                  saved={savedIds.includes(l.id)}
                  onSave={onSave}/>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ─── HOW IT WORKS  ─────────────────────────────────────────── */}
      <section className="section-how" style={{padding:'88px 28px', maxWidth:1440, margin:'0 auto'}}>
        <div style={{textAlign:'center', marginBottom:48}}>
          <div className="chip" style={{background:'transparent', border:'1px solid var(--border-strong)', marginBottom:16}}>For everyone</div>
          <h2 className="font-display" style={{fontSize:'clamp(36px, 5vw, 64px)', margin:0, fontWeight:800, letterSpacing:'-0.04em'}}>
            One platform. Three good deals.
          </h2>
        </div>

        <div className="persona-grid" style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:18}}>
          <PersonaCard
            tone="brand"
            tag="Owners"
            headline="List for ₹0."
            body="Free forever. Verified listings live in &lt;2 hours. We bring you only paying, serious tenants."
            steps={["Sign up with OTP", "Add photos & rent", "Get verified leads"]}
            cta="List your home"
            onClick={()=>nav('how')}/>
          <PersonaCard
            tone="accent"
            tag="Tenants"
            headline={<>Pay just<br/>50% of market rate.</>}
            body="One flat fee. No surprise charges. No follow-up calls from 8 brokers."
            steps={["Search by locality", "Shortlist favourites", "Unlock & call directly"]}
            cta="Find a home"
            onClick={()=>nav('search')}/>
          <PersonaCard
            tone="dark"
            tag="Brokers"
            headline="Keep 100% of your commission."
            body="List on behalf of owners. The platform fee comes from tenants, not your pocket."
            steps={["Verify RERA ID", "List owners' homes", "Earn full commission"]}
            cta="Become a partner"
            onClick={()=>nav('how')}/>
        </div>
      </section>

      {/* ─── CTA  ───────────────────────────────────────────────── */}
      <section className="section-cta" style={{padding:'120px 28px'}}>
        <div style={{maxWidth:1100, margin:'0 auto', textAlign:'center'}}>
          <h2 className="font-display" style={{fontSize:'clamp(48px, 7vw, 96px)', lineHeight:.96, letterSpacing:'-0.045em', fontWeight:800, margin:0}}>
            Ready when<br/>you are.
          </h2>
          <div style={{display:'flex', gap:12, justifyContent:'center', marginTop:36}}>
            <button className="btn btn-brand btn-lg" onClick={()=>nav('search')} style={{padding:'0 28px'}}>Find a home <Icon.arrow/></button>
            <button className="btn btn-outline btn-lg" onClick={()=>nav('how')} style={{padding:'0 28px'}}>List a home for ₹0</button>
          </div>
        </div>
      </section>

    </div>
  );
}

// ─── Helper: persona card ───────────────────────────────────────────────
function PersonaCard({tone, tag, headline, body, steps, cta, onClick}) {
  const tones = {
    brand:  { bg: 'var(--brand-500)', fg:'#fff', chip:'rgba(255,255,255,.15)' },
    accent: { bg: 'var(--accent-500)', fg:'#1A1100', chip:'rgba(0,0,0,.1)' },
    dark:   { bg: 'var(--text)', fg:'var(--bg)', chip:'rgba(255,255,255,.12)' },
  };
  const t = tones[tone];
  return (
    <div style={{
      background: t.bg, color: t.fg,
      borderRadius:'var(--r-xl)',
      padding: 'clamp(24px, 3vw, 36px)',
      display:'flex', flexDirection:'column',
      minHeight: 460,
    }}>
      <div style={{display:'inline-flex', alignSelf:'flex-start', padding:'4px 10px', borderRadius:'var(--r-pill)', background:t.chip, fontSize:11, fontWeight:600, letterSpacing:'.08em', textTransform:'uppercase'}}>{tag}</div>
      <h3 className="font-display" style={{fontSize:'clamp(28px, 3vw, 40px)', margin:'24px 0 16px', fontWeight:800, letterSpacing:'-0.03em', lineHeight:1.05}}>{headline}</h3>
      <p style={{fontSize:15, lineHeight:1.5, opacity:.85, marginTop:0, marginBottom:'auto'}}>{body}</p>

      <ol style={{listStyle:'none', padding:0, margin:'32px 0', display:'flex', flexDirection:'column', gap:10}}>
        {steps.map((s, i)=>(
          <li key={i} style={{display:'flex', alignItems:'center', gap:12}}>
            <span style={{width:26, height:26, borderRadius:'50%', background:t.chip, display:'grid', placeItems:'center', fontSize:12, fontWeight:700}}>{i+1}</span>
            <span style={{fontSize:14, fontWeight:500}}>{s}</span>
          </li>
        ))}
      </ol>

      <button onClick={onClick} className="btn"
        style={{background: tone === 'accent' ? '#1A1100' : '#fff', color: tone === 'accent' ? '#fff' : t.bg, alignSelf:'flex-start'}}>
        {cta} <Icon.arrow/>
      </button>
    </div>
  );
}

// ─── Helper: unlock demo widget ─────────────────────────────────────────
function UnlockDemo({onUnlock}) {
  const [unlocked, setUnlocked] = useState(false);
  const [pulsing, setPulsing] = useState(false);
  useEffect(()=>{ const t = setInterval(()=>setPulsing(p=>!p), 1500); return ()=>clearInterval(t); }, []);

  return (
    <div className="card" style={{padding:0, overflow:'hidden', boxShadow:'var(--sh-3)'}}>
      <div style={{position:'relative', aspectRatio:'16/10'}}>
        <Img src={INTERIORS[0]} style={{width:'100%', height:'100%'}}/>
        <div style={{position:'absolute', inset:0, background:'linear-gradient(180deg, transparent 40%, rgba(15,22,20,.65))'}}/>
        <div style={{position:'absolute', top:16, left:16}}>
          <span className="chip" style={{background:'rgba(255,255,255,.92)', color:'#0F1614', border:0, fontWeight:600}}>3 BHK · Koramangala</span>
        </div>
        <div style={{position:'absolute', left:20, right:20, bottom:20, color:'#fff'}}>
          <div style={{fontSize:11, opacity:.8, letterSpacing:'.08em', textTransform:'uppercase'}}>Property address</div>
          <div className="font-mono" style={{fontSize:20, fontWeight:600, marginTop:6, filter: unlocked ? 'none' : 'blur(8px)', transition:'filter .5s', userSelect:'none'}}>
            38, 4th Block, 80 Feet Rd
          </div>
        </div>
      </div>
      <div style={{padding:20, display:'flex', alignItems:'center', justifyContent:'space-between', gap:16}}>
        <div>
          <div style={{fontSize:12, color:'var(--text-muted)'}}>Monthly rent ₹52,000 · Unlock fee</div>
          <div className="font-display" style={{fontSize:26, fontWeight:800, letterSpacing:'-0.03em', marginTop:2}}>
            ₹15,340 <span style={{fontSize:12, color:'var(--text-muted)', fontWeight:500}}>incl. GST</span>
          </div>
        </div>
        <button className="btn btn-brand btn-lg" onClick={()=>{ setUnlocked(true); setTimeout(()=>{ setUnlocked(false); onUnlock(); }, 1400); }}
          style={{boxShadow: pulsing ? '0 0 0 4px color-mix(in oklab, var(--brand-500) 25%, transparent)' : 'none', transition:'box-shadow .8s'}}>
          {unlocked ? <><Icon.unlock/> Unlocked!</> : <><Icon.lock/> Unlock</>}
        </button>
      </div>
    </div>
  );
}

export { LocationAutocomplete, HomePage, PersonaCard, UnlockDemo };
