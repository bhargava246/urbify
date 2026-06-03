"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

function Logo() {
  return (
    <Link href="/" style={{textDecoration:'none',color:'inherit',display:'flex',alignItems:'center',gap:8}}>
      <div style={{width:32,height:32,borderRadius:8,background:'var(--text)',color:'var(--bg)',display:'grid',placeItems:'center',fontWeight:900,fontSize:14,fontFamily:'var(--f-display)'}}>U</div>
      <span style={{fontWeight:800,fontSize:17,letterSpacing:'-0.02em',fontFamily:'var(--f-display)'}}>urbify</span>
    </Link>
  );
}

export function SiteHeader() {
  const router    = useRouter();
  const pathname  = usePathname();
  const [user, setUser]       = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Read auth from localStorage on mount + on focus (tab switch)
  const syncAuth = () => {
    try {
      const stored = localStorage.getItem('urb_user');
      setUser(stored ? JSON.parse(stored) : null);
    } catch { setUser(null); }
  };

  useEffect(() => {
    syncAuth();
    window.addEventListener('focus', syncAuth);
    window.addEventListener('urbify:auth', syncAuth); // custom event from login
    return () => {
      window.removeEventListener('focus', syncAuth);
      window.removeEventListener('urbify:auth', syncAuth);
    };
  }, []);

  // Close menu on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const logout = () => {
    const token = localStorage.getItem('urb_access');
    if (token) fetch('/api/v1/auth/logout', { method:'POST', headers:{ Authorization:`Bearer ${token}` } }).catch(()=>{});
    localStorage.removeItem('urb_access');
    localStorage.removeItem('urb_refresh');
    localStorage.removeItem('urb_user');
    setUser(null);
    setMenuOpen(false);
    router.push('/');
  };

  const role  = user?.role;
  const dName = user?.ownerProfile?.fullName || user?.brokerProfile?.fullName || user?.clientProfile?.fullName || 'Account';
  const initials = dName.split(' ').map((w:string)=>w[0]).join('').slice(0,2).toUpperCase();

  const dashLink = role === 'OWNER' ? '/owner/dashboard' : role === 'BROKER' ? '/broker/dashboard' : role === 'ADMIN' ? '/admin' : '/dashboard';

  const isPortal = pathname?.startsWith('/dashboard') || pathname?.startsWith('/owner') || pathname?.startsWith('/broker') || pathname?.startsWith('/admin');

  if (isPortal) return null; // portals have their own sidebar nav

  return (
    <header style={{
      position:'sticky', top:0, zIndex:100,
      height:64, display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'0 28px', background:'var(--bg)', borderBottom:'1px solid var(--border)',
    }}>
      <Logo/>

      <nav style={{display:'flex', alignItems:'center', gap:24}}>
        <Link href="/rent"         style={navStyle(pathname==='/rent')}>Rent</Link>
        <Link href="/rent"         style={navStyle(false)}>Buy</Link>
        <Link href="/how-it-works" style={navStyle(pathname==='/how-it-works')}>How it works</Link>
        <Link href="/pricing"      style={navStyle(pathname==='/pricing')}>Pricing</Link>
      </nav>

      <div style={{display:'flex', alignItems:'center', gap:12}}>
        {user ? (
          <>
            <Link href={dashLink} style={{fontSize:13, color:'var(--text-muted)', textDecoration:'none', fontWeight:500}}>My Dashboard</Link>
            <div style={{position:'relative'}} ref={menuRef}>
              <button onClick={()=>setMenuOpen(o=>!o)} style={{
                width:36, height:36, borderRadius:'50%', background:'var(--brand-500)', color:'#fff',
                border:0, cursor:'pointer', fontWeight:700, fontSize:13, display:'grid', placeItems:'center',
              }}>{initials}</button>
              {menuOpen && (
                <div style={{
                  position:'absolute', right:0, top:44, zIndex:200, minWidth:200, padding:'6px 0',
                  background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--r-md)', boxShadow:'var(--sh-2)',
                }}>
                  <div style={{padding:'10px 16px 6px', fontSize:12, color:'var(--text-muted)'}}>Signed in as</div>
                  <div style={{padding:'0 16px 10px', fontSize:13, fontWeight:600, borderBottom:'1px solid var(--border)'}}>{dName}</div>
                  <a style={{display:'block',padding:'10px 16px',fontSize:13,cursor:'pointer',textDecoration:'none',color:'var(--text)'}} href={dashLink}>My dashboard</a>
                  <a style={{display:'block',padding:'10px 16px',fontSize:13,cursor:'pointer',textDecoration:'none',color:'var(--text)'}} href="/notifications">Notifications</a>
                  <a style={{display:'block',padding:'10px 16px',fontSize:13,cursor:'pointer',textDecoration:'none',color:'var(--text)'}} href="/settings">Settings</a>
                  <div style={{height:1,background:'var(--border)',margin:'4px 0'}}/>
                  <button onClick={logout} style={{display:'block',width:'100%',textAlign:'left',padding:'10px 16px',fontSize:13,cursor:'pointer',background:'none',border:'none',color:'var(--danger)'}}>Sign out</button>
                </div>
              )}
            </div>
          </>
        ) : (
          <Link href="/auth" style={{
            padding:'8px 18px', borderRadius:'var(--r-pill)', background:'var(--brand-500)', color:'#fff',
            fontWeight:600, fontSize:13, textDecoration:'none',
          }}>Sign in</Link>
        )}
      </div>
    </header>
  );
}

function navStyle(active: boolean): React.CSSProperties {
  return {
    fontSize:14, fontWeight:500, textDecoration:'none',
    color: active ? 'var(--text)' : 'var(--text-muted)',
    borderBottom: active ? '2px solid var(--brand-500)' : '2px solid transparent',
    paddingBottom:2,
  };
}
