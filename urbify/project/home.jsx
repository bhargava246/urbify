// home.jsx — Urbify homepage

function HomePage({nav, savedIds, onSave, onUnlock}) {
  const [tab, setTab] = useState("rent");
  const [city, setCity] = useState("Bangalore");
  const [bhk, setBhk] = useState("Any");
  const [type, setType] = useState("Apartment");

  const featured = LISTINGS.slice(0, 8);

  return (
    <div>
      {/* ─── HERO ─────────────────────────────────────────────────────── */}
      <section style={{padding:'56px 28px 32px', maxWidth:1440, margin:'0 auto'}}>
        <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:24}}>
          <span className="chip" style={{background:'transparent', border:'1px solid var(--border-strong)'}}>
            <span style={{width:6, height:6, borderRadius:'50%', background:'var(--success)', display:'inline-block'}}/>
            Live in 12 cities
          </span>
          <span className="chip" style={{background:'transparent', border:'1px solid var(--border-strong)', color:'var(--text-muted)'}}>
            ₹0 to list · 7.5 days' rent to unlock
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
          Owners list for free. Tenants pay just <strong style={{color:'var(--text)'}}>7.5 days' rent</strong> — one time, all in.
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

          <div style={{display:'grid', gridTemplateColumns:'1.6fr 1fr 1fr auto', gap:10, alignItems:'stretch'}}>
            <div style={{display:'flex', alignItems:'center', gap:10, padding:'0 14px', background:'var(--surface-sunken)', borderRadius:'var(--r-sm)', height: 'var(--row-h)'}}>
              <span style={{fontSize:16, color:'var(--text-muted)'}}><Icon.pin/></span>
              <input className="input" placeholder="City or locality" defaultValue={`${city}, Koramangala`}
                style={{border:0, background:'transparent', padding:0, height:'auto', flex:1}}/>
            </div>
            <select className="input select" value={type} onChange={e=>setType(e.target.value)} style={{background:'var(--surface-sunken)', border:0}}>
              {["Apartment","Independent house","Villa","PG / Hostel","Plot / Land"].map(o=><option key={o}>{o}</option>)}
            </select>
            <select className="input select" value={bhk} onChange={e=>setBhk(e.target.value)} style={{background:'var(--surface-sunken)', border:0}}>
              {["Any BHK","1 BHK","2 BHK","3 BHK","4+ BHK"].map(o=><option key={o}>{o}</option>)}
            </select>
            <button className="btn btn-brand" onClick={()=>nav('search')} style={{padding:'0 26px'}}>
              <Icon.search/> Search
            </button>
          </div>

          <div style={{display:'flex', gap:8, marginTop:14, flexWrap:'wrap', alignItems:'center'}}>
            <span style={{fontSize:12, color:'var(--text-faint)'}}>Popular:</span>
            {["Koramangala", "HSR Layout", "Indiranagar", "Bandra W", "Powai", "Sector 56"].map(loc=>(
              <button key={loc} className="chip" onClick={()=>nav('search')} style={{cursor:'pointer', background:'transparent', height:26, padding:'0 10px'}}>{loc}</button>
            ))}
          </div>
        </div>

        {/* stats strip */}
        <div style={{
          display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:0,
          marginTop:64, paddingTop:32, borderTop:'1px solid var(--border)'
        }}>
          {[
            {n:"12,400+", l:"active listings", sub:"updated daily"},
            {n:"12", l:"cities live", sub:"42 launching '26"},
            {n:"4.8★", l:"on Google", sub:"from 2,800 reviews"},
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
      <section style={{padding:'72px 28px', background:'var(--surface-sunken)'}}>
        <div style={{maxWidth:1440, margin:'0 auto'}}>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:80, alignItems:'center'}}>
            <div>
              <div className="chip" style={{background:'var(--brand-50)', color:'var(--brand-700)', border:0, marginBottom:18}}>The privacy bit ↓</div>
              <h2 className="font-display" style={{fontSize:'clamp(36px, 5vw, 64px)', lineHeight:1, letterSpacing:'-0.04em', fontWeight:800, margin:0}}>
                Your address<br/>stays yours.<br/>
                <span style={{color:'var(--brand-500)'}}>Until you decide.</span>
              </h2>
              <p className="muted" style={{fontSize:17, marginTop:24, maxWidth:480, lineHeight:1.55}}>
                Every listing on Urbify hides the exact address. Tenants pay a small flat fee — 7.5 days' rent — to unlock it.
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
      <section style={{padding:'72px 28px 24px', maxWidth:1440, margin:'0 auto'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'end', marginBottom:28}}>
          <div>
            <div style={{fontSize:13, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.08em', fontWeight:600}}>Fresh today</div>
            <h2 className="font-display" style={{fontSize:'clamp(28px, 3.4vw, 44px)', margin:'8px 0 0', fontWeight:800, letterSpacing:'-0.03em'}}>
              Homes worth a second look
            </h2>
          </div>
          <button className="btn btn-ghost" onClick={()=>nav('search')}>View all 12,400 →</button>
        </div>

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
      </section>

      {/* ─── HOW IT WORKS  ─────────────────────────────────────────── */}
      <section style={{padding:'88px 28px', maxWidth:1440, margin:'0 auto'}}>
        <div style={{textAlign:'center', marginBottom:48}}>
          <div className="chip" style={{background:'transparent', border:'1px solid var(--border-strong)', marginBottom:16}}>For everyone</div>
          <h2 className="font-display" style={{fontSize:'clamp(36px, 5vw, 64px)', margin:0, fontWeight:800, letterSpacing:'-0.04em'}}>
            One platform. Three good deals.
          </h2>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:18}}>
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
            headline={<>Pay just<br/>7.5 days' rent.</>}
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

      {/* ─── TRUST  ───────────────────────────────────────────────── */}
      <section style={{padding:'48px 28px', borderTop:'1px solid var(--border)'}}>
        <div style={{maxWidth:1440, margin:'0 auto', display:'flex', alignItems:'center', gap:48, flexWrap:'wrap', justifyContent:'space-between'}}>
          <div style={{fontSize:13, color:'var(--text-muted)', fontWeight:500}}>As seen in</div>
          {["MINT", "ET PRIME", "YourStory", "INC42", "Moneycontrol", "TechCrunch"].map(p=>(
            <div key={p} className="font-display" style={{fontSize:18, fontWeight:700, letterSpacing:'.02em', color:'var(--text-faint)'}}>{p}</div>
          ))}
        </div>
      </section>

      {/* ─── CTA  ───────────────────────────────────────────────── */}
      <section style={{padding:'120px 28px'}}>
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

      <Footer nav={nav}/>
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

// ─── Helper: footer ─────────────────────────────────────────────────────
function Footer({nav}) {
  return (
    <footer style={{background:'var(--text)', color:'var(--bg)', padding:'72px 28px 32px', marginTop:0}}>
      <div style={{maxWidth:1440, margin:'0 auto'}}>
        <div style={{display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr', gap:48, paddingBottom:48, borderBottom:'1px solid rgba(255,255,255,.12)'}}>
          <div>
            <div className="font-display" style={{fontSize:36, fontWeight:800, letterSpacing:'-0.04em'}}>urbify</div>
            <p style={{maxWidth:300, fontSize:14, opacity:.6, marginTop:16, lineHeight:1.6}}>
              Real estate, fair & simple. Owners list free, tenants pay one fee, brokers keep it all.
            </p>
          </div>
          <FooterCol title="Rent" items={["Bangalore","Mumbai","Pune","Delhi NCR","Hyderabad","All cities →"]}/>
          <FooterCol title="Buy" items={["Apartments","Villas","Plots","Commercial","Premium homes"]}/>
          <FooterCol title="Company" items={[{l:"How it works", k:'how'}, "Pricing", "Blog", "About", "Press"]} nav={nav}/>
          <FooterCol title="Support" items={["FAQ", "Contact", "Refund policy", "RERA compliance", "Grievance officer"]}/>
        </div>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:32, fontSize:12, opacity:.5}}>
          <div>© 2026 Urbify Technologies Pvt. Ltd. · CIN U72200KA2024PTC123456</div>
          <div style={{display:'flex', gap:16}}><span>Privacy</span><span>Terms</span><span>Cookies</span></div>
        </div>
      </div>
    </footer>
  );
}
function FooterCol({title, items, nav}) {
  return (
    <div>
      <div style={{fontSize:11, fontWeight:600, letterSpacing:'.1em', textTransform:'uppercase', opacity:.55, marginBottom:18}}>{title}</div>
      <ul style={{listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:10}}>
        {items.map((it, i) => {
          const label = typeof it === 'string' ? it : it.l;
          const k = typeof it === 'string' ? null : it.k;
          return (
            <li key={i} style={{fontSize:14, opacity:.8, cursor: k?'pointer':'default'}}
                onClick={()=> k && nav(k)}>
              {label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

Object.assign(window, { HomePage });
