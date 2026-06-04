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
import { authFetch } from '@/lib/authFetch';
import { Field } from './owner';

// ADMIN_USER is now derived from authUser in each component


function useAdminUser() {
  const { authUser } = useAppData();
  if (!authUser) return { initials: '?', name: 'Admin', role: 'Admin', color: '#7C3AED' };
  const name = authUser.ownerProfile?.fullName || authUser.brokerProfile?.fullName || authUser.clientProfile?.fullName || authUser.email || 'Admin';
  return {
    initials: name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase(),
    name,
    role: 'Admin',
    color: '#7C3AED',
  };
}

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
  const adminUser = useAdminUser();
  const [stats, setStats] = useState({ listings: 0, pending: 0, users: 0, revenue: 0 });

  useEffect(() => {
    Promise.allSettled([
      authFetch('/api/v1/properties/admin/all?limit=1').then(r => r.ok ? r.json() : null),
      authFetch('/api/v1/properties/admin/all?status=PENDING_REVIEW&limit=1').then(r => r.ok ? r.json() : null),
      authFetch('/api/v1/users?limit=1').then(r => r.ok ? r.json() : null),
    ]).then(([listings, pending, users]) => {
      setStats({
        listings: listings.value?.data?.total ?? listings.value?.total ?? 0,
        pending:  pending.value?.data?.total  ?? pending.value?.total  ?? 0,
        users:    users.value?.data?.total    ?? users.value?.total    ?? 0,
        revenue: 0,
      });
    });
  }, []);

  return (
    <PortalShell user={adminUser} navItems={ADMIN_NAV()} current="adminDash" onNav={(id)=>nav(id)}>
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
        <StatCard label="Revenue (30d)" value="₹—" sub="PhonePe data pending"/>
        <StatCard label="Pending review" value={String(stats.pending)} sub="listings in queue" color={stats.pending > 0 ? 'var(--warning)' : undefined}/>
        <StatCard label="Total listings" value={stats.listings.toLocaleString('en-IN')} sub="all time"/>
        <StatCard label="Total users" value={stats.users.toLocaleString('en-IN')} sub="across all roles"/>
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
          <div className="font-display" style={{fontSize:48, fontWeight:800, letterSpacing:'-0.04em', marginTop:8}}>{stats.pending}</div>
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

function Spec({label, value}) {
  return (
    <div style={{padding:'12px 16px', background:'var(--surface-sunken)', borderRadius:'var(--r-sm)'}}>
      <div style={{fontSize:11, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.06em', marginBottom:4}}>{label}</div>
      <div style={{fontSize:14, fontWeight:600}}>{value ?? '—'}</div>
    </div>
  );
}

// ─── Moderation Queue ─────────────────────────────────────────────────────
function AdminModPage({nav}) {
  const adminUser = useAdminUser();
  const [activeIdx, setActiveIdx] = useState(0);
  const [queue, setQueue] = useState([]);
  const [loadingQueue, setLoadingQueue] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('urb_access');
    if (!token) { setLoadingQueue(false); return; }
    authFetch('/api/v1/properties/admin/all?status=PENDING_REVIEW&limit=50')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        const items = (Array.isArray(data) ? data : (data?.data || [])).map(l => ({
          ...normalizeApiListing(l),
          submittedBy: l.isBrokerListing ? 'Broker listing' : 'Direct owner',
          submitted: new Date(l.createdAt).toLocaleString('en-IN', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' }),
          sla: (() => {
            const mins = Math.round((Date.now() - new Date(l.createdAt)) / 60000);
            const left = 120 - mins;
            if (left < 0) return `-${Math.abs(left)}m`;
            return `${left}m left`;
          })(),
          overdue: (Date.now() - new Date(l.createdAt)) > 2 * 60 * 60 * 1000,
          flags: l.moderationNote ? [{ type: 'Note', label: l.moderationNote }] : [],
          photos: l.photos?.map(p => p.s3Url) || [],
        }));
        setQueue(items);
        setActiveIdx(0);
      })
      .catch(() => {})
      .finally(() => setLoadingQueue(false));
  }, []);

  const active = queue[activeIdx];

  return (
    <PortalShell user={adminUser} navItems={ADMIN_NAV()} current="adminMod" onNav={(id)=>nav(id)}>
      <DashHeader title="Moderation queue"
        subtitle={loadingQueue ? 'Loading…' : `${queue.length} listings · SLA target < 2h · ${queue.filter(q=>q.overdue).length} overdue`}
        actions={
          <>
            <select className="input select btn-sm" style={{height:34, fontSize:13}}><option>All flags</option><option>AI flagged</option><option>User reported</option></select>
            <button className="btn btn-outline btn-sm">Bulk approve safe</button>
          </>
        }/>

      {loadingQueue && <div style={{padding:'40px', textAlign:'center', color:'var(--text-muted)'}}>Loading queue…</div>}
      {!loadingQueue && queue.length === 0 && (
        <div className="card" style={{padding:'48px', textAlign:'center'}}>
          <div style={{fontSize:32, marginBottom:12}}>✓</div>
          <div style={{fontWeight:600, fontSize:16}}>Queue is clear</div>
          <p style={{color:'var(--text-muted)', marginTop:8}}>No listings pending review right now.</p>
        </div>
      )}

      {!loadingQueue && queue.length > 0 && <div style={{display:'grid', gridTemplateColumns:'380px 1fr', gap:16, alignItems:'start'}}>
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
              <button className="btn btn-sm" style={{background:'var(--error)', color:'#fff', border:0}} onClick={async () => {
                const token = localStorage.getItem('urb_access');
                if (!token) return;
                await authFetch(`/api/v1/properties/admin/${active.id}/moderate`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({status:'REJECTED', note:'Rejected by admin'}) });
                setQueue(q => q.filter((_,i)=>i!==activeIdx));
                setActiveIdx(0);
              }}>Reject</button>
              <button className="btn btn-sm" style={{background:'var(--success)', color:'#fff', border:0}} onClick={async () => {
                const token = localStorage.getItem('urb_access');
                if (!token) return;
                await authFetch(`/api/v1/properties/admin/${active.id}/moderate`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({status:'ACTIVE'}) });
                setQueue(q => q.filter((_,i)=>i!==activeIdx));
                setActiveIdx(0);
              }}>Approve</button>
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
      </div>}
    </PortalShell>
  );
}

