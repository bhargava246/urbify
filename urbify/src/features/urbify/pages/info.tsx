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
  PortalShell, StatCard, StatusBadge, DashHeader, Footer, Faq,
} from '../_shared';
import { Field } from './owner';

function AboutPage({nav}) {
  return (
    <div>
      <section style={{padding:'72px 28px 24px', maxWidth:1280, margin:'0 auto'}}>
        <div className="chip" style={{background:'transparent', border:'1px solid var(--border-strong)', marginBottom:24}}>About Urbify</div>
        <h1 className="font-display" style={{fontSize:'clamp(48px, 7vw, 96px)', fontWeight:800, letterSpacing:'-0.045em', lineHeight:.96, margin:0, maxWidth:1200}}>
          Real estate has been<br/>broken for too long.
        </h1>
        <p className="muted" style={{fontSize:20, maxWidth:760, marginTop:32, lineHeight:1.45}}>
          We built Urbify because hunting for a home in India shouldn't mean fielding 14 broker calls a day, paying a full month's rent in commission, or handing your address to strangers before you've even met them.
        </p>
      </section>

      {/* big visual */}
      <section style={{padding:'24px 28px 72px', maxWidth:1280, margin:'0 auto'}}>
        <div style={{borderRadius:'var(--r-xl)', overflow:'hidden', aspectRatio:'21/9'}}>
          <Img src={INTERIORS[1]} style={{width:'100%', height:'100%'}}/>
        </div>
      </section>

      {/* mission */}
      <section style={{padding:'72px 28px', background:'var(--surface-sunken)'}}>
        <div style={{maxWidth:1100, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1.6fr', gap:48, alignItems:'start'}}>
          <div>
            <div style={{fontSize:12, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.1em', fontWeight:600}}>Our mission</div>
            <h2 className="font-display" style={{fontSize:'clamp(36px, 5vw, 56px)', fontWeight:800, letterSpacing:'-0.035em', lineHeight:1, marginTop:14}}>
              Make real estate fair for everyone.
            </h2>
          </div>
          <div style={{display:'flex', flexDirection:'column', gap:18, fontSize:17, lineHeight:1.6, color:'var(--text-muted)'}}>
            <p style={{margin:0}}>Renting your first apartment in Bangalore, or your fifth in Mumbai, the experience hasn't changed. Brokers charge a month's rent. Listings are stale. Phone numbers get resold. Addresses leak.</p>
            <p style={{margin:0}}>We thought: what if we built the opposite? Free for owners. One flat fee for tenants. Brokers paid by the result, not by collecting names. Addresses revealed only when someone genuinely wants the home.</p>
            <p style={{margin:0, color:'var(--text)'}}>That's Urbify. Three good deals, one platform.</p>
          </div>
        </div>
      </section>

      {/* values */}
      <section style={{padding:'88px 28px', maxWidth:1280, margin:'0 auto'}}>
        <div style={{textAlign:'center', marginBottom:56}}>
          <div className="chip" style={{background:'transparent', border:'1px solid var(--border-strong)'}}>How we operate</div>
          <h2 className="font-display" style={{fontSize:'clamp(32px, 4vw, 48px)', fontWeight:800, letterSpacing:'-0.03em', margin:'14px 0 0'}}>Three principles, no exceptions.</h2>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:18}}>
          <ValueCard num="01" title="Privacy by default" body="Addresses, phone numbers and inquiries are encrypted at rest. We never resell, lease, or 'partner-share' user data. Ever."/>
          <ValueCard num="02" title="Pricing in plain sight" body="One number, one explanation, one screen. If we can't justify the fee on a calculator, we shouldn't be charging it."/>
          <ValueCard num="03" title="Humans over algorithms" body="Every listing is reviewed by a real moderator within 2 hours. Disputes are handled by humans, not chatbots."/>
        </div>
      </section>

      {/* team */}
      <section style={{padding:'72px 28px', background:'var(--text)', color:'var(--bg)'}}>
        <div style={{maxWidth:1280, margin:'0 auto'}}>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:64, alignItems:'center'}}>
            <div>
              <div style={{fontSize:12, opacity:.6, textTransform:'uppercase', letterSpacing:'.1em', fontWeight:600}}>The team</div>
              <h2 className="font-display" style={{fontSize:'clamp(36px, 5vw, 56px)', fontWeight:800, letterSpacing:'-0.035em', lineHeight:1, marginTop:14}}>
                Built by people who've moved 38 times between them.
              </h2>
              <p style={{fontSize:17, opacity:.7, marginTop:20, lineHeight:1.55, maxWidth:520}}>
                Engineers, designers and ops people from PhonePe, CRED, Swiggy and Flipkart. We've all hated finding apartments. So we built the one we wanted.
              </p>
              <div style={{display:'flex', gap:12, marginTop:28, flexWrap:'wrap'}}>
                {["Bangalore HQ","42 team members","Series A · ₹120 Cr","Founded 2024"].map(t=><span key={t} className="chip" style={{background:'rgba(255,255,255,.1)', color:'#fff', border:0}}>{t}</span>)}
              </div>
            </div>

            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:14}}>
              {[
                { name:"Aanya Sharma", role:"CEO", color:"var(--brand-500)", initials:"AS" },
                { name:"Vikram Kumar", role:"Co-founder, CPO", color:"var(--accent-500)", initials:"VK" },
                { name:"Rohan Pillai", role:"Head of Engineering", color:"#7C3AED", initials:"RP" },
                { name:"Karan Mehta", role:"Head of Ops", color:"#EF4444", initials:"KM" },
              ].map(p=>(
                <div key={p.name} style={{background:'rgba(255,255,255,.05)', borderRadius:'var(--r-md)', padding:20}}>
                  <div style={{width:54, height:54, borderRadius:'50%', background:p.color, color:'#fff', display:'grid', placeItems:'center', fontWeight:800, fontSize:16}}>{p.initials}</div>
                  <div style={{fontSize:14, fontWeight:700, marginTop:14}}>{p.name}</div>
                  <div style={{fontSize:12, opacity:.6, marginTop:2}}>{p.role}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer nav={nav}/>
    </div>
  );
}

function ValueCard({num, title, body}) {
  return (
    <div className="card" style={{padding:28, minHeight:240}}>
      <div className="font-display" style={{fontSize:48, fontWeight:800, letterSpacing:'-0.04em', color:'var(--text-faint)', lineHeight:1}}>{num}</div>
      <div className="font-display" style={{fontSize:22, fontWeight:700, letterSpacing:'-0.02em', marginTop:18}}>{title}</div>
      <div style={{fontSize:14, lineHeight:1.55, color:'var(--text-muted)', marginTop:10}}>{body}</div>
    </div>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────
function FaqPage({nav}) {
  const groups = [
    {
      title:"Pricing & fees",
      faqs:[
        ["How is the Urbify fee calculated?", "Traditional brokers charge one full month's rent — sometimes two. We charge exactly 50% of that. Take the monthly rent, divide by 30 to get the daily rent, multiply by 7.5. Add 18% GST on top. So a ₹40,000/month flat costs you ₹11,800 to unlock — exactly 50% of what a typical broker would charge."],
        ["Is GST included in the displayed fee?", "Yes. The total fee shown anywhere on Urbify is the all-in number — including 18% GST. You'll see the GST line item separately on your invoice."],
        ["Do I pay again if I unlock the same listing twice?", "No. Once you've unlocked a listing, the contact stays unlocked in your dashboard. You can revisit it any time at no extra charge."],
        ["What's the refund policy?", "If the address turns out wrong, or the owner is unreachable, you can flag it within 24 hours and we'll refund automatically. No support queue, no email tag."],
      ],
    },
    {
      title:"Privacy",
      faqs:[
        ["Is my address really hidden from everyone?", "Yes. The exact street address is stored encrypted and never displayed — not on cards, not on the detail page, not even to other brokers. Only the locality and an area zone show. The address is revealed only after the platform fee is paid."],
        ["Will my phone number ever be shared?", "No. We don't sell, rent, or syndicate phone numbers to third parties. Tenants who pay the fee can see your number to call directly. Brokers and agencies can't bulk-export."],
        ["What about owners — do tenants see my name?", "Only your first name shows on the listing. Tenants who pay can see the full name and a verified-owner badge."],
      ],
    },
    {
      title:"For owners",
      faqs:[
        ["Is listing really free?", "Yes — ₹0 to list, ₹0 to renew, ₹0 to feature. Our entire revenue comes from the tenant-side fee. We're never going to add an owner-side charge."],
        ["How long does verification take?", "Target is under 2 hours. We have moderators across 3 time zones, so most listings go live within 60 minutes. After 8 PM IST, longer queues are possible."],
        ["Can I cancel or mark as rented at any time?", "Yes. One click in your dashboard removes the listing from search. We'll archive it so you can re-list later if your tenant doesn't move in."],
      ],
    },
    {
      title:"For brokers",
      faqs:[
        ["How do brokers earn?", "You and the owner agree on the commission like always. Urbify doesn't touch your owner-side cut. The 50% of market brokerage fee we collect comes from the tenant, on top — it's our revenue, not yours."],
        ["Is RERA verification mandatory?", "Yes. We require a valid RERA Broker ID before you can list. We verify it monthly against state RERA portals. Tenants see a green shield on listings from verified brokers."],
      ],
    },
    {
      title:"Legal & compliance",
      faqs:[
        ["Is Urbify RERA compliant?", "Yes. We're registered as an intermediary platform and require RERA registration for properties where state law mandates it. All brokers on the platform must be RERA-registered."],
        ["Who is the grievance officer?", "Required under the Consumer Protection Act 2019. Contact: grievance@urbify.in · +91 80-4567-8900 (Mon-Fri, 10 AM – 6 PM IST)."],
      ],
    },
  ];

  return (
    <div>
      <section style={{padding:'72px 28px 32px', maxWidth:1280, margin:'0 auto'}}>
        <div className="chip" style={{background:'transparent', border:'1px solid var(--border-strong)', marginBottom:24}}>FAQ</div>
        <h1 className="font-display" style={{fontSize:'clamp(48px, 7vw, 88px)', fontWeight:800, letterSpacing:'-0.045em', lineHeight:.96, margin:0}}>
          Questions, answered.
        </h1>
        <p className="muted" style={{fontSize:20, maxWidth:680, marginTop:24, lineHeight:1.4}}>
          The honest version — no marketing fluff.
        </p>
      </section>

      <section style={{padding:'24px 28px 72px', maxWidth:980, margin:'0 auto'}}>
        {groups.map((g, gi)=>(
          <div key={g.title} style={{marginTop: gi === 0 ? 0 : 48}}>
            <h2 className="font-display" style={{fontSize:22, fontWeight:700, letterSpacing:'-0.02em', marginBottom:8}}>{g.title}</h2>
            {g.faqs.map(([q, a], i)=> <Faq key={i} q={q} a={a}/>)}
          </div>
        ))}
      </section>

      <section style={{padding:'72px 28px', background:'var(--surface-sunken)'}}>
        <div style={{maxWidth:680, margin:'0 auto', textAlign:'center'}}>
          <h2 className="font-display" style={{fontSize:'clamp(28px, 4vw, 40px)', fontWeight:800, letterSpacing:'-0.03em', margin:0}}>Still stuck? Real humans are here.</h2>
          <div style={{display:'flex', gap:10, justifyContent:'center', marginTop:24}}>
            <button className="btn btn-brand" onClick={()=>nav('contact')}>Contact support</button>
            <button className="btn btn-outline">Open chat</button>
          </div>
        </div>
      </section>

      <Footer nav={nav}/>
    </div>
  );
}

// ─── CONTACT ──────────────────────────────────────────────────────────────
function ContactPage({nav}) {
  const [topic, setTopic] = useState("general");
  return (
    <div>
      <section style={{padding:'72px 28px 32px', maxWidth:1280, margin:'0 auto'}}>
        <div className="chip" style={{background:'transparent', border:'1px solid var(--border-strong)', marginBottom:24}}>Contact</div>
        <h1 className="font-display" style={{fontSize:'clamp(48px, 7vw, 88px)', fontWeight:800, letterSpacing:'-0.045em', lineHeight:.96, margin:0}}>
          We read every message.
        </h1>
        <p className="muted" style={{fontSize:20, maxWidth:680, marginTop:24, lineHeight:1.4}}>
          Real people, real replies. Usually within 4 hours during business hours.
        </p>
      </section>

      <section style={{padding:'24px 28px 96px', maxWidth:1280, margin:'0 auto'}}>
        <div style={{display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:36}}>

          {/* form */}
          <div className="card" style={{padding:36}}>
            <div className="font-display" style={{fontSize:22, fontWeight:700, letterSpacing:'-0.02em'}}>Send us a message</div>
            <p className="muted" style={{margin:'6px 0 24px', fontSize:14}}>We'll reply to the email you provide.</p>

            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:14}}>
              <Field label="First name"><input className="input" defaultValue="Aanya"/></Field>
              <Field label="Last name"><input className="input" defaultValue="Sharma"/></Field>
            </div>
            <div style={{marginTop:14}}>
              <Field label="Email"><input className="input" type="email" defaultValue="aanya@example.com"/></Field>
            </div>
            <div style={{marginTop:14}}>
              <Field label="Phone (optional)">
                <div style={{display:'flex', gap:8}}>
                  <div className="input" style={{width:90, display:'flex', alignItems:'center', justifyContent:'center', gap:6}}>🇮🇳 +91</div>
                  <input className="input" placeholder="98XXX XXXXX" style={{flex:1}}/>
                </div>
              </Field>
            </div>

            <div style={{marginTop:14}}>
              <label style={{fontSize:12, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.08em', display:'block', marginBottom:10}}>What's this about?</label>
              <div style={{display:'flex', flexWrap:'wrap', gap:8}}>
                {[
                  {id:'general',label:'General question'},
                  {id:'refund',label:'Refund / dispute'},
                  {id:'listing',label:'Issue with a listing'},
                  {id:'partnership',label:'Partnership / press'},
                  {id:'broker',label:'Broker onboarding'},
                  {id:'feedback',label:'Feedback'},
                ].map(t=>(
                  <button key={t.id} onClick={()=>setTopic(t.id)}
                    style={{
                      padding:'8px 14px', borderRadius:99,
                      border:'1.5px solid', borderColor: topic===t.id?'var(--text)':'var(--border)',
                      background: topic===t.id?'var(--text)':'transparent',
                      color: topic===t.id?'var(--bg)':'var(--text)',
                      fontSize:13, fontWeight:600, cursor:'pointer',
                    }}>{t.label}</button>
                ))}
              </div>
            </div>

            <div style={{marginTop:18}}>
              <Field label="Message">
                <textarea className="input" rows="5" style={{height:'auto', padding:'12px 14px', resize:'vertical', lineHeight:1.6}} defaultValue="Hi Urbify team,&#10;&#10;I'd like to know more about..."/>
              </Field>
            </div>

            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:24}}>
              <div style={{fontSize:11, color:'var(--text-faint)'}}>By submitting you agree to our privacy policy.</div>
              <button className="btn btn-brand">Send message <Icon.arrow/></button>
            </div>
          </div>

          {/* sidebar */}
          <div style={{display:'flex', flexDirection:'column', gap:14}}>
            <div className="card" style={{padding:24}}>
              <div className="font-display" style={{fontSize:16, fontWeight:700, letterSpacing:'-0.02em'}}>Live chat</div>
              <div style={{fontSize:13, color:'var(--text-muted)', marginTop:6, lineHeight:1.5}}>Real humans, 9 AM – 8 PM IST · all days</div>
              <button className="btn btn-brand btn-sm" style={{marginTop:14}}>Open chat →</button>
            </div>

            <div className="card" style={{padding:24}}>
              <div className="font-display" style={{fontSize:16, fontWeight:700, letterSpacing:'-0.02em'}}>City support</div>
              <div style={{display:'flex', flexDirection:'column', gap:8, marginTop:14, fontSize:13}}>
                <ContactRow city="Bangalore" email="blr@urbify.in" phone="+91 80-4567-8900"/>
                <ContactRow city="Mumbai" email="mum@urbify.in" phone="+91 22-3456-7890"/>
                <ContactRow city="Pune" email="pune@urbify.in" phone="+91 20-2345-6789"/>
                <ContactRow city="Delhi NCR" email="dl@urbify.in" phone="+91 11-9876-5432"/>
              </div>
            </div>

            <div className="card" style={{padding:24, background:'#FEF3C7', border:0}}>
              <div className="font-display" style={{fontSize:14, fontWeight:700, color:'#78350F'}}>Grievance officer</div>
              <div style={{fontSize:12, color:'#92400E', marginTop:6, lineHeight:1.5}}>As required under the Consumer Protection Act, 2019.</div>
              <div style={{fontSize:13, marginTop:12, color:'#78350F', fontWeight:600}}>Maya Iyer<br/>grievance@urbify.in<br/>+91 80-4567-8901</div>
            </div>

            <div className="card" style={{padding:24}}>
              <div className="font-display" style={{fontSize:16, fontWeight:700, letterSpacing:'-0.02em'}}>HQ</div>
              <div style={{fontSize:13, color:'var(--text-muted)', marginTop:6, lineHeight:1.5}}>
                Urbify Technologies Pvt. Ltd.<br/>
                4th Floor, Diamond District<br/>
                HAL Old Airport Rd, Bangalore 560008<br/>
                CIN U72200KA2024PTC123456
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer nav={nav}/>
    </div>
  );
}

function ContactRow({city, email, phone}) {
  return (
    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid var(--border)'}}>
      <div>
        <div style={{fontWeight:600}}>{city}</div>
        <div style={{fontSize:11, color:'var(--text-muted)', fontFamily:'var(--f-mono)'}}>{email}</div>
      </div>
      <div style={{fontSize:11, color:'var(--text-muted)', fontFamily:'var(--f-mono)'}}>{phone}</div>
    </div>
  );
}

// ---- city-pages.jsx ----
// city-pages.jsx — City landing + Locality landing (programmatic SEO pages)

// ─── CITY LANDING ─────────────────────────────────────────────────────────

export { AboutPage, FaqPage, ContactPage };
