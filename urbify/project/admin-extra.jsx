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

// ─── ADMIN PROPERTIES ─────────────────────────────────────────────────────
const ADMIN_PROPERTIES_INIT = LISTINGS.slice(0, 12).map((l, i) => ({
  ...l,
  status: ['live','live','live','pending','live','live','rejected','live','live','pending','live','live'][i],
  addedBy: ['Vikram K.','Admin','Anita R.','Rohit M.','Admin','Priya S.','Admin','Karan T.','Admin','Manish J.','Admin','Dhruv N.'][i],
  addedOn: ['Nov 1','Nov 3','Nov 5','Nov 6','Nov 7','Nov 8','Nov 9','Nov 10','Nov 11','Nov 12','Nov 13','Nov 14'][i],
  propertyType: ['Apartment','Apartment','Villa','Apartment','PG','Apartment','Apartment','Villa','Apartment','Apartment','Studio','Apartment'][i],
}));

const EMPTY_FORM = {
  title:'', propertyType:'Apartment', city:'Bangalore', locality:'',
  bhk:'2', area:'', floor:'', totalFloors:'', furnishing:'Semi-furnished',
  facing:'East', rent:'', deposit:'', listingType:'rent',
  ownerName:'', ownerPhone:'', ownerEmail:'',
  description:'', amenities:[], photos:['','',''],
  status:'pending',
};

