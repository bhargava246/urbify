// owner-pages.jsx — Owner Dashboard + Create Listing wizard + Listings + Inquiries

const OWNER_USER = { initials:"RP", name:"Rohan Pillai", role:"Direct Owner", color:'var(--brand-500)' };

const OWNER_NAV = (current, onNav, navMain) => [
  { id:'ownerDash',     label:'Dashboard',  icon:'◧' },
  { id:'ownerList',     label:'My listings', icon:'⊞', badge:'4' },
  { id:'ownerInquiries',label:'Inquiries',   icon:'◐', badge:'7', badgeTone:'danger' },
  { id:'ownerNew',      label:'Add listing', icon:'＋' },
  { divider:'account' },
  { id:'settings', label:'Settings', icon:'⚙' },
  { id:'home', label:'Back to site', icon:'↗' },
];

// ─── Owner Dashboard ──────────────────────────────────────────────────────
function OwnerDashPage({nav}) {
  const myListings = LISTINGS.slice(0, 4).map((l, i) => ({
    ...l,
    status: ["live","live","pending","rented"][i],
    unlocks: [12, 6, 0, 23][i],
    daysLeft: [14, 28, "—", "—"][i],
  }));
  const items = OWNER_NAV(null, null);
  return (
    <PortalShell user={OWNER_USER} navItems={items} current="ownerDash" onNav={(id)=>nav(id)}>
      <DashHeader
        title="Welcome back, Rohan."
        subtitle="Here's how your listings are doing."
        actions={
          <>
            <button className="btn btn-outline btn-sm">Export</button>
            <button className="btn btn-brand btn-sm" onClick={()=>nav('ownerNew')}>＋ New listing</button>
          </>
        }/>

      <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:14, marginBottom:24}}>
        <StatCard label="Active listings" value="3" trend="+1" sub="this month"/>
        <StatCard label="Unlocks this month" value="18" trend="+42%" sub="vs last"/>
        <StatCard label="Total inquiries" value="124" sub="lifetime"/>
        <StatCard label="Expiring soon" value="2" sub="renew within 3 days" color="var(--warning)"/>
      </div>

      <div className="card" style={{padding:18, background:'#FEF3C7', display:'flex', justifyContent:'space-between', alignItems:'center', border:0, marginBottom:24, gap:16}}>
        <div style={{display:'flex', alignItems:'center', gap:12}}>
          <div style={{width:36, height:36, borderRadius:'var(--r-sm)', background:'#FCD34D', color:'#78350F', display:'grid', placeItems:'center', fontSize:18}}><Icon.bolt/></div>
          <div>
            <div style={{fontSize:14, fontWeight:600, color:'#78350F'}}>2 listings expiring in 3 days.</div>
            <div style={{fontSize:12, color:'#92400E'}}>Renew now to keep them live and visible to new tenants.</div>
          </div>
        </div>
        <button className="btn btn-sm" style={{background:'#78350F', color:'#fff', border:0}}>Renew both →</button>
      </div>

      {/* listings table */}
      <div className="card" style={{padding:0, overflow:'hidden'}}>
        <div style={{padding:'18px 22px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div className="font-display" style={{fontSize:18, fontWeight:700, letterSpacing:'-0.02em'}}>Your listings</div>
          <div style={{display:'flex', gap:6}}>
            {["All","Live","Pending","Rented"].map((t, i)=>(
              <button key={t} className="chip" style={{cursor:'pointer', background:i===0?'var(--text)':'transparent', color:i===0?'var(--bg)':'var(--text)', border:i===0?0:'1px solid var(--border)'}}>{t}</button>
            ))}
          </div>
        </div>
        <table style={{width:'100%', borderCollapse:'collapse', fontSize:13}}>
          <thead>
            <tr style={{textAlign:'left', color:'var(--text-muted)', fontSize:11, textTransform:'uppercase', letterSpacing:'.08em', fontWeight:600}}>
              <th style={{padding:'12px 22px'}}>Property</th>
              <th style={{padding:'12px 22px'}}>Status</th>
              <th style={{padding:'12px 22px'}}>Unlocks</th>
              <th style={{padding:'12px 22px'}}>Days left</th>
              <th style={{padding:'12px 22px'}}>Rent</th>
              <th style={{padding:'12px 22px', textAlign:'right'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {myListings.map(l=>(
              <tr key={l.id} style={{borderTop:'1px solid var(--border)'}}>
                <td style={{padding:'14px 22px'}}>
                  <div style={{display:'flex', alignItems:'center', gap:12}}>
                    <Img src={l.photo} style={{width:48, height:48, borderRadius:'var(--r-sm)'}}/>
                    <div>
                      <div style={{fontWeight:600}}>{l.bhk} BHK · {l.locality}</div>
                      <div style={{fontSize:11, color:'var(--text-muted)'}}>ID {l.id} · {l.area} sq ft</div>
                    </div>
                  </div>
                </td>
                <td style={{padding:'14px 22px'}}><StatusBadge status={l.status}/></td>
                <td style={{padding:'14px 22px', fontWeight:600, fontVariantNumeric:'tabular-nums'}}>{l.unlocks}</td>
                <td style={{padding:'14px 22px', color:'var(--text-muted)', fontVariantNumeric:'tabular-nums'}}>{l.daysLeft}</td>
                <td style={{padding:'14px 22px', fontWeight:600}}>₹{l.rentK}k</td>
                <td style={{padding:'14px 22px', textAlign:'right'}}>
                  <div style={{display:'inline-flex', gap:4}}>
                    <button className="btn btn-ghost btn-sm" onClick={()=>nav('detail', l.id)}>View</button>
                    <button className="btn btn-outline btn-sm">Edit</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* activity feed */}
      <div style={{marginTop:24}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:14}}>
          <div className="font-display" style={{fontSize:18, fontWeight:700, letterSpacing:'-0.02em'}}>Recent activity</div>
          <button className="btn btn-ghost btn-sm" onClick={()=>nav('ownerInquiries')}>View all</button>
        </div>
        <div className="card" style={{padding:0, overflow:'hidden'}}>
          {[
            { who:"A tenant", what:`unlocked your 2 BHK in Koramangala`, when:"2 hours ago", money:"+₹6,250" },
            { who:"Tenant 'P. Mehta'", what:`marked your HSR Layout 3 BHK as their favourite`, when:"5 hours ago" },
            { who:"A tenant", what:`unlocked your studio in Indiranagar`, when:"yesterday", money:"+₹4,400" },
            { who:"System", what:`approved your new listing in Whitefield`, when:"yesterday" },
            { who:"A tenant", what:`unlocked your 2 BHK in Koramangala`, when:"2 days ago", money:"+₹6,250" },
          ].map((a, i)=>(
            <div key={i} style={{padding:'14px 22px', borderTop: i===0 ? 0 : '1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center', gap:14}}>
              <div style={{display:'flex', alignItems:'center', gap:12, fontSize:14}}>
                <div style={{width:34, height:34, borderRadius:'50%', background:'var(--surface-sunken)', display:'grid', placeItems:'center', fontSize:14}}>
                  {a.money ? <Icon.unlock/> : <Icon.heart filled/>}
                </div>
                <div>
                  <span style={{fontWeight:600}}>{a.who}</span> <span style={{color:'var(--text-muted)'}}>{a.what}</span>
                  <div style={{fontSize:11, color:'var(--text-faint)', marginTop:2}}>{a.when}</div>
                </div>
              </div>
              {a.money && <span style={{fontWeight:700, color:'var(--success)', fontSize:14}}>{a.money}</span>}
            </div>
          ))}
        </div>
      </div>
    </PortalShell>
  );
}

// ─── Owner Listings ───────────────────────────────────────────────────────
function OwnerListPage({nav}) {
  const myListings = LISTINGS.slice(0, 6).map((l, i) => ({
    ...l,
    status: ["live","live","pending","rented","live","expired"][i],
  }));
  return (
    <PortalShell user={OWNER_USER} navItems={OWNER_NAV()} current="ownerList" onNav={(id)=>nav(id)}>
      <DashHeader title="My listings"
        subtitle={`${myListings.length} listings · ${myListings.filter(l=>l.status==='live').length} live`}
        actions={<button className="btn btn-brand btn-sm" onClick={()=>nav('ownerNew')}>＋ New listing</button>}/>

      <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:16}}>
        {myListings.map(l=>(
          <div key={l.id} className="card" style={{padding:0, overflow:'hidden'}}>
            <div style={{position:'relative'}}>
              <Img src={l.photo} style={{aspectRatio:'5/3'}}/>
              <div style={{position:'absolute', top:10, left:10}}><StatusBadge status={l.status}/></div>
            </div>
            <div style={{padding:16}}>
              <div className="font-display" style={{fontSize:16, fontWeight:700, letterSpacing:'-0.02em'}}>{l.bhk} BHK · {l.locality}</div>
              <div style={{fontSize:12, color:'var(--text-muted)', marginTop:2}}>ID {l.id} · ₹{l.rentK}k/mo</div>

              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginTop:14, fontSize:11, color:'var(--text-muted)'}}>
                <div><div style={{fontSize:18, fontWeight:700, color:'var(--text)'}}>{Math.floor(l.pop/4)}</div>unlocks</div>
                <div><div style={{fontSize:18, fontWeight:700, color:'var(--text)'}}>{l.pop}</div>views</div>
                <div><div style={{fontSize:18, fontWeight:700, color:'var(--text)'}}>{Math.floor(l.pop/8)}</div>shortlists</div>
              </div>

              <div style={{display:'flex', gap:6, marginTop:14}}>
                <button className="btn btn-outline btn-sm" style={{flex:1}}>Edit</button>
                <button className="btn btn-outline btn-sm" style={{flex:1}}>Pause</button>
                <button className="btn btn-ghost btn-sm">⋯</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </PortalShell>
  );
}

// ─── Owner Inquiries ──────────────────────────────────────────────────────
function OwnerInquiriesPage({nav}) {
  const items = [
    { kind:"unlock", who:"+91 9845••42", listing:LISTINGS[0], when:"2 hours ago", amount:6250 },
    { kind:"shortlist", who:"+91 9821••18", listing:LISTINGS[1], when:"5 hours ago" },
    { kind:"unlock", who:"+91 9986••11", listing:LISTINGS[0], when:"yesterday, 4:23 PM", amount:6250 },
    { kind:"view", who:"+91 9000••72", listing:LISTINGS[2], when:"yesterday, 11:08 AM" },
    { kind:"unlock", who:"+91 8123••00", listing:LISTINGS[3], when:"2 days ago", amount:9800 },
    { kind:"shortlist", who:"+91 7890••11", listing:LISTINGS[1], when:"3 days ago" },
  ];
  return (
    <PortalShell user={OWNER_USER} navItems={OWNER_NAV()} current="ownerInquiries" onNav={(id)=>nav(id)}>
      <DashHeader title="Inquiries"
        subtitle="A feed of everything that's happened on your listings."
        actions={<button className="btn btn-outline btn-sm">Mark all read</button>}/>

      <div className="card" style={{padding:0, overflow:'hidden'}}>
        {items.map((a, i)=>(
          <div key={i} style={{padding:'18px 22px', borderTop: i===0 ? 0 : '1px solid var(--border)', display:'flex', alignItems:'center', gap:14}}>
            <div style={{width:42, height:42, borderRadius:'50%', display:'grid', placeItems:'center',
              background: a.kind==='unlock' ? 'var(--brand-500)' : 'var(--surface-sunken)',
              color: a.kind==='unlock' ? '#fff' : 'var(--text)',
              fontSize:16,
            }}>{a.kind==='unlock' ? <Icon.unlock/> : a.kind==='shortlist' ? <Icon.heart filled/> : '👁'}</div>
            <Img src={a.listing.photo} style={{width:54, height:54, borderRadius:'var(--r-sm)'}}/>
            <div style={{flex:1, minWidth:0}}>
              <div style={{fontSize:14}}>
                <span style={{fontWeight:600, fontFamily:'var(--f-mono)'}}>{a.who}</span>
                <span style={{color:'var(--text-muted)'}}> {a.kind==='unlock' ? 'unlocked' : a.kind==='shortlist' ? 'shortlisted' : 'viewed'} </span>
                <span style={{fontWeight:600}}>{a.listing.bhk} BHK in {a.listing.locality}</span>
              </div>
              <div style={{fontSize:11, color:'var(--text-faint)', marginTop:2}}>{a.when}</div>
            </div>
            {a.amount && <div style={{fontWeight:700, color:'var(--success)', fontSize:15}}>+₹{a.amount.toLocaleString("en-IN")}</div>}
            <button className="btn btn-outline btn-sm">View →</button>
          </div>
        ))}
      </div>
    </PortalShell>
  );
}

// ─── Create Listing wizard ────────────────────────────────────────────────
function OwnerNewPage({nav}) {
  const [step, setStep] = useState(0);
  const steps = ["Type","Details","Location","Pricing","Photos","Review"];

  return (
    <PortalShell user={OWNER_USER} navItems={OWNER_NAV()} current="ownerNew" onNav={(id)=>nav(id)}>
      <DashHeader title="New listing"
        subtitle={`Step ${step+1} of ${steps.length} · ${steps[step]}`}/>

      {/* progress bar */}
      <div style={{display:'grid', gridTemplateColumns:`repeat(${steps.length}, 1fr)`, gap:6, marginBottom:32}}>
        {steps.map((s, i)=>(
          <div key={s} onClick={()=>setStep(i)} style={{cursor:'pointer'}}>
            <div style={{height:4, background: i <= step ? 'var(--text)' : 'var(--border)', borderRadius:99}}/>
            <div style={{fontSize:11, marginTop:8, fontWeight:600, color: i <= step ? 'var(--text)' : 'var(--text-muted)'}}>0{i+1} · {s}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{padding:36, maxWidth:880}}>
        {step === 0 && <StepType onNext={()=>setStep(1)}/>}
        {step === 1 && <StepDetails onNext={()=>setStep(2)} onBack={()=>setStep(0)}/>}
        {step === 2 && <StepLocation onNext={()=>setStep(3)} onBack={()=>setStep(1)}/>}
        {step === 3 && <StepPricing onNext={()=>setStep(4)} onBack={()=>setStep(2)}/>}
        {step === 4 && <StepPhotos onNext={()=>setStep(5)} onBack={()=>setStep(3)}/>}
        {step === 5 && <StepReview onNext={()=>nav('ownerDash')} onBack={()=>setStep(4)}/>}
      </div>
    </PortalShell>
  );
}

function WizardNav({onBack, onNext, nextLabel = "Continue"}) {
  return (
    <div style={{display:'flex', justifyContent:'space-between', marginTop:32, paddingTop:24, borderTop:'1px solid var(--border)'}}>
      <button className="btn btn-outline" onClick={onBack} disabled={!onBack} style={{visibility: onBack ? 'visible' : 'hidden'}}>← Back</button>
      <button className="btn btn-brand" onClick={onNext}>{nextLabel} <Icon.arrow/></button>
    </div>
  );
}

function StepType({onNext}) {
  const types = [
    { id:"res-rent", title:"Residential rental", sub:"Apartment, house, villa to let", emoji:"🏠" },
    { id:"com-rent", title:"Commercial rental", sub:"Office, shop, warehouse", emoji:"🏢" },
    { id:"res-sale", title:"Residential sale", sub:"Sell a home or villa", emoji:"🏡" },
    { id:"com-sale", title:"Commercial sale", sub:"Sell a commercial space", emoji:"🏬" },
    { id:"land",     title:"Land / plot", sub:"Sell or lease land", emoji:"🌳" },
    { id:"pg",       title:"PG / hostel", sub:"Shared accommodation", emoji:"🛏" },
  ];
  const [sel, setSel] = useState("res-rent");
  return (
    <div>
      <h2 className="font-display" style={{fontSize:24, fontWeight:700, letterSpacing:'-0.02em', margin:'0 0 6px'}}>What are you listing?</h2>
      <p className="muted" style={{margin:0, fontSize:14}}>Pick the category that fits best — you can change details later.</p>

      <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:12, marginTop:24}}>
        {types.map(t=>(
          <button key={t.id} onClick={()=>setSel(t.id)} style={{
            padding:'22px 18px', borderRadius:'var(--r-md)',
            border:'1.5px solid', borderColor: sel===t.id ? 'var(--text)' : 'var(--border)',
            background: sel===t.id ? 'var(--surface-sunken)' : 'transparent',
            textAlign:'left', cursor:'pointer', font:'inherit', color:'var(--text)',
          }}>
            <div style={{fontSize:28}}>{t.emoji}</div>
            <div style={{marginTop:10, fontSize:15, fontWeight:700}}>{t.title}</div>
            <div style={{fontSize:12, color:'var(--text-muted)', marginTop:4}}>{t.sub}</div>
          </button>
        ))}
      </div>

      <WizardNav onNext={onNext}/>
    </div>
  );
}

function StepDetails({onNext, onBack}) {
  const [bhk, setBhk] = useState(2);
  return (
    <div>
      <h2 className="font-display" style={{fontSize:24, fontWeight:700, letterSpacing:'-0.02em', margin:'0 0 6px'}}>Tell us about the property</h2>

      <div style={{marginTop:20}}>
        <label style={{fontSize:12, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.08em'}}>Configuration</label>
        <div style={{display:'flex', gap:6, marginTop:8, flexWrap:'wrap'}}>
          {[1,2,3,4,"4+"].map(n=>{
            const v = n==='4+' ? 5 : n;
            const a = bhk === v;
            return <button key={n} onClick={()=>setBhk(v)} style={{padding:'10px 16px', borderRadius:'var(--r-pill)', border:'1.5px solid', borderColor: a?'var(--text)':'var(--border)', background: a?'var(--text)':'transparent', color: a?'var(--bg)':'var(--text)', fontWeight:600, fontSize:13, cursor:'pointer'}}>{n} BHK</button>;
          })}
        </div>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginTop:24}}>
        <Field label="Carpet area"><div style={{display:'flex', alignItems:'center', gap:6}}><input className="input" defaultValue="1240" style={{flex:1}}/><span className="muted" style={{fontSize:13}}>sq ft</span></div></Field>
        <Field label="Total floors / your floor">
          <div style={{display:'flex', gap:8}}>
            <input className="input" defaultValue="4" placeholder="Floor" style={{flex:1}}/>
            <input className="input" defaultValue="8" placeholder="Total" style={{flex:1}}/>
          </div>
        </Field>
        <Field label="Facing">
          <select className="input select"><option>East</option><option>West</option><option>North</option><option>South</option></select>
        </Field>
        <Field label="Property age">
          <select className="input select"><option>New construction</option><option>Less than 1 year</option><option>1 – 5 years</option><option>5 – 10 years</option></select>
        </Field>
        <Field label="Furnishing">
          <select className="input select"><option>Unfurnished</option><option>Semi-furnished</option><option>Fully furnished</option></select>
        </Field>
        <Field label="Available from">
          <input className="input" type="date" defaultValue="2026-01-15"/>
        </Field>
      </div>

      <WizardNav onBack={onBack} onNext={onNext}/>
    </div>
  );
}

function StepLocation({onNext, onBack}) {
  return (
    <div>
      <h2 className="font-display" style={{fontSize:24, fontWeight:700, letterSpacing:'-0.02em', margin:'0 0 6px'}}>Where is it located?</h2>

      <div style={{marginTop:20}}>
        <Field label="City">
          <select className="input select"><option>Bangalore</option><option>Mumbai</option><option>Pune</option><option>Delhi NCR</option></select>
        </Field>
      </div>
      <div style={{marginTop:16}}>
        <Field label="Locality">
          <input className="input" defaultValue="Koramangala 4th Block"/>
        </Field>
      </div>
      <div style={{marginTop:16}}>
        <Field label="Full address">
          <textarea className="input" rows="3" defaultValue="38, 4th Block, 80 Feet Road, Koramangala, Bangalore 560034" style={{height:'auto', padding:'12px 14px', resize:'vertical', lineHeight:1.5}}/>
        </Field>
      </div>

      {/* privacy callout */}
      <div style={{marginTop:18, padding:'14px 18px', background:'var(--brand-50)', borderRadius:'var(--r-md)', display:'flex', gap:14, alignItems:'flex-start'}}>
        <span style={{fontSize:18, color:'var(--brand-500)', marginTop:2}}><Icon.shield/></span>
        <div style={{fontSize:13, color:'var(--brand-900)', lineHeight:1.55}}>
          <strong>Your full address is encrypted and hidden.</strong> Tenants only see "Koramangala 4th Block" until they pay the platform fee. That's how we protect you from spam.
        </div>
      </div>

      <div style={{marginTop:20, height:240, borderRadius:'var(--r-md)', overflow:'hidden', border:'1px solid var(--border)'}}>
        <MiniMap label="Koramangala"/>
      </div>

      <WizardNav onBack={onBack} onNext={onNext}/>
    </div>
  );
}

function StepPricing({onNext, onBack}) {
  const [rent, setRent] = useState(38000);
  const fee = Math.round((rent / 30) * 7.5 * 1.18);
  return (
    <div>
      <h2 className="font-display" style={{fontSize:24, fontWeight:700, letterSpacing:'-0.02em', margin:'0 0 6px'}}>Set your price</h2>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginTop:20}}>
        <Field label="Monthly rent">
          <div style={{display:'flex', alignItems:'center', gap:6}}>
            <span className="muted" style={{fontSize:14, fontWeight:600}}>₹</span>
            <input className="input" type="number" value={rent} onChange={e=>setRent(+e.target.value || 0)} style={{flex:1}}/>
          </div>
        </Field>
        <Field label="Security deposit">
          <div style={{display:'flex', alignItems:'center', gap:6}}>
            <span className="muted" style={{fontSize:14, fontWeight:600}}>₹</span>
            <input className="input" defaultValue="76000" style={{flex:1}}/>
            <span className="muted" style={{fontSize:13}}>(2 mo)</span>
          </div>
        </Field>
        <Field label="Maintenance">
          <select className="input select"><option>Included in rent</option><option>Charged extra</option></select>
        </Field>
        <Field label="Negotiable?">
          <select className="input select"><option>Yes</option><option>No</option></select>
        </Field>
      </div>

      <div style={{marginTop:24, padding:'18px 22px', background:'var(--surface-sunken)', borderRadius:'var(--r-md)', display:'flex', justifyContent:'space-between', alignItems:'center', gap:18}}>
        <div>
          <div style={{fontSize:11, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.08em'}}>Each tenant unlock earns you</div>
          <div style={{fontSize:13, color:'var(--text-muted)', marginTop:4}}>You keep ₹{rent} rent + ₹{rent*2} deposit. We collect the platform fee from the tenant.</div>
        </div>
        <div style={{textAlign:'right'}}>
          <div style={{fontSize:11, color:'var(--text-muted)'}}>Platform fee (collected from tenant)</div>
          <div className="font-display" style={{fontSize:28, fontWeight:800, letterSpacing:'-0.03em'}}>₹{fee.toLocaleString("en-IN")}</div>
        </div>
      </div>

      <WizardNav onBack={onBack} onNext={onNext}/>
    </div>
  );
}

function StepPhotos({onNext, onBack}) {
  return (
    <div>
      <h2 className="font-display" style={{fontSize:24, fontWeight:700, letterSpacing:'-0.02em', margin:'0 0 6px'}}>Add photos</h2>
      <p className="muted" style={{margin:'0 0 20px', fontSize:14}}>Minimum 3, maximum 30. Listings with 8+ photos get 3× more unlocks.</p>

      <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:12}}>
        {INTERIORS.slice(0, 3).map((src, i)=>(
          <div key={i} style={{position:'relative', aspectRatio:'4/3', borderRadius:'var(--r-md)', overflow:'hidden'}}>
            <Img src={src} style={{width:'100%', height:'100%'}}/>
            <button style={{position:'absolute', top:8, right:8, width:24, height:24, borderRadius:'50%', background:'rgba(15,22,20,.7)', color:'#fff', border:0, cursor:'pointer', fontSize:11}}>✕</button>
            {i === 0 && <span className="chip chip-dark" style={{position:'absolute', bottom:8, left:8, height:22, fontSize:10}}>COVER</span>}
          </div>
        ))}

        <button style={{
          aspectRatio:'4/3', borderRadius:'var(--r-md)',
          border:'2px dashed var(--border-strong)', background:'transparent',
          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8,
          cursor:'pointer', color:'var(--text-muted)',
          fontSize:13, fontWeight:500,
        }}>
          <div style={{fontSize:24}}>＋</div>
          Drop photos here
          <span style={{fontSize:11, color:'var(--text-faint)'}}>JPG, PNG · max 8MB each</span>
        </button>
      </div>

      <div style={{marginTop:18, padding:'14px 18px', background:'var(--surface-sunken)', borderRadius:'var(--r-md)', display:'flex', gap:14, alignItems:'flex-start'}}>
        <span style={{fontSize:18, color:'var(--accent-600)', marginTop:2}}><Icon.sparkle/></span>
        <div style={{fontSize:13, lineHeight:1.55}}>
          <strong>AI tips for your photos:</strong> <span style={{color:'var(--text-muted)'}}>Photo 2 appears slightly dark — try shooting in daylight. Photo 3 looks great. Add a balcony / view photo to boost engagement.</span>
        </div>
      </div>

      <Field label="Virtual tour link (optional)" style={{marginTop:24}}>
        <input className="input" placeholder="https://youtube.com/... or matterport URL"/>
      </Field>

      <WizardNav onBack={onBack} onNext={onNext} nextLabel="Continue"/>
    </div>
  );
}