// ---- admin-extra.jsx ----
// admin-extra.jsx — Admin Users, Revenue, CMS

// ─── ADMIN USERS ──────────────────────────────────────────────────────────
function AdminUsersPage({nav}) {
  const adminUser = useAdminUser();
  const [filter, setFilter] = useState("all");
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('urb_access');
    if (!token) { setLoadingUsers(false); return; }
    const roleParam = filter !== 'all' ? `&role=${filter.toUpperCase()}` : '';
    authFetch(`/api/v1/users?limit=50&page=1${roleParam}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        const items = Array.isArray(data) ? data : (data?.data || []);
        const total = data?.total ?? items.length;
        setTotalCount(total);
        const colorMap = { OWNER:'#7C3AED', CLIENT:'var(--accent-500)', BROKER:'var(--brand-500)', ADMIN:'#EF4444' };
        setUsers(items.map(u => {
          const name = u.ownerProfile?.fullName || u.brokerProfile?.fullName || u.clientProfile?.fullName || u.email || 'User';
          return {
            initials: name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase(),
            name, email: u.email,
            role: u.role?.toLowerCase() === 'client' ? 'tenant' : u.role?.toLowerCase(),
            joined: new Date(u.createdAt).toLocaleDateString('en-IN', { month:'short', year:'numeric' }),
            listings: 0, unlocks: 0,
            status: u.isBanned ? 'flagged' : u.isVerified ? 'verified' : 'pending',
            rera: u.brokerProfile?.reraId,
            color: colorMap[u.role] || 'var(--text-muted)',
            id: u.id,
          };
        }));
      })
      .catch(() => {})
      .finally(() => setLoadingUsers(false));
  }, [filter]);

  const filtered = users;

  return (
    <PortalShell user={adminUser} navItems={ADMIN_NAV()} current="adminUsers" onNav={(id)=>nav(id)}>
      <DashHeader title="Users"
        subtitle={loadingUsers ? 'Loading…' : `${totalCount.toLocaleString()} accounts · ${users.filter(u=>u.status==='pending').length} pending verification`}
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
            {id:'all',    l:`All · ${totalCount}`},
            {id:'owner',  l:`Owners`},
            {id:'client', l:`Tenants`},
            {id:'broker', l:`Brokers`},
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
          <span>{loadingUsers ? 'Loading…' : `Showing 1–${filtered.length} of ${totalCount}`}</span>
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
  const adminUser = useAdminUser();
  const [revData, setRevData] = useState(null);
  const [txns, setTxns] = useState([]);
  const [loadingRev, setLoadingRev] = useState(true);

  useEffect(() => {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).toISOString();
    const to = now.toISOString();
    authFetch(`/api/v1/payments/revenue?from=${from}&to=${to}`)
      .then(r => r.ok ? r.json() : null)
      .then(raw => {
        const d = raw?.data ?? raw;
        if (d) setRevData(d);
        if (Array.isArray(d?.transactions)) setTxns(d.transactions);
      })
      .catch(() => {})
      .finally(() => setLoadingRev(false));
  }, []);

  const fmt = (n) => (n || 0).toLocaleString('en-IN');

  return (
    <PortalShell user={adminUser} navItems={ADMIN_NAV()} current="adminRev" onNav={(id)=>nav(id)}>
      <DashHeader title="Revenue & analytics"
        subtitle={`Last 30 days · ${loadingRev ? 'loading…' : 'live data'}`}
        actions={
          <>
            <select className="input select btn-sm" style={{height:34, fontSize:13}}><option>Last 30 days</option><option>This quarter</option><option>Year to date</option></select>
            <button className="btn btn-outline btn-sm"><Icon.download/> Report</button>
          </>
        }/>

      {/* big number row */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:14, marginBottom:24}}>
        <StatCard label="Gross revenue (30d)" value={loadingRev ? '…' : revData?.grossRevenue ? `₹${fmt(revData.grossRevenue)}` : '₹0'} sub="last 30 days"/>
        <StatCard label="GST collected" value={loadingRev ? '…' : revData?.gstAmount ? `₹${fmt(revData.gstAmount)}` : '₹0'} sub="18% of gross"/>
        <StatCard label="Net revenue" value={loadingRev ? '…' : revData?.netRevenue ? `₹${fmt(revData.netRevenue)}` : '₹0'} sub="post-GST"/>
        <StatCard label="Refunds" value={loadingRev ? '…' : revData?.refundAmount ? `₹${fmt(revData.refundAmount)}` : '₹0'} sub="processed this period"/>
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
            {loadingRev && <tr><td colSpan={6} style={{padding:'28px', textAlign:'center', color:'var(--text-muted)'}}>Loading transactions…</td></tr>}
            {!loadingRev && txns.length === 0 && (
              <tr><td colSpan={6} style={{padding:'32px', textAlign:'center', color:'var(--text-muted)', fontSize:13}}>
                No transactions yet. Once tenants unlock listings via PhonePe, they'll appear here.
              </td></tr>
            )}
            {txns.map((t)=>{
              const listing = normalizeApiListing(t.listing || {});
              const clientEmail = t.client?.email || t.clientId || '—';
              const amount = t.totalAmountInr || t.amount || 0;
              const status = t.status === 'SUCCESS' ? 'completed' : t.status === 'REFUNDED' ? 'refunded' : 'pending';
              const when = t.createdAt ? new Date(t.createdAt).toLocaleString('en-IN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}) : '—';
              return (
                <tr key={t.id} style={{borderTop:'1px solid var(--border)'}}>
                  <td style={{padding:'14px 22px', fontFamily:'var(--f-mono)', fontSize:12, fontWeight:600}}>{(t.merchantTransactionId || t.id || '').slice(-8)}</td>
                  <td style={{padding:'14px 22px', fontFamily:'var(--f-mono)', fontSize:12}}>{clientEmail}</td>
                  <td style={{padding:'14px 22px'}}>
                    <div style={{fontWeight:600}}>{listing.bhk ? `${listing.bhk} BHK · ${listing.locality}` : listing.locality || '—'}</div>
                    <div style={{fontSize:11, color:'var(--text-muted)'}}>{when}</div>
                  </td>
                  <td style={{padding:'14px 22px', color:'var(--text-muted)'}}>UPI</td>
                  <td style={{padding:'14px 22px', fontWeight:700, fontVariantNumeric:'tabular-nums'}}>₹{amount.toLocaleString('en-IN')}</td>
                  <td style={{padding:'14px 22px'}}>
                    {status === 'completed' ? <span style={{fontSize:11, color:'var(--success)', fontWeight:600}}>✓ Completed</span>
                      : status === 'refunded' ? <span style={{fontSize:11, color:'var(--text-muted)', fontWeight:600}}>↺ Refunded</span>
                      : <span style={{fontSize:11, color:'var(--warning)', fontWeight:600}}>⏳ Pending</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </PortalShell>
  );
}

// ─── ADMIN CMS ────────────────────────────────────────────────────────────
function AdminCmsPage({nav}) {
  const adminUser = useAdminUser();
  const [tab, setTab] = useState("blog");

  return (
    <PortalShell user={adminUser} navItems={ADMIN_NAV()} current="adminCms" onNav={(id)=>nav(id)}>
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
          { f:"Saved-search SMS alerts", on:true