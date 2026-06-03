// auth-pricing.jsx — Auth + Pricing pages

// ─── AUTH ─────────────────────────────────────────────────────────────────
function AuthPage({nav}) {
  const [tab, setTab] = useState("tenant");
  const [mode, setMode] = useState("login"); // login | signup
  const [step, setStep] = useState("phone"); // phone | otp
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["","","","","",""]);
  const otpRefs = useRef([]);

  const tabs = [
    { id:"owner", l:"I'm an owner", sub:"List your property for free" },
    { id:"tenant", l:"I'm a tenant / buyer", sub:"Find a home, unlock contact" },
    { id:"broker", l:"I'm a broker", sub:"Manage your listings & earn 100%" },
  ];
  const cur = tabs.find(t=>t.id === tab);

  const updateOtp = (i, v) => {
    const next = [...otp]; next[i] = v.slice(-1); setOtp(next);
    if (v && i < 5) otpRefs.current[i+1]?.focus();
  };

  return (
    <div style={{minHeight:'calc(100vh - 64px)', display:'grid', gridTemplateColumns:'1.1fr 1fr', background:'var(--surface-sunken)'}}>
      {/* LEFT — brand panel */}
      <div style={{
        background:'var(--text)', color:'var(--bg)',
        padding:'80px 64px', position:'relative', overflow:'hidden',
        display:'flex', flexDirection:'column', justifyContent:'space-between',
      }}>
        <div>
          <div className="font-display" style={{fontSize:32, fontWeight:800, letterSpacing:'-0.04em'}}>urbify</div>
          <h1 className="font-display" style={{fontSize:'clamp(40px, 4.5vw, 64px)', fontWeight:800, letterSpacing:'-0.045em', lineHeight:.98, marginTop:64}}>
            One account.<br/>Every door.
          </h1>
          <p style={{fontSize:17, opacity:.7, marginTop:20, maxWidth:420, lineHeight:1.55}}>
            List, search, or manage portfolios — all from one login. No spam, no resold data, ever.
          </p>
        </div>

        <div style={{display:'flex', flexDirection:'column', gap:12, marginTop:48}}>
          {[
            "256-bit encrypted at rest",
            "Mobile OTP — no passwords to leak",
            "RERA-verified brokers only",
            "Your number is never shared without consent",
          ].map((s, i)=>(
            <div key={i} style={{display:'flex', alignItems:'center', gap:14, fontSize:14, opacity:.85}}>
              <span style={{width:24, height:24, borderRadius:'50%', background:'rgba(255,255,255,.1)', display:'grid', placeItems:'center', fontSize:11}}>✓</span>
              {s}
            </div>
          ))}
        </div>

        {/* decorative blobs */}
        <div style={{position:'absolute', right:-100, top:-80, width:340, height:340, borderRadius:'50%', background:'var(--brand-500)', filter:'blur(80px)', opacity:.25}}/>
        <div style={{position:'absolute', right:80, bottom:-80, width:240, height:240, borderRadius:'50%', background:'var(--accent-500)', filter:'blur(60px)', opacity:.2}}/>
      </div>

      {/* RIGHT — form */}
      <div style={{padding:'64px 56px', display:'flex', flexDirection:'column', justifyContent:'center', maxWidth:560}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline'}}>
          <h2 className="font-display" style={{fontSize:30, fontWeight:800, letterSpacing:'-0.03em', margin:0}}>
            {mode === "login" ? "Welcome back" : "Get started"}
          </h2>
          <button onClick={()=>setMode(mode==='login'?'signup':'login')} className="btn btn-ghost btn-sm">
            {mode === "login" ? "Create account" : "Sign in instead"}
          </button>
        </div>
        <p className="muted" style={{fontSize:15, marginTop:8}}>{cur.sub}</p>

        {/* tab cards */}
        <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:8, marginTop:28}}>
          {tabs.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{
              padding:'14px 12px', borderRadius:'var(--r-md)', cursor:'pointer',
              border: '1.5px solid', borderColor: tab===t.id ? 'var(--text)' : 'var(--border)',
              background: tab===t.id ? 'var(--surface)' : 'transparent',
              textAlign:'left', font:'inherit', color:'var(--text)',
            }}>
              <div style={{fontSize:13, fontWeight:600}}>{t.l}</div>
            </button>
          ))}
        </div>

        {/* form */}
        <div style={{marginTop:28}}>
          {step === "phone" && (
            <div className="pop-in">
              <label style={{fontSize:12, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.08em'}}>Mobile number</label>
              <div style={{display:'flex', gap:8, marginTop:8}}>
                <div className="input" style={{display:'flex', alignItems:'center', gap:8, width:110, justifyContent:'center'}}>
                  🇮🇳 <span style={{fontWeight:600}}>+91</span>
                </div>
                <input className="input" type="tel" placeholder="98XXX XXXXX" maxLength="10"
                  value={phone} onChange={e=>setPhone(e.target.value.replace(/\D/g,''))}
                  style={{flex:1, fontSize:16, fontVariantNumeric:'tabular-nums'}}/>
              </div>

              {tab === "broker" && mode === "signup" && (
                <div style={{marginTop:18}}>
                  <label style={{fontSize:12, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.08em'}}>RERA Broker ID <span style={{textTransform:'none', fontWeight:500, color:'var(--text-faint)'}}>(get verified badge)</span></label>
                  <input className="input" placeholder="e.g. KA/RERA/AGT/1234" style={{display:'block', width:'100%', marginTop:8}}/>
                </div>
              )}

              <button className="btn btn-brand btn-lg btn-block" style={{marginTop:20}} disabled={phone.length !== 10} onClick={()=>setStep('otp')}>
                {phone.length === 10 ? "Send OTP" : "Enter 10 digits"} {phone.length===10 && <Icon.arrow/>}
              </button>

              {tab === "tenant" && (
                <>
                  <div style={{display:'flex', alignItems:'center', gap:12, margin:'24px 0', color:'var(--text-faint)', fontSize:12}}>
                    <div style={{flex:1, height:1, background:'var(--border)'}}/> or continue with <div style={{flex:1, height:1, background:'var(--border)'}}/>
                  </div>
                  <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8}}>
                    <button className="btn btn-outline">🟦 Google</button>
                    <button className="btn btn-outline">🍎 Apple</button>
                  </div>
                </>
              )}
            </div>
          )}

          {step === "otp" && (
            <div className="pop-in">
              <button className="btn btn-ghost btn-sm" onClick={()=>setStep('phone')} style={{marginBottom:14}}><Icon.back/> Change number</button>
              <div style={{fontSize:13, color:'var(--text-muted)'}}>OTP sent to <strong style={{color:'var(--text)'}}>+91 {phone}</strong></div>

              <div style={{display:'flex', gap:10, marginTop:18}}>
                {otp.map((d, i)=>(
                  <input key={i}
                    ref={el => otpRefs.current[i] = el}
                    className="input"
                    value={d} onChange={e=>updateOtp(i, e.target.value)}
                    onKeyDown={(e)=>{
                      if (e.key === 'Backspace' && !d && i>0) otpRefs.current[i-1]?.focus();
                    }}
                    maxLength="1" inputMode="numeric"
                    style={{width:54, height:62, textAlign:'center', fontSize:24, fontWeight:700, fontFamily:'var(--f-mono)'}}/>
                ))}
              </div>

              <div style={{fontSize:12, color:'var(--text-muted)', marginTop:14, display:'flex', justifyContent:'space-between'}}>
                <span>Didn't get it? <a style={{color:'var(--brand-500)', fontWeight:600, cursor:'pointer'}}>Resend in 24s</a></span>
                <span style={{fontVariantNumeric:'tabular-nums'}}>00:24</span>
              </div>

              <button className="btn btn-brand btn-lg btn-block" style={{marginTop:24}} onClick={()=>nav(tab === 'owner' ? 'ownerDash' : tab === 'broker' ? 'brokerDash' : 'clientDash')} disabled={otp.filter(Boolean).length !== 6}>
                Verify & continue <Icon.arrow/>
              </button>
            </div>
          )}
        </div>

        <div style={{marginTop:32, fontSize:11, color:'var(--text-faint)', lineHeight:1.5}}>
          By continuing, you agree to Urbify's <a style={{textDecoration:'underline'}}>Terms</a> and <a style={{textDecoration:'underline'}}>Privacy Policy</a>. We'll text you to verify — your number is never shared.
        </div>
      </div>
    </div>
  );
}