function StepReview({onNext, onBack}) {
  return (
    <div>
      <h2 className="font-display" style={{fontSize:24, fontWeight:700, letterSpacing:'-0.02em', margin:'0 0 6px'}}>Review & submit</h2>
      <p className="muted" style={{margin:'0 0 24px', fontSize:14}}>Last look before your listing goes to our moderation team. We review in &lt; 2 hours.</p>

      <div style={{display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:18}}>
        <div className="card" style={{padding:0, overflow:'hidden'}}>
          <Img src={INTERIORS[0]} style={{aspectRatio:'16/9'}}/>
          <div style={{padding:20}}>
            <div style={{display:'flex', gap:8, marginBottom:10}}>
              <span className="chip chip-brand">Direct Owner</span>
              <span className="chip">Pending review</span>
            </div>
            <div className="font-display" style={{fontSize:20, fontWeight:800, letterSpacing:'-0.02em'}}>2 BHK Apartment · Koramangala</div>
            <div style={{display:'flex', gap:14, fontSize:13, color:'var(--text-muted)', marginTop:8}}>
              <span>1,240 sq ft</span>·<span>Floor 4/8</span>·<span>East-facing</span>·<span>Semi-furnished</span>
            </div>
            <div className="font-display" style={{fontSize:30, fontWeight:800, letterSpacing:'-0.03em', marginTop:14}}>₹38,000<span style={{fontSize:14, color:'var(--text-muted)', fontWeight:500}}>/mo</span></div>
          </div>
        </div>

        <div className="card" style={{padding:22}}>
          <div className="font-display" style={{fontSize:16, fontWeight:700, letterSpacing:'-0.02em'}}>What happens next?</div>
          <ol style={{paddingLeft:20, marginTop:14, marginBottom:0, display:'flex', flexDirection:'column', gap:10, fontSize:13, lineHeight:1.55, color:'var(--text-muted)'}}>
            <li>Submit for review</li>
            <li>A real human checks your listing (target &lt; 2 hrs)</li>
            <li>Listing goes live, visible to tenants</li>
            <li>You get a notification on every unlock</li>
          </ol>

          <label style={{display:'flex', alignItems:'flex-start', gap:10, marginTop:18, fontSize:12, color:'var(--text-muted)', cursor:'pointer'}}>
            <input type="checkbox" defaultChecked style={{marginTop:2}}/>
            I agree to Urbify's terms and confirm this property is mine to list.
          </label>
        </div>
      </div>

      <WizardNav onBack={onBack} onNext={onNext} nextLabel="Submit for review"/>
    </div>
  );
}

function Field({label, children, style}) {
  return (
    <div style={style}>
      <label style={{fontSize:12, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.08em', display:'block', marginBottom:8}}>{label}</label>
      {children}
    </div>
  );
}

Object.assign(window, { OwnerDashPage, OwnerListPage, OwnerInquiriesPage, OwnerNewPage });
