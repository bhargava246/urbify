// client-broker-pages.jsx — Tenant/buyer dashboard + Broker portal

const CLIENT_USER = { initials:"AS", name:"Aanya Sharma", role:"Tenant", color:'var(--accent-500)' };
const BROKER_USER = { initials:"VK", name:"Vikram Kumar", role:"Verified Broker · RERA KA1234", color:'var(--text)' };

const CLIENT_NAV = () => [
  { id:'clientDash',    label:'Dashboard',    icon:'◧' },
  { id:'clientShort',   label:'Shortlisted',  icon:'♡', badge:'7' },
  { id:'clientTx',      label:'Transactions', icon:'≡' },
  { id:'clientSearches',label:'Saved searches', icon:'⌕', badge:'3' },
  { divider:'account' },
  { id:'settings', label:'Profile', icon:'◌' },
  { id:'home', label:'Back to site', icon:'↗' },
];

const BROKER_NAV = () => [
  { id:'brokerDash',  label:'Dashboard',  icon:'◧' },
  { id:'brokerList',  label:'Portfolio',  icon:'⊞', badge:'24' },
  { id:'brokerInq',   label:'Leads',      icon:'◐', badge:'12', badgeTone:'danger' },
  { id:'brokerCommission', label:'Commission', icon:'₹' },
  { id:'ownerNew',    label:'Add listing', icon:'＋' },
  { divider:'account' },
  { id:'settings', label:'Settings', icon:'⚙' },
  { id:'home', label:'Back to site', icon:'↗' },
];