// ─── PRICING ──────────────────────────────────────────────────────────────
function PricingPage({nav}) {
  const [rent, setRent] = useState(40000);
  const dailyRent = Math.round(rent / 30);
  const base = Math.round(dailyRent * 7.5);
  const gst = Math.round(base * 0.18);
  const total = base + gst;
  const fmt = (n) => n.toLocaleString("en-IN");

  return (
    <div>
      <section style={{padding:'72px 28px 24px', maxWidth:1280, margin:'0 auto'}}>
        <div className="chip" style={{background:'transparent', border:'1px solid var(--border-strong)', marginBottom:24}}>Pricing</div>
        <h1 className="font-display" style={{fontSize:'clamp(48px, 7vw, 96px)', fontWeight:800, letterSpacing:'-0.045em', lineHeight:.96, margin:0}}>
          Honest pricing.<br/>No surprises.
        </h1>
        <p className="muted" style={{fontSize:20, maxWidth:680, marginTop:24, lineHeight:1.4}}>
          Owners and brokers pay <strong style={{color:'var(--text)'}}>nothing</strong>. Tenants pay one flat fee of <strong style={{color:'var(--text)'}}>7.5 days' rent</strong>. That's it.
        </p>
      </section>

      {/* Calculator */}
      <section style={{padding:'40px 28px 72px', maxWidth:1280, margin:'0 auto'}}>
        <div className="card" style={{padding:0, overflow:'hidden', boxShadow:'var(--sh-2)'}}>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1.2fr'}}>
            {/* slider side */}
            <div style={{padding:'48px 48px', background:'var(--text)', color:'var(--bg)'}}>
              <div style={{fontSize:12, opacity:.6, textTransform:'uppercase', letterSpacing:'.08em', fontWeight:600}}>Try the calculator</div>
              <div className="font-display" style={{fontSize:24, fontWeight:700, letterSpacing:'-0.02em', marginTop:14}}>Monthly rent</div>
              <div className="font-display" style={{fontSize:64, fontWeight:800, letterSpacing:'-0.045em', marginTop:8, lineHeight:1}}>₹{fmt(rent)}</div>

              <input type="range" min="5000" max="200000" step="500" value={rent}
                onChange={e=>setRent(+e.target.value)}
                style={{width:'100%', marginTop:36, accentColor:'var(--accent-500)'}}/>

              <div style={{display:'flex', justifyContent:'space-between', fontSize:11, opacity:.6, marginTop:6}}>
                <span>₹5k</span><span>₹2L</span>
              </div>

              <div style={{display:'flex', gap:6, marginTop:24, flexWrap:'wrap'}}>
                {[15000, 25000, 40000, 65000, 100000].map(r=>(
                  <button key={r} onClick={()=>setRent(r)} className="chip"
                    style={{cursor:'pointer', background: rent===r ? 'var(--bg)' : 'rgba(255,255,255,.1)', color: rent===r ? 'var(--text)' : 'var(--bg)', border:0, height:30, fontSize:12}}>
                    ₹{fmt(r/1000)}k
                  </button>
                ))}
              </div>
            </div>

            {/* breakdown side */}
            <div style={{padding:'48px 48px'}}>
              <div style={{fontSize:12, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.08em', fontWeight:600}}>You pay</div>
              <div style={{display:'flex', alignItems:'baseline', gap:8, marginTop:12}}>
                <div className="font-display" style={{fontSize:80, fontWeight:800, letterSpacing:'-0.045em', color:'var(--brand-500)', lineHeight:1}}>
                  ₹{fmt(total)}
                </div>
              </div>
              <div style={{fontSize:13, color:'var(--text-muted)', marginTop:4}}>one-time · all-in · incl. GST</div>

              <div style={{marginTop:36, padding:'18px 22px', background:'var(--surface-sunken)', borderRadius:'var(--r-md)'}}>
                <Row label={`Daily rent (₹${fmt(rent)} ÷ 30)`} value={`₹${fmt(dailyRent)}`}/>
                <Row label="× 7.5 days" value={`₹${fmt(base)}`}/>
                <Row label="+ GST 18%" value={`₹${fmt(gst)}`}/>
                <div style={{height:1, background:'var(--border)', margin:'10px 0'}}/>
                <Row label="Total" value={`₹${fmt(total)}`} big/>
              </div>

              <div style={{marginTop:24, padding:'14px 18px', background:'#FEF3C7', borderRadius:'var(--r-md)', display:'flex', gap:12, alignItems:'center'}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:11, color:'#78350F', fontWeight:600, textTransform:'uppercase', letterSpacing:'.08em'}}>Traditional broker</div>
                  <div className="font-display" style={{fontSize:32, fontWeight:800, letterSpacing:'-0.03em', color:'#78350F', textDecoration:'line-through'}}>₹{fmt(Math.round(rent * 1.18))}</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:11, color:'#78350F', fontWeight:600}}>You save</div>
                  <div className="font-display" style={{fontSize:24, fontWeight:800, letterSpacing:'-0.03em', color:'#92400E'}}>₹{fmt(Math.round(rent * 1.18) - total)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section style={{padding:'72px 28px', background:'var(--surface-sunken)'}}>
        <div style={{maxWidth:1280, margin:'0 auto'}}>
          <h2 className="font-display" style={{fontSize:'clamp(32px, 4vw, 52px)', fontWeight:800, letterSpacing:'-0.035em', textAlign:'center', margin:'0 0 48px'}}>
            How we stack up.
          </h2>

          <div style={{display:'grid', gridTemplateColumns:'1.4fr 1fr 1fr 1fr', borderRadius:'var(--r-lg)', overflow:'hidden', background:'var(--surface)', boxShadow:'var(--sh-2)'}}>
            <CompHeader/>
            <CompCol name="urbify" winner subtitle="Built differently"/>
            <CompCol name="NoBroker" subtitle="Subscription model"/>
            <CompCol name="99acres / MagicBricks" subtitle="Classifieds + brokers"/>

            <CompRow row="Owner listing cost" cells={["FREE", "₹2,499 – ₹9,999", "FREE listing + paid boost"]} good={[true, false, false]}/>
            <CompRow row="Tenant fee" cells={["7.5 days' rent", "₹1,000 – ₹5,000 / month sub", "Broker commission (1 mo)"]} good={[true, false, false]}/>
            <CompRow row="Broker model" cells={["Keep 100% commission", "Not supported", "Pay-per-lead"]} good={[true, false, false]}/>
            <CompRow row="Address privacy" cells={["Hidden until paid", "Partial", "Always visible"]} good={[true, false, false]}/>
            <CompRow row="Refund policy" cells={["24h auto-refund", "Limited", "None"]} good={[true, false, false]}/>
            <CompRow row="RERA verification" cells={["Mandatory for brokers", "Optional", "Optional"]} good={[true, false, false]}/>
            <CompRow row="Land deals" cells={["Yes", "No", "Yes"]} good={[true, false, true]} last/>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{padding:'120px 28px'}}>
        <div style={{maxWidth:780, margin:'0 auto', textAlign:'center'}}>
          <h2 className="font-display" style={{fontSize:'clamp(40px, 6vw, 72px)', lineHeight:1, letterSpacing:'-0.045em', fontWeight:800, margin:0}}>
            Pricing this honest<br/>shouldn't feel rare.
          </h2>
          <div style={{display:'flex', gap:12, justifyContent:'center', marginTop:32}}>
            <button className="btn btn-brand btn-lg" onClick={()=>nav('search')}>Find a home <Icon.arrow/></button>
            <button className="btn btn-outline btn-lg" onClick={()=>nav('auth')}>List for ₹0</button>
          </div>
        </div>
      </section>

      <Footer nav={nav}/>
    </div>
  );
}

