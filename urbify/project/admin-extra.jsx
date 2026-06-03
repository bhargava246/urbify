// admin-extra.jsx — Admin Users, Revenue, CMS

// ─── ADMIN USERS ──────────────────────────────────────────────────────────
function AdminUsersPage({nav}) {
  const [filter, setFilter] = useState("all");

  const users = [
    { initials:"VK", name:"Vikram Kumar", phone:"+91 98450•••12", role:"broker", joined:"Mar 2024", listings:24, unlocks:142, status:"verified", rera:"KA/RERA/AGT/1234", color:'var(--brand-500)' },
    { initials:"AS", name:"Aanya Sharma", phone:"+91 98217•••42", role:"tenant", joined:"Nov 2025", listings:0, unlocks:8, status:"verified", color:'var(--accent-500)' },
    { initials:"RP", name:"Rohan Pillai", phone:"+91 98455•••18", role:"owner", joined:"Jan 2025", listings:3, unlocks:42, status:"verified", color:'#7C3AED' },
    { initials:"MJ", name:"Manish J.", phone:"+91 81234•••00", role:"owner", joined:"May 2026", listings:1, unlocks:0, status:"pending", color:'#10B981' },
    { initials:"PS", name:"Priya Singh", phone:"+91 90000•••72", role:"tenant", joined:"Apr 2026", listings:0, unlocks:0, status:"verified", color:'#EF4444' },
    { initials:"KT", name:"Karan T.", phone:"+91 78900•••11", role:"broker", joined:"Feb 2025", listings:18, unlocks:96, status:"flagged", rera:"MH/RERA/AGT/5142", color:'#0EA5E9' },
    { initials:"DN", name:"Dhruv Nair", phone:"+91 87543•••28", role:"owner", joined:"Jul 2025", listings:5, unlocks:31, status:"verified", color:'#F59E0B' },
    { initials:"AK", name:"Aditi Joshi", phone:"+91 99860•••11", role:"broker", joined:"May 2026", listings:0, unlocks:0, status:"pending", rera:"MH-4521 (verifying)", color:'#06B6D4' },
  ];

  const filtered = filter === "all" ? users : users.filter(u=>u.role === filter);

  return (
    <PortalShell user={ADMIN_USER} navItems={ADMIN_NAV()} current="adminUsers" onNav={(id)=>nav(id)}>
      <DashHeader title="Users"
        subtitle={`${users.length.toLocaleString()} active accounts · ${users.filter(u=>u.status==='pending').length} pending verification`}
        actions={
          <>
            <button className="btn btn-outline btn-sm">Export CSV</button>
            <button className="btn btn-brand btn-sm">＋ Invite admin</button>
          </>
        }/>

      {/* filters + search */}
      <div className="card" style={{padding:'16px 20px', display:'flex', alignItems:'center', gap:14, marginBottom:18}}>
        <div style={{display:'flex', gap:6}}>
          {[
            {id:'all', l:`All · 28,402`},
            {id:'owner', l:'Owners · 12,840'},
            {id:'tenant', l:'Tenants · 14,182'},
            {id:'broker', l:'Brokers · 1,380'},
          ].map(t=>(
            <button key={t.id} onClick={()=>setFilter(t.id)}
              style={{
                padding:'7px 14px', borderRadius:99,
                border:'1.5px solid', borderColor: filter===t.id?'var(--text)':'var(--border)',
                background: filter===t.id?'var(--text)':'transparent',
                color: filter===t.id?'var(--bg)':'var(--text)',
                fontSize:12, fontWeight:600, cursor:'pointer',
              }}>{t.l}</button>
          ))}
        </div>
        <div style={{flex:1}}/>
        <div style={{display:'flex', alignItems:'center', gap:8, padding:'0 12px', background:'var(--surface-sunken)', borderRadius:'var(--r-sm)', height:36, width:280}}>
          <Icon.search/>
          <input className="input" placeholder="Search name, phone, RERA…" style={{border:0, background:'transparent', padding:0, height:'auto', flex:1, fontSize:13}}/>
        </div>
        <select className="input select btn-sm" style={{height:36, fontSize:12}}><option>Any status</option><option>Verified</option><option>Pending</option><option>Flagged</option></select>
      </div>

      {/* table */}
      <div className="card" style={{padding:0, overflow:'hidden'}}>
        <table style={{width:'100%', borderCollapse:'collapse', fontSize:13}}>
          <thead style={{background:'var(--surface-sunken)'}}>
            <tr style={{textAlign:'left', color:'var(--text-muted)', fontSize:11, textTransform:'uppercase', letterSpacing:'.08em', fontWeight:600}}>
              <th style={{padding:'12px 22px'}}>User</th>
              <th style={{padding:'12px 22px'}}>Role</th>
              <th style={{padding:'12px 22px'}}>Joined</th>
              <th style={{padding:'12px 22px'}}>Listings</th>
              <th style={{padding:'12px 22px'}}>Unlocks</th>
              <th style={{padding:'12px 22px'}}>Status</th>
              <th style={{padding:'12px 22px', textAlign:'right'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u=>(
              <tr key={u.name} style={{borderTop:'1px solid var(--border)'}}>
                <td style={{padding:'14px 22px'}}>
                  <div style={{display:'flex', alignItems:'center', gap:12}}>
                    <div style={{width:36, height:36, borderRadius:'50%', background:u.color, color:'#fff', display:'grid', placeItems:'center', fontSize:12, fontWeight:700}}>{u.initials}</div>
                    <div>
                      <div style={{fontWeight:600}}>{u.name}</div>
                      <div style={{fontSize:11, color:'var(--text-muted)', fontFamily:'var(--f-mono)'}}>{u.phone}</div>
                    </div>
                  </div>
                </td>
                <td style={{padding:'14px 22px'}}>
                  <div style={{display:'flex', flexDirection:'column'}}>
                    <span style={{fontWeight:600, textTransform:'capitalize'}}>{u.role}</span>
                    {u.rera && <span style={{fontSize:10, color:'var(--text-muted)', fontFamily:'var(--f-mono)'}}>{u.rera}</span>}
                  </div>
                </td>
                <td style={{padding:'14px 22px', color:'var(--text-muted)'}}>{u.joined}</td>
                <td style={{padding:'14px 22px', fontVariantNumeric:'tabular-nums', fontWeight:600}}>{u.listings}</td>
                <td style={{padding:'14px 22px', fontVariantNumeric:'tabular-nums', fontWeight:600}}>{u.unlocks}</td>
                <td style={{padding:'14px 22px'}}>
                  <StatusBadge status={u.status === 'verified' ? 'live' : u.status === 'flagged' ? 'flagged' : 'pending'}/>
                </td>
                <td style={{padding:'14px 22px', textAlign:'right'}}>
                  <div style={{display:'inline-flex', gap:4}}>
                    <button className="btn btn-ghost btn-sm">View</button>
                    {u.status === 'pending' && <button className="btn btn-sm" style={{background:'var(--success)', color:'#fff'}}>Verify</button>}
                    {u.status === 'flagged' && <button className="btn btn-sm" style={{background:'var(--error)', color:'#fff'}}>Review</button>}
                    <button className="btn btn-ghost btn-sm">⋯</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{padding:'14px 22px', borderTop:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:12, color:'var(--text-muted)'}}>
          <span>Showing 1-{filtered.length} of {filter === 'all' ? '28,402' : '~'}</span>
          <div style={{display:'flex', gap:6}}>
            <button className="btn btn-outline btn-sm">← Prev</button>
            <button className="btn btn-outline btn-sm">Next →</button>
          </div>
        </div>
      </div>
    </PortalShell>
  );
}

// ─── ADMIN REVENUE ────────────────────────────────────────────────────────
function AdminRevenuePage({nav}) {
  return (
    <PortalShell user={ADMIN_USER} navItems={ADMIN_NAV()} current="adminRev" onNav={(id)=>nav(id)}>
      <DashHeader title="Revenue & analytics"
        subtitle="Q4 2026 · last 30 days"
        actions={
          <>
            <select className="input select btn-sm" style={{height:34, fontSize:13}}><option>Last 30 days</option><option>This quarter</option><option>Year to date</option></select>
            <button className="btn btn-outline btn-sm"><Icon.download/> Report</button>
          </>
        }/>

      {/* big number row */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:14, marginBottom:24}}>
        <StatCard label="Gross revenue (30d)" value="₹48.2L" trend="+18.6%" sub="vs prev period"/>
        <StatCard label="GST collected" value="₹7.4L" sub="18% of gross"/>
        <StatCard label="Net revenue" value="₹40.8L" trend="+19.2%" sub="post-GST"/>
        <StatCard label="Refunds processed" value="₹16,400" sub="0.34% rate"/>
      </div>

      {/* daily chart */}
      <div className="card" style={{padding:28, marginBottom:18}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:14}}>
          <div>
            <div style={{fontSize:13, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.08em'}}>Daily gross revenue</div>
            <div style={{display:'flex', gap:18, alignItems:'baseline', marginTop:6}}>
              <div className="font-display" style={{fontSize:36, fontWeight:800, letterSpacing:'-0.035em'}}>₹48,21,400</div>
              <div style={{color:'var(--success)', fontSize:13, fontWeight:600}}>↑ ₹7.6L vs prev period</div>
            </div>
          </div>
          <div style={{display:'flex', gap:8}}>
            <button className="btn btn-outline btn-sm">Daily</button>
            <button className="btn btn-ghost btn-sm">Weekly</button>
            <button className="btn btn-ghost btn-sm">Monthly</button>
          </div>
        </div>

        <svg viewBox="0 0 1000 280" style={{width:'100%', height:280}}>
          <defs>
            <linearGradient id="rev-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--brand-500)" stopOpacity="0.25"/>
              <stop offset="100%" stopColor="var(--brand-500)" stopOpacity="0"/>
            </linearGradient>
          </defs>
          {/* gridlines */}
          {[0, 56, 112, 168, 224].map((y, i)=>(
            <g key={i}>
              <line x1="50" y1={y+20} x2="1000" y2={y+20} stroke="var(--border)" strokeDasharray="4 4"/>
              <text x="40" y={y+24} fontSize="10" fill="var(--text-faint)" textAnchor="end">
                {["₹2L","₹1.5L","₹1L","₹50k","0"][i]}
              </text>
            </g>
          ))}
          {/* bars */}
          {Array.from({length:30}).map((_, i)=>{
            const v = 60 + Math.sin(i*0.5)*30 + Math.random()*40 + i*4;
            const h = v * 0.7;
            const x = 60 + i*31;
            const today = i === 29;
            return (
              <rect key={i} x={x} y={244 - h} width={20} height={h} rx={3}
                fill={today ? "var(--brand-500)" : `color-mix(in oklab, var(--brand-500) ${30 + i*1.5}%, var(--surface-sunken))`}/>
            );
          })}
          {/* line overlay */}
          <path d={
            "M 60 200 " + Array.from({length:30}).map((_, i)=>{
              const v = 70 + Math.sin(i*0.3)*20 + i*3.5;
              return `L ${72 + i*31} ${244 - v*0.7}`;
            }).join(' ')
          } fill="none" stroke="var(--accent-500)" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>

        <div style={{display:'flex', justifyContent:'space-between', marginTop:8, fontSize:10, color:'var(--text-faint)'}}>
          <span>Oct 17</span><span>Oct 24</span><span>Oct 31</span><span>Nov 7</span><span>Nov 14</span><span>Today</span>
        </div>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:18, marginBottom:18}}>
        {/* By city */}
        <div className="card" style={{padding:24}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline'}}>
            <div style={{fontSize:13, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.08em'}}>Revenue by city</div>
            <button className="btn btn-ghost btn-sm">Export</button>
          </div>
          {[
            { city:"Bangalore", val:1820000, deals:412, growth:"+24%" },
            { city:"Mumbai", val:1320000, deals:298, growth:"+18%" },
            { city:"Pune", val:680000, deals:184, growth:"+32%" },
            { city:"Hyderabad", val:540000, deals:148, growth:"+12%" },
            { city:"Delhi NCR", val:480000, deals:124, growth:"+8%" },
            { city:"Chennai", val:380000, deals:98, growth:"+22%" },
          ].map((c, i)=>(
            <div key={c.city} style={{display:'grid', gridTemplateColumns:'140px 1fr 80px 60px', alignItems:'center', gap:14, padding:'10px 0', borderBottom: i === 5 ? 0 : '1px solid var(--border)'}}>
              <div style={{fontWeight:600, fontSize:14}}>{c.city}</div>
              <div style={{height:8, background:'var(--surface-sunken)', borderRadius:99, overflow:'hidden'}}>
                <div style={{height:'100%', width:`${(c.val/2000000)*100}%`, background: i===0 ? 'var(--brand-500)' : `color-mix(in oklab, var(--brand-500) ${90 - i*12}%, var(--surface-sunken))`, borderRadius:99}}/>
              </div>
              <div style={{fontVariantNumeric:'tabular-nums', fontWeight:700, fontSize:14, textAlign:'right'}}>₹{(c.val/100000).toFixed(1)}L</div>
              <div style={{fontSize:11, color:'var(--success)', fontWeight:600, textAlign:'right'}}>{c.growth}</div>
            </div>
          ))}
        </div>

        {/* Cohort retention */}
        <div className="card" style={{padding:24}}>
          <div style={{fontSize:13, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.08em', marginBottom:14}}>Tenant cohort retention</div>
          <div style={{display:'grid', gridTemplateColumns:'80px repeat(6, 1fr)', gap:4, fontSize:11}}>
            <div></div>
            {["M0","M1","M2","M3","M4","M5"].map(m=><div key={m} style={{textAlign:'center', color:'var(--text-muted)', fontWeight:600, padding:'4px 0'}}>{m}</div>)}
            {[
              { c:"Jul '26", vals:[100, 42, 24, 18, 14, 12] },
              { c:"Aug '26", vals:[100, 48, 28, 22, 18] },
              { c:"Sep '26", vals:[100, 54, 32, 24] },
              { c:"Oct '26", vals:[100, 62, 38] },
              { c:"Nov '26", vals:[100, 68] },
              { c:"Dec '26", vals:[100] },
            ].map(c=>(
              <React.Fragment key={c.c}>
                <div style={{fontSize:11, color:'var(--text-muted)', fontWeight:500, padding:'8px 0', textAlign:'right'}}>{c.c}</div>
                {Array.from({length:6}).map((_, j)=>{
                  const v = c.vals[j];
                  if (v === undefined) return <div key={j}/>;
                  const intensity = v / 100;
                  return (
                    <div key={j} style={{
                      background: `color-mix(in oklab, var(--brand-500) ${intensity*80}%, var(--surface-sunken))`,
                      color: intensity > 0.4 ? '#fff' : 'var(--text)',
                      textAlign:'center', padding:'8px 4px', borderRadius:6,
                      fontSize:11, fontWeight:600,
                      fontVariantNumeric:'tabular-nums',
                    }}>{v}%</div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
          <div style={{marginTop:14, fontSize:12, color:'var(--text-muted)', lineHeight:1.5}}>
            % of tenants who unlock again within N months of their first unlock.
          </div>
        </div>
      </div>

      {/* Recent transactions */}
      <div className="card" style={{padding:0, overflow:'hidden'}}>
        <div style={{padding:'18px 22px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between'}}>
          <div className="font-display" style={{fontSize:18, fontWeight:700, letterSpacing:'-0.02em'}}>Recent transactions</div>
          <button className="btn btn-ghost btn-sm">View all →</button>
        </div>
        <table style={{width:'100%', borderCollapse:'collapse', fontSize:13}}>
          <thead style={{background:'var(--surface-sunken)'}}>
            <tr style={{textAlign:'left', color:'var(--text-muted)', fontSize:11, textTransform:'uppercase', letterSpacing:'.08em', fontWeight:600}}>
              <th style={{padding:'12px 22px'}}>Txn ID</th>
              <th style={{padding:'12px 22px'}}>Tenant</th>
              <th style={{padding:'12px 22px'}}>Listing</th>
              <th style={{padding:'12px 22px'}}>Method</th>
              <th style={{padding:'12px 22px'}}>Amount</th>
              <th style={{padding:'12px 22px'}}>Status</th>
            </tr>
          </thead>
          <tbody>
            {[
              { id:"TXN-89231", who:"+91 98450•••42", listing:LISTINGS[0], method:"UPI", amount:6250, status:"completed", t:"2 min ago" },
              { id:"TXN-89230", who:"+91 90000•••18", listing:LISTINGS[3], method:"Card", amount:9800, status:"completed", t:"14 min ago" },
              { id:"TXN-89229", who:"+91 81234•••00", listing:LISTINGS[1], method:"UPI", amount:5200, status:"completed", t:"38 min ago" },
              { id:"TXN-89228", who:"+91 78900•••11", listing:LISTINGS[5], method:"Card", amount:7400, status:"refunded", t:"1 h ago" },
              { id:"TXN-89227", who:"+91 99860•••28", listing:LISTINGS[2], method:"NetBank", amount:8600, status:"completed", t:"1 h ago" },
              { id:"TXN-89226", who:"+91 87543•••72", listing:LISTINGS[4], method:"UPI", amount:6250, status:"completed", t:"2 h ago" },
            ].map((t)=>(
              <tr key={t.id} style={{borderTop:'1px solid var(--border)'}}>
                <td style={{padding:'14px 22px', fontFamily:'var(--f-mono)', fontSize:12, fontWeight:600}}>{t.id}</td>
                <td style={{padding:'14px 22px', fontFamily:'var(--f-mono)', fontSize:12}}>{t.who}</td>
                <td style={{padding:'14px 22px'}}>
                  <div style={{fontWeight:600}}>{t.listing.bhk} BHK · {t.listing.locality}</div>
                  <div style={{fontSize:11, color:'var(--text-muted)'}}>{t.t}</div>
                </td>
                <td style={{padding:'14px 22px', color:'var(--text-muted)'}}>{t.method}</td>
                <td style={{padding:'14px 22px', fontWeight:700, fontVariantNumeric:'tabular-nums'}}>₹{t.amount.toLocaleString("en-IN")}</td>
                <td style={{padding:'14px 22px'}}>
                  {t.status === 'completed' ? <span style={{fontSize:11, color:'var(--success)', fontWeight:600}}>✓ Completed</span> : <span style={{fontSize:11, color:'var(--text-muted)', fontWeight:600}}>↺ Refunded</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PortalShell>
  );
}

// ─── ADMIN CMS ────────────────────────────────────────────────────────────
function AdminCmsPage({nav}) {
  const [tab, setTab] = useState("blog");

  return (
    <PortalShell user={ADMIN_USER} navItems={ADMIN_NAV()} current="adminCms" onNav={(id)=>nav(id)}>
      <DashHeader title="CMS · SEO"
        subtitle="Blog posts · locality pages · platform configuration"
        actions={<button className="btn btn-brand btn-sm">＋ New post</button>}/>

      {/* tabs */}
      <div style={{display:'flex', gap:6, marginBottom:20, padding:6, background:'var(--surface)', borderRadius:'var(--r-pill)', alignSelf:'flex-start', width:'fit-content', border:'1px solid var(--border)'}}>
        {[
          {id:'blog', l:'Blog posts'},
          {id:'localities', l:'Locality pages'},
          {id:'config', l:'Platform config'},
        ].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{
              padding:'7px 18px', borderRadius:99,
              background: tab===t.id?'var(--text)':'transparent',
              color: tab===t.id?'var(--bg)':'var(--text-muted)',
              border:0, cursor:'pointer', fontSize:13, fontWeight:600,
            }}>{t.l}</button>
        ))}
      </div>

      {tab === 'blog' && <CmsBlogTab nav={nav}/>}
      {tab === 'localities' && <CmsLocalitiesTab nav={nav}/>}
      {tab === 'config' && <CmsConfigTab/>}
    </PortalShell>
  );
}

function CmsBlogTab({nav}) {
  const posts = [
    { title:"Tenant rights in India: the full 2026 guide", status:"published", views:"24.6k", date:"May 12, 2026", author:"Aanya S." },
    { title:"The complete Koramangala area guide", status:"published", views:"12.4k", date:"May 8, 2026", author:"Vikram K." },
    { title:"Urbify Rent Index · May 2026", status:"published", views:"8.2k", date:"May 5, 2026", author:"Urbify Data" },
    { title:"Investment hot-spots for 2026", status:"published", views:"6.8k", date:"Apr 18, 2026", author:"Vikram K." },
    { title:"How to photograph your rental", status:"published", views:"4.2k", date:"Apr 14, 2026", author:"Maya I." },
    { title:"What the new Karnataka tenancy bill means", status:"draft", views:"—", date:"Draft · 2 days ago", author:"Aanya S." },
    { title:"Hyderabad rental landscape · summer 2026", status:"draft", views:"—", date:"Draft · last week", author:"Karan M." },
  ];

  return (
    <div className="card" style={{padding:0, overflow:'hidden'}}>
      <div style={{padding:'14px 20px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:10}}>
        <input className="input btn-sm" placeholder="Search posts…" style={{height:32, fontSize:12, width:280}}/>
        <select className="input select btn-sm" style={{height:32, fontSize:12}}><option>All status</option><option>Published</option><option>Draft</option></select>
        <div style={{flex:1}}/>
        <span style={{fontSize:12, color:'var(--text-muted)'}}>{posts.length} posts</span>
      </div>
      <table style={{width:'100%', borderCollapse:'collapse', fontSize:13}}>
        <thead>
          <tr style={{textAlign:'left', color:'var(--text-muted)', fontSize:11, textTransform:'uppercase', letterSpacing:'.08em', fontWeight:600, background:'var(--surface-sunken)'}}>
            <th style={{padding:'12px 22px'}}>Title</th>
            <th style={{padding:'12px 22px'}}>Author</th>
            <th style={{padding:'12px 22px'}}>Status</th>
            <th style={{padding:'12px 22px'}}>Views</th>
            <th style={{padding:'12px 22px'}}>Updated</th>
            <th style={{padding:'12px 22px', textAlign:'right'}}></th>
          </tr>
        </thead>
        <tbody>
          {posts.map(p=>(
            <tr key={p.title} style={{borderTop:'1px solid var(--border)'}}>
              <td style={{padding:'14px 22px', fontWeight:600, maxWidth:380}}>{p.title}</td>
              <td style={{padding:'14px 22px', color:'var(--text-muted)'}}>{p.author}</td>
              <td style={{padding:'14px 22px'}}>
                {p.status === 'published' ? <span style={{fontSize:11, color:'var(--success)', fontWeight:600}}>● Published</span> : <span style={{fontSize:11, color:'var(--text-muted)', fontWeight:600}}>○ Draft</span>}
              </td>
              <td style={{padding:'14px 22px', fontVariantNumeric:'tabular-nums', fontWeight:600}}>{p.views}</td>
              <td style={{padding:'14px 22px', color:'var(--text-muted)'}}>{p.date}</td>
              <td style={{padding:'14px 22px', textAlign:'right'}}>
                <div style={{display:'inline-flex', gap:4}}>
                  <button className="btn btn-ghost btn-sm" onClick={()=>nav('blogPost')}>Preview</button>
                  <button className="btn btn-outline btn-sm">Edit</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CmsLocalitiesTab({nav}) {
  const items = [
    { name:"Koramangala", city:"Bangalore", listings:142, content:100, seo:98, status:"live" },
    { name:"Indiranagar", city:"Bangalore", listings:98, content:100, seo:94, status:"live" },
    { name:"HSR Layout", city:"Bangalore", listings:128, content:80, seo:72, status:"needs review" },
    { name:"Powai", city:"Mumbai", listings:142, content:100, seo:91, status:"live" },
    { name:"Bandra West", city:"Mumbai", listings:96, content:60, seo:48, status:"needs review" },
    { name:"Whitefield", city:"Bangalore", listings:186, content:100, seo:88, status:"live" },
  ];
  return (
    <div className="card" style={{padding:0, overflow:'hidden'}}>
      <div style={{padding:'14px 20px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:10}}>
        <select className="input select btn-sm" style={{height:32, fontSize:12}}><option>All cities</option><option>Bangalore</option><option>Mumbai</option></select>
        <input className="input btn-sm" placeholder="Search localities…" style={{height:32, fontSize:12, width:240}}/>
        <div style={{flex:1}}/>
        <span style={{fontSize:12, color:'var(--text-muted)'}}>12,402 locality pages live · ~10k programmatic</span>
      </div>
      <table style={{width:'100%', borderCollapse:'collapse', fontSize:13}}>
        <thead>
          <tr style={{textAlign:'left', color:'var(--text-muted)', fontSize:11, textTransform:'uppercase', letterSpacing:'.08em', fontWeight:600, background:'var(--surface-sunken)'}}>
            <th style={{padding:'12px 22px'}}>Locality</th>
            <th style={{padding:'12px 22px'}}>City</th>
            <th style={{padding:'12px 22px'}}>Listings</th>
            <th style={{padding:'12px 22px'}}>Content score</th>
            <th style={{padding:'12px 22px'}}>SEO score</th>
            <th style={{padding:'12px 22px'}}>Status</th>
            <th style={{padding:'12px 22px', textAlign:'right'}}></th>
          </tr>
        </thead>
        <tbody>
          {items.map(i=>(
            <tr key={i.name} style={{borderTop:'1px solid var(--border)'}}>
              <td style={{padding:'14px 22px', fontWeight:600}}>{i.name}</td>
              <td style={{padding:'14px 22px', color:'var(--text-muted)'}}>{i.city}</td>
              <td style={{padding:'14px 22px', fontVariantNumeric:'tabular-nums', fontWeight:600}}>{i.listings}</td>
              <td style={{padding:'14px 22px'}}><ScoreBar value={i.content}/></td>
              <td style={{padding:'14px 22px'}}><ScoreBar value={i.seo}/></td>
              <td style={{padding:'14px 22px'}}>
                {i.status === 'live' ? <span style={{fontSize:11, color:'var(--success)', fontWeight:600}}>● Live</span> : <span style={{fontSize:11, color:'var(--warning)', fontWeight:600}}>● Needs review</span>}
              </td>
              <td style={{padding:'14px 22px', textAlign:'right'}}>
                <button className="btn btn-ghost btn-sm" onClick={()=>nav('locality')}>View →</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ScoreBar({value}) {
  return (
    <div style={{display:'flex', alignItems:'center', gap:8}}>
      <div style={{flex:1, maxWidth:80, height:5, background:'var(--surface-sunken)', borderRadius:99, overflow:'hidden'}}>
        <div style={{height:'100%', width:`${value}%`, background: value > 90 ? 'var(--success)' : value > 70 ? 'var(--brand-500)' : 'var(--warning)', borderRadius:99}}/>
      </div>
      <span style={{fontSize:12, fontVariantNumeric:'tabular-nums', fontWeight:600, minWidth:30}}>{value}</span>
    </div>
  );
}

function CmsConfigTab() {
  return (
    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:18}}>
      <div className="card" style={{padding:28}}>
        <div className="font-display" style={{fontSize:18, fontWeight:700, letterSpacing:'-0.02em'}}>Platform fee</div>
        <div style={{fontSize:13, color:'var(--text-muted)', marginTop:6, marginBottom:18}}>Change carefully — affects every listing.</div>
        <Field label="Fee multiplier (days of rent)">
          <div style={{display:'flex', alignItems:'center', gap:6}}>
            <input className="input" defaultValue="7.5" type="number" step="0.5" style={{flex:1}}/>
            <span className="muted" style={{fontSize:13}}>days</span>
          </div>
        </Field>
        <div style={{marginTop:14}}>
          <Field label="GST rate">
            <div style={{display:'flex', alignItems:'center', gap:6}}>
              <input className="input" defaultValue="18" type="number" style={{flex:1}}/>
              <span className="muted" style={{fontSize:13}}>%</span>
            </div>
          </Field>
        </div>
        <div style={{marginTop:14}}>
          <Field label="Minimum fee floor">
            <div style={{display:'flex', alignItems:'center', gap:6}}>
              <span className="muted" style={{fontSize:13}}>₹</span>
              <input className="input" defaultValue="999" style={{flex:1}}/>
            </div>
          </Field>
        </div>
      </div>

      <div className="card" style={{padding:28}}>
        <div className="font-display" style={{fontSize:18, fontWeight:700, letterSpacing:'-0.02em'}}>Listing rules</div>
        <div style={{fontSize:13, color:'var(--text-muted)', marginTop:6, marginBottom:18}}>Defaults applied to new listings.</div>
        <Field label="Listing expiry">
          <div style={{display:'flex', alignItems:'center', gap:6}}>
            <input className="input" defaultValue="30" type="number" style={{flex:1}}/>
            <span className="muted" style={{fontSize:13}}>days</span>
          </div>
        </Field>
        <div style={{marginTop:14}}>
          <Field label="Refund window">
            <div style={{display:'flex', alignItems:'center', gap:6}}>
              <input className="input" defaultValue="24" type="number" style={{flex:1}}/>
              <span className="muted" style={{fontSize:13}}>hours after unlock</span>
            </div>
          </Field>
        </div>
        <div style={{marginTop:14}}>
          <Field label="Minimum photos">
            <input className="input" defaultValue="3" type="number"/>
          </Field>
        </div>
      </div>

      <div className="card" style={{padding:28}}>
        <div className="font-display" style={{fontSize:18, fontWeight:700, letterSpacing:'-0.02em'}}>Cities</div>
        <div style={{fontSize:13, color:'var(--text-muted)', marginTop:6, marginBottom:18}}>Toggle city availability on the public site.</div>
        <div style={{display:'flex', flexDirection:'column', gap:10}}>
          {[
            { city:"Bangalore", on:true, count:"2,847" },
            { city:"Mumbai", on:true, count:"2,142" },
            { city:"Pune", on:true, count:"1,486" },
            { city:"Hyderabad", on:true, count:"1,284" },
            { city:"Delhi NCR", on:true, count:"1,180" },
            { city:"Chennai", on:true, count:"962" },
            { city:"Ahmedabad", on:false, count:"launching Q1 '27" },
            { city:"Kolkata", on:false, count:"launching Q1 '27" },
          ].map(c=>(
            <div key={c.city} style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid var(--border)'}}>
              <div>
                <div style={{fontSize:14, fontWeight:600}}>{c.city}</div>
                <div style={{fontSize:11, color:'var(--text-muted)'}}>{c.count}</div>
              </div>
              <Toggle on={c.on}/>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{padding:28}}>
        <div className="font-display" style={{fontSize:18, fontWeight:700, letterSpacing:'-0.02em'}}>Feature flags</div>
        <div style={{fontSize:13, color:'var(--text-muted)', marginTop:6, marginBottom:18}}>Roll features to subsets of users.</div>
        {[
          { f:"Multi-pack unlock (₹4,999 for 5)", on:false, sub:"Internal beta · 0.5%" },
          { f:"Saved-search SMS alerts", on:true, sub:"All users" },
          { f:"WhatsApp contact reveal", on:true, sub:"All users" },
          { f:"AI listing description writer", on:false, sub:"Owners only · 10%" },
          { f:"Virtual tours", on:true, sub:"Premium tier only" },
        ].map(f=>(
          <div key={f.f} style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid var(--border)'}}>
            <div>
              <div style={{fontSize:14, fontWeight:600}}>{f.f}</div>
              <div style={{fontSize:11, color:'var(--text-muted)'}}>{f.sub}</div>
            </div>
            <Toggle on={f.on}/>
          </div>
        ))}
      </div>
    </div>
  );
}

function Toggle({on:initial}) {
  const [on, setOn] = useState(initial);
  return (
    <button onClick={()=>setOn(!on)} style={{
      width:42, height:24, borderRadius:99,
      background: on ? 'var(--brand-500)' : 'var(--border-strong)',
      border:0, cursor:'pointer', position:'relative', flexShrink:0,
      transition:'background .15s',
    }}>
      <div style={{
        position:'absolute', top:2, left: on ? 20 : 2,
        width:20, height:20, borderRadius:'50%', background:'#fff',
        transition:'left .2s', boxShadow:'0 1px 3px rgba(0,0,0,.2)',
      }}/>
    </button>
  );
}

Object.assign(window, { AdminUsersPage, AdminRevenuePage, AdminCmsPage });
