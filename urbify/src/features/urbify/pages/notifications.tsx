// @ts-nocheck
"use client";
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { reverseGeocode, autocomplete } from '@/lib/olamaps';
import {
  LISTINGS, CITIES, LOCALITIES, PHOTOS, INTERIORS, FURNISHING, FACINGS, AMENITIES,
  furnishingLabel, facingLabel, ageLabel, postedLabel, normalizeApiListing,
  AppDataContext, useAppData, OlaMap,
  Icon, Logo, Img, LockedAddress, ListingCard, Modal,
  PortalShell, StatCard, StatusBadge, DashHeader,
} from '../_shared';

function NotificationsPage({nav}) {
  const { authUser } = useAppData();
  const [filter, setFilter] = useState("all");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Normalize API notification to UI shape
  const normalizeNotif = (n) => ({
    id: n.id,
    kind: n.type?.toLowerCase() || 'system',
    read: n.isRead,
    t: n.createdAt ? new Date(n.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short' }) : '',
    icon: n.type === 'UNLOCK' ? <Icon.unlock/> : n.type === 'MATCH' ? '⌕' : <Icon.bolt/>,
    who: n.type === 'UNLOCK' ? 'Payment' : n.type === 'MATCH' ? 'Saved search' : 'System',
    title: n.title || n.message || 'Notification',
    body: n.body || n.message || '',
    cta: n.type === 'UNLOCK' ? 'View listing' : n.type === 'MATCH' ? 'View matches' : 'View',
    action: n.type === 'UNLOCK' ? 'detail' : n.type === 'MATCH' ? 'search' : undefined,
  });

  useEffect(() => {
    const token = localStorage.getItem('urb_access');
    if (!token) { setLoading(false); return; }
    fetch('/api/v1/notifications', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : { data: [] })
      .then(data => {
        const arr = Array.isArray(data) ? data : (data.data || []);
        if (arr.length > 0) setItems(arr.map(normalizeNotif));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const unreadCount = items.filter(i => !i.read).length;
  const filtered = filter === "all"
    ? items
    : filter === "unread"
      ? items.filter(i => !i.read)
      : items.filter(i => i.kind === filter);

  const markRead = async (id) => {
    setItems(prev => prev.map(i => i.id === id ? {...i, read:true} : i));
    const token = localStorage.getItem('urb_access');
    if (token) {
      try {
        await fetch(`/api/v1/notifications/${id}/read`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } });
      } catch {}
    }
  };

  const markAllRead = async () => {
    setItems(prev => prev.map(i => ({...i, read:true})));
    const token = localStorage.getItem('urb_access');
    if (token) {
      try {
        await fetch('/api/v1/notifications/read-all', { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } });
      } catch {}
    }
  };

  const firstName = authUser?.clientProfile?.fullName?.split(' ')[0] || authUser?.ownerProfile?.fullName?.split(' ')[0] || '';
  const portalUser = authUser ? {
    initials: (firstName || 'U').slice(0,2).toUpperCase(),
    name: authUser?.clientProfile?.fullName || authUser?.ownerProfile?.fullName || 'User',
    role: 'Tenant',
    color: 'var(--accent-500)',
  } : CLIENT_USER;

  return (
    <PortalShell user={portalUser} navItems={CLIENT_NAV()} current="notifications" onNav={(id)=>nav(id)}>
      <DashHeader
        title={<>Inbox {unreadCount > 0 && <span style={{fontSize:18, color:'var(--text-muted)', fontWeight:500, marginLeft:8}}>· {unreadCount} unread</span>}</>}
        subtitle="Updates, matches, security, and platform news — all in one place."
        actions={
          <>
            <button className="btn btn-outline btn-sm" onClick={markAllRead} disabled={unreadCount === 0}>Mark all read</button>
            <button className="btn btn-outline btn-sm">⚙ Preferences</button>
          </>
        }/>

      {/* filter chips */}
      <div style={{display:'flex', gap:6, marginBottom:18, flexWrap:'wrap'}}>
        {[
          { id:'all', l:`All · ${items.length}` },
          { id:'unread', l:`Unread · ${unreadCount}` },
          { id:'match', l:`Matches · ${items.filter(i=>i.kind==='match').length}` },
          { id:'unlock', l:`Unlocks & payments · ${items.filter(i=>i.kind==='unlock').length}` },
          { id:'alert', l:`Alerts · ${items.filter(i=>i.kind==='alert').length}` },
          { id:'system', l:`System · ${items.filter(i=>i.kind==='system').length}` },
        ].map(f=>(
          <button key={f.id} onClick={()=>setFilter(f.id)}
            style={{
              padding:'7px 14px', borderRadius:99,
              border:'1.5px solid', borderColor: filter===f.id?'var(--text)':'var(--border)',
              background: filter===f.id?'var(--text)':'transparent',
              color: filter===f.id?'var(--bg)':'var(--text)',
              fontSize:12, fontWeight:600, cursor:'pointer',
            }}>{f.l}</button>
        ))}
      </div>

      {/* notification list */}
      {loading ? (
        <div className="card" style={{padding:'60px 24px', textAlign:'center', color:'var(--text-muted)', fontSize:14}}>
          Loading notifications…
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{padding:'80px 24px', textAlign:'center'}}>
          <div style={{fontSize:40, marginBottom:8}}>✓</div>
          <div className="font-display" style={{fontSize:20, fontWeight:700, letterSpacing:'-0.02em'}}>All caught up.</div>
          <div style={{color:'var(--text-muted)', marginTop:8, fontSize:14}}>Nothing in this filter right now — we'll let you know when something happens.</div>
        </div>
      ) : (
        <div className="card" style={{padding:0, overflow:'hidden'}}>
          {filtered.map((n, i)=>(
            <div key={n.id} onClick={()=>!n.read && markRead(n.id)} style={{
              padding:'18px 24px',
              borderTop: i===0 ? 0 : '1px solid var(--border)',
              display:'flex', alignItems:'flex-start', gap:18,
              background: n.read ? 'transparent' : 'color-mix(in oklab, var(--brand-500) 5%, transparent)',
              cursor: n.read ? 'default' : 'pointer',
              position:'relative',
            }}>
              {/* unread dot */}
              {!n.read && (
                <div style={{
                  position:'absolute', left:10, top:'50%', transform:'translateY(-50%)',
                  width:6, height:6, borderRadius:'50%', background:'var(--brand-500)',
                }}/>
              )}

              {/* icon */}
              <div style={{
                width:44, height:44, borderRadius:'var(--r-md)', flexShrink:0,
                background:
                  n.urgent ? 'color-mix(in oklab, var(--warning) 18%, transparent)' :
                  n.kind === 'unlock' && n.refund ? 'var(--surface-sunken)' :
                  n.kind === 'unlock' ? 'var(--brand-500)' :
                  n.kind === 'match' ? 'var(--accent-500)' :
                  'var(--surface-sunken)',
                color:
                  n.urgent ? 'var(--warning)' :
                  n.kind === 'unlock' && !n.refund ? '#fff' :
                  n.kind === 'match' ? '#1A1100' :
                  'var(--text)',
                display:'grid', placeItems:'center',
                fontSize:18,
              }}>{n.icon}</div>

              {/* body */}
              <div style={{flex:1, minWidth:0}}>
                <div style={{display:'flex', alignItems:'baseline', gap:12, marginBottom:6}}>
                  <span style={{fontSize:11, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.08em', fontWeight:600}}>{n.who}</span>
                  {n.urgent && <span style={{fontSize:10, color:'var(--warning)', fontWeight:700, textTransform:'uppercase', letterSpacing:'.08em'}}>● URGENT</span>}
                  <div style={{flex:1}}/>
                  <span style={{fontSize:11, color:'var(--text-faint)'}}>{n.t}</span>
                </div>
                <div style={{fontSize:15, fontWeight: n.read ? 500 : 700, color:'var(--text)', lineHeight:1.3}}>{n.title}</div>
                <div style={{fontSize:13, color:'var(--text-muted)', marginTop:6, lineHeight:1.5, maxWidth:680}}>{n.body}</div>

                <div style={{display:'flex', alignItems:'center', gap:10, marginTop:12}}>
                  <button className="btn btn-outline btn-sm" onClick={(e)=>{e.stopPropagation(); n.action && nav(n.action);}}>{n.cta} →</button>
                  {!n.read && <button className="btn btn-ghost btn-sm" onClick={(e)=>{e.stopPropagation(); markRead(n.id);}}>Mark as read</button>}
                </div>
              </div>

              {/* amount */}
              {n.amount && (
                <div style={{textAlign:'right', flexShrink:0}}>
                  <div className="font-display" style={{fontSize:22, fontWeight:800, letterSpacing:'-0.025em', color: n.refund ? 'var(--text-muted)' : 'var(--text)'}}>{n.amount}</div>
                  <div style={{fontSize:10, color:'var(--text-faint)', textTransform:'uppercase', letterSpacing:'.08em', fontWeight:600, marginTop:2}}>{n.refund ? 'REFUNDED' : 'PAID'}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* preferences shortcut */}
      <div style={{marginTop:32, padding:'18px 22px', background:'var(--surface-sunken)', borderRadius:'var(--r-md)', display:'flex', alignItems:'center', gap:14}}>
        <div style={{fontSize:18, color:'var(--text-muted)'}}>⚙</div>
        <div style={{flex:1, fontSize:13, color:'var(--text-muted)'}}>
          Getting too many of these? Customise what we notify you about in <a style={{color:'var(--brand-500)', textDecoration:'underline', cursor:'pointer', fontWeight:600}} onClick={()=>nav('settings')}>notification preferences</a>.
        </div>
      </div>
    </PortalShell>
  );
}

// Update CLIENT_NAV to include notifications — patch in client-broker-pages.jsx's CLIENT_NAV
// We re-export with a wrapper so the bell shows up in tenant portal sidebar:
function CLIENT_NAV_WITH_NOTIF() {
  return [
    { id:'clientDash',    label:'Dashboard',    icon:'◧' },
    { id:'notifications', label:'Inbox',        icon:'✉', badge:'3', badgeTone:'danger' },
    { id:'clientShort',   label:'Shortlisted',  icon:'♡', badge:'7' },
    { id:'compare',       label:'Compare',      icon:'⊟' },
    { id:'clientTx',      label:'Transactions', icon:'≡' },
    { id:'clientSearches',label:'Saved searches', icon:'⌕', badge:'3' },
    { divider:'account' },
    { id:'settings', label:'Profile', icon:'◌' },
    { id:'home', label:'Back to site', icon:'↗' },
  ];
}


export { NotificationsPage };
