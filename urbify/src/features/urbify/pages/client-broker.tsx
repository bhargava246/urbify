// @ts-nocheck
"use client";
import React, { useState, useEffect, useMemo } from 'react';
import {
  normalizeApiListing,
  useAppData,
  Icon, Img, ListingCard,
  PortalShell, StatCard, StatusBadge, DashHeader,
} from '../_shared';
import { authFetch } from '@/lib/authFetch';

export const CLIENT_USER = { initials:"?", name:"Loading…", role:"Tenant", color:'var(--accent-500)' };
export const BROKER_USER = { initials:"?", name:"Loading…", role:"Broker", color:'var(--text)' };

// notifCount and shortlistCount are optional — 0 by default so existing callers work unchanged
export const CLIENT_NAV = (notifCount = 0, shortlistCount = 0) => [
  { id:'clientDash',    label:'Dashboard',    icon:'◧' },
  { id:'notifications', label:'Inbox',        icon:'✉',
    ...(notifCount > 0 ? { badge: String(notifCount), badgeTone:'danger' } : {}) },
  { id:'clientShort',   label:'Shortlisted',  icon:'♡',
    ...(shortlistCount > 0 ? { badge: String(shortlistCount) } : {}) },
  { id:'compare',       label:'Compare',      icon:'⊟' },
  { id:'clientTx',      label:'Transactions', icon:'≡' },
  { id:'clientSearches',label:'Saved searches', icon:'⌕' },
  { divider:'account' },
  { id:'settings', label:'Profile', icon:'◌' },
  { id:'home', label:'Back to site', icon:'↗' },
];

export const BROKER_NAV = () => [
  { id:'brokerDash',  label:'Dashboard',  icon:'◧' },
  { id:'brokerList',  label:'Portfolio',  icon:'⊞' },
  { id:'brokerInq',   label:'Leads',      icon:'◐', badgeTone:'danger' },
  { id:'brokerCommission', label:'Commission', icon:'₹' },
  { id:'ownerNew',    label:'Add listing', icon:'＋' },
  { divider:'account' },
  { id:'settings', label:'Settings', icon:'⚙' },
  { id:'home', label:'Back to site', icon:'↗' },
];

function portalUserFromAuth(authUser) {
  if (!authUser) return CLIENT_USER;
  const fullName = authUser?.clientProfile?.fullName
    || authUser?.ownerProfile?.fullName
    || authUser?.brokerProfile?.fullName
    || '';
  const firstName = fullName.split(' ')[0] || 'U';
  return {
    initials: firstName.slice(0,2).toUpperCase(),
    name: fullName || authUser?.email || 'User',
    role: 'Tenant',
    color: 'var(--accent-500)',
    avatarUrl: authUser?.avatarUrl || null,
  };
}

function profileCompletion(authUser) {
  if (!authUser) return 0;
  const name = authUser?.clientProfile?.fullName || authUser?.ownerProfile?.fullName || '';
  const parts = name.trim().split(' ');
  const fields = [!!parts[0], !!parts[1], !!authUser?.email, !!authUser?.phone];
  return Math.round(fields.filter(Boolean).length / fields.length * 100);
}

