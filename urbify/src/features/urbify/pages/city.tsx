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

function CityPage({nav, savedIds, onSave, onUnlock}) {
  const { listings } = useAppData();
  const city = "Bangalore";
  const localities = [
    { name:"Koramangala", count:142, avg:42 },
    { name:"Indiranagar", count:98, avg:48 },
    { name:"HSR Layout", count:128, avg:38 },
    { name:"Whitefield", count:186, avg:32 },
    { name:"Jayanagar", count:76, avg:35 },
    { name:"BTM Layout", count:64, avg:28 },
    { name:"Marathahalli", count:112, avg:31 },
    { name:"JP Nagar", count:84, avg:34 },
    { name:"Sarjapur Road", count:102, avg:36 },
    { name:"Bellandur", count:88, avg:33 },
    { name:"Electronic City", count:124, avg:24 },
    { name:"Hebbal", count:62, avg:30 },
  ];

  return (
    <div>
      <section style={{padding:'56px 28px 32px', maxWidth:1440, margin:'0 auto'}}>
        <div style={{fontSize:12, color:'var(--text-muted)', marginBottom:18}}>
          <span style={{cursor:'pointer'}} onClick={()=>nav('home')}>Home</span> / Rent / <span style={{color:'var(--text)'}}>Bangalore</span>
        </div>
        <h1 className="font-display" style={{fontSize:'clamp(48px, 7vw, 96px)', fontWeight:800, letterSpacing:'-0.045em', lineHeight:.96, margin:0}}>
          Homes for rent<br/>in {city}.
        </h1>
        <div style={{display:'flex', gap:18, flexWrap:'wrap', marginTop:28, alignItems:'baseline'}}>
          <Stat2 big="2,847" l="active rentals"/>
          <span style={{color:'var(--text-faint)'}}>·</span>
          <Stat2 big="₹38k" l="avg 2 BHK rent"/>
          <span style={{color:'var(--text-faint)'}}>·</span>
          <Stat2 big="98" l="localities covered"/>
          <span style={{color:'var(--text-faint)'}}>·</span>
          <Stat2 big="4.8★" l="on Google"/>
        </div>

        {/* search */}
        <div className="card" style={{marginTop:32, padding:14, boxShadow:'var(--sh-2)'}}>
          <div style={{display:'grid', gridTemplateColumns:'1.6fr 1fr 1fr auto', gap:10}}>
            <div style={{display:'flex', alignItems:'center', gap:10, padding:'0 14px', background:'var(--surface-sunken)', borderRadius:'var(--r-sm)', height:'var(--row-h)'}}>
              <Icon.pin/>
              <input className="input" defaultValue="Koramangala" style={{border:0, background:'transparent', padding:0, height:'auto', flex:1}}/>
            </div>
            <select className="input select" style={{background:'var(--surface-sunken)', border:0}}><option>Any BHK</option><option>1 BHK</option><option>2 BHK</option><option>3 BHK</option></select>
            <select className="input select" style={{background:'var(--surface-sunken)', border:0}}><option>Any budget</option><option>Under ₹20k</option><option>₹20-40k</option><option>₹40-60k</option><option>₹60k+</option></select>
            <button className="btn btn-brand" onClick={()=>nav('search')}><Icon.search/> Search</button>
          </div>
        </div>
      </section>

      {/* BHK breakdown */}
      <section style={{padding:'56px 28px', maxWidth:1440, margin:'0 auto'}}>
        <div style={{fontSize:13, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.08em'}}>Rent by configuration</div>
        <h2 className="font-display" style={{fontSize:'clamp(28px, 3.5vw, 40px)', fontWeight:800, letterSpacing:'-0.03em', margin:'10px 0 28px'}}>
          What rents cost in {city}, room by room.
        </h2>

        <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:14}}>
          {[
            { bhk:"1 BHK", avg:22, range:"₹15k – ₹32k", listings:412 },
            { bhk:"2 BHK", avg:38, range:"₹26k – ₹58k", listings:1284, primary:true },
            { bhk:"3 BHK", avg:62, range:"₹42k – ₹95k", listings:842 },
            { bhk:"4+ BHK", avg:120, range:"₹78k – ₹2.5L", listings:309 },
          ].map(b=>(
            <div key={b.bhk} className="card" style={{padding:22, background: b.primary ? 'var(--text)' : 'var(--surface)', color: b.primary ? 'var(--bg)' : 'var(--text)', border: b.primary ? 0 : '1px solid var(--border)'}}>
              <div style={{fontSize:12, opacity: b.primary ? .7 : 1, color: b.primary ? 'inherit' : 'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.08em', fontWeight:600}}>{b.bhk}</div>
              <div className="font-display" style={{fontSize:38, fontWeight:800, letterSpacing:'-0.035em', marginTop:8, lineHeight:1}}>₹{b.avg}k</div>
              <div style={{fontSize:12, opacity: b.primary ? .7 : 1, color: b.primary ? 'inherit' : 'var(--text-muted)', marginTop:4}}>avg / month</div>
              <div style={{height:1, background: b.primary ? 'rgba(255,255,255,.15)' : 'var(--border)', margin:'16px 0'}}/>
              <div style={{fontSize:11, opacity: b.primary ? .7 : 1, color: b.primary ? 'inherit' : 'var(--text-muted)'}}>Range</div>
              <div style={{fontSize:13, fontWeight:600, marginTop:2}}>{b.range}</div>
              <div style={{fontSize:11, opacity: b.primary ? .7 : 1, color: b.primary ? 'inherit' : 'var(--text-muted)', marginTop:10}}>{b.listings} listings</div>
            </div>
          ))}
        </div>
      </section>

      {/* localities */}
      <section style={{padding:'56px 28px', maxWidth:1440, margin:'0 auto'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:28}}>
          <div>
            <div style={{fontSize:13, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.08em'}}>Top localities</div>
            <h2 className="font-display" style={{fontSize:'clamp(28px, 3.5vw, 40px)', fontWeight:800, letterSpacing:'-0.03em', margin:'10px 0 0'}}>
              Where {city} lives.
            </h2>
          </div>
          <button className="btn btn-ghost btn-sm">View all 98 →</button>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:14}}>
          {localities.slice(0, 8).map((loc, i)=>(
            <div key={loc.name} className="card" style={{padding:0, overflow:'hidden', cursor:'pointer'}}
              onClick={()=>nav('locality')}>
              <div style={{position:'relative', aspectRatio:'16/10'}}>
                <Img src={PHOTOS[i % PHOTOS.length]} style={{width:'100%', height:'100%'}}/>
                <div style={{position:'absolute', inset:0, background:'linear-gradient(180deg, transparent 40%, rgba(15,22,20,.7))'}}/>
                <div style={{position:'absolute', left:14, bottom:12, color:'#fff'}}>
                  <div className="font-display" style={{fontSize:20, fontWeight:800, letterSpacing:'-0.02em'}}>{loc.name}</div>
                  <div style={{fontSize:11, opacity:.85, marginTop:2}}>{loc.count} listings · avg ₹{loc.avg}k</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{display:'flex', flexWrap:'wrap', gap:8, marginTop:24}}>
          {localities.slice(8).map(loc=>(
            <span key={loc.name} className="chip" style={{cursor:'pointer'}} onClick={()=>nav('locality')}>
              {loc.name} <span style={{color:'var(--text-faint)', marginLeft:4}}>{loc.count}</span>
            </span>
          ))}
        </div>
      </section>

      {/* Featured listings */}
      <section style={{padding:'56px 28px', maxWidth:1440, margin:'0 auto'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:28}}>
          <div>
            <div style={{fontSize:13, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.08em'}}>Recently listed</div>
            <h2 className="font-display" style={{fontSize:'clamp(28px, 3.5vw, 40px)', fontWeight:800, letterSpacing:'-0.03em', margin:'10px 0 0'}}>
              Fresh on the market.
            </h2>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={()=>nav('search')}>View all 2,847 →</button>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:14}}>
          {listings.slice(0, 4).map(l=>(
            <ListingCard key={l.id} listing={l}
              onOpen={()=>nav('detail', l.id)}
              onUnlock={onUnlock}
              saved={savedIds.includes(l.id)}
              onSave={onSave}/>
          ))}
        </div>
      </section>

      {/* Why Bangalore */}
      <section style={{padding:'72px 28px', background:'var(--surface-sunken)'}}>
        <div style={{maxWidth:1100, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1.4fr', gap:48, alignItems:'start'}}>
          <div>
            <div style={{fontSize:13, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.08em'}}>The city</div>
            <h2 className="font-display" style={{fontSize:'clamp(32px, 4vw, 48px)', fontWeight:800, letterSpacing:'-0.035em', margin:'10px 0 0', lineHeight:1.05}}>
              About renting in {city}.
            </h2>
          </div>
          <div style={{fontSize:16, lineHeight:1.7, color:'var(--text-muted)', display:'flex', flexDirection:'column', gap:18}}>
            <p style={{margin:0}}>Bangalore's rental market is the most competitive in India. Average rents have grown 22% over the last two years, driven by IT corridor demand from Whitefield, Sarjapur, and Outer Ring Road.</p>
            <p style={{margin:0}}>Most rentals require a deposit of 6–10 months for independent homes and 2–3 months for apartment complexes. Furnished options are common in Indiranagar and Koramangala, while bare-shell units dominate the suburbs.</p>
            <p style={{margin:0}}>The best months to find a deal: November to February. School term endings (April-May) tighten supply considerably.</p>
          </div>
        </div>

        <div style={{maxWidth:1100, margin:'48px auto 0', display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:14}}>
          <Tile label="Rent growth (YoY)" value="+12.4%" tone="success"/>
          <Tile label="Avg deposit" value="2-3 months"/>
          <Tile label="Best months to rent" value="Nov-Feb"/>
          <Tile label="Most furnished" value="Koramangala"/>
        </div>
      </section>

      {/* FAQ */}
      <section style={{padding:'72px 28px', maxWidth:920, margin:'0 auto'}}>
        <h2 className="font-display" style={{fontSize:'clamp(28px, 4vw, 40px)', fontWeight:800, letterSpacing:'-0.03em', margin:'0 0 24px'}}>
          Renting in {city} — FAQs
        </h2>
        <Faq q="What's the average rent for a 2 BHK in Bangalore?" a="The platform-wide average is ₹38,000/month. Central localities (Indiranagar, Koramangala, Jayanagar) typically run ₹42k–₹58k. Suburbs (Whitefield, Electronic City) are ₹26k–₹38k."/>
        <Faq q="Which Bangalore neighbourhoods are best for working professionals?" a="Koramangala and HSR Layout dominate for IT and startup employees — good connectivity, cafes, and quick metro access. Indiranagar suits creative roles and night-life. Whitefield works if you commute to IT Park East."/>
        <Faq q="Is owning a car necessary?" a="Less so than it used to be. Namma Metro covers Whitefield, Indiranagar, Hebbal, and Electronic City as of 2026. Yellow Line via JP Nagar and Bommasandra opened in March."/>
      </section>

      <Footer nav={nav}/>
    </div>
  );
}

function Stat2({big, l}) {
  return (
    <div>
      <span className="font-display" style={{fontSize:'clamp(24px, 3vw, 36px)', fontWeight:800, letterSpacing:'-0.03em'}}>{big}</span>
      <span style={{fontSize:13, color:'var(--text-muted)', marginLeft:6}}>{l}</span>
    </div>
  );
}

function Tile({label, value, tone}) {
  return (
    <div className="card" style={{padding:18}}>
      <div style={{fontSize:11, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.08em'}}>{label}</div>
      <div className="font-display" style={{fontSize:24, fontWeight:800, letterSpacing:'-0.03em', marginTop:6, color: tone === 'success' ? 'var(--success)' : 'var(--text)'}}>{value}</div>
    </div>
  );
}

// ─── LOCALITY LANDING ─────────────────────────────────────────────────────
function LocalityPage({nav, savedIds, onSave, onUnlock}) {
  const loc = "Koramangala";
  const city = "Bangalore";

  return (
    <div>
      <section style={{padding:'56px 28px 32px', maxWidth:1440, margin:'0 auto'}}>
        <div style={{fontSize:12, color:'var(--text-muted)', marginBottom:18}}>
          <span style={{cursor:'pointer'}} onClick={()=>nav('home')}>Home</span> / Rent / <span style={{cursor:'pointer'}} onClick={()=>nav('city')}>Bangalore</span> / <span style={{color:'var(--text)'}}>{loc}</span>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:36, alignItems:'end'}}>
          <div>
            <div style={{display:'flex', gap:8, marginBottom:16}}>
              <span className="chip chip-brand">98 active listings</span>
              <span className="chip">Walk score 84</span>
              <span className="chip">Metro 0.8 km</span>
            </div>
            <h1 className="font-display" style={{fontSize:'clamp(48px, 7vw, 88px)', fontWeight:800, letterSpacing:'-0.045em', lineHeight:.96, margin:0}}>
              {loc},<br/>{city}.
            </h1>
            <p className="muted" style={{fontSize:19, maxWidth:560, marginTop:24, lineHeight:1.5}}>
              The leafy heart of Bangalore. Tree-lined streets, indie cafes, and one of the city's best dining scenes — wrapped around the 4th Block ring road.
            </p>
          </div>

          <div style={{borderRadius:'var(--r-xl)', overflow:'hidden', height:340}}>
            <MiniMap label={loc}/>
          </div>
        </div>
      </section>

      {/* stats strip */}
      <section style={{padding:'24px 28px 56px', maxWidth:1440, margin:'0 auto'}}>
        <div style={{display:'grid', gridTemplateColumns:'repeat(5, 1fr)', borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)', padding:'24px 0'}}>
          {[
            { l:"Avg 2 BHK rent", v:"₹42k", sub:"+8% YoY", tone:'success' },
            { l:"Furnished listings", v:"68%", sub:"city avg 42%" },
            { l:"Pet-friendly", v:"31%", sub:"city avg 18%" },
            { l:"Avg time to rent", v:"9 days", sub:"city avg 16" },
            { l:"Median area", v:"1,240 sq ft", sub:"2 BHK" },
          ].map((s, i)=>(
            <div key={i} style={{padding:'0 24px', borderLeft: i===0?0:'1px solid var(--border)'}}>
              <div style={{fontSize:11, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.08em'}}>{s.l}</div>
              <div className="font-display" style={{fontSize:'clamp(24px, 2.8vw, 36px)', fontWeight:800, letterSpacing:'-0.035em', marginTop:8, lineHeight:1}}>{s.v}</div>
              <div style={{fontSize:12, color: s.tone === 'success' ? 'var(--success)' : 'var(--text-muted)', marginTop:6, fontWeight:600}}>{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Rent trend chart */}
      <section style={{padding:'24px 28px 56px', maxWidth:1440, margin:'0 auto'}}>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:18}}>
          <div className="card" style={{padding:28}}>
            <div style={{fontSize:13, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.08em'}}>Rent trend · last 24 months</div>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginTop:10}}>
              <div>
                <div className="font-display" style={{fontSize:42, fontWeight:800, letterSpacing:'-0.04em'}}>₹42k</div>
                <div style={{fontSize:13, color:'var(--text-muted)'}}>avg 2 BHK rent today</div>
              </div>
              <div style={{textAlign:'right'}}>
                <div className="font-display" style={{fontSize:22, fontWeight:800, letterSpacing:'-0.03em', color:'var(--success)'}}>+22%</div>
                <div style={{fontSize:11, color:'var(--text-muted)'}}>vs 2 years ago</div>
              </div>
            </div>
            <svg viewBox="0 0 600 200" style={{width:'100%', height:160, marginTop:20}}>
              <defs>
                <linearGradient id="cityTrend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--brand-500)" stopOpacity="0.3"/>
                  <stop offset="100%" stopColor="var(--brand-500)" stopOpacity="0"/>
                </linearGradient>
              </defs>
              <path d="M0 150 L 25 145 L 50 140 L 75 138 L 100 130 L 125 128 L 150 120 L 175 122 L 200 110 L 225 100 L 250 95 L 275 88 L 300 85 L 325 75 L 350 72 L 375 65 L 400 60 L 425 55 L 450 50 L 475 45 L 500 38 L 525 34 L 550 28 L 575 25 L 600 22 L 600 200 L 0 200 Z" fill="url(#cityTrend)"/>
              <path d="M0 150 L 25 145 L 50 140 L 75 138 L 100 130 L 125 128 L 150 120 L 175 122 L 200 110 L 225 100 L 250 95 L 275 88 L 300 85 L 325 75 L 350 72 L 375 65 L 400 60 L 425 55 L 450 50 L 475 45 L 500 38 L 525 34 L 550 28 L 575 25 L 600 22" fill="none" stroke="var(--brand-500)" strokeWidth="2.5"/>
              <line x1="0" y1="180" x2="600" y2="180" stroke="var(--border)"/>
            </svg>
            <div style={{display:'flex', justifyContent:'space-between', marginTop:6, fontSize:10, color:'var(--text-faint)'}}>
              <span>Nov '24</span><span>May '25</span><span>Nov '25</span><span>May '26</span><span>Today</span>
            </div>
          </div>

          <div className="card" style={{padding:28}}>
            <div style={{fontSize:13, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.08em'}}>Nearby landmarks</div>
            <div style={{display:'flex', flexDirection:'column', gap:14, marginTop:20}}>
              {[
                { n:"Forum Mall", d:"0.6 km", t:"shopping" },
                { n:"Sony World Junction", d:"0.4 km", t:"transit" },
                { n:"Christ University", d:"1.2 km", t:"education" },
                { n:"St John's Hospital", d:"1.8 km", t:"hospital" },
                { n:"Manipal Hospital", d:"2.4 km", t:"hospital" },
                { n:"Indiranagar Metro", d:"3.1 km", t:"metro" },
                { n:"Outer Ring Road", d:"0.9 km", t:"highway" },
              ].map(p=>(
                <div key={p.n} style={{display:'flex', justifyContent:'space-between', alignItems:'center', paddingBottom:14, borderBottom:'1px solid var(--border)'}}>
                  <div>
                    <div style={{fontSize:14, fontWeight:600}}>{p.n}</div>
                    <div style={{fontSize:11, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.08em', marginTop:2}}>{p.t}</div>
                  </div>
                  <div className="font-mono" style={{fontSize:13, fontWeight:600}}>{p.d}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* BHK breakdown */}
      <section style={{padding:'24px 28px 56px', maxWidth:1440, margin:'0 auto'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:18}}>
          <h2 className="font-display" style={{fontSize:'clamp(24px, 3vw, 32px)', fontWeight:800, letterSpacing:'-0.03em', margin:0}}>Rent by configuration in {loc}</h2>
          <button className="btn btn-ghost btn-sm" onClick={()=>nav('search')}>Browse all →</button>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:14}}>
          {[
            { bhk:"1 BHK", avg:24, count:18 },
            { bhk:"2 BHK", avg:42, count:38, primary:true },
            { bhk:"3 BHK", avg:68, count:28 },
            { bhk:"4+ BHK", avg:132, count:14 },
          ].map(b=>(
            <div key={b.bhk} className="card" style={{padding:18, cursor:'pointer'}} onClick={()=>nav('search')}>
              <div style={{fontSize:12, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.08em', fontWeight:600}}>{b.bhk} in {loc}</div>
              <div className="font-display" style={{fontSize:30, fontWeight:800, letterSpacing:'-0.035em', marginTop:6, lineHeight:1}}>₹{b.avg}k<span style={{fontSize:13, fontWeight:500, color:'var(--text-muted)'}}>/mo avg</span></div>
              <div style={{fontSize:12, color:'var(--text-muted)', marginTop:6}}>{b.count} listings → </div>
            </div>
          ))}
        </div>
      </section>

      {/* listings */}
      <section style={{padding:'24px 28px 56px', maxWidth:1440, margin:'0 auto'}}>
        <h2 className="font-display" style={{fontSize:'clamp(24px, 3vw, 32px)', fontWeight:800, letterSpacing:'-0.03em', marginBottom:18}}>Available in {loc}</h2>
        <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:14}}>
          {listings.slice(0, 8).map(l=>(
            <ListingCard key={l.id} listing={l}
              onOpen={()=>nav('detail', l.id)}
              onUnlock={onUnlock}
              saved={savedIds.includes(l.id)}
              onSave={onSave}/>
          ))}
        </div>
      </section>

      {/* about locality */}
      <section style={{padding:'72px 28px', background:'var(--surface-sunken)'}}>
        <div style={{maxWidth:1100, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1.4fr', gap:48, alignItems:'start'}}>
          <div>
            <div style={{fontSize:13, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.08em'}}>The neighbourhood</div>
            <h2 className="font-display" style={{fontSize:'clamp(32px, 4vw, 48px)', fontWeight:800, letterSpacing:'-0.035em', margin:'10px 0 0', lineHeight:1.05}}>
              Why people choose {loc}.
            </h2>
          </div>
          <div style={{fontSize:16, lineHeight:1.7, color:'var(--text-muted)', display:'flex', flexDirection:'column', gap:18}}>
            <p style={{margin:0}}>Koramangala has been Bangalore's startup and IT capital for nearly two decades. The 1st through 8th blocks fan out from a central commercial spine on 80 Feet Road and 100 Feet Road.</p>
            <p style={{margin:0}}>Blocks 4, 5 and 6 are the most popular for working professionals — closest to Forum Mall, the metro, and the best of the cafe scene. Block 1 and Block 8 are quieter and have more independent houses.</p>
            <p style={{margin:0}}>Commute: 25 minutes to MG Road, 35 to Whitefield via Outer Ring Road, 18 to Electronic City via Hosur Road (off-peak).</p>
          </div>
        </div>
      </section>

      <Footer nav={nav}/>
    </div>
  );
}

// ---- blog-pages.jsx ----
// blog-pages.jsx — Blog hub + Article

export { CityPage, LocalityPage };
