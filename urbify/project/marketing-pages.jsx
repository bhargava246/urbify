// marketing-pages.jsx — Careers · Press · Investor · Referral

// ─── CAREERS ─────────────────────────────────────────────────────────────
function CareersPage({nav}) {
  const [team, setTeam] = useState("all");
  const jobs = [
    { id:1, title:"Senior Backend Engineer", team:"eng", loc:"Bangalore", type:"Full-time", salary:"₹48-72 L/yr" },
    { id:2, title:"Staff Frontend Engineer", team:"eng", loc:"Bangalore / Remote", type:"Full-time", salary:"₹56-84 L/yr" },
    { id:3, title:"Mobile Engineer (React Native)", team:"eng", loc:"Bangalore", type:"Full-time", salary:"₹38-58 L/yr" },
    { id:4, title:"Product Designer", team:"design", loc:"Bangalore", type:"Full-time", salary:"₹32-52 L/yr" },
    { id:5, title:"Senior PM, Marketplace", team:"product", loc:"Bangalore", type:"Full-time", salary:"₹48-78 L/yr" },
    { id:6, title:"Growth Marketing Lead", team:"marketing", loc:"Bangalore", type:"Full-time", salary:"₹38-62 L/yr" },
    { id:7, title:"City Manager · Mumbai", team:"ops", loc:"Mumbai", type:"Full-time", salary:"₹28-42 L/yr" },
    { id:8, title:"City Manager · Pune", team:"ops", loc:"Pune", type:"Full-time", salary:"₹24-36 L/yr" },
    { id:9, title:"Listings Moderator", team:"ops", loc:"Bangalore (Hybrid)", type:"Full-time", salary:"₹6-9 L/yr" },
    { id:10,title:"Customer Support · L2", team:"ops", loc:"Bangalore / Remote", type:"Full-time", salary:"₹5-8 L/yr" },
    { id:11,title:"Data Scientist", team:"eng", loc:"Bangalore", type:"Full-time", salary:"₹42-68 L/yr" },
    { id:12,title:"Content Writer", team:"marketing", loc:"Remote", type:"Contract", salary:"₹40-80k/mo" },
  ];
  const filtered = team === "all" ? jobs : jobs.filter(j=>j.team === team);

  return (
    <div>
      <section style={{padding:'72px 28px 24px', maxWidth:1280, margin:'0 auto'}}>
        <div className="chip" style={{background:'transparent', border:'1px solid var(--border-strong)', marginBottom:24}}>We're hiring · 12 open roles</div>
        <h1 className="font-display" style={{fontSize:'clamp(48px, 7vw, 96px)', fontWeight:800, letterSpacing:'-0.045em', lineHeight:.96, margin:0}}>
          Help fix real estate.<br/>From the inside.
        </h1>
        <p className="muted" style={{fontSize:20, maxWidth:680, marginTop:28, lineHeight:1.4}}>
          We're 42 people in Bangalore building the property platform we all wanted as renters. Series A, profitable on unit economics, on a 10-year mission.
        </p>
      </section>

      {/* HERO IMAGE */}
      <section style={{padding:'24px 28px 56px', maxWidth:1280, margin:'0 auto'}}>
        <div style={{borderRadius:'var(--r-xl)', overflow:'hidden', aspectRatio:'21/9'}}>
          <Img src={INTERIORS[3]} style={{width:'100%', height:'100%'}}/>
        </div>
      </section>

      {/* WHY WORK HERE */}
      <section style={{padding:'48px 28px', maxWidth:1280, margin:'0 auto'}}>
        <h2 className="font-display" style={{fontSize:'clamp(32px, 4vw, 48px)', fontWeight:800, letterSpacing:'-0.035em', margin:'0 0 32px'}}>What we offer.</h2>
        <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:18}}>
          {[
            { t:"Top-of-market pay", b:"75th-90th percentile cash + meaningful equity for every role." },
            { t:"4-day work week", b:"Most weeks. Real off-days, not 'unlimited PTO that nobody takes'." },
            { t:"Health for everyone", b:"₹15 L cover for you, your partner, parents, and one dependent." },
            { t:"Real autonomy", b:"Small teams, end-to-end ownership. We hire seniors, not managers of managers." },
            { t:"Bangalore HQ", b:"4 days office, 1 day flex. Hot desks for visiting remote folks." },
            { t:"₹1 L learning stipend", b:"Courses, books, conferences. No approval needed under ₹40k." },
            { t:"₹50k workspace setup", b:"Chair, desk, monitor, headphones — yours to keep." },
            { t:"Mental health credits", b:"12 sessions/year with vetted therapists, fully covered." },
          ].map(p=>(
            <div key={p.t} className="card" style={{padding:22}}>
              <div className="font-display" style={{fontSize:16, fontWeight:700, letterSpacing:'-0.015em'}}>{p.t}</div>
              <div style={{fontSize:13, color:'var(--text-muted)', marginTop:6, lineHeight:1.55}}>{p.b}</div>
            </div>
          ))}
        </div>
      </section>

      {/* OPEN ROLES */}
      <section style={{padding:'72px 28px', background:'var(--surface-sunken)'}}>
        <div style={{maxWidth:1280, margin:'0 auto'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:24, flexWrap:'wrap', gap:14}}>
            <h2 className="font-display" style={{fontSize:'clamp(32px, 4vw, 48px)', fontWeight:800, letterSpacing:'-0.035em', margin:0}}>Open roles.</h2>
            <div style={{display:'flex', gap:6, flexWrap:'wrap'}}>
              {[
                {id:'all', l:`All · ${jobs.length}`},
                {id:'eng', l:`Engineering · ${jobs.filter(j=>j.team==='eng').length}`},
                {id:'design', l:`Design · ${jobs.filter(j=>j.team==='design').length}`},
                {id:'product', l:`Product · ${jobs.filter(j=>j.team==='product').length}`},
                {id:'marketing', l:`Marketing · ${jobs.filter(j=>j.team==='marketing').length}`},
                {id:'ops', l:`Operations · ${jobs.filter(j=>j.team==='ops').length}`},
              ].map(t=>(
                <button key={t.id} onClick={()=>setTeam(t.id)} style={{
                  padding:'8px 14px', borderRadius:99,
                  border:'1.5px solid', borderColor: team===t.id?'var(--text)':'var(--border)',
                  background: team===t.id?'var(--text)':'transparent',
                  color: team===t.id?'var(--bg)':'var(--text)',
                  fontSize:13, fontWeight:600, cursor:'pointer',
                }}>{t.l}</button>
              ))}
            </div>
          </div>

          <div className="card" style={{padding:0, overflow:'hidden'}}>
            {filtered.map((j, i)=>(
              <div key={j.id} style={{
                display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr auto',
                padding:'22px 24px', borderTop: i===0?0:'1px solid var(--border)',
                alignItems:'center', cursor:'pointer', transition:'background .15s',
              }}
              onMouseEnter={e=>e.currentTarget.style.background='var(--surface-sunken)'}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}
              >
                <div>
                  <div className="font-display" style={{fontSize:17, fontWeight:700, letterSpacing:'-0.02em'}}>{j.title}</div>
                  <div style={{fontSize:12, color:'var(--text-muted)', marginTop:4, textTransform:'capitalize'}}>{j.team}</div>
                </div>
                <div style={{fontSize:13, color:'var(--text-muted)'}}>{j.loc}</div>
                <div style={{fontSize:13, color:'var(--text-muted)'}}>{j.type}</div>
                <div style={{fontSize:13, fontWeight:600, fontVariantNumeric:'tabular-nums'}}>{j.salary}</div>
                <button className="btn btn-outline btn-sm">Apply →</button>
              </div>
            ))}
          </div>

          <div style={{marginTop:32, padding:24, textAlign:'center', borderRadius:'var(--r-lg)', border:'2px dashed var(--border-strong)'}}>
            <div className="font-display" style={{fontSize:18, fontWeight:700, letterSpacing:'-0.02em'}}>Don't see your role?</div>
            <p style={{fontSize:14, color:'var(--text-muted)', marginTop:6, marginBottom:14}}>If you're exceptional and want to work on this problem, we'll find a way to fit you in.</p>
            <button className="btn btn-outline">Open application →</button>
          </div>
        </div>
      </section>

      {/* THE TEAM */}
      <section style={{padding:'72px 28px', maxWidth:1280, margin:'0 auto'}}>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1.4fr', gap:48, alignItems:'start'}}>
          <div>
            <h2 className="font-display" style={{fontSize:'clamp(28px, 4vw, 40px)', fontWeight:800, letterSpacing:'-0.035em', margin:0, lineHeight:1.05}}>The team you'd join.</h2>
            <p className="muted" style={{fontSize:16, lineHeight:1.55, marginTop:18}}>Engineers, designers and ops people from Razorpay, CRED, Swiggy, Flipkart, and a few who used to broker apartments and got tired of it.</p>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginTop:28}}>
              <Stat3 n="42" l="People"/>
              <Stat3 n="14" l="Engineers"/>
              <Stat3 n="6" l="Designers"/>
              <Stat3 n="4.9★" l="Glassdoor"/>
            </div>
          </div>
          <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:8}}>
            {Array.from({length:12}).map((_,i)=>(
              <div key={i} style={{aspectRatio:'1', borderRadius:'var(--r-md)', overflow:'hidden', background: `color-mix(in oklab, var(--brand-500) ${30 + (i*5)%70}%, var(--surface-sunken))`, display:'grid', placeItems:'center', color:'#fff', fontWeight:800, fontSize:16, fontFamily:'var(--f-display)'}}>
                {["AS","VK","RP","KM","MI","SR","PJ","DN","AT","NB","HG","LM"][i]}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer nav={nav}/>
    </div>
  );
}

function Stat3({n, l}) {
  return (
    <div>
      <div className="font-display" style={{fontSize:36, fontWeight:800, letterSpacing:'-0.035em', lineHeight:1}}>{n}</div>
      <div style={{fontSize:12, color:'var(--text-muted)', marginTop:6, textTransform:'uppercase', letterSpacing:'.08em', fontWeight:600}}>{l}</div>
    </div>
  );
}

// ─── PRESS ───────────────────────────────────────────────────────────────
function PressPage({nav}) {
  return (
    <div>
      <section style={{padding:'72px 28px 24px', maxWidth:1280, margin:'0 auto'}}>
        <div className="chip" style={{background:'transparent', border:'1px solid var(--border-strong)', marginBottom:24}}>Press</div>
        <h1 className="font-display" style={{fontSize:'clamp(48px, 7vw, 96px)', fontWeight:800, letterSpacing:'-0.045em', lineHeight:.96, margin:0}}>
          For journalists,<br/>analysts & writers.
        </h1>
        <p className="muted" style={{fontSize:20, maxWidth:680, marginTop:28, lineHeight:1.4}}>
          Logos, leadership bios, fact sheets, and recent coverage — everything you need to write about Urbify.
        </p>
      </section>

      <section style={{padding:'24px 28px 56px', maxWidth:1280, margin:'0 auto'}}>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:18}}>
          <div className="card" style={{padding:32, background:'var(--text)', color:'var(--bg)', border:0}}>
            <div style={{fontSize:12, opacity:.6, textTransform:'uppercase', letterSpacing:'.08em', fontWeight:600}}>Brand kit</div>
            <div className="font-display" style={{fontSize:28, fontWeight:800, letterSpacing:'-0.03em', marginTop:8}}>Logos & brand assets</div>
            <p style={{fontSize:13, opacity:.7, marginTop:8, lineHeight:1.55}}>Wordmarks, lockups, color palette, and the brand book — in SVG, PNG, and figma-friendly formats.</p>
            <div style={{display:'flex', gap:8, marginTop:18}}>
              <button className="btn btn-accent btn-sm">Download (.zip 2.4 MB)</button>
              <button className="btn btn-sm" style={{background:'rgba(255,255,255,.1)', color:'#fff', border:0}}>View brand book</button>
            </div>
          </div>
          <div className="card" style={{padding:32}}>
            <div style={{fontSize:12, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.08em', fontWeight:600}}>Press contact</div>
            <div className="font-display" style={{fontSize:28, fontWeight:800, letterSpacing:'-0.03em', marginTop:8}}>Maya Iyer</div>
            <p style={{fontSize:13, color:'var(--text-muted)', marginTop:4}}>Head of Communications</p>
            <div style={{display:'flex', flexDirection:'column', gap:8, marginTop:18, fontSize:13, fontFamily:'var(--f-mono)'}}>
              <span>maya@urbify.in</span>
              <span>+91 98455 33 423</span>
              <span>@maya_urbify (Twitter)</span>
            </div>
            <button className="btn btn-outline btn-sm" style={{marginTop:18}} onClick={()=>nav('contact')}>Send press inquiry →</button>
          </div>
        </div>
      </section>

      {/* FACT SHEET */}
      <section style={{padding:'56px 28px', maxWidth:1280, margin:'0 auto'}}>
        <h2 className="font-display" style={{fontSize:'clamp(28px, 4vw, 40px)', fontWeight:800, letterSpacing:'-0.035em', margin:'0 0 32px'}}>Fast facts.</h2>
        <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:1, background:'var(--border)', borderRadius:'var(--r-lg)', overflow:'hidden'}}>
          {[
            { n:"2024", l:"Founded"},
            { n:"42", l:"Team size"},
            { n:"₹120 Cr", l:"Total raised"},
            { n:"Series A", l:"Stage"},
            { n:"12", l:"Cities live"},
            { n:"12,400+", l:"Active listings"},
            { n:"28,400+", l:"Users"},
            { n:"₹0", l:"Owner cost · forever"},
          ].map(s=>(
            <div key={s.l} style={{padding:24, background:'var(--surface)'}}>
              <div className="font-display" style={{fontSize:36, fontWeight:800, letterSpacing:'-0.035em', lineHeight:1}}>{s.n}</div>
              <div style={{fontSize:12, color:'var(--text-muted)', marginTop:8, textTransform:'uppercase', letterSpacing:'.08em', fontWeight:600}}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* LEADERSHIP */}
      <section style={{padding:'40px 28px 56px', maxWidth:1280, margin:'0 auto'}}>
        <h2 className="font-display" style={{fontSize:'clamp(28px, 4vw, 40px)', fontWeight:800, letterSpacing:'-0.035em', margin:'0 0 24px'}}>Leadership.</h2>
        <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:16}}>
          {[
            { n:"Aanya Sharma", r:"CEO & Co-founder", b:"Previously product at Razorpay. ISB '18.", c:'var(--brand-500)', i:'AS' },
            { n:"Vikram Kumar", r:"Co-founder, CPO", b:"Ex-Swiggy. Built the rent collection product at NoBroker.", c:'var(--accent-500)', i:'VK' },
            { n:"Rohan Pillai", r:"Head of Engineering", b:"Ex-CRED, ex-Flipkart. IIT Madras '15.", c:'#7C3AED', i:'RP' },
            { n:"Maya Iyer", r:"Head of Communications", b:"Ex-Stripe, ex-Times Internet. Writer at the Mint.", c:'#EF4444', i:'MI' },
          ].map(p=>(
            <div key={p.n} className="card" style={{padding:22}}>
              <div style={{width:54, height:54, borderRadius:'50%', background:p.c, color:'#fff', display:'grid', placeItems:'center', fontWeight:800, fontSize:16}}>{p.i}</div>
              <div className="font-display" style={{fontSize:18, fontWeight:700, letterSpacing:'-0.02em', marginTop:14}}>{p.n}</div>
              <div style={{fontSize:12, color:'var(--brand-500)', fontWeight:600, marginTop:2}}>{p.r}</div>
              <div style={{fontSize:12, color:'var(--text-muted)', marginTop:10, lineHeight:1.55}}>{p.b}</div>
              <button className="btn btn-ghost btn-sm" style={{marginTop:14, paddingLeft:0}}>Download bio · headshot →</button>
            </div>
          ))}
        </div>
      </section>

      {/* RECENT COVERAGE */}
      <section style={{padding:'56px 28px 88px', maxWidth:1280, margin:'0 auto'}}>
        <h2 className="font-display" style={{fontSize:'clamp(28px, 4vw, 40px)', fontWeight:800, letterSpacing:'-0.035em', margin:'0 0 24px'}}>Recent coverage.</h2>
        <div style={{display:'flex', flexDirection:'column', gap:0}}>
          {[
            { pub:"MINT", date:"May 14, 2026", headline:"Urbify wants to make Indian real estate 'fair by default'", url:"livemint.com/companies" },
            { pub:"YourStory", date:"May 8, 2026", headline:"How Urbify is rewiring the broker-tenant equation in 12 cities", url:"yourstory.com/2026" },
            { pub:"INC42", date:"Apr 22, 2026", headline:"Inside Urbify's Series A — and the unit economics of zero-brokerage", url:"inc42.com/buzz" },
            { pub:"Moneycontrol", date:"Apr 10, 2026", headline:"Indian renters are paying ₹4,200 crore in brokerage. Urbify wants to kill that.", url:"moneycontrol.com" },
            { pub:"TechCrunch", date:"Mar 28, 2026", headline:"Bangalore's Urbify raises $14M to scale its zero-brokerage model", url:"techcrunch.com/2026" },
            { pub:"ET Prime", date:"Mar 15, 2026", headline:"The Razorpay alumni building India's next big real estate platform", url:"economictimes.com" },
          ].map((c, i)=>(
            <div key={i} style={{padding:'22px 0', borderTop:'1px solid var(--border)', display:'grid', gridTemplateColumns:'140px 1fr 200px auto', gap:24, alignItems:'center'}}>
              <div className="font-display" style={{fontSize:14, fontWeight:800, letterSpacing:'.02em', color:'var(--text-faint)'}}>{c.pub}</div>
              <div className="font-display" style={{fontSize:17, fontWeight:600, letterSpacing:'-0.015em'}}>{c.headline}</div>
              <div style={{fontSize:12, color:'var(--text-muted)', fontFamily:'var(--f-mono)'}}>{c.url}</div>
              <div style={{fontSize:12, color:'var(--text-muted)'}}>{c.date}</div>
            </div>
          ))}
        </div>
      </section>

      <Footer nav={nav}/>
    </div>
  );
}