// ─── CLIENT DASHBOARD ─────────────────────────────────────────────────────
function ClientDashPage({nav}) {
  const { authUser, listings: ctxListings, shortlistIds } = useAppData();
  const [unlocks, setUnlocks] = useState([]);
  const [loadingUnlocks, setLoadingUnlocks] = useState(true);
  const [savedSearches, setSavedSearches] = useState([]);
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('urb_access');
    if (!token) { setLoadingUnlocks(false); return; }

    authFetch('/api/v1/users/me/unlocks')
      .then(r => r.ok ? r.json() : null)
      .then(raw => {
        const inner = raw?.data ?? raw;
        const arr = Array.isArray(inner) ? inner : (inner?.data ?? []);
        setUnlocks(Array.isArray(arr) ? arr : []);
      })
      .catch(() => {})
      .finally(() => setLoadingUnlocks(false));

    authFetch('/api/v1/search/saved')
      .then(r => r.ok ? r.json() : null)
      .then(raw => {
        const inner = raw?.data ?? raw;
        const arr = Array.isArray(inner) ? inner : (inner?.data ?? []);
        setSavedSearches(Array.isArray(arr) ? arr : []);
      })
      .catch(() => {});

    authFetch('/api/v1/notifications/unread-count')
      .then(r => r.ok ? r.json() : null)
      .then(raw => setNotifCount(Number(raw?.data?.count ?? raw?.count ?? 0) || 0))
      .catch(() => {});
  }, []);

  const saved = ctxListings.filter(l => shortlistIds.includes(l.id));
  const transactions = (unlocks || []).map(u => ({
    id: u.id || '',
    listing: normalizeApiListing(u.listing || {
      id: u.listingId || '',
      locality: u.listing?.locality || '',
      city: u.listing?.city || '',
      rentOrPrice: u.totalAmountInr || 0,
    }),
    date: u.createdAt
      ? new Date(u.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })
      : '—',
    amount: u.totalAmountInr || 0,
    status: u.status === 'SUCCESS' ? 'completed' : u.status === 'REFUNDED' ? 'refunded' : 'pending',
  }));

  const firstName = authUser?.clientProfile?.fullName?.split(' ')[0]
    || authUser?.ownerProfile?.fullName?.split(' ')[0]
    || 'there';
  const completionPct = profileCompletion(authUser);
  const portalUser = portalUserFromAuth(authUser);

  return (
    <PortalShell user={portalUser} navItems={CLIENT_NAV(notifCount, saved.length)} current="clientDash" onNav={(id)=>nav(id)}>
      <DashHeader title={`Hi ${firstName}.`}
        subtitle="Where you left off in your house hunt."
        actions={<button className="btn btn-brand btn-sm" onClick={()=>nav('search')}>＋ New search</button>}/>

      <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:14, marginBottom:24}}>
        <StatCard label="Shortlisted" value={String(saved.length)} sub="properties saved"/>
        <StatCard label="Unlocked"
          value={loadingUnlocks ? '…' : String(transactions.filter(t=>t.status==='completed').length)}
          sub="contacts"/>
        <StatCard label="Transactions"
          value={loadingUnlocks ? '…' : String(transactions.length)}
          sub="total"/>
        <StatCard label="Profile" value={`${completionPct}%`} sub="complete" color="var(--accent-500)"/>
      </div>

      {/* profile completion banner — hidden when 100% complete */}
      {completionPct < 100 && (
        <div className="card" style={{padding:'18px 22px', display:'flex', alignItems:'center', gap:18, marginBottom:24, background:'var(--brand-50)', border:0}}>
          <div style={{width:48, height:48, borderRadius:'50%', background:'var(--brand-500)', color:'#fff', display:'grid', placeItems:'center', fontSize:20}}>◌</div>
          <div style={{flex:1}}>
            <div style={{fontSize:14, fontWeight:600, color:'var(--brand-900)'}}>Complete your profile to get owners' attention</div>
            <div style={{fontSize:12, color:'var(--brand-700)', marginTop:2}}>Verified tenants get replies 2.3× faster. Add your phone number and full name.</div>
            <div style={{height:6, background:'rgba(255,255,255,.5)', borderRadius:99, marginTop:10, overflow:'hidden'}}>
              <div style={{height:'100%', width:`${completionPct}%`, background:'var(--brand-500)', borderRadius:99, transition:'width .4s'}}/>
            </div>
          </div>
          <button className="btn btn-brand btn-sm" onClick={()=>nav('settings')}>Complete</button>
        </div>
      )}

      {/* shortlisted */}
      <div style={{marginBottom:32}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:14}}>
          <div className="font-display" style={{fontSize:18, fontWeight:700, letterSpacing:'-0.02em'}}>Your shortlist</div>
          <button className="btn btn-ghost btn-sm" onClick={()=>nav('clientShort')}>See all {saved.length} →</button>
        </div>
        {saved.length === 0 ? (
          <div className="card" style={{padding:28, textAlign:'center'}}>
            <div style={{fontSize:24, marginBottom:8}}>🏠</div>
            <div style={{fontWeight:600}}>No saved properties yet</div>
            <p style={{color:'var(--text-muted)', fontSize:13, marginTop:6}}>Tap the heart on any listing to shortlist it.</p>
            <button className="btn btn-brand btn-sm" style={{marginTop:14}} onClick={()=>nav('search')}>Browse homes</button>
          </div>
        ) : (
          <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:14}}>
            {saved.slice(0,4).map(l=>(
              <ListingCard key={l.id} listing={l}
                onOpen={()=>nav('detail', l.id)}
                onUnlock={(li)=>nav('unlock', li.id)}
                saved={true}
                onSave={()=>{}}/>
            ))}
          </div>
        )}
      </div>

      {/* saved searches */}
      <div style={{marginBottom:32}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:14}}>
          <div className="font-display" style={{fontSize:18, fontWeight:700, letterSpacing:'-0.02em'}}>Saved searches</div>
          {savedSearches.length > 0 && (
            <button className="btn btn-ghost btn-sm" onClick={()=>nav('clientSearches')}>
              See all {savedSearches.length} →
            </button>
          )}
        </div>
        {savedSearches.length === 0 ? (
          <div className="card" style={{padding:32, textAlign:'center'}}>
            <div style={{fontSize:28, marginBottom:8}}>🔍</div>
            <div style={{fontWeight:600}}>No saved searches yet</div>
            <p style={{color:'var(--text-muted)', fontSize:13, marginTop:6}}>Search for homes and save your filters to get alerts on new matches.</p>
            <button className="btn btn-brand btn-sm" style={{marginTop:14}} onClick={()=>nav('search')}>Start searching</button>
          </div>
        ) : (
          <div className="card" style={{padding:0, overflow:'hidden'}}>
            {savedSearches.slice(0,3).map((s, i) => {
              const label = s.query || s.name || (s.filters
                ? Object.entries(s.filters).filter(([,v])=>v).map(([k,v])=>`${k}: ${v}`).join(' · ')
                : 'Saved search');
              const date = s.createdAt
                ? new Date(s.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short' })
                : '';
              return (
                <div key={s.id} style={{padding:'16px 22px', borderTop: i===0?0:'1px solid var(--border)', display:'flex', alignItems:'center', gap:16}}>
                  <div style={{width:36, height:36, borderRadius:'var(--r-sm)', background:'var(--surface-sunken)', display:'grid', placeItems:'center', fontSize:16, flexShrink:0}}>🔍</div>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{fontSize:14, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{label}</div>
                    {date && <div style={{fontSize:11, color:'var(--text-muted)', marginTop:2}}>Saved {date}</div>}
                  </div>
                  <button className="btn btn-outline btn-sm" onClick={()=>nav('search')}>View matches →</button>
                </div>
              );
            })}
          </div>
        )}
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
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={5} style={{padding:'32px 22px', textAlign:'center', color:'var(--text-muted)', fontSize:13}}>
                    {loadingUnlocks ? 'Loading…' : 'No transactions yet'}
                  </td>
                </tr>
              )}
              {transactions.map(t=>(
                <tr key={t.id} style={{borderTop:'1px solid var(--border)'}}>
                  <td style={{padding:'14px 22px'}}>
                    <div style={{display:'flex', alignItems:'center', gap:12}}>
                      <Img src={t.listing.photo} style={{width:40, height:40, borderRadius:'var(--r-sm)'}}/>
                      <div>
                        <div style={{fontWeight:600}}>{t.listing.bhk} BHK · {t.listing.locality || t.listing.city || '—'}</div>
                        <div style={{fontSize:11, color:'var(--text-muted)', fontFamily:'var(--f-mono)'}}>{t.id}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{padding:'14px 22px', color:'var(--text-muted)'}}>{t.date}</td>
                  <td style={{padding:'14px 22px', fontWeight:700, fontVariantNumeric:'tabular-nums'}}>₹{t.amount.toLocaleString("en-IN")}</td>
                  <td style={{padding:'14px 22px'}}>
                    {t.status === 'refunded'
                      ? <span style={{fontSize:11, color:'var(--text-muted)', fontWeight:600}}>↺ Refunded</span>
                      : t.status === 'completed'
                        ? <span style={{fontSize:11, color:'var(--success)', fontWeight:600}}>✓ Completed</span>
                        : <span style={{fontSize:11, color:'var(--warning)', fontWeight:600}}>⏳ Pending</span>
                    }
                  </td>
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

// ─── CLIENT SHORTLIST ──────────────────────────────────────────────────────
function ClientShortlistPage({nav, savedIds, onSave, onUnlock}) {
  const { listings, shortlistIds: ctxIds, authUser } = useAppData();
  const [sort, setSort] = useState("Recently saved");
  const [compareSet, setCompareSet] = useState([]);
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('urb_access');
    if (!token) return;
    authFetch('/api/v1/notifications/unread-count')
      .then(r => r.ok ? r.json() : null)
      .then(raw => setNotifCount(Number(raw?.data?.count ?? raw?.count ?? 0) || 0))
      .catch(() => {});
  }, []);

  const ids = savedIds ?? ctxIds ?? [];
  const shortlisted = listings.filter(l => ids.includes(l.id));

  const sorted = useMemo(() => {
    const arr = [...shortlisted];
    if (sort === "Price low to high")  return arr.sort((a,b) => (a.rentK||0) - (b.rentK||0));
    if (sort === "Price high to low")  return arr.sort((a,b) => (b.rentK||0) - (a.rentK||0));
    if (sort === "Biggest area")       return arr.sort((a,b) => (b.area||0) - (a.area||0));
    return arr; // "Recently saved" — preserve order
  }, [shortlisted, sort]);

  const toggleCompare = (id) => setCompareSet(s =>
    s.includes(id) ? s.filter(x=>x!==id) : s.length < 3 ? [...s, id] : s
  );

  const handleCompare = () => {
    try { sessionStorage.setItem('urbify_compare_ids', JSON.stringify(compareSet)); } catch {}
    nav('compare');
  };

  const portalUser = portalUserFromAuth(authUser);

  return (
    <PortalShell user={portalUser} navItems={CLIENT_NAV(notifCount, shortlisted.length)} current="clientShort" onNav={(id)=>nav(id)}>
      <DashHeader title="Shortlisted"
        subtitle={shortlisted.length > 0
          ? `${shortlisted.length} saved · select up to 3 to compare`
          : "Properties you've saved while browsing"}
        actions={
          <>
            <select className="input select btn-sm" style={{height:34, fontSize:13}}
              value={sort} onChange={e=>setSort(e.target.value)}>
              <option>Recently saved</option>
              <option>Price low to high</option>
              <option>Price high to low</option>
              <option>Biggest area</option>
            </select>
            {compareSet.length >= 2 && (
              <button className="btn btn-brand btn-sm" onClick={handleCompare}>
                ⊟ Compare {compareSet.length} →
              </button>
            )}
          </>
        }/>

      {/* compare selection strip */}
      {compareSet.length > 0 && (
        <div className="card" style={{
          padding:'12px 18px', marginBottom:18,
          background:'var(--text)', color:'var(--bg)', border:0,
          display:'flex', alignItems:'center', gap:14, flexWrap:'wrap',
        }}>
          <span style={{fontSize:13, fontWeight:600}}>{compareSet.length} of 3 selected</span>
          <div style={{flex:1, display:'flex', gap:6, flexWrap:'wrap'}}>
            {compareSet.map(id => {
              const l = listings.find(x=>x.id===id);
              if (!l) return null;
              return (
                <span key={id} className="chip" style={{background:'rgba(255,255,255,.12)', color:'#fff', border:0, height:24, display:'flex', alignItems:'center', gap:4}}>
                  {l.bhk} BHK · {l.locality}
                  <button onClick={()=>toggleCompare(id)} style={{background:'transparent', border:0, color:'#fff', cursor:'pointer', padding:'0 2px', fontSize:14, lineHeight:1}}>×</button>
                </span>
              );
            })}
          </div>
          <button className="btn btn-accent btn-sm" disabled={compareSet.length < 2} onClick={handleCompare}>
            Compare {compareSet.length} →
          </button>
        </div>
      )}

      {shortlisted.length === 0 ? (
        <div className="card" style={{padding:48, textAlign:'center'}}>
          <div style={{fontSize:36, marginBottom:12}}>🏠</div>
          <div style={{fontWeight:600}}>No saved properties yet</div>
          <p style={{color:'var(--text-muted)', marginTop:8}}>Tap the heart on any listing to shortlist it.</p>
          <button className="btn btn-brand btn-sm" style={{marginTop:16}} onClick={()=>nav('search')}>Browse homes</button>
        </div>
      ) : (
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:20}}>
          {sorted.map(l => (
            <div key={l.id} style={{position:'relative'}}>
              <ListingCard listing={l}
                onOpen={()=>nav('detail', l.id)}
                onUnlock={onUnlock ? ()=>onUnlock(l) : ()=>nav('unlock', l.id)}
                saved={true}
                onSave={onSave ? ()=>onSave(l.id) : ()=>{}}/>
              {/* compare checkbox overlay */}
              <label style={{
                position:'absolute', top:10, left:10, zIndex:2,
                display:'flex', alignItems:'center', gap:5, padding:'4px 9px',
                borderRadius:99, background:'rgba(255,255,255,.95)', backdropFilter:'blur(8px)',
                fontSize:11, fontWeight:600, cursor:'pointer', userSelect:'none',
              }}>
                <input type="checkbox"
                  checked={compareSet.includes(l.id)}
                  onChange={()=>toggleCompare(l.id)}
                  disabled={!compareSet.includes(l.id) && compareSet.length >= 3}
                  style={{margin:0, cursor:'pointer'}}/>
                Compare
              </label>
            </div>
          ))}
        </div>
      )}
    </PortalShell>
  );
}

