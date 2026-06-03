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
import { Footer } from './home';

function HowPage({nav}) {
  const [calcRent, setCalcRent] = useState(40000);
  const [tab, setTab] = useState("tenant");
  const flows = {
    owner: {
      tone: 'brand',
      title: "For owners",
      sub: "List your home. Stop fielding broker calls. Get only paying tenants.",
      steps: [
        {h:"Register in 30 seconds", b:"Mobile OTP — no forms, no documents at first."},
        {h:"Add your listing", b:"Photos, locality, rent. Your full address stays encrypted."},
        {h:"We verify in <2 hours", b:"A real human reviews every listing. No bots, no fakes."},
        {h:"Get verified leads", b:"Only tenants who paid the fee can see your number."},
        {h:"Mark as rented", b:"Done. Listing comes down. Nothing more to do."},
      ],
      cost: "₹0 forever",
      cta: "List your home"
    },
    tenant: {
      tone: 'accent',
      title: "For tenants & buyers",
      sub: "Search like a pro. Pay one flat fee. Talk to the owner directly.",
      steps: [
        {h:"Search by city or locality", b:"Filter by BHK, rent, furnishing, area, facing — whatever you care about."},
        {h:"Shortlist your favourites", b:"Photos, specs, locality details — all visible upfront."},
        {h:"Pay 50% of market brokerage", b:"One time. Includes GST. Refundable if details are wrong."},
        {h:"Address + number unlocked", b:"Call the owner directly. No middleman, no commission."},
        {h:"Move in", b:"Negotiate, visit, sign. The home is between you and them."},
      ],
      cost: "50% of market brokerage (one-time)",
      cta: "Find a home"
    },
    broker: {
      tone: 'dark',
      title: "For brokers",
      sub: "List on behalf of owners. Keep every rupee of your commission.",
      steps: [
        {h:"Verify your RERA ID", b:"Get a verified-broker badge that tenants trust on sight."},
        {h:"List owners' homes for free", b:"Manage a portfolio across cities and property types."},
        {h:"We collect the tenant's fee", b:"50% of market brokerage goes to Urbify — not your owner-side cut."},
        {h:"Earn 100% commission", b:"Whatever you and the owner agreed: yours. We take nothing from it."},
        {h:"Grow your book", b:"One dashboard. Unlimited listings. Real metrics."},
      ],
      cost: "₹0 platform cut",
      cta: "Become a partner"
    },
  };
  const flow = flows[tab];

  return (
    <div>
      <section style={{padding:'72px 28px 24px', maxWidth:1280, margin:'0 auto'}}>
        <div className="chip" style={{background:'transparent', border:'1px solid var(--border-strong)', marginBottom:24}}>How it works</div>
        <h1 className="font-display" style={{fontSize:'clamp(48px, 7vw, 96px)', fontWeight:800, letterSpacing:'-0.045em', lineHeight:.96, margin:0}}>
          A fairer way to<br/>find, list & let.
        </h1>
        <p className="muted" style={{fontSize:20, maxWidth:720, marginTop:28, lineHeight:1.4}}>
          Three flows, one platform. Pick yours below.
        </p>

        {/* tab switcher */}
        <div style={{display:'inline-flex', gap:4, padding:6, marginTop:40, background:'var(--surface-sunken)', borderRadius:'var(--r-pill)'}}>
          {[
            {id:'owner', l:'Owner'},
            {id:'tenant', l:'Tenant / Buyer'},
            {id:'broker', l:'Broker'},
          ].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} className="btn btn-sm"
              style={{
                background: tab===t.id ? 'var(--text)':'transparent',
                color: tab===t.id ? 'var(--bg)':'var(--text-muted)',
                borderRadius:'var(--r-pill)', height:40, padding:'0 22px', fontSize:14, fontWeight:600, border:0,
              }}>{t.l}</button>
          ))}
        </div>
      </section>

      <section style={{padding:'24px 28px 72px', maxWidth:1280, margin:'0 auto'}}>
        <div style={{
          padding: 'clamp(28px, 4vw, 56px)',
          borderRadius:'var(--r-xl)',
          background: flow.tone === 'brand' ? 'var(--brand-500)' : flow.tone === 'accent' ? 'var(--accent-500)' : 'var(--text)',
          color: flow.tone === 'accent' ? '#1A1100' : '#fff',
          display:'grid', gridTemplateColumns:'1fr 1.4fr', gap: 48,
        }}>
          <div>
            <h2 className="font-display" style={{fontSize:'clamp(32px, 4vw, 52px)', fontWeight:800, letterSpacing:'-0.035em', margin:0, lineHeight:1.05}}>
              {flow.title}
            </h2>
            <p style={{fontSize:17, opacity:.85, marginTop:18, lineHeight:1.5, marginBottom:32}}>{flow.sub}</p>

            <div style={{padding:'14px 18px', background:'rgba(255,255,255,.15)', borderRadius:'var(--r-md)', marginBottom:24}}>
              <div style={{fontSize:11, opacity:.7, textTransform:'uppercase', letterSpacing:'.08em', fontWeight:600}}>What it costs you</div>
              <div className="font-display" style={{fontSize:32, fontWeight:800, letterSpacing:'-0.03em', marginTop:4}}>{flow.cost}</div>
            </div>

            <button className="btn btn-lg" style={{background: flow.tone === 'accent' ? '#1A1100' : '#fff', color: flow.tone === 'accent' ? '#fff' : (flow.tone === 'brand' ? 'var(--brand-500)' : 'var(--text)')}}
              onClick={()=>nav(tab === 'tenant' ? 'search' : 'home')}>
              {flow.cta} <Icon.arrow/>
            </button>
          </div>

          <div style={{display:'flex', flexDirection:'column', gap:14}}>
            {flow.steps.map((s, i)=>(
              <div key={i} style={{
                display:'flex', alignItems:'flex-start', gap:18,
                padding:'18px 22px',
                background:'rgba(255,255,255,.12)',
                borderRadius:'var(--r-md)',
                backdropFilter:'blur(8px)', WebkitBackdropFilter:'blur(8px)',
              }}>
                <div className="font-display" style={{
                  fontSize:36, fontWeight:800, letterSpacing:'-0.04em',
                  opacity:.6, minWidth:48, lineHeight:1,
                }}>0{i+1}</div>
                <div>
                  <div className="font-display" style={{fontSize:18, fontWeight:700, letterSpacing:'-0.02em'}}>{s.h}</div>
                  <div style={{fontSize:14, opacity:.85, lineHeight:1.55, marginTop:4}}>{s.b}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* THE FEE */}
      <section style={{padding:'72px 28px', background:'var(--surface-sunken)'}}>
        <div style={{maxWidth:1100, margin:'0 auto', textAlign:'center'}}>
          <div className="chip" style={{background:'transparent', border:'1px solid var(--border-strong)', marginBottom:16}}>The honest fee</div>
          <h2 className="font-display" style={{fontSize:'clamp(36px, 5vw, 64px)', fontWeight:800, letterSpacing:'-0.04em', margin:0, lineHeight:1.05}}>
            How we calculate 50%.
          </h2>
          <p className="muted" style={{fontSize:18, marginTop:20, maxWidth:680, marginInline:'auto', lineHeight:1.5}}>
            Traditional brokers charge one full month's rent — sometimes two. We charge exactly <strong style={{color:'var(--text)'}}>50%</strong> of that. Fair for tenants, still zero for owners.
          </p>

          <div className="card" style={{marginTop:40, padding:0, overflow:'hidden', textAlign:'left', maxWidth:780, marginInline:'auto'}}>
            <div style={{padding:'14px 22px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <div style={{fontSize:13, color:'var(--text-muted)', fontWeight:600}}>If your rent is</div>
              <input className="input" defaultValue="40000" type="number" style={{width:160, textAlign:'right'}}/>
            </div>
            <div style={{padding:22, display:'flex', justifyContent:'space-between', alignItems:'center', gap:24}}>
              <div>
                <div style={{fontSize:12, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.08em', fontWeight:600}}>You pay on Urbify</div>
                <div className="font-display" style={{fontSize:48, fontWeight:800, letterSpacing:'-0.04em', color:'var(--brand-500)', marginTop:4}}>₹11,800</div>
                <div style={{fontSize:13, color:'var(--text-muted)', marginTop:2}}>one-time · incl. 18% GST</div>
              </div>
              <div style={{width:1, alignSelf:'stretch', background:'var(--border)'}}/>
              <div>
                <div style={{fontSize:12, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.08em', fontWeight:600}}>Typical broker</div>
                <div className="font-display" style={{fontSize:48, fontWeight:800, letterSpacing:'-0.04em', textDecoration:'line-through', color:'var(--text-faint)', marginTop:4}}>₹47,200</div>
                <div style={{fontSize:13, color:'var(--success)', marginTop:2, fontWeight:600}}>You save ₹35,400</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{padding:'72px 28px', maxWidth:920, margin:'0 auto'}}>
        <h2 className="font-display" style={{fontSize:'clamp(28px, 4vw, 44px)', fontWeight:800, letterSpacing:'-0.03em', margin:'0 0 32px'}}>Common questions</h2>
        <Faq q="Is my address really hidden from everyone before payment?" a="Yes. The exact address is stored encrypted and never shown — not on the listing card, not on the detail page, not even to other brokers. Tenants see locality and a zone polygon on the map. The full address is revealed only after the fee is paid."/>
        <Faq q="What if the address turns out to be wrong or the owner unreachable?" a="You have 24 hours from the unlock to flag the issue from your dashboard. Verified disputes get a full automatic refund — no email tag, no support queue."/>
        <Faq q="How does Urbify make money if owners list for free?" a="The 50% of market brokerage fee from tenants is our entire revenue. We don't take any commission from owners or brokers, and we don't sell user data to anyone."/>
        <Faq q="Are listings RERA compliant?" a="Yes. All listings are reviewed for RERA registration where applicable. Brokers on the platform must verify their RERA ID before they can list."/>
        <Faq q="Do I have to pay again if I want to contact a second owner?" a="Each unlock is for one listing. If you unlock five homes, that's five separate fees. We're working on a multi-pack for serious house-hunters in 2026."/>
        <Faq q="Can I list a commercial property or land?" a="Yes — apartments, independent houses, villas, commercial spaces, and land plots are all supported. Same flow, same fee."/>
      </section>

      {/* Commission Calculator */}
      <section style={{padding:'40px 28px 72px', maxWidth:920, margin:'0 auto'}}>
        <div className="card" style={{padding:28,maxWidth:480}}>
          <div className="font-display" style={{fontSize:18,fontWeight:700,marginBottom:16}}>💰 See your savings</div>
          <label style={{fontSize:12,fontWeight:600,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'.08em'}}>Monthly rent (₹)</label>
          <input
            className="input"
            type="number"
            value={calcRent}
            onChange={e=>setCalcRent(+e.target.value||0)}
            style={{marginTop:6,marginBottom:16}}
          />
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <div style={{padding:'14px 16px',background:'#FEF2F2',borderRadius:'var(--r-md)',textAlign:'center'}}>
              <div style={{fontSize:11,color:'#DC2626',fontWeight:600,marginBottom:4}}>Traditional broker</div>
              <div style={{fontSize:22,fontWeight:800,color:'#DC2626'}}>₹{Math.round(calcRent).toLocaleString('en-IN')}</div>
              <div style={{fontSize:11,color:'#DC2626',opacity:.7}}>1 month rent</div>
            </div>
            <div style={{padding:'14px 16px',background:'#F0FDF4',borderRadius:'var(--r-md)',textAlign:'center'}}>
              <div style={{fontSize:11,color:'#16A34A',fontWeight:600,marginBottom:4}}>Urbify fee</div>
              <div style={{fontSize:22,fontWeight:800,color:'#16A34A'}}>₹{Math.round(calcRent/2).toLocaleString('en-IN')}</div>
              <div style={{fontSize:11,color:'#16A34A',opacity:.7}}>50% of market rate</div>
            </div>
          </div>
          <div style={{marginTop:12,padding:'10px 14px',background:'var(--brand-50)',borderRadius:'var(--r-md)',textAlign:'center',fontWeight:700,color:'var(--brand-700,#0D7C66)',fontSize:14}}>
            You save ₹{Math.round(calcRent/2).toLocaleString('en-IN')} 🎉
          </div>
        </div>
      </section>

      <Footer nav={nav}/>
    </div>
  );
}

function Faq({q, a}) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{borderTop:'1px solid var(--border)'}}>
      <button onClick={()=>setOpen(!open)} style={{
        width:'100%', padding:'22px 0', display:'flex', justifyContent:'space-between', alignItems:'center',
        background:'transparent', border:0, cursor:'pointer', textAlign:'left', font:'inherit', color:'var(--text)',
      }}>
        <span className="font-display" style={{fontSize:18, fontWeight:600, letterSpacing:'-0.015em'}}>{q}</span>
        <span style={{
          width:32, height:32, borderRadius:'50%',
          background: open ? 'var(--text)' : 'var(--surface-sunken)',
          color: open ? 'var(--bg)' : 'var(--text)',
          display:'grid', placeItems:'center', fontSize:18, fontWeight:400,
          transition:'transform .2s, background .2s',
          transform: open ? 'rotate(45deg)' : 'none',
        }}>+</span>
      </button>
      {open && <div className="pop-in" style={{paddingBottom:22, fontSize:15, color:'var(--text-muted)', lineHeight:1.6, maxWidth:720}}>{a}</div>}
    </div>
  );
}

// ---- auth-pricing.jsx ----
// auth-pricing.jsx — Auth + Pricing pages

// ─── AUTH ─────────────────────────────────────────────────────────────────

export { HowPage };