// ─── INVESTOR ────────────────────────────────────────────────────────────
function InvestorPage({nav}) {
  return (
    <div>
      <section style={{padding:'72px 28px 56px', maxWidth:1280, margin:'0 auto'}}>
        <div className="chip" style={{background:'transparent', border:'1px solid var(--border-strong)', marginBottom:24}}>For investors</div>
        <h1 className="font-display" style={{fontSize:'clamp(48px, 7vw, 96px)', fontWeight:800, letterSpacing:'-0.045em', lineHeight:.96, margin:0}}>
          A ₹4,200 Cr<br/>market, ours to take.
        </h1>
        <p className="muted" style={{fontSize:20, maxWidth:680, marginTop:28, lineHeight:1.4}}>
          Indian renters pay an estimated ₹4,200 Cr/year in brokerage. We've taken a 2% bite in 18 months, growing 28% MoM, profitable on contribution margin since Q2 2026.
        </p>
      </section>

      {/* KPIs */}
      <section style={{padding:'24px 28px 56px', maxWidth:1280, margin:'0 auto'}}>
        <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:1, background:'var(--border)', borderRadius:'var(--r-lg)', overflow:'hidden'}}>
          {[
            { n:"₹48.2 L", l:"Monthly revenue · May '26", trend:"+18.6%" },
            { n:"28%", l:"MoM growth · 6-mo avg", trend:"sustained" },
            { n:"68%", l:"Contribution margin", trend:"+4 pp QoQ" },
            { n:"6 mo", l:"Payback period", trend:"down from 14" },
          ].map(s=>(
            <div key={s.l} style={{padding:28, background:'var(--surface)'}}>
              <div style={{fontSize:11, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.08em', fontWeight:600}}>{s.l}</div>
              <div className="font-display" style={{fontSize:36, fontWeight:800, letterSpacing:'-0.035em', marginTop:8, lineHeight:1}}>{s.n}</div>
              <div style={{fontSize:12, color:'var(--success)', fontWeight:600, marginTop:8}}>{s.trend}</div>
            </div>
          ))}
        </div>
      </section>

      {/* THE THESIS */}
      <section style={{padding:'56px 28px', maxWidth:1280, margin:'0 auto'}}>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1.6fr', gap:48, alignItems:'start'}}>
          <div>
            <div style={{fontSize:12, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.1em', fontWeight:600}}>The thesis</div>
            <h2 className="font-display" style={{fontSize:'clamp(32px, 4vw, 48px)', fontWeight:800, letterSpacing:'-0.035em', margin:'10px 0 0', lineHeight:1.05}}>
              Indian rental brokerage is structurally broken.
            </h2>
          </div>
          <div style={{display:'flex', flexDirection:'column', gap:18, fontSize:17, lineHeight:1.6, color:'var(--text-muted)'}}>
            <p style={{margin:0}}>The traditional broker charges a full month's rent — 8% of annual rent — for what is structurally a one-time matching service that costs them under ₹3,000 in time and effort.</p>
            <p style={{margin:0}}>The result: ₹4,200 Cr in dead-weight loss to renters annually. Tenant satisfaction in NPS surveys with traditional brokers averages -31.</p>
            <p style={{margin:0, color:'var(--text)'}}>We replace the brokerage with a flat 7.5-day fee — 75% cheaper, transparent, and built on a platform that scales without scaling the cost of fulfilment.</p>
          </div>
        </div>
      </section>

      {/* GROWTH CHART */}
      <section style={{padding:'40px 28px 56px', maxWidth:1280, margin:'0 auto'}}>
        <div className="card" style={{padding:32}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:18}}>
            <div>
              <div style={{fontSize:12, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.08em', fontWeight:600}}>Monthly revenue · Jul '24 – May '26</div>
              <div className="font-display" style={{fontSize:38, fontWeight:800, letterSpacing:'-0.04em', marginTop:8}}>₹48.2 L / month</div>
            </div>
            <div style={{textAlign:'right'}}>
              <div className="font-display" style={{fontSize:22, fontWeight:800, letterSpacing:'-0.03em', color:'var(--success)'}}>120× in 22 months</div>
              <div style={{fontSize:12, color:'var(--text-muted)'}}>compound monthly growth</div>
            </div>
          </div>
          <svg viewBox="0 0 1200 320" style={{width:'100%', height:280}}>
            <defs>
              <linearGradient id="inv-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--brand-500)" stopOpacity="0.3"/>
                <stop offset="100%" stopColor="var(--brand-500)" stopOpacity="0"/>
              </linearGradient>
            </defs>
            {[0, 60, 120, 180, 240].map((y, i)=>(
              <g key={i}>
                <line x1="60" y1={y+30} x2="1200" y2={y+30} stroke="var(--border)" strokeDasharray="4 4"/>
                <text x="50" y={y+34} fontSize="11" fill="var(--text-faint)" textAnchor="end">{["₹50L","₹40L","₹30L","₹20L","₹10L"][i]}</text>
              </g>
            ))}
            <path d="M 60 290 L 110 286 L 160 282 L 210 274 L 260 268 L 310 258 L 360 246 L 410 234 L 460 220 L 510 208 L 560 192 L 610 176 L 660 158 L 710 138 L 760 122 L 810 108 L 860 96 L 910 82 L 960 70 L 1010 60 L 1060 50 L 1110 40 L 1160 30 L 1160 290 L 60 290 Z" fill="url(#inv-grad)"/>
            <path d="M 60 290 L 110 286 L 160 282 L 210 274 L 260 268 L 310 258 L 360 246 L 410 234 L 460 220 L 510 208 L 560 192 L 610 176 L 660 158 L 710 138 L 760 122 L 810 108 L 860 96 L 910 82 L 960 70 L 1010 60 L 1060 50 L 1110 40 L 1160 30" fill="none" stroke="var(--brand-500)" strokeWidth="3"/>
            {/* milestone markers */}
            <circle cx="310" cy="258" r="6" fill="var(--accent-500)"/>
            <text x="310" y="240" textAnchor="middle" fontSize="11" fontFamily="Plus Jakarta Sans" fontWeight="700" fill="var(--accent-600)">Seed · ₹6 Cr</text>
            <circle cx="810" cy="108" r="6" fill="var(--accent-500)"/>
            <text x="810" y="90" textAnchor="middle" fontSize="11" fontFamily="Plus Jakarta Sans" fontWeight="700" fill="var(--accent-600)">Series A · ₹114 Cr</text>
            <circle cx="1160" cy="30" r="8" fill="var(--brand-500)"/>
          </svg>
          <div style={{display:'flex', justifyContent:'space-between', marginTop:8, fontSize:11, color:'var(--text-faint)'}}>
            <span>Jul '24</span><span>Jan '25</span><span>Jul '25</span><span>Jan '26</span><span>Today</span>
          </div>
        </div>
      </section>

      {/* CAP TABLE / FUNDING */}
      <section style={{padding:'56px 28px', maxWidth:1280, margin:'0 auto'}}>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:18}}>
          <div className="card" style={{padding:28}}>
            <div style={{fontSize:12, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.08em', fontWeight:600}}>Funding history</div>
            <div style={{display:'flex', flexDirection:'column', gap:0, marginTop:14}}>
              {[
                { round:"Pre-seed", date:"Jul 2024", amount:"₹1.2 Cr", lead:"Founder capital + angels" },
                { round:"Seed", date:"Mar 2025", amount:"₹6 Cr", lead:"Stellaris VP (led), Blume Ventures" },
                { round:"Series A", date:"Mar 2026", amount:"₹114 Cr", lead:"Accel India (led), Stellaris, Together Fund" },
              ].map((r, i)=>(
                <div key={r.round} style={{padding:'18px 0', borderTop: i===0?0:'1px solid var(--border)'}}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline'}}>
                    <div className="font-display" style={{fontSize:17, fontWeight:700, letterSpacing:'-0.02em'}}>{r.round}</div>
                    <div className="font-display" style={{fontSize:20, fontWeight:800, letterSpacing:'-0.025em'}}>{r.amount}</div>
                  </div>
                  <div style={{display:'flex', gap:12, marginTop:4, fontSize:12, color:'var(--text-muted)'}}>
                    <span>{r.date}</span><span>·</span><span>{r.lead}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="card" style={{padding:28}}>
            <div style={{fontSize:12, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.08em', fontWeight:600}}>Backed by</div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginTop:14}}>
              {[
                "Accel India",
                "Stellaris VP",
                "Blume Ventures",
                "Together Fund",
                "Kunal Shah",
                "Nitin Kamath",
              ].map(name=>(
                <div key={name} style={{padding:'16px 18px', borderRadius:'var(--r-md)', background:'var(--surface-sunken)', display:'flex', alignItems:'center', justifyContent:'center'}}>
                  <div className="font-display" style={{fontSize:14, fontWeight:700, letterSpacing:'.02em', color:'var(--text-muted)'}}>{name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{padding:'88px 28px'}}>
        <div style={{maxWidth:680, margin:'0 auto', textAlign:'center'}}>
          <h2 className="font-display" style={{fontSize:'clamp(32px, 5vw, 48px)', fontWeight:800, letterSpacing:'-0.04em', margin:0, lineHeight:1.05}}>
            Talk to us.
          </h2>
          <p style={{fontSize:16, color:'var(--text-muted)', marginTop:14, lineHeight:1.5}}>
            We're not actively raising. But we always meet exceptional partners who could matter for the next round.
          </p>
          <button className="btn btn-primary btn-lg" style={{marginTop:24}} onClick={()=>nav('contact')}>
            Reach the founders → investor@urbify.in
          </button>
        </div>
      </section>

      <Footer nav={nav}/>
    </div>
  );
}

// ─── REFERRAL ────────────────────────────────────────────────────────────
function ReferralPage({nav}) {
  const [copied, setCopied] = useState(false);
  const refLink = "urbify.in/r/AANYA-2026";

  return (
    <div>
      <section style={{padding:'72px 28px 32px', maxWidth:1280, margin:'0 auto'}}>
        <div className="chip" style={{background:'transparent', border:'1px solid var(--border-strong)', marginBottom:24}}>Refer a friend</div>
        <h1 className="font-display" style={{fontSize:'clamp(48px, 7vw, 96px)', fontWeight:800, letterSpacing:'-0.045em', lineHeight:.96, margin:0}}>
          Give ₹500.<br/>Get ₹500.
        </h1>
        <p className="muted" style={{fontSize:20, maxWidth:680, marginTop:28, lineHeight:1.4}}>
          Your friend gets ₹500 off their first unlock. You get ₹500 in credit when they actually use it. Simple as that.
        </p>
      </section>

      {/* hero card */}
      <section style={{padding:'24px 28px 56px', maxWidth:1280, margin:'0 auto'}}>
        <div style={{display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:18}}>

          {/* main referral card */}
          <div className="card" style={{padding:0, overflow:'hidden', background:'var(--brand-500)', color:'#fff', border:0}}>
            <div style={{padding:36}}>
              <div style={{fontSize:12, opacity:.7, textTransform:'uppercase', letterSpacing:'.1em', fontWeight:700}}>Your link</div>
              <div style={{
                display:'flex', alignItems:'center', gap:14, marginTop:18,
                background:'rgba(255,255,255,.12)', padding:'16px 22px', borderRadius:'var(--r-md)',
                fontFamily:'var(--f-mono)', fontSize:18, fontWeight:600,
              }}>
                <span style={{flex:1, overflow:'hidden', textOverflow:'ellipsis'}}>{refLink}</span>
                <button onClick={()=>{setCopied(true); setTimeout(()=>setCopied(false), 1500);}}
                  className="btn btn-sm" style={{background:copied ? 'var(--success)' : '#fff', color: copied ? '#fff' : 'var(--brand-500)', border:0}}>
                  {copied ? "✓ Copied" : "Copy link"}
                </button>
              </div>

              <div style={{display:'flex', gap:8, marginTop:18}}>
                {[
                  { l:"WhatsApp", c:'#25D366' },
                  { l:"X / Twitter", c:'#000' },
                  { l:"Email", c:'#374151' },
                  { l:"SMS", c:'#374151' },
                ].map(s=>(
                  <button key={s.l} className="btn btn-sm" style={{background:'rgba(255,255,255,.12)', color:'#fff', border:0}}>{s.l}</button>
                ))}
              </div>
            </div>

            <div style={{padding:'24px 36px', background:'rgba(255,255,255,.08)', display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:24}}>
              <div>
                <div style={{fontSize:11, opacity:.7, textTransform:'uppercase', letterSpacing:'.08em', fontWeight:700}}>Friends invited</div>
                <div className="font-display" style={{fontSize:32, fontWeight:800, letterSpacing:'-0.035em', marginTop:6}}>12</div>
              </div>
              <div>
                <div style={{fontSize:11, opacity:.7, textTransform:'uppercase', letterSpacing:'.08em', fontWeight:700}}>Signed up</div>
                <div className="font-display" style={{fontSize:32, fontWeight:800, letterSpacing:'-0.035em', marginTop:6}}>7</div>
              </div>
              <div>
                <div style={{fontSize:11, opacity:.7, textTransform:'uppercase', letterSpacing:'.08em', fontWeight:700}}>Credit earned</div>
                <div className="font-display" style={{fontSize:32, fontWeight:800, letterSpacing:'-0.035em', marginTop:6, color:'var(--accent-500)'}}>₹2,500</div>
              </div>
            </div>
          </div>

          {/* how it works */}
          <div className="card" style={{padding:32}}>
            <div className="font-display" style={{fontSize:18, fontWeight:700, letterSpacing:'-0.02em'}}>How it works</div>
            <div style={{display:'flex', flexDirection:'column', gap:18, marginTop:24}}>
              {[
                {n:"01", t:"Share your link", b:"Send it to anyone hunting for a home."},
                {n:"02", t:"They sign up + unlock", b:"They get ₹500 off their first unlock automatically."},
                {n:"03", t:"You get ₹500", b:"Credited to your Urbify wallet — use on your next unlock or withdraw to UPI."},
              ].map(s=>(
                <div key={s.n} style={{display:'flex', gap:14}}>
                  <div className="font-display" style={{fontSize:24, fontWeight:800, letterSpacing:'-0.025em', color:'var(--text-faint)', minWidth:36, lineHeight:1}}>{s.n}</div>
                  <div>
                    <div style={{fontSize:14, fontWeight:700}}>{s.t}</div>
                    <div style={{fontSize:13, color:'var(--text-muted)', marginTop:2, lineHeight:1.5}}>{s.b}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{marginTop:24, padding:'12px 14px', background:'var(--surface-sunken)', borderRadius:'var(--r-sm)', fontSize:12, color:'var(--text-muted)', lineHeight:1.5}}>
              Credit valid for 90 days. Max 50 referrals per account.
            </div>
          </div>
        </div>
      </section>

      {/* RECENT REFERRALS */}
      <section style={{padding:'56px 28px', maxWidth:1280, margin:'0 auto'}}>
        <h2 className="font-display" style={{fontSize:'clamp(24px, 3vw, 32px)', fontWeight:800, letterSpacing:'-0.03em', margin:'0 0 24px'}}>Your referrals</h2>
        <div className="card" style={{padding:0, overflow:'hidden'}}>
          <table style={{width:'100%', borderCollapse:'collapse', fontSize:13}}>
            <thead style={{background:'var(--surface-sunken)'}}>
              <tr style={{textAlign:'left', color:'var(--text-muted)', fontSize:11, textTransform:'uppercase', letterSpacing:'.08em', fontWeight:600}}>
                <th style={{padding:'12px 22px'}}>Friend</th>
                <th style={{padding:'12px 22px'}}>Sent</th>
                <th style={{padding:'12px 22px'}}>Status</th>
                <th style={{padding:'12px 22px'}}>Credit</th>
              </tr>
            </thead>
            <tbody>
              {[
                { who:"+91 9845•••42", date:"3 days ago", status:'unlocked', credit:500 },
                { who:"+91 8123•••00", date:"1 week ago", status:'signed_up', credit:0 },
                { who:"+91 7890•••11", date:"2 weeks ago", status:'unlocked', credit:500 },
                { who:"+91 9986•••28", date:"3 weeks ago", status:'pending', credit:0 },
                { who:"+91 8754•••72", date:"1 month ago", status:'unlocked', credit:500 },
              ].map((r, i)=>(
                <tr key={i} style={{borderTop:'1px solid var(--border)'}}>
                  <td style={{padding:'14px 22px', fontFamily:'var(--f-mono)', fontWeight:600}}>{r.who}</td>
                  <td style={{padding:'14px 22px', color:'var(--text-muted)'}}>{r.date}</td>
                  <td style={{padding:'14px 22px'}}>
                    {r.status === 'unlocked' && <span style={{fontSize:11, color:'var(--success)', fontWeight:600}}>● Unlocked</span>}
                    {r.status === 'signed_up' && <span style={{fontSize:11, color:'var(--accent-600)', fontWeight:600}}>● Signed up — hasn't unlocked yet</span>}
                    {r.status === 'pending' && <span style={{fontSize:11, color:'var(--text-muted)', fontWeight:600}}>○ Link clicked — pending signup</span>}
                  </td>
                  <td style={{padding:'14px 22px', fontWeight:700, color: r.credit > 0 ? 'var(--success)' : 'var(--text-faint)', fontVariantNumeric:'tabular-nums'}}>
                    {r.credit > 0 ? `+₹${r.credit}` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Footer nav={nav}/>
    </div>
  );
}

Object.assign(window, { CareersPage, PressPage, InvestorPage, ReferralPage });
