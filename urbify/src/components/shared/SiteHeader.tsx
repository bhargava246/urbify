"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

function Logo() {
  return (
    <Link href="/" style={{textDecoration:'none',color:'inherit',display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
      <div style={{width:32,height:32,borderRadius:8,background:'var(--text)',color:'var(--bg)',display:'grid',placeItems:'center',fontWeight:900,fontSize:14,fontFamily:'var(--f-display)'}}>U</div>
      <span style={{fontWeight:800,fontSize:17,letterSpacing:'-0.02em',fontFamily:'var(--f-display)'}}>urbify</span>
    </Link>
  );
}

const NAV_LINKS = [
  { href:'/rent',         label:'Rent' },
  { href:'/buy',          label:'Buy' },
  { href:'/how-it-works', label:'How it works' },
  { href:'/pricing',      label:'Pricing' },
];

export function SiteHeader() {
  const router   = useRouter();
  const pathname = usePathname();
  const [user, setUser]             = useState<any>(null);
  const [menuOpen, setMenuOpen]     = useState(false);   // avatar dropdown
  const [mobileOpen, setMobileOpen] = useState(false);   // mobile nav drawer
  const menuRef   = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  const syncAuth = () => {
    try {
      const stored = localStorage.getItem('urb_user');
      if (!stored) { setUser(null); return; }
      const parsed = JSON.parse(stored);
      setUser(parsed?.data ?? parsed);
    } catch { setUser(null); }
  };

  useEffect(() => {
    syncAuth();
    window.addEventListener('focus', syncAuth);
    window.addEventListener('urbify:auth', syncAuth);
    return () => {
      window.removeEventListener('focus', syncAuth);
      window.removeEventListener('urbify:auth', syncAuth);
    };
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (menuRef.current   && !menuRef.current.contains(e.target as Node))   setMenuOpen(false);
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) setMobileOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // Close mobile nav on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const logout = () => {
    const token = localStorage.getItem('urb_access');
    if (token) fetch('/api/v1/auth/logout', { method:'POST', headers:{ Authorization:`Bearer ${token}` } }).catch(()=>{});
    ['urb_access','urb_refresh','urb_user'].forEach(k => localStorage.removeItem(k));
    setUser(null);
    setMenuOpen(false);
    setMobileOpen(false);
    router.push('/');
  };

  const role     = user?.role;
  const dName    = user?.ownerProfile?.fullName || user?.brokerProfile?.fullName || user?.clientProfile?.fullName || 'Account';
  const initials = dName.split(' ').map((w:string)=>w[0]).join('').slice(0,2).toUpperCase();
  const dashLink  = role==='OWNER' ? '/owner/dashboard' : role==='BROKER' ? '/broker/dashboard' : role==='ADMIN' ? '/admin' : '/dashboard';
  const dashLabel = role==='OWNER' ? 'Owner Dashboard' : role==='BROKER' ? 'Broker Dashboard' : role==='ADMIN' ? 'Admin Panel' : 'My Dashboard';

  const isPortal = pathname?.startsWith('/dashboard') || pathname?.startsWith('/owner') || pathname?.startsWith('/broker') || pathname?.startsWith('/admin');
  if (isPortal) return null;

  return (
    <>
      <header style={{
        position:'sticky', top:0, zIndex:100,
        height:64, display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'0 20px', background:'var(--bg)', borderBottom:'1px solid var(--border)',
      }}>
        <Logo/>

        {/* Desktop nav links -- hidden on mobile via class */}
        <nav className="site-nav-desktop" style={{display:'flex', alignItems:'center', gap:24}}>
          {NAV_LINKS.map(l => (
            <Link key={l.href} href={l.href} style={navStyle(pathname===l.href)}>{l.label}</Link>
          ))}
        </nav>

        {/* Right side */}
        <div style={{display:'flex', alignItems:'center', gap:10}}>
          {/* Desktop: dashboard link + avatar */}
          {user ? (
            <>
              <Link href={dashLink} className="site-nav-desktop" style={{fontSize:13, color:'var(--text-muted)', textDecoration:'none', fontWeight:500}}>{dashLabel}</Link>
              <div style={{position:'relative'}} ref={menuRef}>
                <button onClick={()=>setMenuOpen(o=>!o)} style={{
                  width:36, height:36, borderRadius:'50%', background:'var(--brand-500)', color:'#fff',
                  border:0, cursor:'pointer', fontWeight:700, fontSize:13, display:'grid', placeItems:'center',
                  overflow:'hidden', padding:0, flexShrink:0,
                }}>
                  {user?.avatarUrl
                    ? <img src={user.avatarUrl} alt={initials} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                    : initials}
                </button>
                {menuOpen && (
                  <div style={{
                    position:'absolute', right:0, top:44, zIndex:200, minWidth:200, padding:'6px 0',
                    background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--r-md)', boxShadow:'var(--sh-2)',
                  }}>
                    <div style={{padding:'10px 16px 6px', fontSize:12, color:'var(--text-muted)'}}>Signed in as</div>
                    <div style={{padding:'0 16px 10px', fontSize:13, fontWeight:600, borderBottom:'1px solid var(--border)'}}>{dName}</div>
                    <a style={dropItem} href={dashLink}>{dashLabel}</a>
                    <a style={dropItem} href="/notifications">Notifications</a>
                    <a style={dropItem} href="/settings">Settings</a>
                    <div style={{height:1,background:'var(--border)',margin:'4px 0'}}/>
                    <button onClick={logout} style={{...dropItem,display:'block',width:'100%',textAlign:'left',background:'none',border:'none',color:'var(--danger)'} as React.CSSProperties}>Sign out</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link href="/auth" style={{
              padding:'8px 18px', borderRadius:'var(--r-pill)', background:'var(--brand-500)', color:'#fff',
              fontWeight:600, fontSize:13, textDecoration:'none', whiteSpace:'nowrap',
            }}>Sign in</Link>
          )}

          {/* Hamburger -- shown on mobile only */}
          <button
            className="site-hamburger"
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Open menu"
            style={{
              display:'none',
              flexDirection:'column', justifyContent:'center', alignItems:'center', gap:5,
              width:36, height:36, background:'none', border:0, cursor:'pointer', padding:4,
              borderRadius:'var(--r-sm)', flexShrink:0,
            }}
          >
            <span style={{display:'block', width:20, height:2, background:'var(--text)', borderRadius:2, transition:'transform .2s',
              transform: mobileOpen ? 'rotate(45deg) translate(5px,5px)' : 'none'}}/>
            <span style={{display:'block', width:20, height:2, background:'var(--text)', borderRadius:2,
              opacity: mobileOpen ? 0 : 1, transition:'opacity .2s'}}/>
            <span style={{display:'block', width:20, height:2, background:'var(--text)', borderRadius:2, transition:'transform .2s',
              transform: mobileOpen ? 'rotate(-45deg) translate(5px,-5px)' : 'none'}}/>
          </button>
        </div>
      </header>

      {/* Mobile nav drawer */}
      {mobileOpen && (
        <div ref={drawerRef} style={{
          position:'fixed', top:64, left:0, right:0, zIndex:99,
          background:'var(--bg)', borderBottom:'1px solid var(--border)',
          padding:'8px 0 16px', boxShadow:'0 8px 24px rgba(0,0,0,.08)',
        }}>
          {NAV_LINKS.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)} style={{
              display:'block', padding:'14px 20px', fontSize:15, fontWeight:500,
              textDecoration:'none', color: pathname===l.href ? 'var(--brand-500)' : 'var(--text)',
              borderLeft: pathname===l.href ? '3px solid var(--brand-500)' : '3px solid transparent',
            }}>{l.label}</Link>
          ))}
          {user ? (
            <>
              <div style={{height:1, background:'var(--border)', margin:'8px 20px'}}/>
              <a href={dashLink} style={{display:'block', padding:'14px 20px', fontSize:15, fontWeight:500, textDecoration:'none', color:'var(--text)'}}>{dashLabel}</a>
              <a href="/settings" style={{display:'block', padding:'14px 20px', fontSize:15, fontWeight:500, textDecoration:'none', color:'var(--text)'}}>Settings</a>
              <button onClick={logout} style={{display:'block', width:'100%', textAlign:'left', padding:'14px 20px', fontSize:15, fontWeight:500, background:'none', border:'none', cursor:'pointer', color:'var(--danger)'}}>Sign out</button>
            </>
          ) : (
            <>
              <div style={{height:1, background:'var(--border)', margin:'8px 20px'}}/>
              <div style={{padding:'8px 20px'}}>
                <Link href="/auth" onClick={()=>setMobileOpen(false)} style={{
                  display:'block', textAlign:'center', padding:'12px', borderRadius:'var(--r-pill)',
                  background:'var(--brand-500)', color:'#fff', fontWeight:600, fontSize:15, textDecoration:'none',
                }}>Sign in</Link>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}

const dropItem: React.CSSProperties = {
  display:'block', padding:'10px 16px', fontSize:13, cursor:'pointer',
  textDecoration:'none', color:'var(--text)',
};

function navStyle(active: boolean): React.CSSProperties {
  return {
    fontSize:14, fontWeight:500, textDecoration:'none',
    color: active ? 'var(--text)' : 'var(--text-muted)',
    borderBottom: active ? '2px solid var(--brand-500)' : '2px solid transparent',
    paddingBottom:2, whiteSpace:'nowrap',
  };
}