function CompHeader() {
  return (
    <div style={{padding:'24px', borderBottom:'1px solid var(--border)'}}>
      <div style={{fontSize:11, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.08em'}}>Compare</div>
    </div>
  );
}

function CompCol({name, subtitle, winner}) {
  return (
    <div style={{padding:'24px', borderBottom:'1px solid var(--border)', background: winner ? 'var(--text)' : 'transparent', color: winner ? 'var(--bg)' : 'inherit', position:'relative'}}>
      {winner && <span className="chip chip-accent" style={{position:'absolute', top:14, right:14, height:22, fontSize:10}}>BEST</span>}
      <div className="font-display" style={{fontSize:22, fontWeight:800, letterSpacing:'-0.02em'}}>{name}</div>
      <div style={{fontSize:12, opacity:.7, marginTop:4}}>{subtitle}</div>
    </div>
  );
}

function CompRow({row, cells, good, last}) {
  return (
    <>
      <div style={{padding:'20px 24px', fontSize:14, fontWeight:600, borderBottom: last ? 0 : '1px solid var(--border)'}}>{row}</div>
      {cells.map((c, i)=>(
        <div key={i} style={{padding:'20px 24px', fontSize:14, borderBottom: last ? 0 : '1px solid var(--border)', background: i===0 ? 'color-mix(in oklab, var(--brand-500) 6%, transparent)' : 'transparent', display:'flex', alignItems:'center', gap:8}}>
          {good[i] ? <span style={{color:'var(--success)'}}>✓</span> : <span style={{color:'var(--text-faint)'}}>·</span>}
          <span>{c}</span>
        </div>
      ))}
    </>
  );
}

Object.assign(window, { AuthPage, PricingPage });
