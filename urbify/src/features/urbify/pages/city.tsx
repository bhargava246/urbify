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
  PortalShell, StatCard, StatusBadge, DashHeader, Footer, Faq, MiniMap,
} from '../_shared';

function CityPage({nav, savedIds, onSave, onUnlock}) {
  const { listings } = useAppData();
  const city = "Jaipur";
  const localities = [
    { name:"Malviya Nagar", count:142, avg:16 },
    { name:"C-Scheme", count:98, avg:18 },
    { name:"Vaishali Nagar", count:128, avg:12 },
    { name:"Mansarovar", count:186, avg:10 },
    { name:"Jagatpura", count:76, avg:11 },
    { name:"Tonk Road", count:102, avg:13 },
    { name:"Ajmer Road", count:88, avg:9 },
    { name:"Pratap Nagar", count:64, avg:10 },
    { name:"Nirman Nagar", count:72, avg:14 },
    { name:"Bani Park", count:56, avg:16 },
    { name:"Sanganer", count:84, avg:8 },
    { name:"Murlipura", count:62, avg:9 },
  ];

  return (
    <div>
      <div style={{padding:'16px 28px', maxWidth:1440, margin:'0 auto'}}>
        <button className="btn btn-ghost btn-sm" onClick={()=>nav('home')}><Icon.back/> Back</button>
      </div>
      <section style={{padding:'16px 28px 32px', maxWidth:1440, margin:'0 auto'}}>
        <div style={{fontSize:12, color:'var(--text-muted)', marginBottom:18}}>
          <span style={{cursor:'pointer'}} onClick={()=>nav('home')}>Home</span> / Rent / <span style={{color:'var(--text)'}}>Jaipur</span>
        </div>
        <h1 className="font-display" style={{fontSize:'clamp(48px, 7vw, 96px)', fontWeight:800, letterSpacing:'-0.045em', lineHeight:.96, margin:0}}>
          Homes for rent<br/>in {city}.
        </h1>
        <div style={{display:'flex', gap:18, flexWrap:'wrap', marginTop:28, alignItems:'baseline'}}>
          <Stat2 big="1,000+" l="active rentals"/>
          <span style={{color:'var(--text-faint)'}}>·</span>
          <Stat2 big="₹14k" l="avg 2 BHK rent"/>
          <span style={{color:'var(--text-faint)'}}>·</span>
          <Stat2 big="40+" l="localities covered"/>
          <span style={{color:'var(--text-faint)'}}>·</span>
          <Stat2 big="4.8★" l="on Google"/>
        </div>

        {/* search */}
        <div className="card" style={{marginTop:32, padding:14, boxShadow:'var(--sh-2)'}}>
          <div style={{display:'grid', gridTemplateColumns:'1.6fr 1fr 1fr auto', gap:10}}>
            <div style={{display:'flex', alignItems:'center', gap:10, padding:'0 14px', background:'var(--surface-sunken)', borderRadius:'var(--r-sm)', height:'var(--row-h)'}}>
              <Icon.pin/>
              <input className="input" defaultValue="Malviya Nagar" style={{border:0, background:'transparent', padding:0, height:'auto', flex:1}}/>
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
            { bhk:"1 BHK", avg:8, range:"₹5k – ₹14k", listings:412 },
            { bhk:"2 BHK", avg:14, range:"₹9k – ₹22k", listings:1284, primary:true },
            { bhk:"3 BHK", avg:22, range:"₹14k – ₹36k", listings:842 },
            { bhk:"4+ BHK", avg:38, range:"₹24k – ₹70k", listings:309 },
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
          <button className="btn btn-ghost btn-sm">View all 40+ →</button>
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
          <button className="btn btn-ghost btn-sm" onClick={()=>nav('search')}>View all →</button>
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
            <p style={{margin:0}}>Jaipur's rental market combines affordability with a fast-growing demand from IT, tourism, and educational institutions. Localities like Malviya Nagar, C-Scheme, and Vaishali Nagar remain the most sought-after, with newer areas like Jagatpura and Pratap Nagar attracting young professionals.</p>
            <p style={{margin:0}}>Deposits typically run 2–3 months for apartments and up to 6 months for independent homes. Semi-furnished options are common across mid-range localities, while premium areas like C-Scheme and Bani Park have more fully-furnished stock.</p>
            <p style={{margin:0}}>The best months to search: October to January, when migration from summer slows down. Avoid April–June when university students drive up demand in Mansarovar and Murlipura.</p>
          </div>
        </div>

        <div style={{maxWidth:1100, margin:'48px auto 0', display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:14}}>
          <Tile label="Rent growth (YoY)" value="+8%" tone="success"/>
          <Tile label="Avg deposit" value="2-3 months"/>
          <Tile label="Best months to rent" value="Oct-Jan"/>
          <Tile label="Most furnished" value="C-Scheme"/>
        </div>
      </section>

      {/* FAQ */}
      <section style={{padding:'72px 28px', maxWidth:920, margin:'0 auto'}}>
        <h2 className="font-display" style={{fontSize:'clamp(28px, 4vw, 40px)', fontWeight:800, letterSpacing:'-0.03em', margin:'0 0 24px'}}>
          Renting in {city} — FAQs
        </h2>
        <Faq q="What's the average rent for a 2 BHK in Jaipur?" a="The platform-wide average is ₹14,000/month. Central localities like C-Scheme and Malviya Nagar run ₹16k–₹22k. Newer areas like Mansarovar and Pratap Nagar range from ₹9k–₹13k."/>
        <Faq q="Which Jaipur neighbourhoods are best for working professionals?" a="Malviya Nagar and C-Scheme are the top picks — close to corporate hubs, markets, and restaurants. Vaishali Nagar suits families and offers good schools. Jagatpura is growing fast with the IT park nearby."/>
        <Faq q="Is owning a vehicle necessary in Jaipur?" a="Two-wheelers are common and practical. Jaipur Metro connects Mansarovar to Badi Chaupar, making the Pink City area accessible. For the outskirts, a personal vehicle is helpful but not essential if you're near the metro corridor."/>
      </section>

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
  const { listings } = useAppData();
  const loc = "Koramangala";
  const city = "Bangalore";

  return (
    <div>
      <div style={{padding:'16px 28px', maxWidth:1440, margin:'0 auto'}}>
        <button className="btn btn-ghost btn-sm" onClick={()=>nav('city')}><Icon.back/> Back to cities</button>
      </div>
      <section style={{padding:'16px 28px 32px', maxWidth:1440, margin:'0 auto'}}>
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
            { l:"Avg 2 BHK rent", v:"₹14k", sub:"+8% YoY", tone:'success' },
            { l:"Furnished listings", v:"52%", sub:"city avg 35%" },
            { l:"Pet-friendly", v:"24%", sub:"city avg 14%" },
            { l:"Avg time to rent", v:"11 days", sub:"city avg 18" },
            { l:"Median area", v:"980 sq ft", sub:"2 BHK" },
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
                <div className="font-display" style={{fontSize:42, fontWeight:800, letterSpacing:'-0.04em'}}>₹14k</div>
                <div style={{fontSize:13, color:'var(--text-muted)'}}>avg 2 BHK rent today</div>
              </div>
              <div style={{textAlign:'right'}}>
                <div className="font-display" style={{fontSize:22, fontWeight:800, letterSpacing:'-0.03em', color:'var(--success)'}}>+8%</div>
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
                { n:"World Trade Park", d:"1.2 km", t:"shopping" },
                { n:"Mansarovar Metro", d:"2.4 km", t:"metro" },
                { n:"Mahatma Gandhi Hospital", d:"1.6 km", t:"hospital" },
                { n:"IIT Jodhpur Jaipur Campus", d:"3.0 km", t:"education" },
                { n:"Hawa Mahal", d:"4.8 km", t:"landmark" },
                { n:"Jaipur Railway Station", d:"5.2 km", t:"transit" },
                { n:"Jaipur Airport", d:"9.1 km", t:"airport" },
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
            { bhk:"1 BHK", avg:8, count:18 },
            { bhk:"2 BHK", avg:14, count:38, primary:true },
            { bhk:"3 BHK", avg:22, count:28 },
            { bhk:"4+ BHK", avg:38, count:14 },
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

    </div>
  );
}

// ---- blog-pages.jsx ----
// blog-pages.jsx — Blog hub + Article

export { CityPage, LocalityPage };