// ─── CLIENT DASHBOARD ─────────────────────────────────────────────────────
function ClientDashPage({nav}) {
  const saved = LISTINGS.slice(2, 7);
  const transactions = [
    { id:"TXN-89231", listing:LISTINGS[0], date:"24 Nov 2025", amount:6250, status:"completed" },
    { id:"TXN-88770", listing:LISTINGS[3], date:"12 Nov 2025", amount:9800, status:"completed" },
    { id:"TXN-88401", listing:LISTINGS[5], date:"5 Nov 2025",  amount:5200, status:"refunded" },
  ];

  return (
    <PortalShell user={CLIENT_USER} navItems={CLIENT_NAV()} current="clientDash" onNav={(id)=>nav(id)}>
      <DashHeader title="Hi Aanya."
        subtitle="Where you left off in your house hunt."
        actions={<button className="btn btn-brand btn-sm" onClick={()=>nav('search')}>＋ New search</button>}/>

      <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:14, marginBottom:24}}>
        <StatCard label="Shortlisted" value={`${saved.length}`} sub="across 3 cities"/>
        <StatCard label="Unlocked" value={`${transactions.filter(t=>t.status==='completed').length}`} sub="contacts"/>
        <StatCard label="Saved searches" value="3" sub="12 new matches today"/>
        <StatCard label="Profile" value="76%" sub="complete" color="var(--accent-500)"/>
      </div>

      {/* profile completion banner */}
      <div className="card" style={{padding:'18px 22px', display:'flex', alignItems:'center', gap:18, marginBottom:24, background:'var(--brand-50)', border:0}}>
        <div style={{width:48, height:48, borderRadius:'50%', background:'var(--brand-500)', color:'#fff', display:'grid', placeItems:'center', fontSize:20}}>◌</div>
        <div style={{flex:1}}>
          <div style={{fontSize:14, fontWeight:600, color:'var(--brand-900)'}}>Complete your profile to get owners' attention</div>
          <div style={{fontSize:12, color:'var(--brand-700)', marginTop:2}}>Verified tenants get replies 2.3× faster. Add income proof & employment to finish.</div>
          <div style={{height:6, background:'rgba(255,255,255,.5)', borderRadius:99, marginTop:10, overflow:'hidden'}}>
            <div style={{height:'100%', width:'76%', background:'var(--brand-500)', borderRadius:99}}/>
          </div>
        </div>
        <button className="btn btn-brand btn-sm">Complete</button>
      </div>

      {/* shortlisted */}
      <div style={{marginBottom:32}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:14}}>
          <div className="font-display" style={{fontSize:18, fontWeight:700, letterSpacing:'-0.02em'}}>Your shortlist</div>
          <button className="btn btn-ghost btn-sm" onClick={()=>nav('clientShort')}>See all {saved.length} →</button>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:14}}>
          {saved.slice(0,4).map(l=>(
            <ListingCard key={l.id} listing={l}
              onOpen={()=>nav('detail', l.id)}
              onUnlock={(li)=>nav('unlock', li.id)}
              saved={true}
              onSave={()=>{}}/>
          ))}
        </div>
      </div>

      {/* saved searches */}
      <div style={{marginBottom:32}}>
        <div className="font-display" style={{fontSize:18, fontWeight:700, letterSpacing:'-0.02em', marginBottom:14}}>Saved searches</div>
        <div className="card" style={{padding:0, overflow:'hidden'}}>
          {[
            { q:"2 BHK · Koramangala, Bangalore · ₹30k-₹50k", new:12 },
            { q:"3 BHK Furnished · Powai, Mumbai · ₹70k+", new:5 },
            { q:"Studio · Indiranagar, Bangalore", new:0 },
          ].map((s, i)=>(
            <div key={i} style={{padding:'16px 22px', borderTop: i===0?0:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <div>
                <div style={{fontSize:14, fontWeight:600}}>{s.q}</div>
                <div style={{fontSize:11, color:'var(--text-muted)', marginTop:2}}>Alerts via SMS, daily digest</div>
              </div>
              <div style={{display:'flex', alignItems:'center', gap:10}}>
                {s.new > 0 && <span className="chip chip-accent" style={{height:22, fontSize:11}}>{s.new} new</span>}
                <button className="btn btn-outline btn-sm" onClick={()=>nav('search')}>View matches</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* transaction history */}
      <div>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:14}}>
          <div className="font-display" style={{fontSize:18, fontWeight:700, letterSpacing:'-0.02em'}}>Transaction history</div>
          <button className="btn btn-ghost btn-sm" onClick={()=>nav('clientTx')}>View all →</button>
        </div>
        <div className="card" style={{padding:0, overflow:'hidden'}}>
          <table style={{width:'100%', borderCollapse:'collapse', fontSize:13}}>
            <thead>
              <tr style={{textAlign:'left', color:'var(--text-muted)', fontSize:11, textTransform:'uppercase', letterSpacing:'.08em', fontWeight:600}}>
                <th style={{padding:'12px 22px'}}>Property</th>
                <th style={{padding:'12px 22px'}}>Date</th>
                <th style={{padding:'12px 22px'}}>Amount</th>
                <th style={{padding:'12px 22px'}}>Status</th>
                <th style={{padding:'12px 22px', textAlign:'right'}}>Invoice</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(t=>(
                <tr key={t.id} style={{borderTop:'1px solid var(--border)'}}>
                  <td style={{padding:'14px 22px'}}>
                    <div style={{display:'flex', alignItems:'center', gap:12}}>
                      <Img src={t.listing.photo} style={{width:40, height:40, borderRadius:'var(--r-sm)'}}/>
                      <div>
                        <div style={{fontWeight:600}}>{t.listing.bhk} BHK · {t.listing.locality}</div>
                        <div style={{fontSize:11, color:'var(--text-muted)', fontFamily:'var(--f-mono)'}}>{t.id}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{padding:'14px 22px', color:'var(--text-muted)'}}>{t.date}</td>
                  <td style={{padding:'14px 22px', fontWeight:700, fontVariantNumeric:'tabular-nums'}}>₹{t.amount.toLocaleString("en-IN")}</td>
                  <td style={{padding:'14px 22px'}}>{t.status === 'refunded' ? <span style={{fontSize:11, color:'var(--text-muted)', fontWeight:600}}>↺ Refunded</span> : <span style={{fontSize:11, color:'var(--success)', fontWeight:600}}>✓ Completed</span>}</td>
                  <td style={{padding:'14px 22px', textAlign:'right'}}>
                    <button className="btn btn-ghost btn-sm"><Icon.download/> PDF</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PortalShell>
  );
}

// ─── BROKER DASHBOARD ─────────────────────────────────────────────────────
function BrokerDashPage({nav}) {
  const myListings = LISTINGS.slice(0, 6).map((l, i) => ({
    ...l,
    status: ["live","live","live","pending","rented","live"][i],
    owner: ["A. Khanna","P. Iyer","R. Verma","S. Rao","M. Kapoor","D. Nair"][i],
    commission: [38000, 0, 42000, 0, 95000, 38000][i],
  }));

  return (
    <PortalShell user={BROKER_USER} navItems={BROKER_NAV()} current="brokerDash" onNav={(id)=>nav(id)}>
      <DashHeader title="Vikram's desk"
        subtitle="24 active listings · 3 cities · ₹4.2L closed this quarter"
        actions={
          <>
            <button className="btn btn-outline btn-sm">Download report</button>
            <button className="btn btn-brand btn-sm" onClick={()=>nav('ownerNew')}>＋ Add listing</button>
          </>
        }/>

      <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:14, marginBottom:24}}>
        <StatCard label="Active listings" value="24" trend="+4" sub="this month"/>
        <StatCard label="Unlocks this month" value="142" trend="+28%" sub="vs last"/>
        <StatCard label="Deals closed (Q4)" value="6" sub="₹4.2L commission"/>
        <StatCard label="Avg time to close" value="11 days" trend="-2 days" sub="vs industry 32"/>
      </div>

      {/* RERA badge & growth */}
      <div style={{display:'grid', gridTemplateColumns:'1fr 1.4fr', gap:16, marginBottom:24}}>
        <div className="card" style={{padding:24, background:'var(--text)', color:'var(--bg)', border:0}}>
          <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:14}}>
            <span style={{fontSize:18, color:'var(--success)'}}><Icon.shield/></span>
            <div style={{fontSize:11, opacity:.7, fontWeight:600, textTransform:'uppercase', letterSpacing:'.08em'}}>RERA Verified</div>
          </div>
          <div className="font-display" style={{fontSize:24, fontWeight:800, letterSpacing:'-0.025em'}}>KA/RERA/AGT/1234</div>
          <div style={{fontSize:13, opacity:.7, marginTop:6}}>Valid until Mar 2027 · Karnataka</div>
          <div style={{height:1, background:'rgba(255,255,255,.12)', margin:'18px 0'}}/>
          <div className="font-display" style={{fontSize:14, fontWeight:600}}>Verified Broker badge active</div>
          <div style={{fontSize:12, opacity:.7, marginTop:4}}>Your listings get a green shield. Tenants trust them 4.2× more.</div>
        </div>

        <div className="card" style={{padding:24}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline'}}>
            <div>
              <div style={{fontSize:11, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.08em'}}>Commission earned · last 6 months</div>
              <div className="font-display" style={{fontSize:36, fontWeight:800, letterSpacing:'-0.035em', marginTop:4}}>₹12.4 Lakh</div>
              <div style={{fontSize:12, color:'var(--success)', fontWeight:600, marginTop:4}}>+34% vs previous 6 months</div>
            </div>
            <select className="input select btn-sm" style={{height:32, fontSize:12}}><option>6 months</option><option>12 months</option></select>
          </div>
          <div style={{display:'flex', alignItems:'flex-end', gap:6, height:120, marginTop:18}}>
            {[40, 55, 38, 72, 86, 110, 142, 138, 165, 188, 220, 248].map((v, i)=>(
              <div key={i} style={{flex:1, display:'flex', flexDirection:'column', justifyContent:'flex-end', height:'100%'}}>
                <div style={{height:`${(v/260)*100}%`, background: i === 11 ? 'var(--brand-500)' : 'var(--surface-sunken)', borderRadius:4, transition:'all .3s'}}/>
              </div>
            ))}
          </div>
          <div style={{display:'flex', justifyContent:'space-between', marginTop:6, fontSize:10, color:'var(--text-faint)'}}>
            <span>Jan</span><span>Mar</span><span>May</span><span>Jul</span><span>Sep</span><span>Nov</span>
          </div>
        </div>
      </div>

      {/* portfolio table */}
      <div className="card" style={{padding:0, overflow:'hidden'}}>
        <div style={{padding:'18px 22px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div className="font-display" style={{fontSize:18, fontWeight:700, letterSpacing:'-0.02em'}}>Your portfolio</div>
          <div style={{display:'flex', gap:8}}>
            <input className="input btn-sm" placeholder="Search listings…" style={{height:32, fontSize:12, width:220}}/>
            <select className="input select btn-sm" style={{height:32, fontSize:12}}><option>All cities</option><option>Bangalore</option><option>Mumbai</option></select>
          </div>
        </div>
        <table style={{width:'100%', borderCollapse:'collapse', fontSize:13}}>
          <thead>
            <tr style={{textAlign:'left', color:'var(--text-muted)', fontSize:11, textTransform:'uppercase', letterSpacing:'.08em', fontWeight:600}}>
              <th style={{padding:'12px 22px'}}>Property</th>
              <th style={{padding:'12px 22px'}}>Owner (internal)</th>
              <th style={{padding:'12px 22px'}}>Status</th>
              <th style={{padding:'12px 22px'}}>Unlocks</th>
              <th style={{padding:'12px 22px'}}>Commission</th>
              <th style={{padding:'12px 22px', textAlign:'right'}}></th>
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
                      <div style={{fontSize:11, color:'var(--text-muted)'}}>ID {l.id}</div>
                    </div>
                  </div>
                </td>
                <td style={{padding:'14px 22px', color:'var(--text-muted)'}}>{l.owner}</td>
                <td style={{padding:'14px 22px'}}><StatusBadge status={l.status}/></td>
                <td style={{padding:'14px 22px', fontWeight:600, fontVariantNumeric:'tabular-nums'}}>{Math.floor(l.pop/4)}</td>
                <td style={{padding:'14px 22px', fontWeight:700, color: l.commission > 0 ? 'var(--success)' : 'var(--text-muted)'}}>
                  {l.commission > 0 ? `+₹${l.commission.toLocaleString("en-IN")}` : "—"}
                </td>
                <td style={{padding:'14px 22px', textAlign:'right'}}>
                  <button className="btn btn-ghost btn-sm" onClick={()=>nav('detail', l.id)}>View →</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PortalShell>
  );
}

Object.assign(window, { ClientDashPage, BrokerDashPage });
