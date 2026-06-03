// tenant-extras.jsx — Shortlist · Saved Searches · Compare · Notifications · Onboarding

// ─── SHORTLIST ───────────────────────────────────────────────────────────
function ClientShortlistPage({nav, savedIds, onSave, onUnlock}) {
  const [sort, setSort] = useState("Recently saved");
  const [compareSet, setCompareSet] = useState([]);
  const shortlisted = LISTINGS.slice(0, 8);

  const toggleCompare = (id) => setCompareSet(s =>
    s.includes(id) ? s.filter(x=>x!==id) : s.length < 3 ? [...s, id] : s
  );

  return (
    <PortalShell user={CLIENT_USER} navItems={CLIENT_NAV()} current="clientShort" onNav={(id)=>nav(id)}>
      <DashHeader title="Shortlisted"
        subtitle={`${shortlisted.length} homes saved · across 3 cities`}
        actions={
          <>
            <select className="input select btn-sm" style={{height:34, fontSize:13}} value={sort} onChange={e=>setSort(e.target.value)}>
              <option>Recently saved</option>
              <option>Price low to high</option>
              <option>Price high to low</option>
              <option>Newest listed</option>
            </select>
            <button className="btn btn-outline btn-sm">Share shortlist</button>
          </>
        }/>

      {/* compare strip */}
      {compareSet.length > 0 && (
        <div className="card" style={{padding:'12px 18px', marginBottom:18, background:'var(--text)', color:'var(--bg)', border:0, display:'flex', alignItems:'center', gap:14}}>
          <span style={{fontSize:13, fontWeight:600}}>{compareSet.length} of 3 selected to compare</span>
          <div style={{flex:1, display:'flex', gap:6}}>
            {compareSet.map(id => {
              const l = LISTINGS.find(x=>x.id===id);
              return <span key={id} className="chip" style={{background:'rgba(255,255,255,.12)', color:'#fff', border:0, height:24}}>{l.bhk} BHK · {l.locality} <button onClick={()=>toggleCompare(id)} style={{background:'transparent', border:0, color:'#fff', cursor:'pointer', marginLeft:4}}><Icon.close/></button></span>;
            })}
          </div>
          <button className="btn btn-accent btn-sm" disabled={compareSet.length < 2} onClick={()=>nav('compare')}>Compare {compareSet.length} →</button>
        </div>
      )}

      {/* filters */}
      <div style={{display:'flex', gap:6, marginBottom:18, flexWrap:'wrap'}}>
        {[
          {id:'all', l:`All · ${shortlisted.length}`, a:true},
          {id:'blr', l:'Bangalore · 5'},
          {id:'mum', l:'Mumbai · 2'},
          {id:'pune', l:'Pune · 1'},
        ].map(t=>(
          <button key={t.id} className="chip" style={{cursor:'pointer', background: t.a ? 'var(--text)' : 'transparent', color: t.a ? 'var(--bg)' : 'var(--text)', border: t.a ? 0 : '1px solid var(--border-strong)', height:30}}>{t.l}</button>
        ))}
      </div>

      <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:16}}>
        {shortlisted.map(l=>(
          <div key={l.id} style={{position:'relative'}}>
            <ListingCard listing={l}
              onOpen={()=>nav('detail', l.id)}
              onUnlock={onUnlock}
              saved={true}
              onSave={onSave}/>
            <label style={{
              position:'absolute', top:12, left:12, zIndex:2,
              display:'flex', alignItems:'center', gap:6,
              padding:'5px 10px', borderRadius:99,
              background:'rgba(255,255,255,.95)', backdropFilter:'blur(8px)',
              fontSize:11, fontWeight:600, cursor:'pointer',
            }}>
              <input type="checkbox" checked={compareSet.includes(l.id)} onChange={()=>toggleCompare(l.id)} style={{margin:0}}/>
              Compare
            </label>
          </div>
        ))}
      </div>

      {shortlisted.length === 0 && (
        <div className="card" style={{textAlign:'center', padding:'64px 24px'}}>
          <div style={{fontSize:40, marginBottom:8}}>♡</div>
          <div className="font-display" style={{fontSize:22, fontWeight:700}}>Nothing shortlisted yet.</div>
          <div style={{color:'var(--text-muted)', marginTop:8, marginBottom:24}}>Save listings while browsing — they'll appear here.</div>
          <button className="btn btn-brand" onClick={()=>nav('search')}>Browse homes</button>
        </div>
      )}
    </PortalShell>
  );
}