// ─── SAVED SEARCHES ───────────────────────────────────────────────────────
function ClientSearchesPage({nav}) {
  const { authUser } = useAppData();
  const [searches, setSearches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('urb_access');
    if (!token) { setLoading(false); return; }

    authFetch('/api/v1/search/saved')
      .then(r => r.ok ? r.json() : null)
      .then(raw => {
        const inner = raw?.data ?? raw;
        const arr = Array.isArray(inner) ? inner : (inner?.data ?? []);
        setSearches(Array.isArray(arr) ? arr : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    authFetch('/api/v1/notifications/unread-count')
      .then(r => r.ok ? r.json() : null)
      .then(raw => setNotifCount(Number(raw?.data?.count ?? raw?.count ?? 0) || 0))
      .catch(() => {});
  }, []);

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await authFetch(`/api/v1/search/saved/${id}`, { method: 'DELETE' });
      setSearches(s => s.filter(x => x.id !== id));
    } catch {}
    setDeleting(null);
  };

  const portalUser = portalUserFromAuth(authUser);

  return (
    <PortalShell user={portalUser} navItems={CLIENT_NAV(notifCount)} current="clientSearches" onNav={(id)=>nav(id)}>
      <DashHeader title="Saved searches"
        subtitle={loading ? '…' : searches.length > 0
          ? `${searches.length} saved · get notified when new homes match`
          : 'Get alerts when new homes match your criteria'}
        actions={<button className="btn btn-brand btn-sm" onClick={()=>nav('search')}>＋ New search</button>}/>

      {loading ? (
        <div className="card" style={{padding:'60px 24px', textAlign:'center', color:'var(--text-muted)', fontSize:14}}>
          Loading saved searches…
        </div>
      ) : searches.length === 0 ? (
        <div className="card" style={{padding:48, textAlign:'center', marginTop:8}}>
          <div style={{fontSize:36, marginBottom:12}}>🔍</div>
          <div style={{fontWeight:600, fontSize:16}}>No saved searches yet</div>
          <p style={{color:'var(--text-muted)', marginTop:8, lineHeight:1.6, maxWidth:400, marginInline:'auto'}}>
            Search for homes and click <strong>"Save this search"</strong> to get notified of new listings.
          </p>
          <button className="btn btn-brand btn-sm" style={{marginTop:16}} onClick={()=>nav('search')}>Start searching</button>
        </div>
      ) : (
        <>
          <div className="card" style={{padding:0, overflow:'hidden'}}>
            {searches.map((s, i) => {
              const label = s.query || s.name
                || (s.filters
                    ? Object.entries(s.filters).filter(([,v])=>v).map(([k,v])=>`${k}: ${v}`).join(' · ')
                    : 'Saved search');
              const date = s.createdAt
                ? new Date(s.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })
                : '';
              return (
                <div key={s.id} style={{
                  padding:'20px 24px',
                  borderTop: i===0 ? 0 : '1px solid var(--border)',
                  display:'flex', alignItems:'center', gap:20,
                }}>
                  <div style={{width:44, height:44, borderRadius:'var(--r-md)', background:'var(--surface-sunken)', display:'grid', placeItems:'center', fontSize:20, flexShrink:0}}>🔍</div>
                  <div style={{flex:1, minWidth:0}}>
                    <div className="font-display" style={{fontSize:15, fontWeight:700, letterSpacing:'-0.02em', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{label}</div>
                    {date && <div style={{fontSize:12, color:'var(--text-muted)', marginTop:4}}>Saved {date}</div>}
                  </div>
                  <div style={{display:'flex', gap:8, flexShrink:0}}>
                    <button className="btn btn-brand btn-sm" onClick={()=>nav('search')}>View matches →</button>
                    <button className="btn btn-ghost btn-sm"
                      disabled={deleting === s.id}
                      onClick={()=>handleDelete(s.id)}
                      style={{color:'var(--error)'}}>
                      {deleting === s.id ? '…' : 'Delete'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="card" style={{padding:20, background:'var(--brand-50)', border:0, marginTop:20, display:'flex', alignItems:'center', gap:14}}>
            <span style={{fontSize:22}}>🔔</span>
            <div style={{flex:1, fontSize:13, color:'var(--brand-900)', lineHeight:1.5}}>
              <strong>Tip:</strong> Manage alert preferences — SMS, email, or weekly digest — in{' '}
              <a style={{color:'var(--brand-700)', textDecoration:'underline', cursor:'pointer', fontWeight:600}}
                onClick={()=>nav('settings')}>notification settings</a>.
            </div>
          </div>
        </>
      )}
    </PortalShell>
  );
}

// ─── BROKER DASHBOARD ─────────────────────────────────────────────────────
function BrokerDashPage({nav}) {
  const { authUser } = useAppData();
  const [myListings, setMyListings] = useState([]);
  const [loadingBroker, setLoadingBroker] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('urb_access');
    if (!token) { setLoadingBroker(false); return; }
    authFetch('/api/v1/properties/my/listings')
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        const arr = Array.isArray(data) ? data : (data.data || []);
        setMyListings(arr.map(l => ({
          ...normalizeApiListing(l),
          status: l.status === 'ACTIVE' ? 'live'
            : l.status === 'PENDING_REVIEW' ? 'pending'
            : l.status === 'RENTED' ? 'rented'
            : 'paused',
          unlocks: l.unlockCount || 0,
        })));
      })
      .catch(() => {})
      .finally(() => setLoadingBroker(false));
  }, []);

  const brokerName = authUser?.brokerProfile?.fullName || 'Broker';
  const firstName = brokerName.split(' ')[0];
  const reraIdDisplay = authUser?.brokerProfile?.reraId || '—';
  const activeCount = myListings.filter(l => l.status === 'live').length;
  const totalUnlocks = myListings.reduce((s, l) => s + (l.unlocks || 0), 0);

  const portalUser = authUser ? {
    initials: firstName.slice(0,2).toUpperCase(),
    name: brokerName,
    role: `Verified Broker · RERA ${reraIdDisplay}`,
    color: 'var(--text)',
    avatarUrl: authUser?.avatarUrl || null,
  } : BROKER_USER;

  return (
    <PortalShell user={portalUser} navItems={BROKER_NAV()} current="brokerDash" onNav={(id)=>nav(id)}>
      <DashHeader title={`${firstName}'s desk`}
        subtitle={`${activeCount} active listings · ${loadingBroker ? '…' : myListings.length} total`}
        actions={
          <>
            <button className="btn btn-outline btn-sm">Download report</button>
            <button className="btn btn-brand btn-sm" onClick={()=>nav('ownerNew')}>＋ Add listing</button>
          </>
        }/>

      <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:14, marginBottom:24}}>
        <StatCard label="Active listings" value={loadingBroker ? '…' : String(activeCount)} sub="this month"/>
        <StatCard label="Total unlocks" value={loadingBroker ? '…' : String(totalUnlocks)} sub="all listings"/>
        <StatCard label="Total listings" value={loadingBroker ? '…' : String(myListings.length)} sub="portfolio"/>
        <StatCard label="RERA ID" value={reraIdDisplay !== '—' ? '✓' : '—'} sub={reraIdDisplay}/>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1.4fr', gap:16, marginBottom:24}}>
        <div className="card" style={{padding:24, background:'var(--text)', color:'var(--bg)', border:0}}>
          <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:14}}>
            <span style={{fontSize:18, color:'var(--success)'}}>✓</span>
            <div style={{fontSize:11, opacity:.7, fontWeight:600, textTransform:'uppercase', letterSpacing:'.08em'}}>RERA Verified</div>
          </div>
          <div className="font-display" style={{fontSize:24, fontWeight:800, letterSpacing:'-0.025em'}}>{reraIdDisplay}</div>
          <div style={{fontSize:13, opacity:.7, marginTop:6}}>{authUser?.brokerProfile?.isReraVerified ? 'Verified' : 'Pending verification'}</div>
          <div style={{height:1, background:'rgba(255,255,255,.12)', margin:'18px 0'}}/>
          <div className="font-display" style={{fontSize:14, fontWeight:600}}>Verified Broker badge active</div>
          <div style={{fontSize:12, opacity:.7, marginTop:4}}>Your listings get a green shield. Tenants trust them 4.2× more.</div>
        </div>

        <div className="card" style={{padding:24}}>
          <div style={{fontSize:11, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.08em'}}>Total unlocks · all listings</div>
          <div className="font-display" style={{fontSize:36, fontWeight:800, letterSpacing:'-0.035em', marginTop:4}}>
            {loadingBroker ? '…' : totalUnlocks > 0 ? totalUnlocks : '—'}
          </div>
          <div style={{fontSize:12, color:'var(--text-muted)', fontWeight:500, marginTop:4}}>
            {totalUnlocks > 0 ? 'tenants unlocked your listings' : 'No unlocks yet — share your listings'}
          </div>
          <div style={{marginTop:20, padding:'14px 0', borderTop:'1px solid var(--border)', fontSize:13, color:'var(--text-muted)'}}>
            Commission tracking — coming soon. Each unlock brings tenants directly to you.
          </div>
        </div>
      </div>

      <div className="card" style={{padding:0, overflow:'hidden'}}>
        <div style={{padding:'18px 22px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div className="font-display" style={{fontSize:18, fontWeight:700, letterSpacing:'-0.02em'}}>Your portfolio</div>
          <button className="btn btn-ghost btn-sm" onClick={()=>nav('brokerList')}>View all →</button>
        </div>
        {myListings.length === 0 && !loadingBroker ? (
          <div style={{padding:'40px 22px', textAlign:'center', color:'var(--text-muted)', fontSize:14}}>
            No listings yet.{' '}
            <button className="btn btn-brand btn-sm" style={{marginLeft:12}} onClick={()=>nav('ownerNew')}>＋ Add your first listing</button>
          </div>
        ) : (
          <table style={{width:'100%', borderCollapse:'collapse', fontSize:13}}>
            <thead>
              <tr style={{textAlign:'left', color:'var(--text-muted)', fontSize:11, textTransform:'uppercase', letterSpacing:'.08em', fontWeight:600}}>
                <th style={{padding:'12px 22px'}}>Property</th>
                <th style={{padding:'12px 22px'}}>Status</th>
                <th style={{padding:'12px 22px'}}>Unlocks</th>
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
                        <div style={{fontSize:11, color:'var(--text-muted)', fontFamily:'var(--f-mono)'}}>ID {l.id}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{padding:'14px 22px'}}><StatusBadge status={l.status}/></td>
                  <td style={{padding:'14px 22px', fontWeight:600}}>{l.unlocks}</td>
                  <td style={{padding:'14px 22px', textAlign:'right'}}>
                    <button className="btn btn-ghost btn-sm" onClick={()=>nav('detail', l.id)}>View →</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </PortalShell>
  );
}

export { ClientDashPage, BrokerDashPage, ClientShortlistPage, ClientSearchesPage };