function AdminPropertiesPage({nav}) {
  const [properties, setProperties] = useState(ADMIN_PROPERTIES_INIT);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterCity, setFilterCity] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editProp, setEditProp] = useState(null); // null = add, obj = edit
  const [viewProp, setViewProp] = useState(null);
  const [page, setPage] = useState(1);
  const PER_PAGE = 8;

  const filtered = properties.filter(p => {
    const q = search.toLowerCase();
    if (q && !p.title.toLowerCase().includes(q) && !p.locality.toLowerCase().includes(q) && !p.city.toLowerCase().includes(q)) return false;
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;
    if (filterType !== 'all' && p.propertyType !== filterType) return false;
    if (filterCity !== 'all' && p.city !== filterCity) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE);

  const openAdd = () => { setEditProp(null); setShowModal(true); };
  const openEdit = (p) => { setEditProp(p); setShowModal(true); };

  const handleSave = (data) => {
    if (editProp) {
      setProperties(ps => ps.map(p => p.id === editProp.id ? {...p, ...data} : p));
    } else {
      const newId = `URB-${2000 + properties.length}`;
      setProperties(ps => [{
        ...data, id: newId,
        photo: data.photos[0] || PHOTOS[0],
        photos: data.photos.filter(Boolean).length ? data.photos.filter(Boolean) : [PHOTOS[0],PHOTOS[1],PHOTOS[2]],
        rentK: parseInt(data.rent) || 0,
        area: parseInt(data.area) || 0,
        floor: parseInt(data.floor) || 1,
        total: parseInt(data.totalFloors) || 10,
        addedBy: 'Admin',
        addedOn: 'Just now',
        isBroker: false,
        fee: 0, feeGST: 0,
        amenityIds: data.amenities,
      }, ...ps]);
    }
    setShowModal(false);
  };

  const handleStatusChange = (id, status) => {
    setProperties(ps => ps.map(p => p.id === id ? {...p, status} : p));
  };

  const handleDelete = (id) => {
    setProperties(ps => ps.filter(p => p.id !== id));
  };

  return (
    <PortalShell user={ADMIN_USER} navItems={ADMIN_NAV()} current="adminProperties" onNav={(id)=>nav(id)}>
      <DashHeader title="Properties"
        subtitle={`${properties.length.toLocaleString()} total · ${properties.filter(p=>p.status==='pending').length} pending review`}
        actions={
          <>
            <button className="btn btn-outline btn-sm"><Icon.download/> Export</button>
            <button className="btn btn-brand btn-sm" onClick={openAdd}>＋ Add property</button>
          </>
        }/>

      {/* Stats row */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:24}}>
        {[
          {label:'Total listings', value: properties.length.toLocaleString(), color:'var(--brand-500)'},
          {label:'Live', value: properties.filter(p=>p.status==='live').length, color:'var(--success)'},
          {label:'Pending', value: properties.filter(p=>p.status==='pending').length, color:'var(--warning)'},
          {label:'Rejected', value: properties.filter(p=>p.status==='rejected').length, color:'var(--error)'},
        ].map(s=>(
          <div key={s.label} className="card" style={{padding:'18px 22px', display:'flex', alignItems:'center', gap:14}}>
            <div style={{width:10, height:10, borderRadius:99, background:s.color, flexShrink:0}}/>
            <div>
              <div style={{fontSize:26, fontWeight:800, letterSpacing:'-0.03em', lineHeight:1}}>{s.value}</div>
              <div style={{fontSize:11, color:'var(--text-muted)', marginTop:4}}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card" style={{padding:'14px 18px', display:'flex', alignItems:'center', gap:12, marginBottom:16, flexWrap:'wrap'}}>
        <div style={{display:'flex', alignItems:'center', gap:8, padding:'0 12px', background:'var(--surface-sunken)', borderRadius:'var(--r-sm)', height:36, flex:'1 1 260px', maxWidth:320}}>
          <Icon.search/>
          <input value={search} onChange={e=>{setSearch(e.target.value); setPage(1);}}
            className="input" placeholder="Search title, city, locality…"
            style={{border:0, background:'transparent', padding:0, height:'auto', flex:1, fontSize:13}}/>
        </div>
        <select className="input select" style={{height:36, fontSize:12}} value={filterStatus} onChange={e=>{setFilterStatus(e.target.value); setPage(1);}}>
          <option value="all">Any status</option>
          <option value="live">Live</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
        </select>
        <select className="input select" style={{height:36, fontSize:12}} value={filterType} onChange={e=>{setFilterType(e.target.value); setPage(1);}}>
          <option value="all">Any type</option>
          <option value="Apartment">Apartment</option>
          <option value="Villa">Villa</option>
          <option value="Studio">Studio</option>
          <option value="PG">PG / Co-living</option>
          <option value="Office">Office</option>
        </select>
        <select className="input select" style={{height:36, fontSize:12}} value={filterCity} onChange={e=>{setFilterCity(e.target.value); setPage(1);}}>
          <option value="all">All cities</option>
          {CITIES.map(c=><option key={c.name} value={c.name}>{c.name}</option>)}
        </select>
        <div style={{marginLeft:'auto', fontSize:12, color:'var(--text-muted)'}}>
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{padding:0, overflow:'hidden', marginBottom:16}}>
        <table style={{width:'100%', borderCollapse:'collapse', fontSize:13}}>
          <thead style={{background:'var(--surface-sunken)'}}>
            <tr style={{textAlign:'left', color:'var(--text-muted)', fontSize:11, textTransform:'uppercase', letterSpacing:'.08em', fontWeight:600}}>
              <th style={{padding:'12px 20px'}}>Property</th>
              <th style={{padding:'12px 16px'}}>Type</th>
              <th style={{padding:'12px 16px'}}>City</th>
              <th style={{padding:'12px 16px'}}>Rent</th>
              <th style={{padding:'12px 16px'}}>Area</th>
              <th style={{padding:'12px 16px'}}>Added by</th>
              <th style={{padding:'12px 16px'}}>Status</th>
              <th style={{padding:'12px 20px', textAlign:'right'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 && (
              <tr><td colSpan={8} style={{padding:'48px 20px', textAlign:'center', color:'var(--text-muted)', fontSize:14}}>No properties match your filters.</td></tr>
            )}
            {paginated.map((p,i)=>(
              <tr key={p.id} style={{borderTop:'1px solid var(--border)'}}>
                <td style={{padding:'14px 20px'}}>
                  <div style={{display:'flex', alignItems:'center', gap:12}}>
                    <Img src={p.photo} style={{width:52, height:52, borderRadius:'var(--r-sm)', flexShrink:0}}/>
                    <div style={{minWidth:0}}>
                      <div style={{fontWeight:600, fontSize:13, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:220}}>
                        {p.bhk} BHK · {p.locality}
                      </div>
                      <div style={{fontSize:11, color:'var(--text-muted)', fontFamily:'var(--f-mono)', marginTop:2}}>{p.id}</div>
                      <div style={{fontSize:11, color:'var(--text-muted)', marginTop:1}}>{p.furnishing}</div>
                    </div>
                  </div>
                </td>
                <td style={{padding:'14px 16px', color:'var(--text-muted)'}}>{p.propertyType || 'Apartment'}</td>
                <td style={{padding:'14px 16px'}}><span style={{fontWeight:500}}>{p.city}</span></td>
                <td style={{padding:'14px 16px', fontWeight:700, fontVariantNumeric:'tabular-nums'}}>₹{p.rentK}k</td>
                <td style={{padding:'14px 16px', color:'var(--text-muted)', fontVariantNumeric:'tabular-nums'}}>{p.area.toLocaleString('en-IN')} sqft</td>
                <td style={{padding:'14px 16px'}}>
                  <div style={{fontSize:12}}>{p.addedBy}</div>
                  <div style={{fontSize:10, color:'var(--text-faint)'}}>{p.addedOn}</div>
                </td>
                <td style={{padding:'14px 16px'}}>
                  <select
                    value={p.status}
                    onChange={e=>handleStatusChange(p.id, e.target.value)}
                    style={{
                      fontSize:11, fontWeight:600, padding:'4px 8px', borderRadius:99,
                      border:'1.5px solid',
                      borderColor: p.status==='live' ? 'var(--success)' : p.status==='pending' ? 'var(--warning)' : 'var(--error)',
                      color: p.status==='live' ? 'var(--success)' : p.status==='pending' ? 'var(--warning)' : 'var(--error)',
                      background:'transparent', cursor:'pointer',
                    }}>
                    <option value="live">● Live</option>
                    <option value="pending">○ Pending</option>
                    <option value="rejected">✕ Rejected</option>
                  </select>
                </td>
                <td style={{padding:'14px 20px', textAlign:'right'}}>
                  <div style={{display:'inline-flex', gap:4}}>
                    <button className="btn btn-ghost btn-sm" onClick={()=>setViewProp(p)}>View</button>
                    <button className="btn btn-outline btn-sm" onClick={()=>openEdit(p)}>Edit</button>
                    <button className="btn btn-ghost btn-sm" style={{color:'var(--error)'}} onClick={()=>handleDelete(p.id)}>✕</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div style={{padding:'12px 20px', borderTop:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:12, color:'var(--text-muted)'}}>
          <span>Page {page} of {totalPages} · {filtered.length} properties</span>
          <div style={{display:'flex', gap:6}}>
            <button className="btn btn-outline btn-sm" disabled={page===1} onClick={()=>setPage(p=>p-1)}>← Prev</button>
            {Array.from({length:Math.min(5,totalPages)}).map((_,i)=>{
              const pg = i+1;
              return <button key={pg} className={page===pg?"btn btn-brand btn-sm":"btn btn-ghost btn-sm"} onClick={()=>setPage(pg)}>{pg}</button>;
            })}
            <button className="btn btn-outline btn-sm" disabled={page>=totalPages} onClick={()=>setPage(p=>p+1)}>Next →</button>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <PropertyFormModal
          initial={editProp}
          onSave={handleSave}
          onClose={()=>setShowModal(false)}
        />
      )}

      {/* View Modal */}
      {viewProp && (
        <PropertyViewModal prop={viewProp} onClose={()=>setViewProp(null)} onEdit={()=>{setViewProp(null); openEdit(viewProp);}}/>
      )}
    </PortalShell>
  );
}

// ─── Property Form Modal ─────────────────────────────────────────────────
function PropertyFormModal({initial, onSave, onClose}) {
  const isEdit = !!initial;
  const [step, setStep] = useState(1);
  const TOTAL_STEPS = 4;

  const [form, setForm] = useState(() => initial ? {
    title: initial.title || '',
    propertyType: initial.propertyType || 'Apartment',
    city: initial.city || 'Bangalore',
    locality: initial.locality || '',
    bhk: String(initial.bhk || '2'),
    area: String(initial.area || ''),
    floor: String(initial.floor || ''),
    totalFloors: String(initial.total || ''),
    furnishing: initial.furnishing || 'Semi-furnished',
    facing: initial.facing || 'East',
    rent: String(initial.rentK ? initial.rentK * 1000 : ''),
    deposit: String(initial.rentK ? initial.rentK * 2000 : ''),
    listingType: 'rent',
    ownerName: '', ownerPhone: '', ownerEmail: '',
    description: initial.description || '',
    amenities: initial.amenityIds || [],
    photos: initial.photos ? [...initial.photos.slice(0,3), ...Array(3).fill('')].slice(0,3) : ['','',''],
    status: initial.status || 'pending',
  } : {...EMPTY_FORM});

  const set = (k, v) => setForm(f => ({...f, [k]: v}));
  const toggleAmenity = (id) => set('amenities', form.amenities.includes(id) ? form.amenities.filter(a=>a!==id) : [...form.amenities, id]);

  const stepTitles = ['Basic info', 'Location & specs', 'Owner & pricing', 'Photos & publish'];

  const canNext = () => {
    if (step === 1) return form.propertyType && form.city && form.locality && form.bhk;
    if (step === 2) return form.area && form.floor && form.totalFloors;
    if (step === 3) return form.rent;
    return true;
  };

  const handleSubmit = () => {
    onSave({
      ...form,
      bhk: parseInt(form.bhk) || 2,
      area: parseInt(form.area) || 0,
      floor: parseInt(form.floor) || 1,
      total: parseInt(form.totalFloors) || 10,
      rentK: Math.round((parseInt(form.rent) || 0) / 1000),
      photos: form.photos.filter(Boolean).length ? form.photos.filter(Boolean) : [PHOTOS[0]],
      photo: form.photos.filter(Boolean)[0] || PHOTOS[0],
      title: form.title || `${form.bhk} BHK ${form.propertyType} in ${form.locality}`,
    });
  };

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:200,
      background:'rgba(0,0,0,.55)', backdropFilter:'blur(4px)',
      display:'flex', alignItems:'center', justifyContent:'center', padding:24,
    }} onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}>
      <div style={{
        background:'var(--surface)', borderRadius:'var(--r-lg)', width:'100%', maxWidth:680,
        maxHeight:'90vh', overflow:'hidden', display:'flex', flexDirection:'column',
        boxShadow:'var(--sh-pop)',
      }}>
        {/* Header */}
        <div style={{padding:'22px 28px 18px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0}}>
          <div>
            <div style={{fontSize:20, fontWeight:800, letterSpacing:'-0.025em'}}>{isEdit ? 'Edit property' : 'Add new property'}</div>
            <div style={{fontSize:12, color:'var(--text-muted)', marginTop:4}}>Step {step} of {TOTAL_STEPS} · {stepTitles[step-1]}</div>
          </div>
          <button onClick={onClose} style={{background:'var(--surface-sunken)', border:0, borderRadius:'50%', width:34, height:34, cursor:'pointer', fontSize:16, display:'grid', placeItems:'center'}}>✕</button>
        </div>

        {/* Progress bar */}
        <div style={{height:4, background:'var(--surface-sunken)', flexShrink:0}}>
          <div style={{height:'100%', width:`${(step/TOTAL_STEPS)*100}%`, background:'var(--brand-500)', transition:'width .3s', borderRadius:99}}/>
        </div>

        {/* Step indicators */}
        <div style={{padding:'14px 28px', borderBottom:'1px solid var(--border)', display:'flex', gap:6, flexShrink:0}}>
          {stepTitles.map((t,i)=>(
            <div key={i} onClick={()=>{ if(i+1 < step) setStep(i+1); }} style={{
              display:'flex', alignItems:'center', gap:8, fontSize:12, fontWeight:600,
              color: step===i+1 ? 'var(--text)' : step>i+1 ? 'var(--success)' : 'var(--text-faint)',
              cursor: i+1 < step ? 'pointer' : 'default',
            }}>
              <div style={{
                width:22, height:22, borderRadius:'50%', display:'grid', placeItems:'center', fontSize:10, fontWeight:700,
                background: step===i+1 ? 'var(--brand-500)' : step>i+1 ? 'var(--success)' : 'var(--surface-sunken)',
                color: step===i+1 || step>i+1 ? '#fff' : 'var(--text-muted)',
              }}>{step>i+1 ? '✓' : i+1}</div>
              <span style={{display: i < stepTitles.length-1 ? undefined : undefined}}>{t}</span>
              {i < stepTitles.length-1 && <span style={{color:'var(--border-strong)', fontWeight:400, marginLeft:2}}>›</span>}
            </div>
          ))}
        </div>

        {/* Body */}
        <div style={{flex:1, overflowY:'auto', padding:'24px 28px'}}>

          {/* ── Step 1: Basic Info ── */}
          {step === 1 && (
            <div style={{display:'flex', flexDirection:'column', gap:18}}>
              <Field label="Property type">
                <div style={{display:'flex', flexWrap:'wrap', gap:8}}>
                  {['Apartment','Villa','Studio','PG / Co-living','Office','Plot'].map(t=>(
                    <button key={t} onClick={()=>set('propertyType', t==='PG / Co-living'?'PG':t)}
                      style={{
                        padding:'7px 14px', borderRadius:99, fontSize:12, fontWeight:600, cursor:'pointer',
                        border:'1.5px solid', borderColor: form.propertyType===(t==='PG / Co-living'?'PG':t)?'var(--text)':'var(--border)',
                        background: form.propertyType===(t==='PG / Co-living'?'PG':t)?'var(--text)':'transparent',
                        color: form.propertyType===(t==='PG / Co-living'?'PG':t)?'var(--bg)':'var(--text)',
                      }}>{t}</button>
                  ))}
                </div>
              </Field>

              <Field label="Listing type">
                <div style={{display:'flex', gap:8}}>
                  {[{v:'rent',l:'For Rent'},{v:'sale',l:'For Sale'},{v:'pg',l:'PG / Hostel'}].map(t=>(
                    <button key={t.v} onClick={()=>set('listingType',t.v)}
                      style={{
                        padding:'7px 18px', borderRadius:99, fontSize:12, fontWeight:600, cursor:'pointer',
                        border:'1.5px solid', borderColor: form.listingType===t.v?'var(--text)':'var(--border)',
                        background: form.listingType===t.v?'var(--text)':'transparent',
                        color: form.listingType===t.v?'var(--bg)':'var(--text)',
                      }}>{t.l}</button>
                  ))}
                </div>
              </Field>

              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:14}}>
                <Field label="BHK / configuration">
                  <select className="input" value={form.bhk} onChange={e=>set('bhk',e.target.value)}>
                    {['1','2','3','4','5','6'].map(v=><option key={v} value={v}>{v} BHK</option>)}
                  </select>
                </Field>
                <Field label="Furnishing">
                  <select className="input" value={form.furnishing} onChange={e=>set('furnishing',e.target.value)}>
                    {FURNISHING.map(f=><option key={f}>{f}</option>)}
                  </select>
                </Field>
              </div>

              <Field label="Custom title (optional)">
                <input className="input" placeholder={`e.g. ${form.bhk} BHK Apartment in Koramangala`}
                  value={form.title} onChange={e=>set('title',e.target.value)}/>
                <div style={{fontSize:11, color:'var(--text-faint)', marginTop:6}}>Auto-generated if left blank.</div>
              </Field>

              <Field label="Description">
                <textarea className="input" rows={4}
                  placeholder="Describe the property — highlights, nearby landmarks, special features…"
                  value={form.description} onChange={e=>set('description',e.target.value)}
                  style={{resize:'vertical', fontFamily:'var(--f-body)', lineHeight:1.6}}/>
              </Field>
            </div>
          )}

          {/* ── Step 2: Location & Specs ── */}
          {step === 2 && (
            <div style={{display:'flex', flexDirection:'column', gap:18}}>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:14}}>
                <Field label="City *">
                  <select className="input" value={form.city} onChange={e=>set('city',e.target.value)}>
                    {CITIES.map(c=><option key={c.name}>{c.name}</option>)}
                  </select>
                </Field>
                <Field label="Locality / area *">
                  <input className="input" placeholder="e.g. Koramangala, HSR Layout"
                    value={form.locality} onChange={e=>set('locality',e.target.value)}
                    list="locality-options"/>
                  <datalist id="locality-options">
                    {LOCALITIES.map(l=><option key={l} value={l}/>)}
                  </datalist>
                </Field>
              </div>

              <Field label="Full address (admin only — hidden from tenants)">
                <input className="input" placeholder="Building / flat no., street, pincode"
                  value={form.address || ''} onChange={e=>set('address',e.target.value)}/>
              </Field>

              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:14}}>
                <Field label="Carpet area (sqft) *">
                  <input className="input" type="number" placeholder="e.g. 850"
                    value={form.area} onChange={e=>set('area',e.target.value)}/>
                </Field>
                <Field label="Floor *">
                  <input className="input" type="number" placeholder="e.g. 4"
                    value={form.floor} onChange={e=>set('floor',e.target.value)}/>
                </Field>
                <Field label="Total floors *">
                  <input className="input" type="number" placeholder="e.g. 12"
                    value={form.totalFloors} onChange={e=>set('totalFloors',e.target.value)}/>
                </Field>
              </div>

              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:14}}>
                <Field label="Facing">
                  <select className="input" value={form.facing} onChange={e=>set('facing',e.target.value)}>
                    {FACINGS.map(f=><option key={f}>{f}</option>)}
                  </select>
                </Field>
                <Field label="Available from">
                  <input className="input" type="date" value={form.availableFrom || ''} onChange={e=>set('availableFrom',e.target.value)}/>
                </Field>
              </div>

              <Field label="Amenities">
                <div style={{display:'flex', flexWrap:'wrap', gap:8, marginTop:4}}>
                  {AMENITIES.map(a=>(
                    <button key={a.id} onClick={()=>toggleAmenity(a.id)}
                      style={{
                        padding:'6px 14px', borderRadius:99, fontSize:12, fontWeight:600, cursor:'pointer',
                        border:'1.5px solid', borderColor: form.amenities.includes(a.id)?'var(--brand-500)':'var(--border)',
                        background: form.amenities.includes(a.id)?'var(--brand-50)':'transparent',
                        color: form.amenities.includes(a.id)?'var(--brand-700)':'var(--text-muted)',
                      }}>{form.amenities.includes(a.id)?'✓ ':''}{a.label}</button>
                  ))}
                </div>
              </Field>
            </div>
          )}

          {/* ── Step 3: Owner & Pricing ── */}
          {step === 3 && (
            <div style={{display:'flex', flexDirection:'column', gap:18}}>
              <div style={{padding:'14px 18px', borderRadius:'var(--r-md)', background:'var(--surface-sunken)', fontSize:13, color:'var(--text-muted)', lineHeight:1.6}}>
                Owner details are kept private. Tenants only see the locality until they pay to unlock.
              </div>

              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:14}}>
                <Field label="Owner full name">
                  <input className="input" placeholder="e.g. Rajesh Kumar"
                    value={form.ownerName} onChange={e=>set('ownerName',e.target.value)}/>
                </Field>
                <Field label="Owner phone">
                  <input className="input" placeholder="+91 98765 43210"
                    value={form.ownerPhone} onChange={e=>set('ownerPhone',e.target.value)}/>
                </Field>
              </div>

              <Field label="Owner email (optional)">
                <input className="input" type="email" placeholder="owner@example.com"
                  value={form.ownerEmail} onChange={e=>set('ownerEmail',e.target.value)}/>
              </Field>

              <div style={{borderTop:'1px solid var(--border)', paddingTop:18}}>
                <div style={{fontSize:13, fontWeight:700, marginBottom:14}}>Pricing</div>
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:14}}>
                  <Field label="Monthly rent (₹) *">
                    <div style={{display:'flex', alignItems:'center', gap:0}}>
                      <span style={{padding:'0 12px', height:40, lineHeight:'40px', background:'var(--surface-sunken)', border:'1px solid var(--border)', borderRight:0, borderRadius:'var(--r-sm) 0 0 var(--r-sm)', fontSize:13, color:'var(--text-muted)'}}>₹</span>
                      <input className="input" type="number" placeholder="45000"
                        value={form.rent} onChange={e=>set('rent',e.target.value)}
                        style={{borderRadius:'0 var(--r-sm) var(--r-sm) 0'}}/>
                    </div>
                  </Field>
                  <Field label="Security deposit (₹)">
                    <div style={{display:'flex', alignItems:'center', gap:0}}>
                      <span style={{padding:'0 12px', height:40, lineHeight:'40px', background:'var(--surface-sunken)', border:'1px solid var(--border)', borderRight:0, borderRadius:'var(--r-sm) 0 0 var(--r-sm)', fontSize:13, color:'var(--text-muted)'}}>₹</span>
                      <input className="input" type="number" placeholder="90000"
                        value={form.deposit} onChange={e=>set('deposit',e.target.value)}
                        style={{borderRadius:'0 var(--r-sm) var(--r-sm) 0'}}/>
                    </div>
                  </Field>
                </div>
              </div>

              {form.rent && (
                <div style={{padding:'14px 18px', borderRadius:'var(--r-md)', background:'var(--brand-50)', border:'1px solid var(--brand-500)', fontSize:12}}>
                  <div style={{fontWeight:700, color:'var(--brand-700)', marginBottom:8}}>Platform fee estimate</div>
                  <div style={{display:'flex', gap:24}}>
                    <div><span style={{color:'var(--text-muted)'}}>Unlock fee:</span> <strong>₹{Math.round((parseInt(form.rent)||0)/30*7.5).toLocaleString('en-IN')}</strong></div>
                    <div><span style={{color:'var(--text-muted)'}}>incl. GST:</span> <strong>₹{Math.round((parseInt(form.rent)||0)/30*7.5*1.18).toLocaleString('en-IN')}</strong></div>
                    <div><span style={{color:'var(--text-muted)'}}>Deposit shown:</span> <strong>₹{parseInt(form.deposit||0).toLocaleString('en-IN') || '—'}</strong></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Step 4: Photos & Publish ── */}
          {step === 4 && (
            <div style={{display:'flex', flexDirection:'column', gap:18}}>
              <Field label="Photo URLs (paste image links — at least 1 required)">
                <div style={{display:'flex', flexDirection:'column', gap:10}}>
                  {form.photos.map((url,i)=>(
                    <div key={i} style={{display:'flex', gap:10, alignItems:'flex-start'}}>
                      <div style={{flex:1}}>
                        <input className="input" placeholder={`Photo ${i+1} URL — https://…`}
                          value={url} onChange={e=>{
                            const p = [...form.photos]; p[i] = e.target.value; set('photos',p);
                          }}/>
                      </div>
                      {url && (
                        <div style={{width:52, height:52, borderRadius:'var(--r-sm)', overflow:'hidden', flexShrink:0, border:'1px solid var(--border)'}}>
                          <img src={url} alt="" style={{width:'100%', height:'100%', objectFit:'cover'}}
                            onError={e=>{ e.currentTarget.style.opacity='.2'; }}/>
                        </div>
                      )}
                    </div>
                  ))}
                  <button className="btn btn-ghost btn-sm" style={{alignSelf:'flex-start'}}
                    onClick={()=>set('photos',[...form.photos,''])}>
                    + Add another photo
                  </button>
                </div>
              </Field>

              {form.photos.filter(Boolean).length > 0 && (
                <div>
                  <div style={{fontSize:12, fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:10}}>Preview</div>
                  <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8}}>
                    {form.photos.filter(Boolean).slice(0,6).map((url,i)=>(
                      <div key={i} style={{aspectRatio:'4/3', borderRadius:'var(--r-sm)', overflow:'hidden', background:'var(--surface-sunken)'}}>
                        <img src={url} alt="" style={{width:'100%', height:'100%', objectFit:'cover'}}/>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Field label="Initial status">
                <div style={{display:'flex', gap:8}}>
                  {[{v:'pending',l:'Pending review'},{v:'live',l:'Publish immediately'},{v:'rejected',l:'Rejected'}].map(s=>(
                    <button key={s.v} onClick={()=>set('status',s.v)}
                      style={{
                        padding:'7px 16px', borderRadius:99, fontSize:12, fontWeight:600, cursor:'pointer',
                        border:'1.5px solid', borderColor: form.status===s.v?'var(--text)':'var(--border)',
                        background: form.status===s.v?'var(--text)':'transparent',
                        color: form.status===s.v?'var(--bg)':'var(--text)',
                      }}>{s.l}</button>
                  ))}
                </div>
              </Field>

              {/* Summary */}
              <div style={{padding:'18px 20px', borderRadius:'var(--r-md)', background:'var(--surface-sunken)', border:'1px solid var(--border)'}}>
                <div style={{fontSize:13, fontWeight:700, marginBottom:12}}>Summary</div>
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, fontSize:13}}>
                  <SummaryRow label="Type" value={`${form.bhk} BHK ${form.propertyType}`}/>
                  <SummaryRow label="City" value={`${form.locality}, ${form.city}`}/>
                  <SummaryRow label="Area" value={form.area ? `${form.area} sqft` : '—'}/>
                  <SummaryRow label="Floor" value={form.floor && form.totalFloors ? `${form.floor} / ${form.totalFloors}` : '—'}/>
                  <SummaryRow label="Rent" value={form.rent ? `₹${parseInt(form.rent).toLocaleString('en-IN')}` : '—'}/>
                  <SummaryRow label="Furnishing" value={form.furnishing}/>
                  <SummaryRow label="Photos" value={`${form.photos.filter(Boolean).length} uploaded`}/>
                  <SummaryRow label="Amenities" value={`${form.amenities.length} selected`}/>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{padding:'16px 28px', borderTop:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0, background:'var(--surface)'}}>
          <button className="btn btn-ghost" onClick={()=>{ if(step>1) setStep(s=>s-1); else onClose(); }}>
            {step > 1 ? '← Back' : 'Cancel'}
          </button>
          <div style={{display:'flex', gap:8}}>
            {step < TOTAL_STEPS ? (
              <button className="btn btn-brand" disabled={!canNext()} onClick={()=>setStep(s=>s+1)}>
                Continue →
              </button>
            ) : (
              <button className="btn btn-brand" onClick={handleSubmit}>
                {isEdit ? '✓ Save changes' : '✓ Add property'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({label, value}) {
  return (
    <div style={{display:'flex', justifyContent:'space-between', gap:8}}>
      <span style={{color:'var(--text-muted)'}}>{label}</span>
      <span style={{fontWeight:600, textAlign:'right'}}>{value || '—'}</span>
    </div>
  );
}

// ─── Property View Modal ──────────────────────────────────────────────────
function PropertyViewModal({prop, onClose, onEdit}) {
  const photos = prop.photos || [prop.photo];
  const [active, setActive] = useState(0);

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:200,
      background:'rgba(0,0,0,.6)', backdropFilter:'blur(4px)',
      display:'flex', alignItems:'center', justifyContent:'center', padding:24,
    }} onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}>
      <div style={{
        background:'var(--surface)', borderRadius:'var(--r-lg)', width:'100%', maxWidth:760,
        maxHeight:'90vh', overflow:'hidden', display:'flex', flexDirection:'column',
        boxShadow:'var(--sh-pop)',
      }}>
        {/* Header */}
        <div style={{padding:'18px 24px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0}}>
          <div>
            <div style={{fontSize:20, fontWeight:800, letterSpacing:'-0.025em'}}>{prop.bhk} BHK in {prop.locality}</div>
            <div style={{fontSize:12, color:'var(--text-muted)', marginTop:4, fontFamily:'var(--f-mono)'}}>{prop.id}</div>
          </div>
          <div style={{display:'flex', gap:8}}>
            <button className="btn btn-outline btn-sm" onClick={onEdit}>Edit</button>
            <button onClick={onClose} style={{background:'var(--surface-sunken)', border:0, borderRadius:'50%', width:34, height:34, cursor:'pointer', fontSize:16, display:'grid', placeItems:'center'}}>✕</button>
          </div>
        </div>

        <div style={{flex:1, overflowY:'auto', padding:24}}>
          {/* Gallery */}
          <div style={{marginBottom:20}}>
            <div style={{height:280, borderRadius:'var(--r-md)', overflow:'hidden', marginBottom:8}}>
              <Img src={photos[active] || photos[0]} style={{width:'100%', height:'100%'}}/>
            </div>
            {photos.length > 1 && (
              <div style={{display:'flex', gap:8, overflowX:'auto'}}>
                {photos.map((p,i)=>(
                  <div key={i} onClick={()=>setActive(i)} style={{
                    width:64, height:48, borderRadius:'var(--r-sm)', overflow:'hidden', flexShrink:0,
                    cursor:'pointer', border:'2px solid', borderColor: active===i?'var(--brand-500)':'transparent',
                  }}>
                    <img src={p} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Specs grid */}
          <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20}}>
            {[
              {l:'Rent', v:`₹${(prop.rentK||0)}k/mo`},
              {l:'Area', v:`${(prop.area||0).toLocaleString('en-IN')} sqft`},
              {l:'Floor', v:`${prop.floor||'—'} / ${prop.total||'—'}`},
              {l:'Furnishing', v:prop.furnishing||'—'},
              {l:'City', v:prop.city},
              {l:'Locality', v:prop.locality},
              {l:'Type', v:prop.propertyType||'Apartment'},
              {l:'Facing', v:prop.facing||'—'},
            ].map(s=>(
              <div key={s.l} style={{padding:'12px 14px', borderRadius:'var(--r-sm)', background:'var(--surface-sunken)'}}>
                <div style={{fontSize:10, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.08em', fontWeight:600}}>{s.l}</div>
                <div style={{fontSize:15, fontWeight:700, marginTop:4}}>{s.v}</div>
              </div>
            ))}
          </div>

          {/* Status + meta */}
          <div style={{padding:'14px 18px', borderRadius:'var(--r-md)', border:'1px solid var(--border)', fontSize:13}}>
            <div style={{display:'flex', gap:24, flexWrap:'wrap'}}>
              <div><span style={{color:'var(--text-muted)'}}>Status:</span> <strong style={{color: prop.status==='live'?'var(--success)':prop.status==='pending'?'var(--warning)':'var(--error)', textTransform:'capitalize'}}>{prop.status}</strong></div>
              <div><span style={{color:'var(--text-muted)'}}>Added by:</span> <strong>{prop.addedBy||'Admin'}</strong></div>
              <div><span style={{color:'var(--text-muted)'}}>Added on:</span> <strong>{prop.addedOn||'—'}</strong></div>
              {prop.isBroker && <div><span style={{color:'var(--text-muted)'}}>Source:</span> <strong>Broker listing</strong></div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { AdminUsersPage, AdminRevenuePage, AdminCmsPage, AdminPropertiesPage });