// ─── SAVED SEARCHES ──────────────────────────────────────────────────────
function ClientSavedSearchesPage({nav}) {
  const searches = [
    { id:1, q:"2 BHK Furnished · Koramangala, Bangalore", filters:"₹30-50k · Pet-friendly", new:12, alerts:'daily-sms', lastChecked:"23 min ago" },
    { id:2, q:"3 BHK · Powai, Mumbai", filters:"₹60-90k · Semi/Fully furnished", new:5, alerts:'daily-email', lastChecked:"2 h ago" },
    { id:3, q:"Studio · Indiranagar, Bangalore", filters:"₹15-25k · Any furnishing", new:0, alerts:'weekly', lastChecked:"yesterday" },
    { id:4, q:"1 BHK · HSR Layout, Bangalore", filters:"₹18-28k · Furnished", new:3, alerts:'daily-sms', lastChecked:"4 h ago" },
  ];

  return (
    <PortalShell user={CLIENT_USER} navItems={CLIENT_NAV()} current="clientSearches" onNav={(id)=>nav(id)}>
      <DashHeader title="Saved searches"
        subtitle={`${searches.length} searches · ${searches.reduce((s,x)=>s+x.new,0)} new matches today`}
        actions={<button className="btn btn-brand btn-sm" onClick={()=>nav('search')}>＋ New search</button>}/>

      <div className="card" style={{padding:0, overflow:'hidden'}}>
        {searches.map((s, i)=>(
          <div key={s.id} style={{padding:'22px 24px', borderTop: i===0 ? 0 : '1px solid var(--border)', display:'flex', alignItems:'center', gap:20}}>
            <div style={{flex:1, minWidth:0}}>
              <div className="font-display" style={{fontSize:17, fontWeight:700, letterSpacing:'-0.02em'}}>{s.q}</div>
              <div style={{display:'flex', gap:14, marginTop:6, fontSize:12, color:'var(--text-muted)'}}>
                <span>{s.filters}</span><span>·</span>
                <span>Last checked {s.lastChecked}</span>
              </div>
              <div style={{display:'flex', gap:8, marginTop:10, alignItems:'center'}}>
                <span style={{fontSize:11, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.08em'}}>Alerts</span>
                {[
                  { id:'daily-sms', l:'Daily SMS', icon:'💬' },
                  { id:'daily-email', l:'Daily email', icon:'✉' },
                  { id:'weekly', l:'Weekly digest', icon:'📅' },
                  { id:'off', l:'Off', icon:'×' },
                ].map(a=>(
                  <span key={a.id} className="chip" style={{
                    height:22, fontSize:10, padding:'0 8px',
                    background: s.alerts === a.id ? 'var(--text)' : 'transparent',
                    color: s.alerts === a.id ? 'var(--bg)' : 'var(--text-muted)',
                    border: s.alerts === a.id ? 0 : '1px solid var(--border)',
                    cursor:'pointer',
                  }}>{a.icon} {a.l}</span>
                ))}
              </div>
            </div>
            <div style={{textAlign:'center'}}>
              {s.new > 0 ? (
                <div>
                  <div className="font-display" style={{fontSize:32, fontWeight:800, letterSpacing:'-0.035em', color:'var(--brand-500)', lineHeight:1}}>{s.new}</div>
                  <div style={{fontSize:11, color:'var(--text-muted)', marginTop:4}}>new matches</div>
                </div>
              ) : (
                <div>
                  <div className="font-display" style={{fontSize:32, fontWeight:800, letterSpacing:'-0.035em', color:'var(--text-faint)', lineHeight:1}}>0</div>
                  <div style={{fontSize:11, color:'var(--text-muted)', marginTop:4}}>no new</div>
                </div>
              )}
            </div>
            <div style={{display:'flex', flexDirection:'column', gap:6}}>
              <button className="btn btn-brand btn-sm" onClick={()=>nav('search')}>View matches</button>
              <button className="btn btn-ghost btn-sm">Edit</button>
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{padding:20, background:'var(--brand-50)', border:0, marginTop:24, display:'flex', alignItems:'center', gap:14}}>
        <span style={{fontSize:24}}>🔔</span>
        <div style={{flex:1, fontSize:13, color:'var(--brand-900)'}}>
          <strong>Pro tip:</strong> Daily SMS alerts get tenants to view-and-unlock 3× faster than weekly digests in tight markets.
        </div>
      </div>
    </PortalShell>
  );
}

// ─── COMPARE LISTINGS ────────────────────────────────────────────────────
function ComparePage({nav, savedIds, onSave, onUnlock}) {
  const compareList = [LISTINGS[0], LISTINGS[2], LISTINGS[4]];
  const fmt = (n)=>n.toLocaleString("en-IN");

  // Find "best" per row to highlight
  const winners = {
    rent: compareList.reduce((min, l)=> l.rentK < min.rentK ? l : min),
    area: compareList.reduce((max, l)=> l.area > max.area ? l : max),
    fee:  compareList.reduce((min, l)=> l.feeGST < min.feeGST ? l : min),
  };

  const Row = ({label, render, winner, mono}) => (
    <div style={{display:'grid', gridTemplateColumns: `220px repeat(${compareList.length}, 1fr)`, borderTop:'1px solid var(--border)'}}>
      <div style={{padding:'16px 22px', fontSize:12, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.08em', background:'var(--surface-sunken)'}}>{label}</div>
      {compareList.map(l=>{
        const isWinner = winner && winners[winner]?.id === l.id;
        return (
          <div key={l.id} style={{
            padding:'16px 22px',
            fontSize:14, fontWeight: isWinner ? 700 : 500,
            background: isWinner ? 'var(--brand-50)' : 'transparent',
            color: isWinner ? 'var(--brand-900)' : 'var(--text)',
            position:'relative',
            fontFamily: mono ? 'var(--f-mono)' : 'inherit',
          }}>
            {render(l)}
            {isWinner && <span className="chip" style={{position:'absolute', top:14, right:14, height:18, fontSize:9, background:'var(--brand-500)', color:'#fff', border:0, padding:'0 6px'}}>BEST</span>}
          </div>
        );
      })}
    </div>
  );

  return (
    <div>
      <section style={{padding:'24px 28px', maxWidth:1440, margin:'0 auto'}}>
        <button className="btn btn-ghost btn-sm" onClick={()=>nav('clientShort')} style={{marginBottom:18}}><Icon.back/> Back to shortlist</button>
        <h1 className="font-display" style={{fontSize:'clamp(32px, 4.5vw, 56px)', fontWeight:800, letterSpacing:'-0.04em', margin:0}}>
          Compare these homes.
        </h1>
        <p className="muted" style={{fontSize:16, marginTop:10, lineHeight:1.5}}>Best value in each row is highlighted.</p>
      </section>

      <section style={{padding:'24px 28px 80px', maxWidth:1440, margin:'0 auto'}}>
        <div className="card" style={{padding:0, overflow:'hidden'}}>

          {/* listing header row */}
          <div style={{display:'grid', gridTemplateColumns: `220px repeat(${compareList.length}, 1fr)`}}>
            <div/>
            {compareList.map(l=>(
              <div key={l.id} style={{padding:20, borderLeft:'1px solid var(--border)'}}>
                <div style={{borderRadius:'var(--r-md)', overflow:'hidden', aspectRatio:'5/3', marginBottom:14}}>
                  <Img src={l.photo} style={{width:'100%', height:'100%'}}/>
                </div>
                <div className="font-display" style={{fontSize:17, fontWeight:700, letterSpacing:'-0.02em'}}>{l.bhk} BHK · {l.locality}</div>
                <div style={{fontSize:12, color:'var(--text-muted)', marginTop:4}}>{l.city} · ID {l.id}</div>
                <button className="btn btn-outline btn-sm" style={{marginTop:12, width:'100%'}} onClick={()=>nav('detail', l.id)}>View details</button>
              </div>
            ))}
          </div>

          <Row label="Monthly rent" winner="rent" render={l=>`₹${l.rentK}k`}/>
          <Row label="Carpet area" winner="area" render={l=>`${fmt(l.area)} sq ft`}/>
          <Row label="Unlock fee" winner="fee" mono render={l=>`₹${fmt(l.feeGST)}`}/>
          <Row label="Floor" render={l=>`${l.floor} of ${l.total}`}/>
          <Row label="Facing" render={l=>`${l.facing}`}/>
          <Row label="Furnishing" render={l=>l.furnishing}/>
          <Row label="Age" render={l=>l.age}/>
          <Row label="Available" render={l=>l.available}/>
          <Row label="Deposit" render={l=>`₹${l.deposit}k`}/>
          <Row label="Listed by" render={l=>l.isBroker ? "Verified Broker" : "Direct Owner"}/>

          {/* amenities row — special */}
          <div style={{display:'grid', gridTemplateColumns: `220px repeat(${compareList.length}, 1fr)`, borderTop:'1px solid var(--border)'}}>
            <div style={{padding:'16px 22px', fontSize:12, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.08em', background:'var(--surface-sunken)'}}>Amenities</div>
            {compareList.map(l=>(
              <div key={l.id} style={{padding:'16px 22px'}}>
                <div style={{display:'flex', flexWrap:'wrap', gap:6}}>
                  {AMENITIES.filter(a=>l.amenities.includes(a.id)).map(a=>(
                    <span key={a.id} className="chip" style={{height:22, fontSize:10, background:'var(--surface-sunken)', color:'var(--text)', border:0, padding:'0 8px'}}>✓ {a.label}</span>
                  ))}
                </div>
                <div style={{fontSize:11, color:'var(--text-faint)', marginTop:8}}>
                  {l.amenities.length} of {AMENITIES.length} amenities
                </div>
              </div>
            ))}
          </div>

          {/* CTA row */}
          <div style={{display:'grid', gridTemplateColumns: `220px repeat(${compareList.length}, 1fr)`, borderTop:'1px solid var(--border)', background:'var(--surface-sunken)'}}>
            <div/>
            {compareList.map(l=>(
              <div key={l.id} style={{padding:22, borderLeft:'1px solid var(--border)'}}>
                <button className="btn btn-brand btn-block" onClick={()=>onUnlock(l)}>
                  <Icon.unlock/> Unlock · ₹{fmt(l.feeGST)}
                </button>
                <button className="btn btn-ghost btn-sm btn-block" style={{marginTop:8}}>♡ Keep in shortlist</button>
              </div>
            ))}
          </div>
        </div>

        <div style={{marginTop:18, padding:'14px 18px', background:'#FEF3C7', borderRadius:'var(--r-md)', display:'flex', alignItems:'center', gap:14}}>
          <span style={{fontSize:18, color:'#92400E'}}>💡</span>
          <div style={{fontSize:13, color:'#78350F', lineHeight:1.55}}>
            <strong>Saving money on the unlock?</strong> The cheapest unlock isn't always the best deal. Factor in rent, deposit, and amenities together.
          </div>
        </div>
      </section>

      <Footer nav={nav}/>
    </div>
  );
}

// ─── NOTIFICATIONS ───────────────────────────────────────────────────────
function NotificationsPage({nav}) {
  const [tab, setTab] = useState("all");

  const notifs = [
    { id:1, type:'match', icon:'⌕', title:"12 new matches", desc:"in 2 BHK · Koramangala, Bangalore", time:"23 min ago", unread:true, listing:LISTINGS[0] },
    { id:2, type:'price', icon:'₹', title:"Price reduced", desc:"3 BHK in HSR Layout dropped ₹4k to ₹46k/mo", time:"2 hours ago", unread:true, listing:LISTINGS[2] },
    { id:3, type:'reply', icon:'💬', title:"Owner replied", desc:"Rohan P. replied to your inquiry on the Koramangala home", time:"3 hours ago", unread:true, listing:LISTINGS[0] },
    { id:4, type:'system', icon:'✓', title:"Payment successful", desc:"₹6,250 paid for URB-1042 unlock · invoice emailed", time:"yesterday", unread:false },
    { id:5, type:'tip', icon:'💡', title:"Complete your tenant profile", desc:"Verified tenants get 2.3× faster replies", time:"yesterday", unread:false },
    { id:6, type:'match', icon:'⌕', title:"5 new matches", desc:"in 3 BHK · Powai, Mumbai", time:"2 days ago", unread:false },
    { id:7, type:'expire', icon:'⏰', title:"Your saved search is going stale", desc:"You haven't viewed Bangalore matches in 7 days", time:"3 days ago", unread:false },
    { id:8, type:'system', icon:'⚖', title:"Tenant rights guide updated", desc:"New section on the 2026 Karnataka tenancy amendments", time:"5 days ago", unread:false },
  ];

  const filtered = tab === 'all' ? notifs : tab === 'unread' ? notifs.filter(n=>n.unread) : notifs.filter(n=>n.type === tab);

  const tones = {
    match:'var(--brand-500)', price:'var(--success)', reply:'var(--accent-500)',
    system:'var(--text)', tip:'var(--info)', expire:'var(--warning)',
  };

  return (
    <PortalShell user={CLIENT_USER} navItems={CLIENT_NAV()} current="notifications" onNav={(id)=>nav(id)}>
      <DashHeader title="Notifications"
        subtitle={`${notifs.filter(n=>n.unread).length} unread · ${notifs.length} total`}
        actions={
          <>
            <button className="btn btn-outline btn-sm">Mark all read</button>
            <button className="btn btn-ghost btn-sm">⚙ Preferences</button>
          </>
        }/>

      {/* tabs */}
      <div style={{display:'flex', gap:6, marginBottom:18, flexWrap:'wrap'}}>
        {[
          {id:'all', l:`All · ${notifs.length}`},
          {id:'unread', l:`Unread · ${notifs.filter(n=>n.unread).length}`},
          {id:'match', l:'Matches'},
          {id:'reply', l:'Replies'},
          {id:'system', l:'System'},
        ].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{
            padding:'7px 14px', borderRadius:99,
            border:'1.5px solid', borderColor: tab===t.id?'var(--text)':'var(--border)',
            background: tab===t.id?'var(--text)':'transparent',
            color: tab===t.id?'var(--bg)':'var(--text)',
            fontSize:12, fontWeight:600, cursor:'pointer',
          }}>{t.l}</button>
        ))}
      </div>

      <div className="card" style={{padding:0, overflow:'hidden'}}>
        {filtered.map((n, i)=>(
          <div key={n.id} style={{
            padding:'18px 22px',
            borderTop: i===0 ? 0 : '1px solid var(--border)',
            display:'flex', alignItems:'center', gap:16,
            background: n.unread ? 'var(--brand-50)' : 'transparent',
            cursor:'pointer',
          }}>
            <div style={{
              width:42, height:42, borderRadius:'50%',
              background: tones[n.type], color:'#fff',
              display:'grid', placeItems:'center', fontSize:18,
              flexShrink:0,
            }}>{n.icon}</div>

            {n.listing && <Img src={n.listing.photo} style={{width:54, height:54, borderRadius:'var(--r-sm)', flexShrink:0}}/>}

            <div style={{flex:1, minWidth:0}}>
              <div style={{display:'flex', alignItems:'center', gap:10}}>
                <div style={{fontSize:14, fontWeight: n.unread ? 700 : 500}}>{n.title}</div>
                {n.unread && <span style={{width:6, height:6, borderRadius:'50%', background:'var(--brand-500)'}}/>}
              </div>
              <div style={{fontSize:13, color:'var(--text-muted)', marginTop:4}}>{n.desc}</div>
              <div style={{fontSize:11, color:'var(--text-faint)', marginTop:4}}>{n.time}</div>
            </div>

            <div style={{display:'flex', gap:6}}>
              {n.type === 'match' && <button className="btn btn-outline btn-sm" onClick={()=>nav('search')}>View →</button>}
              {n.type === 'reply' && <button className="btn btn-outline btn-sm">Open chat</button>}
              {n.type === 'price' && <button className="btn btn-outline btn-sm" onClick={()=>nav('detail', n.listing?.id)}>View →</button>}
              {n.type === 'system' && <button className="btn btn-ghost btn-sm"><Icon.download/></button>}
              <button className="btn btn-ghost btn-sm">⋯</button>
            </div>
          </div>
        ))}
      </div>
    </PortalShell>
  );
}

// ─── ONBOARDING ──────────────────────────────────────────────────────────
function OnboardingPage({nav}) {
  const [step, setStep] = useState(0);
  const steps = [
    {
      title:"Welcome to Urbify, Aanya 👋",
      sub:"You're 3 steps away from the perfect place. Let's tailor it to you.",
      content:(
        <div style={{display:'flex', justifyContent:'center', padding:'48px 0'}}>
          <div style={{
            width:160, height:160, borderRadius:'50%',
            background:'var(--brand-500)', color:'#fff',
            display:'grid', placeItems:'center', fontSize:64,
            position:'relative',
          }}>
            👋
            <div style={{position:'absolute', inset:-20, borderRadius:'50%', border:'2px dashed var(--brand-500)', opacity:.4}}/>
            <div style={{position:'absolute', inset:-40, borderRadius:'50%', border:'2px dashed var(--brand-500)', opacity:.2}}/>
          </div>
        </div>
      ),
    },
    {
      title:"Where are you looking?",
      sub:"Pick a city or two — you can change this any time.",
      content:(
        <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:10, padding:'24px 0'}}>
          {["Bangalore","Mumbai","Pune","Delhi NCR","Hyderabad","Chennai","Ahmedabad","Kolkata","Other"].map((c, i)=>(
            <button key={c} style={{
              padding:'18px', borderRadius:'var(--r-md)',
              border:'1.5px solid', borderColor: i===0 ? 'var(--text)' : 'var(--border)',
              background: i===0 ? 'var(--surface-sunken)' : 'transparent',
              cursor:'pointer', textAlign:'left', font:'inherit', color:'var(--text)',
            }}>
              <div style={{fontSize:15, fontWeight:700}}>{c}</div>
              <div style={{fontSize:11, color:'var(--text-muted)', marginTop:4}}>{Math.floor(Math.random()*2000+200)} listings</div>
            </button>
          ))}
        </div>
      ),
    },
    {
      title:"What kind of home?",
      sub:"This helps us send you only the matches that matter.",
      content:(
        <div style={{padding:'24px 0', display:'flex', flexDirection:'column', gap:24}}>
          <div>
            <label style={{fontSize:12, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.08em'}}>Configuration</label>
            <div style={{display:'flex', gap:8, marginTop:10, flexWrap:'wrap'}}>
              {["Studio","1 BHK","2 BHK","3 BHK","4+ BHK"].map((b,i)=>(
                <button key={b} style={{padding:'10px 18px', borderRadius:99, border:'1.5px solid', borderColor: i===2?'var(--text)':'var(--border)', background: i===2?'var(--text)':'transparent', color: i===2?'var(--bg)':'var(--text)', fontWeight:600, fontSize:13, cursor:'pointer'}}>{b}</button>
              ))}
            </div>
          </div>
          <div>
            <label style={{fontSize:12, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.08em'}}>Monthly budget</label>
            <div style={{marginTop:10, padding:'18px 22px', background:'var(--surface-sunken)', borderRadius:'var(--r-md)'}}>
              <div style={{display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:8}}>
                <span style={{fontWeight:600}}>₹30k</span><span style={{fontWeight:600}}>₹60k</span>
              </div>
              <div style={{position:'relative', height:6, background:'var(--border)', borderRadius:99}}>
                <div style={{position:'absolute', left:'20%', right:'40%', height:6, background:'var(--text)', borderRadius:99}}/>
              </div>
            </div>
          </div>
          <div>
            <label style={{fontSize:12, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.08em'}}>Must-haves</label>
            <div style={{display:'flex', gap:8, marginTop:10, flexWrap:'wrap'}}>
              {["Parking","Furnished","Pet-friendly","Gym","Lift","Balcony","Power backup"].map((b,i)=>(
                <button key={b} style={{padding:'8px 14px', borderRadius:99, border:'1.5px solid', borderColor: [0,1,2].includes(i)?'var(--text)':'var(--border)', background: [0,1,2].includes(i)?'var(--text)':'transparent', color: [0,1,2].includes(i)?'var(--bg)':'var(--text-muted)', fontSize:12, fontWeight:600, cursor:'pointer'}}>{b}</button>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      title:"You're all set! ✨",
      sub:"We found 247 matches for you. Here are a few to get you started.",
      content:(
        <div style={{padding:'24px 0', display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:12}}>
          {LISTINGS.slice(0, 3).map(l=>(
            <div key={l.id} className="card" style={{padding:0, overflow:'hidden'}}>
              <Img src={l.photo} style={{aspectRatio:'5/3'}}/>
              <div style={{padding:14}}>
                <div className="font-display" style={{fontSize:14, fontWeight:700}}>{l.bhk} BHK · {l.locality}</div>
                <div className="font-display" style={{fontSize:18, fontWeight:800, marginTop:6, letterSpacing:'-0.02em'}}>₹{l.rentK}k<span style={{fontSize:11, color:'var(--text-muted)', fontWeight:500}}>/mo</span></div>
              </div>
            </div>
          ))}
        </div>
      ),
    },
  ];

  const cur = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <div style={{minHeight:'calc(100vh - 64px)', background:'var(--surface-sunken)', display:'grid', placeItems:'center', padding:'40px 28px'}}>
      <div style={{maxWidth:780, width:'100%'}}>
        {/* progress */}
        <div style={{display:'flex', gap:6, marginBottom:32}}>
          {steps.map((_, i)=>(
            <div key={i} style={{flex:1, height:4, background: i <= step ? 'var(--text)' : 'var(--border)', borderRadius:99}}/>
          ))}
        </div>

        <div className="card" style={{padding:48, boxShadow:'var(--sh-3)'}}>
          <div style={{fontSize:12, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.08em', fontWeight:600}}>Step {step+1} of {steps.length}</div>
          <h1 className="font-display" style={{fontSize:'clamp(28px, 4vw, 40px)', fontWeight:800, letterSpacing:'-0.035em', margin:'8px 0 6px', lineHeight:1.05}}>
            {cur.title}
          </h1>
          <p className="muted" style={{margin:0, fontSize:16, lineHeight:1.5}}>{cur.sub}</p>

          {cur.content}

          <div style={{display:'flex', justifyContent:'space-between', marginTop:32, paddingTop:24, borderTop:'1px solid var(--border)'}}>
            <button className="btn btn-ghost" onClick={()=>step === 0 ? nav('clientDash') : setStep(step-1)}>
              {step === 0 ? 'Skip' : '← Back'}
            </button>
            <button className="btn btn-brand btn-lg" onClick={()=>{
              if (isLast) nav('search');
              else setStep(step+1);
            }}>
              {isLast ? <>See all matches <Icon.arrow/></> : <>Continue <Icon.arrow/></>}
            </button>
          </div>
        </div>

        <div style={{textAlign:'center', marginTop:24, fontSize:12, color:'var(--text-faint)'}}>
          Takes under 60 seconds. You can change all of these later in Settings.
        </div>
      </div>
    </div>
  );
}

// Extend CLIENT_NAV — re-export from outside since it's already defined elsewhere
// We need a richer CLIENT_NAV that includes notifications. Patch it in-place.
const CLIENT_NAV_FULL = () => [
  { id:'clientDash',     label:'Dashboard',      icon:'◧' },
  { id:'clientShort',    label:'Shortlisted',    icon:'♡', badge:'8' },
  { id:'compare',        label:'Compare',        icon:'⊞' },
  { id:'clientTx',       label:'Transactions',   icon:'≡' },
  { id:'clientSearches', label:'Saved searches', icon:'⌕', badge:'4' },
  { id:'notifications',  label:'Notifications',  icon:'🔔', badge:'3', badgeTone:'danger' },
  { divider:'account' },
  { id:'settings', label:'Profile', icon:'◌' },
  { id:'home', label:'Back to site', icon:'↗' },
];
// Replace existing CLIENT_NAV so portal sidebars show notification badge
window.CLIENT_NAV = CLIENT_NAV_FULL;

Object.assign(window, { ClientShortlistPage, ClientSavedSearchesPage, ComparePage, NotificationsPage, OnboardingPage });
