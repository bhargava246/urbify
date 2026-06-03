// admin-pages.jsx — Admin Dashboard + Moderation Queue

const ADMIN_USER = { initials:"OM", name:"Ops · Maya", role:"Admin · L2", color:'#7C3AED' };

const ADMIN_NAV = () => [
  { id:'adminDash', label:'Overview', icon:'◧' },
  { id:'adminMod',  label:'Moderation', icon:'⌗', badge:'14', badgeTone:'danger' },
  { id:'adminUsers', label:'Users', icon:'◐' },
  { id:'adminRev',   label:'Revenue', icon:'₹' },
  { id:'adminCms',   label:'CMS / SEO', icon:'✍' },
  { divider:'system' },
  { id:'settings', label:'Settings', icon:'⚙' },
  { id:'home', label:'Back to site', icon:'↗' },
];

// ─── Admin Dashboard ──────────────────────────────────────────────────────
function AdminDashPage({nav}) {
  return (
    <PortalShell user={ADMIN_USER} navItems={ADMIN_NAV()} current="adminDash" onNav={(id)=>nav(id)}>
      <DashHeader title="Platform overview"
        subtitle="Tue, 17 Nov 2026 · last 30 days"
        actions={
          <>
            <select className="input select btn-sm" style={{height:34, fontSize:13}}><option>Last 30 days</option><option>This quarter</option></select>
            <button className="btn btn-outline btn-sm">Export</button>
          </>
        }/>

      {/* alerts strip */}
      <div className="card" style={{padding:'14px 18px', display:'flex', alignItems:'center', gap:14, marginBottom:24, background:'#FEE2E2', border:0}}>
        <div style={{width:36, height:36, borderRadius:'var(--r-sm)', background:'#FCA5A5', color:'#7F1D1D', display:'grid', placeItems:'center', fontSize:18}}>!</div>
        <div style={{flex:1, fontSize:13, color:'#7F1D1D'}}>
          <strong>3 payment disputes pending review.</strong> SLA breach in 4h 12m. <span style={{opacity:.7}}>· 2 listings flagged by AI moderation</span>
        </div>
        <button className="btn btn-sm" style={{background:'#7F1D1D', color:'#fff', border:0}}>Review now →</button>
      </div>

      {/* primary KPIs */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:14, marginBottom:24}}>
        <StatCard label="Revenue (30d)" value="₹48.2L" trend="+18.6%" sub="vs prev period"/>
        <StatCard label="Unlocks" value="1,284" trend="+22%" sub="paid contact reveals"/>
        <StatCard label="Active listings" value="12,402" trend="+412" sub="net add"/>
        <StatCard label="New signups" value="3,841" trend="+8.2%" sub="across roles"/>
      </div>

      {/* charts */}
      <div style={{display:'grid', gridTemplateColumns:'1.6fr 1fr', gap:16, marginBottom:24}}>
        <div className="card" style={{padding:24}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:14}}>
            <div>
              <div style={{fontSize:11, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.08em'}}>Revenue · daily</div>
              <div className="font-display" style={{fontSize:32, fontWeight:800, letterSpacing:'-0.03em', marginTop:6}}>₹48,21,400</div>
            </div>
            <div style={{display:'flex', gap:14, fontSize:12}}>
              <div style={{display:'flex', alignItems:'center', gap:6}}><span style={{width:8, height:8, background:'var(--brand-500)', borderRadius:99}}/> Net</div>
              <div style={{display:'flex', alignItems:'center', gap:6}}><span style={{width:8, height:8, background:'var(--accent-500)', borderRadius:99}}/> GST</div>
            </div>
          </div>

          <svg viewBox="0 0 600 200" style={{width:'100%', height:200}}>
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--brand-500)" stopOpacity="0.3"/>
                <stop offset="100%" stopColor="var(--brand-500)" stopOpacity="0"/>
              </linearGradient>
            </defs>
            <path d="M0 160 L 40 140 L 80 150 L 120 100 L 160 110 L 200 80 L 240 95 L 280 60 L 320 75 L 360 50 L 400 65 L 440 30 L 480 45 L 520 25 L 560 40 L 600 20 L 600 200 L 0 200 Z" fill="url(#grad)"/>
            <path d="M0 160 L 40 140 L 80 150 L 120 100 L 160 110 L 200 80 L 240 95 L 280 60 L 320 75 L 360 50 L 400 65 L 440 30 L 480 45 L 520 25 L 560 40 L 600 20" fill="none" stroke="var(--brand-500)" strokeWidth="2.5"/>
            {/* axis */}
            <line x1="0" y1="180" x2="600" y2="180" stroke="var(--border)"/>
          </svg>
          <div style={{display:'flex', justifyContent:'space-between', marginTop:6, fontSize:10, color:'var(--text-faint)'}}>
            <span>Oct 17</span><span>Oct 24</span><span>Oct 31</span><span>Nov 7</span><span>Nov 14</span><span>Today</span>
          </div>
        </div>

        <div className="card" style={{padding:24}}>
          <div style={{fontSize:11, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.08em', marginBottom:14}}>Top cities by revenue</div>
          {[
            { city:"Bangalore", val:1820000, pct:38 },
            { city:"Mumbai", val:1320000, pct:27 },
            { city:"Pune", val:680000, pct:14 },
            { city:"Hyderabad", val:540000, pct:11 },
            { city:"Delhi NCR", val:480000, pct:10 },
          ].map((c, i)=>(
            <div key={c.city} style={{marginBottom:14}}>
              <div style={{display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:6}}>
                <span style={{fontWeight:500}}>{c.city}</span>
                <span style={{fontWeight:700, fontVariantNumeric:'tabular-nums'}}>₹{(c.val/100000).toFixed(1)}L</span>
              </div>
              <div style={{height:6, background:'var(--surface-sunken)', borderRadius:99, overflow:'hidden'}}>
                <div style={{height:'100%', width:`${c.pct*2.6}%`, background: i===0?'var(--brand-500)':'var(--surface-sunken)', backgroundColor: `color-mix(in oklab, var(--brand-500) ${100-i*15}%, var(--surface-sunken))`, borderRadius:99}}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* second row */}
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16, marginBottom:24}}>
        <div className="card" style={{padding:22}}>
          <div style={{fontSize:11, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.08em'}}>Listings · status</div>
          <div style={{display:'flex', alignItems:'center', gap:16, marginTop:18}}>
            <div style={{width:120, height:120, position:'relative'}}>
              <svg viewBox="0 0 36 36" style={{width:'100%', height:'100%', transform:'rotate(-90deg)'}}>
                <circle cx="18" cy="18" r="14" fill="none" stroke="var(--surface-sunken)" strokeWidth="5"/>
                <circle cx="18" cy="18" r="14" fill="none" stroke="var(--brand-500)" strokeWidth="5" strokeDasharray="56 88" strokeLinecap="round"/>
                <circle cx="18" cy="18" r="14" fill="none" stroke="var(--accent-500)" strokeWidth="5" strokeDasharray="18 88" strokeDashoffset="-56" strokeLinecap="round"/>
                <circle cx="18" cy="18" r="14" fill="none" stroke="var(--text-faint)" strokeWidth="5" strokeDasharray="8 88" strokeDashoffset="-74" strokeLinecap="round"/>
              </svg>
              <div style={{position:'absolute', inset:0, display:'grid', placeItems:'center'}}>
                <div style={{textAlign:'center'}}>
                  <div className="font-display" style={{fontSize:24, fontWeight:800, letterSpacing:'-0.03em'}}>12.4k</div>
                  <div style={{fontSize:10, color:'var(--text-muted)'}}>total</div>
                </div>
              </div>
            </div>
            <div style={{flex:1, display:'flex', flexDirection:'column', gap:8, fontSize:12}}>
              <Legend color="var(--brand-500)" label="Live" value="8,420"/>
              <Legend color="var(--accent-500)" label="Pending" value="2,180"/>
              <Legend color="var(--text-faint)" label="Rented" value="1,202"/>
              <Legend color="var(--surface-sunken)" label="Expired" value="600"/>
            </div>
          </div>
        </div>

        <div className="card" style={{padding:22}}>
          <div style={{fontSize:11, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.08em'}}>Moderation queue</div>
          <div className="font-display" style={{fontSize:48, fontWeight:800, letterSpacing:'-0.04em', marginTop:8}}>14</div>
          <div style={{fontSize:12, color:'var(--text-muted)'}}>listings awaiting review</div>
          <div style={{display:'flex', gap:6, marginTop:14, fontSize:11}}>
            <span className="chip chip-accent">2 flagged</span>
            <span className="chip">SLA 1h 24m</span>
          </div>
          <button className="btn btn-brand btn-sm" style={{width:'100%', marginTop:18}} onClick={()=>nav('adminMod')}>Open queue →</button>
        </div>

        <div className="card" style={{padding:22}}>
          <div style={{fontSize:11, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.08em'}}>Refund rate</div>
          <div className="font-display" style={{fontSize:48, fontWeight:800, letterSpacing:'-0.04em', marginTop:8}}>0.34%</div>
          <div style={{fontSize:12, color:'var(--success)', fontWeight:600}}>↓ 0.12% vs last month</div>
          <div style={{marginTop:18, padding:'10px 12px', background:'var(--surface-sunken)', borderRadius:8, fontSize:12, color:'var(--text-muted)'}}>
            Most refunds: invalid address (52%)
          </div>
        </div>
      </div>

      {/* recent activity */}
      <div className="card" style={{padding:0, overflow:'hidden'}}>
        <div style={{padding:'18px 22px', borderBottom:'1px solid var(--border)'}}>
          <div className="font-display" style={{fontSize:18, fontWeight:700, letterSpacing:'-0.02em'}}>Real-time activity</div>
        </div>
        {[
          { e:"Listing approved", det:"URB-1042 · 2 BHK Koramangala by Vikram K.", who:"Maya · 2 min ago", tone:"success" },
          { e:"Refund processed", det:"TXN-89102 · ₹6,250 → wallet (invalid address)", who:"Auto · 14 min ago", tone:"warn" },
          { e:"New broker verified", det:"Aditi Joshi · RERA MH-4521", who:"Maya · 28 min ago", tone:"info" },
          { e:"Listing flagged", det:"URB-1031 · duplicate photos detected", who:"AI · 42 min ago", tone:"danger" },
          { e:"Listing rejected", det:"URB-1009 · low-quality photos, asked to resubmit", who:"Karan · 1 h ago", tone:"danger" },
        ].map((a, i)=>(
          <div key={i} style={{padding:'14px 22px', borderTop: i===0?0:'1px solid var(--border)', display:'flex', alignItems:'center', gap:14}}>
            <div style={{width:8, height:8, borderRadius:99, background:
              a.tone === 'success' ? 'var(--success)' :
              a.tone === 'warn' ? 'var(--warning)' :
              a.tone === 'danger' ? 'var(--error)' : 'var(--info)'}}/>
            <div style={{flex:1, fontSize:13}}>
              <span style={{fontWeight:600}}>{a.e}</span> · <span style={{color:'var(--text-muted)'}}>{a.det}</span>
            </div>
            <div style={{fontSize:11, color:'var(--text-faint)'}}>{a.who}</div>
          </div>
        ))}
      </div>
    </PortalShell>
  );
}

function Legend({color, label, value}) {
  return (
    <div style={{display:'flex', alignItems:'center', gap:8}}>
      <span style={{width:8, height:8, borderRadius:99, background:color}}/>
      <span style={{flex:1, color:'var(--text-muted)'}}>{label}</span>
      <span style={{fontWeight:700, fontVariantNumeric:'tabular-nums'}}>{value}</span>
    </div>
  );
}

// ─── Moderation Queue ─────────────────────────────────────────────────────
function AdminModPage({nav}) {
  const [activeIdx, setActiveIdx] = useState(0);
  const queue = LISTINGS.slice(0, 6).map((l, i) => ({
    ...l,
    submittedBy: ["Vikram K. (Broker)","Anita R.","Rohit M.","Priya S.","Karan T. (Broker)","Manish J."][i],
    submitted: ["12 min ago","34 min ago","1 h ago","1.5 h ago","2 h ago","3 h ago"][i],
    sla: ["1h 48m","1h 26m","1h 00m","30 min","-12 min","-1h 12m"][i],
    overdue: i >= 4,
    flags: [
      [], 
      [{type:'AI', label:'Quality 7/10'}], 
      [], 
      [{type:'AI', label:'Possible duplicate'}], 
      [{type:'AI', label:'Photo dark'}, {type:'AI', label:'Quality 4/10'}], 
      [{type:'User', label:'Reported by 3 users'}]
    ][i],
  }));
  const active = queue[activeIdx];

  return (
    <PortalShell user={ADMIN_USER} navItems={ADMIN_NAV()} current="adminMod" onNav={(id)=>nav(id)}>
      <DashHeader title="Moderation queue"
        subtitle={`${queue.length} listings · SLA target < 2h · ${queue.filter(q=>q.overdue).length} overdue`}
        actions={
          <>
            <select className="input select btn-sm" style={{height:34, fontSize:13}}><option>All flags</option><option>AI flagged</option><option>User reported</option></select>
            <button className="btn btn-outline btn-sm">Bulk approve safe</button>
          </>
        }/>

      <div style={{display:'grid', gridTemplateColumns:'380px 1fr', gap:16, alignItems:'start'}}>
        {/* Queue list */}
        <div className="card" style={{padding:0, overflow:'hidden', position:'sticky', top:96, maxHeight:'calc(100vh - 120px)', overflowY:'auto'}}>
          {queue.map((q, i)=>(
            <div key={q.id} onClick={()=>setActiveIdx(i)} style={{
              padding:'14px 16px', borderTop: i===0?0:'1px solid var(--border)',
              cursor:'pointer',
              background: i === activeIdx ? 'var(--surface-sunken)' : 'transparent',
              display:'flex', alignItems:'center', gap:12,
              borderLeft: '3px solid', borderLeftColor: i === activeIdx ? 'var(--text)' : 'transparent',
            }}>
              <Img src={q.photo} style={{width:54, height:54, borderRadius:'var(--r-sm)', flexShrink:0}}/>
              <div style={{flex:1, minWidth:0}}>
                <div style={{fontSize:13, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{q.bhk} BHK · {q.locality}</div>
                <div style={{fontSize:11, color:'var(--text-muted)', marginTop:2}}>{q.submittedBy}</div>
                <div style={{display:'flex', gap:6, marginTop:6}}>
                  {q.flags.length > 0 && <span className="chip chip-accent" style={{height:18, fontSize:10, padding:'0 6px'}}>{q.flags.length} flag{q.flags.length>1?'s':''}</span>}
                  <span className="chip" style={{height:18, fontSize:10, padding:'0 6px', background: q.overdue ? '#FEE2E2' : 'var(--surface-sunken)', color: q.overdue ? '#7F1D1D' : 'var(--text-muted)', border:0, fontVariantNumeric:'tabular-nums'}}>
                    {q.overdue ? `OVR ${q.sla.replace('-','')}` : q.sla}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Active detail */}
        <div className="card" style={{padding:0, overflow:'hidden'}}>
          <div style={{padding:'18px 24px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12}}>
            <div>
              <div className="font-display" style={{fontSize:20, fontWeight:800, letterSpacing:'-0.025em'}}>{active.bhk} BHK in {active.locality}</div>
              <div style={{fontSize:12, color:'var(--text-muted)', marginTop:4}}>
                ID <span style={{fontFamily:'var(--f-mono)'}}>{active.id}</span> · Submitted {active.submitted} by {active.submittedBy}
              </div>
            </div>
            <div style={{display:'flex', gap:8}}>
              <button className="btn btn-outline btn-sm">Request changes</button>
              <button className="btn btn-sm" style={{background:'var(--error)', color:'#fff', border:0}}>Reject</button>
              <button className="btn btn-sm" style={{background:'var(--success)', color:'#fff', border:0}}>Approve</button>
            </div>
          </div>

          {/* gallery */}
          <div style={{padding:24}}>
            <div style={{display:'grid', gridTemplateColumns:'1.6fr 1fr 1fr', gap:8, height:320, borderRadius:'var(--r-md)', overflow:'hidden'}}>
              <Img src={active.photos[0]}/>
              <Img src={active.photos[1]}/>
              <Img src={active.photos[2]}/>
            </div>

            {/* flags */}
            {active.flags.length > 0 && (
              <div style={{marginTop:20, padding:'14px 18px', borderRadius:'var(--r-md)', background:'#FEF3C7'}}>
                <div style={{fontSize:12, fontWeight:600, color:'#78350F', marginBottom:8, textTransform:'uppercase', letterSpacing:'.08em'}}>Pre-screening flags</div>
                <div style={{display:'flex', flexWrap:'wrap', gap:8}}>
                  {active.flags.map((f, i)=>(
                    <span key={i} style={{
                      padding:'5px 10px', borderRadius:99, background:'#fff', border:'1px solid #FCD34D',
                      fontSize:12, color:'#78350F', fontWeight:500,
                      display:'inline-flex', alignItems:'center', gap:6,
                    }}>
                      <span style={{fontSize:10, fontWeight:700, color:'#92400E'}}>{f.type}</span>
                      {f.label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* property details */}
            <div style={{marginTop:20, display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:14}}>
              <Spec label="Carpet area" value={`${active.area.toLocaleString("en-IN")} sq ft`}/>
              <Spec label="Floor" value={`${active.floor} of ${active.total}`}/>
              <Spec label="Furnishing" value={active.furnishing}/>
              <Spec label="Rent" value={`₹${active.rentK}k`}/>
            </div>

            {/* address (shown blurred) */}
            <div style={{marginTop:24, padding:'16px 20px', background:'var(--surface-sunken)', borderRadius:'var(--r-md)'}}>
              <div style={{fontSize:11, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.08em', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <span><Icon.lock/> Full address (admin only)</span>
                <button className="btn btn-ghost btn-sm">Reveal for review</button>
              </div>
              <div className="font-mono" style={{marginTop:8, filter:'blur(6px)', userSelect:'none', fontSize:14, fontWeight:600}}>
                #{active.id.slice(-3)}, 4th Block, 80 Feet Road, {active.locality}, {active.city} 560034
              </div>
            </div>
          </div>
        </div>
      </div>
    </PortalShell>
  );
}

Object.assign(window, { AdminDashPage, AdminModPage });
