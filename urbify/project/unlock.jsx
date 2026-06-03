// unlock.jsx — Urbify payment / unlock flow + how-it-works

function UnlockPage({nav, listing}) {
  const [step, setStep] = useState(1);
  const [method, setMethod] = useState("upi");
  const [processing, setProcessing] = useState(false);
  const fmt = (n) => n.toLocaleString("en-IN");

  if (!listing) listing = LISTINGS[0];

  const pay = () => {
    setProcessing(true);
    setTimeout(()=>{ setProcessing(false); setStep(3); }, 1800);
  };

  return (
    <div style={{minHeight:'100vh', background:'var(--surface-sunken)', paddingBottom:60}}>
      <div style={{maxWidth:1100, margin:'0 auto', padding:'24px 28px'}}>

        <div style={{display:'flex', alignItems:'center', gap:14, marginBottom:24}}>
          <button className="btn btn-ghost btn-sm" onClick={()=>nav('detail', listing.id)}><Icon.back/> Back</button>
          <div style={{flex:1}}/>
          <StepBar step={step}/>
        </div>

        <div style={{display:'grid', gridTemplateColumns: step === 3 ? '1fr' : '1fr 380px', gap:24, alignItems:'start'}}>
          {/* MAIN */}
          <div className="card" style={{padding: step === 3 ? 0 : 32, overflow: step === 3 ? 'hidden' : 'visible'}}>

            {step === 1 && (
              <div className="pop-in">
                <div style={{fontSize:12, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.08em', fontWeight:600}}>Step 1 / 3</div>
                <h1 className="font-display" style={{fontSize:36, fontWeight:800, letterSpacing:'-0.03em', margin:'8px 0 16px'}}>Review your fee</h1>
                <p className="muted" style={{fontSize:16, lineHeight:1.55, maxWidth:540, marginTop:0}}>
                  One flat payment unlocks the owner's contact + full address. No hidden charges, no monthly surprises.
                </p>

                <div style={{marginTop:32}}>
                  <FormulaCalc listing={listing}/>
                </div>

                <div style={{marginTop:32, padding:'14px 18px', borderRadius:'var(--r-md)', background:'var(--surface-sunken)', display:'flex', gap:14, alignItems:'flex-start'}}>
                  <span style={{fontSize:18, color:'var(--success)', flexShrink:0, marginTop:2}}><Icon.shield/></span>
                  <div style={{fontSize:13, color:'var(--text-muted)', lineHeight:1.55}}>
                    <strong style={{color:'var(--text)'}}>24-hour refund.</strong> If the address turns out wrong, or the owner is unreachable, you'll get a full refund — no questions asked.
                  </div>
                </div>

                <div style={{display:'flex', gap:10, marginTop:32}}>
                  <button className="btn btn-outline btn-lg" onClick={()=>nav('detail', listing.id)}>Cancel</button>
                  <button className="btn btn-brand btn-lg" onClick={()=>setStep(2)} style={{flex:1}}>
                    Proceed to pay ₹{fmt(listing.feeGST)} <Icon.arrow/>
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="pop-in">
                <div style={{fontSize:12, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.08em', fontWeight:600}}>Step 2 / 3</div>
                <h1 className="font-display" style={{fontSize:36, fontWeight:800, letterSpacing:'-0.03em', margin:'8px 0 16px'}}>Pay securely</h1>
                <div className="muted" style={{fontSize:14, display:'flex', alignItems:'center', gap:8}}>
                  <Icon.shield/> 256-bit encrypted · Powered by Razorpay · PCI-DSS compliant
                </div>

                <div style={{display:'flex', flexDirection:'column', gap:10, marginTop:28}}>
                  <PaymentOption id="upi" active={method==='upi'} onClick={()=>setMethod('upi')}
                    icon={<Icon.upi/>} label="UPI" sub="Pay with any UPI app · No charges" badge="Fastest"/>
                  <PaymentOption id="card" active={method==='card'} onClick={()=>setMethod('card')}
                    icon={<Icon.card/>} label="Debit / Credit card" sub="Visa, Mastercard, RuPay, Amex"/>
                  <PaymentOption id="bank" active={method==='bank'} onClick={()=>setMethod('bank')}
                    icon={<Icon.bank/>} label="Net banking" sub="50+ banks supported"/>
                  <PaymentOption id="wallet" active={method==='wallet'} onClick={()=>setMethod('wallet')}
                    icon={<Icon.wallet/>} label="Wallets" sub="Paytm, PhonePe, Amazon Pay"/>
                </div>

                {/* method-specific input */}
                <div style={{marginTop:24, padding:24, background:'var(--surface-sunken)', borderRadius:'var(--r-md)'}}>
                  {method === 'upi' && (
                    <div>
                      <label style={{fontSize:12, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.08em', fontWeight:600}}>UPI ID</label>
                      <input className="input" placeholder="yourname@okhdfc" defaultValue="rahul@oksbi" style={{display:'block', width:'100%', marginTop:8, background:'var(--surface)'}}/>
                      <div style={{display:'flex', alignItems:'center', gap:8, marginTop:14, fontSize:13, color:'var(--text-muted)'}}>
                        or scan QR with any UPI app
                      </div>
                    </div>
                  )}
                  {method === 'card' && (
                    <div style={{display:'grid', gap:10}}>
                      <input className="input" placeholder="Card number" defaultValue="•••• •••• •••• 4242" style={{background:'var(--surface)'}}/>
                      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
                        <input className="input" placeholder="MM / YY" defaultValue="12 / 27" style={{background:'var(--surface)'}}/>
                        <input className="input" placeholder="CVV" type="password" defaultValue="123" style={{background:'var(--surface)'}}/>
                      </div>
                    </div>
                  )}
                  {method === 'bank' && (
                    <select className="input select" style={{width:'100%', background:'var(--surface)'}}>
                      <option>HDFC Bank</option><option>ICICI Bank</option><option>SBI</option><option>Axis Bank</option><option>Kotak Mahindra</option>
                    </select>
                  )}
                  {method === 'wallet' && (
                    <div style={{display:'flex', gap:10}}>
                      {["Paytm","PhonePe","Amazon Pay"].map(w=><button key={w} className="btn btn-outline" style={{flex:1, background:'var(--surface)'}}>{w}</button>)}
                    </div>
                  )}
                </div>

                <div style={{display:'flex', gap:10, marginTop:24}}>
                  <button className="btn btn-outline btn-lg" onClick={()=>setStep(1)}>Back</button>
                  <button className="btn btn-brand btn-lg" onClick={pay} disabled={processing} style={{flex:1}}>
                    {processing ? "Processing…" : <>Pay ₹{fmt(listing.feeGST)} <Icon.unlock/></>}
                  </button>
                </div>
              </div>
            )}

            {step === 3 && <SuccessScreen listing={listing} nav={nav}/>}
          </div>

          {/* SIDEBAR — order summary */}
          {step !== 3 && (
            <aside style={{position:'sticky', top:88}}>
              <div className="card" style={{padding:0, overflow:'hidden'}}>
                <Img src={listing.photo} style={{height:160}}/>
                <div style={{padding:18}}>
                  <div className="font-display" style={{fontSize:16, fontWeight:700, letterSpacing:'-0.02em'}}>{listing.title}</div>
                  <div style={{fontSize:13, color:'var(--text-muted)', marginTop:4, display:'flex', alignItems:'center', gap:4}}>
                    <Icon.pin/> {listing.locality}, {listing.city}
                  </div>
                  <div style={{display:'flex', gap:8, marginTop:10, fontSize:12, color:'var(--text-muted)'}}>
                    <span>{listing.bhk} BHK</span><span>·</span>
                    <span>{listing.area} sq ft</span><span>·</span>
                    <span>{listing.furnishing}</span>
                  </div>
                </div>
                <div style={{padding:'18px', background:'var(--surface-sunken)', borderTop:'1px solid var(--border)'}}>
                  <Row label="Monthly rent" value={`₹${listing.rentK}k`}/>
                  <Row label="Daily rent" value={`₹${fmt(Math.round(listing.rentK*1000/30))}`}/>
                  <Row label="× 7.5 days" value={`₹${fmt(listing.fee)}`}/>
                  <Row label="GST 18%" value={`₹${fmt(listing.feeGST - listing.fee)}`}/>
                  <div style={{height:1, background:'var(--border)', margin:'10px 0'}}/>
                  <Row label="Total" value={`₹${fmt(listing.feeGST)}`} big/>
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}

function StepBar({step}) {
  const steps = ["Review", "Pay", "Unlocked"];
  return (
    <div style={{display:'flex', alignItems:'center', gap:10}}>
      {steps.map((s, i)=>{
        const n = i+1, done = step > n, active = step === n;
        return (
          <React.Fragment key={s}>
            <div style={{display:'flex', alignItems:'center', gap:8}}>
              <div style={{
                width:24, height:24, borderRadius:'50%',
                background: done ? 'var(--success)' : active ? 'var(--text)' : 'transparent',
                color: (done || active) ? '#fff' : 'var(--text-muted)',
                border: (done || active) ? 0 : '1.5px solid var(--border-strong)',
                display:'grid', placeItems:'center', fontSize:11, fontWeight:700,
              }}>{done ? "✓" : n}</div>
              <div style={{fontSize:13, color: active ? 'var(--text)' : 'var(--text-muted)', fontWeight: active ? 600 : 500}}>{s}</div>
            </div>
            {i < steps.length-1 && <div style={{width:24, height:1, background:'var(--border-strong)'}}/>}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function FormulaCalc({listing}) {
  const fmt = (n)=>n.toLocaleString("en-IN");
  return (
    <div style={{
      background:'var(--text)', color:'var(--bg)',
      padding:28, borderRadius:'var(--r-lg)',
      position:'relative', overflow:'hidden',
    }}>
      <div style={{display:'flex', flexDirection:'column', gap:14}}>
        <Calc label="Monthly rent" value={`₹${fmt(listing.rentK*1000)}`}/>
        <Calc label="÷ 30 days" value={`₹${fmt(Math.round(listing.rentK*1000/30))}`}/>
        <Calc label="× 7.5 days" value={`₹${fmt(listing.fee)}`}/>
        <Calc label="+ 18% GST" value={`+ ₹${fmt(listing.feeGST - listing.fee)}`}/>
        <div style={{height:1, background:'rgba(255,255,255,.15)', margin:'6px 0'}}/>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline'}}>
          <span style={{fontSize:15}}>You pay</span>
          <span className="font-display" style={{fontSize:40, fontWeight:800, letterSpacing:'-0.04em'}}>₹{fmt(listing.feeGST)}</span>
        </div>
      </div>
    </div>
  );
}

function Calc({label, value}) {
  return (
    <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', opacity:.85}}>
      <span style={{fontSize:14}}>{label}</span>
      <span className="font-mono" style={{fontSize:15}}>{value}</span>
    </div>
  );
}

function PaymentOption({id, active, onClick, icon, label, sub, badge}) {
  return (
    <button onClick={onClick} style={{
      display:'flex', alignItems:'center', gap:14,
      padding:'16px 18px', borderRadius:'var(--r-md)',
      background: active ? 'var(--surface)' : 'transparent',
      border: '1.5px solid', borderColor: active ? 'var(--text)' : 'var(--border)',
      cursor:'pointer', textAlign:'left', font: 'inherit',
      transition:'all .15s', color:'var(--text)',
    }}>
      <div style={{
        width:40, height:40, borderRadius:'var(--r-sm)',
        background:'var(--surface-sunken)', color:'var(--text)',
        display:'grid', placeItems:'center', fontSize:20, flexShrink:0,
      }}>{icon}</div>
      <div style={{flex:1}}>
        <div style={{fontSize:14, fontWeight:600, display:'flex', alignItems:'center', gap:8}}>
          {label}
          {badge && <span className="chip chip-accent" style={{height:20, fontSize:10}}>{badge}</span>}
        </div>
        <div style={{fontSize:12, color:'var(--text-muted)', marginTop:2}}>{sub}</div>
      </div>
      <div style={{
        width:18, height:18, borderRadius:'50%',
        border:'1.5px solid', borderColor: active ? 'var(--text)' : 'var(--border-strong)',
        position:'relative', flexShrink:0,
      }}>
        {active && <div style={{position:'absolute', inset:3, borderRadius:'50%', background:'var(--text)'}}/>}
      </div>
    </button>
  );
}

function Row({label, value, big}) {
  return (
    <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', padding:'4px 0'}}>
      <span style={{fontSize: big ? 14 : 13, color: big ? 'var(--text)' : 'var(--text-muted)', fontWeight: big ? 600 : 400}}>{label}</span>
      <span className={big ? "font-display" : "font-mono"} style={{fontSize: big ? 22 : 13, fontWeight: big ? 800 : 500, letterSpacing: big ? '-0.02em' : 0}}>{value}</span>
    </div>
  );
}

// ─── Success screen — the BIG MOMENT ──────────────────────────────────────
function SuccessScreen({listing, nav}) {
  const [revealed, setRevealed] = useState(false);
  useEffect(()=>{ const t = setTimeout(()=>setRevealed(true), 500); return ()=>clearTimeout(t); }, []);

  const fmt = (n)=>n.toLocaleString("en-IN");

  return (
    <div className="pop-in">
      {/* big success header */}
      <div style={{
        background:'var(--brand-500)', color:'#fff',
        padding:'56px 40px', textAlign:'center',
        position:'relative', overflow:'hidden',
      }}>
        <div style={{
          width:80, height:80, margin:'0 auto 20px',
          borderRadius:'50%',
          background:'rgba(255,255,255,.18)',
          display:'grid', placeItems:'center',
          fontSize:38,
          animation: 'pop-in .6s cubic-bezier(.2,.7,.2,1) both',
        }}>
          <Icon.unlock/>
        </div>
        <div className="font-display" style={{fontSize:'clamp(36px, 5vw, 56px)', fontWeight:800, letterSpacing:'-0.035em', lineHeight:1.05}}>
          Unlocked.<br/>The home is yours to call.
        </div>
        <p style={{fontSize:16, opacity:.85, marginTop:16, maxWidth:560, marginInline:'auto'}}>
          Payment of <strong style={{opacity:1}}>₹{fmt(listing.feeGST)}</strong> received. Invoice on its way to your inbox.
        </p>
      </div>

      {/* Revealed info */}
      <div style={{padding:40}}>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:18, marginBottom:18}}>
          <div className="card" style={{padding:24, background:'var(--surface-sunken)', borderRadius:'var(--r-lg)'}}>
            <div style={{fontSize:11, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.1em', fontWeight:700, display:'flex', alignItems:'center', gap:8}}>
              <Icon.pin/> Full address
            </div>
            <div className="font-display" style={{
              fontSize:24, fontWeight:700, letterSpacing:'-0.02em',
              marginTop:14, lineHeight:1.3,
              filter: revealed ? 'blur(0)' : 'blur(10px)',
              transition: 'filter .8s ease',
            }}>
              #{listing.id.slice(-3)}, 4th Block,<br/>
              80 Feet Road, {listing.locality},<br/>
              {listing.city} 560034
            </div>
            <button className="btn btn-outline btn-sm" style={{marginTop:14}}>Copy address</button>
          </div>

          <div className="card" style={{padding:24, background:'var(--surface-sunken)', borderRadius:'var(--r-lg)'}}>
            <div style={{fontSize:11, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.1em', fontWeight:700, display:'flex', alignItems:'center', gap:8}}>
              <Icon.phone/> Owner contact
            </div>
            <div style={{display:'flex', alignItems:'center', gap:14, marginTop:14}}>
              <div style={{
                width:54, height:54, borderRadius:'50%',
                background:'var(--brand-500)', color:'#fff',
                display:'grid', placeItems:'center',
                fontWeight:800, fontSize:18,
              }}>RP</div>
              <div>
                <div style={{fontWeight:600, fontSize:15}}>Rohan Pillai</div>
                <div style={{fontSize:12, color:'var(--text-muted)'}}>Direct Owner · Verified</div>
              </div>
            </div>
            <div className="font-mono" style={{
              fontSize:22, fontWeight:700,
              marginTop:14,
              filter: revealed ? 'blur(0)' : 'blur(10px)',
              transition: 'filter .8s ease .15s',
            }}>+91 98450 ••• ••• <span style={{filter: revealed ? 'none' : 'none'}}>23</span></div>
            <div style={{display:'flex', gap:8, marginTop:14}}>
              <button className="btn btn-brand btn-sm" style={{flex:1}}><Icon.phone/> Tap to call</button>
              <button className="btn btn-outline btn-sm" style={{flex:1}}>WhatsApp</button>
            </div>
          </div>
        </div>

        <div className="card" style={{padding:20, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12}}>
          <div style={{display:'flex', alignItems:'center', gap:12}}>
            <div style={{width:40, height:40, borderRadius:'var(--r-sm)', background:'var(--surface-sunken)', display:'grid', placeItems:'center', fontSize:18}}><Icon.download/></div>
            <div>
              <div style={{fontSize:14, fontWeight:600}}>GST Invoice — URB-INV-{Math.floor(Math.random()*99999)}</div>
              <div style={{fontSize:12, color:'var(--text-muted)'}}>PDF · 124 KB · also sent to your email</div>
            </div>
          </div>
          <button className="btn btn-outline btn-sm">Download</button>
        </div>

        <div style={{marginTop:32, padding:18, background:'#FEF3C7', borderRadius:'var(--r-md)', display:'flex', gap:14, alignItems:'flex-start'}}>
          <span style={{fontSize:18, color:'#92400E', marginTop:1}}><Icon.shield/></span>
          <div style={{fontSize:13, color:'#78350F', lineHeight:1.55}}>
            <strong>24-hour grace.</strong> If the address turns out invalid or the owner is unreachable, hit "Report issue" within 24 hours for an instant refund.
          </div>
        </div>

        <div style={{display:'flex', gap:10, marginTop:32}}>
          <button className="btn btn-outline btn-lg" onClick={()=>nav('search')}>Browse more homes</button>
          <button className="btn btn-primary btn-lg" onClick={()=>nav('detail', listing.id)} style={{flex:1}}>Back to listing <Icon.arrow/></button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { UnlockPage });
