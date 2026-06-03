// portal-shell.jsx — shared sidebar + topbar for dashboards

function PortalShell({user, navItems, current, onNav, children}) {
  return (
    <div style={{display:'grid', gridTemplateColumns:'248px 1fr', minHeight:'calc(100vh - 64px)', background:'var(--surface-sunken)'}}>
      <aside style={{
        background:'var(--surface)', borderRight:'1px solid var(--border)',
        padding:'24px 16px', display:'flex', flexDirection:'column',
        position:'sticky', top:64, height:'calc(100vh - 64px)',
      }}>
        {/* user card */}
        <div style={{display:'flex', alignItems:'center', gap:12, padding:'10px 12px', marginBottom:20}}>
          <div style={{
            width:40, height:40, borderRadius:'50%',
            background: user.color || 'var(--brand-500)',
            color:'#fff',
            display:'grid', placeItems:'center',
            fontWeight:700, fontSize:14,
          }}>{user.initials}</div>
          <div style={{minWidth:0, flex:1}}>
            <div style={{fontSize:13, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{user.name}</div>
            <div style={{fontSize:11, color:'var(--text-muted)'}}>{user.role}</div>
          </div>
        </div>

        <nav style={{display:'flex', flexDirection:'column', gap:2, flex:1}}>
          {navItems.map(item=>{
            if (item.divider) return <div key={item.divider} style={{fontSize:10, color:'var(--text-faint)', fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', padding:'14px 12px 6px'}}>{item.divider}</div>;
            const active = item.id === current;
            return (
              <button key={item.id} onClick={()=>onNav(item.id)} style={{
                display:'flex', alignItems:'center', gap:12,
                padding:'10px 12px', borderRadius:'var(--r-sm)',
                background: active ? 'var(--surface-sunken)' : 'transparent',
                border:0, cursor:'pointer', textAlign:'left',
                font:'inherit', color: active ? 'var(--text)' : 'var(--text-muted)',
                fontWeight: active ? 600 : 500, fontSize:14,
                transition:'background .15s',
              }}>
                <span style={{fontSize:16, color: active ? 'var(--text)' : 'var(--text-muted)'}}>{item.icon}</span>
                <span style={{flex:1}}>{item.label}</span>
                {item.badge && <span className="chip" style={{height:18, padding:'0 7px', fontSize:10, fontWeight:700, background: item.badgeTone === 'danger' ? 'var(--error)' : 'var(--text)', color:'#fff', border:0}}>{item.badge}</span>}
              </button>
            );
          })}
        </nav>

        <div className="card" style={{marginTop:'auto', padding:14, background:'var(--brand-50)', border:0}}>
          <div className="font-display" style={{fontSize:14, fontWeight:700, letterSpacing:'-0.01em', color:'var(--brand-900)'}}>Need help?</div>
          <div style={{fontSize:12, color:'var(--brand-700)', marginTop:4}}>Chat with our team 9 AM – 8 PM IST</div>
          <button className="btn btn-sm" style={{marginTop:10, background:'var(--brand-500)', color:'#fff', height:30, fontSize:12}}>Open chat</button>
        </div>
      </aside>

      <main style={{padding:'32px 36px', minWidth:0}}>{children}</main>
    </div>
  );
}

// ─── small dashboard components ───────────────────────────────────────────
function StatCard({label, value, trend, sub, color}) {
  return (
    <div className="card" style={{padding:22, display:'flex', flexDirection:'column', gap:8}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
        <div style={{fontSize:12, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.08em', fontWeight:600}}>{label}</div>
        {color && <span style={{width:10, height:10, borderRadius:'50%', background:color}}/>}
      </div>
      <div className="font-display" style={{fontSize:36, fontWeight:800, letterSpacing:'-0.035em', lineHeight:1, marginTop:4}}>{value}</div>
      <div style={{display:'flex', gap:8, alignItems:'baseline', marginTop:2, fontSize:12}}>
        {trend && <span style={{
          color: trend.startsWith('+') ? 'var(--success)' : 'var(--error)',
          fontWeight:600,
        }}>{trend}</span>}
        {sub && <span style={{color:'var(--text-muted)'}}>{sub}</span>}
      </div>
    </div>
  );
}

function StatusBadge({status}) {
  const map = {
    live:    { bg:'var(--success)', fg:'#fff', label:'Live'},
    pending: { bg:'#FEF3C7', fg:'#92400E', label:'Pending'},
    expired: { bg:'var(--surface-sunken)', fg:'var(--text-muted)', label:'Expired'},
    rented:  { bg:'var(--text)', fg:'var(--bg)', label:'Rented'},
    flagged: { bg:'#FEE2E2', fg:'#991B1B', label:'Flagged'},
    approved:{ bg:'var(--success)', fg:'#fff', label:'Approved'},
    rejected:{ bg:'#FEE2E2', fg:'#991B1B', label:'Rejected'},
  };
  const s = map[status] || map.live;
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:6,
      padding:'4px 10px', borderRadius:99,
      background:s.bg, color:s.fg,
      fontSize:11, fontWeight:600,
    }}>
      <span style={{width:6, height:6, borderRadius:'50%', background:s.fg, opacity: status === 'live' ? 1 : .5}}/>
      {s.label}
    </span>
  );
}

function DashHeader({title, subtitle, actions}) {
  return (
    <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:28, gap:16, flexWrap:'wrap'}}>
      <div>
        <h1 className="font-display" style={{fontSize:32, fontWeight:800, letterSpacing:'-0.035em', margin:0}}>{title}</h1>
        {subtitle && <div style={{fontSize:14, color:'var(--text-muted)', marginTop:6}}>{subtitle}</div>}
      </div>
      {actions && <div style={{display:'flex', gap:8}}>{actions}</div>}
    </div>
  );
}

Object.assign(window, { PortalShell, StatCard, StatusBadge, DashHeader });
