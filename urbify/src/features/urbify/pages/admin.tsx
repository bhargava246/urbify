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
  { id:'adminDash',       label:'Overview',   icon:'◧' },
  { id:'adminMod',        label:'Moderation', icon:'⌗', badge:'14', badgeTone:'danger' },
  { id:'adminProperties', label:'Properties', icon:'⊞' },
  { id:'adminUsers',      label:'Users',      icon:'◐' },
  { id:'adminRev',        label:'Revenue',    icon:'₹' },
  { id:'adminCms',        label:'CMS / SEO',  icon:'✍' },
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
  const [actioning, setActioning] = useState(false);
  const [actionMsg, setActionMsg] = useState('');
  const [showChangesModal, setShowChangesModal] = useState(false);
  const [changesNote, setChangesNote] = useState('');

  const toast = (msg, isError=false) => {
    setActionMsg((isError ? '✕ ' : '✓ ') + msg);
    setTimeout(() => setActionMsg(''), 3500);
  };

  const loadQueue = () => {
    setLoadingQueue(true);
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
          photos: l.photos?.map(p => p.s3Url || p).filter(Boolean) || [],
          rawId: l.id,
        }));
        setQueue(items);
        setActiveIdx(0);
      })
      .catch(() => toast('Failed to load queue', true))
      .finally(() => setLoadingQueue(false));
  };

  useEffect(() => { loadQueue(); }, []);

  const active = queue[activeIdx];

  const moderateListing = async (status, note) => {
    if (!active) return;
    setActioning(true);
    try {
      const res = await authFetch(`/api/v1/properties/admin/${active.rawId || active.id}/moderate`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, note }),
      });
      if (res.ok) {
        toast(status === 'ACTIVE' ? 'Listing approved ✓' : status === 'REJECTED' ? 'Listing rejected' : 'Changes requested');
        const newQueue = queue.filter((_, i) => i !== activeIdx);
        setQueue(newQueue);
        setActiveIdx(Math.min(activeIdx, newQueue.length - 1));
      } else {
        const e = await res.json().catch(() => ({}));
        toast(`Failed: ${e.message || res.status}`, true);
      }
    } catch { toast('Network error', true); }
    finally { setActioning(false); }
  };

  return (
    <PortalShell user={adminUser} navItems={ADMIN_NAV()} current="adminMod" onNav={(id)=>nav(id)}>
      <DashHeader title="Moderation queue"
        subtitle={loadingQueue ? 'Loading…' : `${queue.length} listings · SLA target < 2h · ${queue.filter(q=>q.overdue).length} overdue`}
        actions={
          <>
            <button className="btn btn-outline btn-sm" onClick={loadQueue}>↺ Refresh</button>
          </>
        }/>

      {/* Toast */}
      {actionMsg && (
        <div style={{padding:'12px 18px', marginBottom:12, borderRadius:'var(--r-md)',
          background: actionMsg.startsWith('✕') ? '#FEE2E2' : '#DCFCE7',
          color: actionMsg.startsWith('✕') ? '#7F1D1D' : '#14532D',
          fontSize:13, fontWeight:600}}>
          {actionMsg}
        </div>
      )}

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
              <button className="btn btn-outline btn-sm" disabled={actioning}
                onClick={()=>{ setChangesNote(''); setShowChangesModal(true); }}>
                Request changes
              </button>
              <button className="btn btn-sm" style={{background:'var(--error)', color:'#fff', border:0}} disabled={actioning}
                onClick={()=>moderateListing('REJECTED', 'Rejected by admin')}>
                {actioning ? '…' : 'Reject'}
              </button>
              <button className="btn btn-sm" style={{background:'var(--success)', color:'#fff', border:0}} disabled={actioning}
                onClick={()=>moderateListing('ACTIVE', undefined)}>
                {actioning ? '…' : 'Approve ✓'}
              </button>
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

      {/* Request changes modal */}
      {showChangesModal && (
        <div style={{position:'fixed',inset:0,zIndex:300,background:'rgba(0,0,0,.55)',display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
          <div style={{background:'var(--surface)',borderRadius:'var(--r-lg)',width:'100%',maxWidth:480,padding:28,boxShadow:'var(--sh-pop)'}}>
            <div style={{fontSize:18,fontWeight:800,letterSpacing:'-0.025em',marginBottom:8}}>Request changes</div>
            <div style={{fontSize:13,color:'var(--text-muted)',marginBottom:16}}>Describe what needs to be fixed. The owner will be notified.</div>
            <textarea className="input" rows={4} style={{resize:'vertical',lineHeight:1.6,width:'100%'}}
              placeholder="e.g. Photos are too dark, need clearer images of interior…"
              value={changesNote} onChange={e=>setChangesNote(e.target.value)}/>
            <div style={{display:'flex',gap:8,justifyContent:'flex-end',marginTop:16}}>
              <button className="btn btn-outline btn-sm" onClick={()=>setShowChangesModal(false)}>Cancel</button>
              <button className="btn btn-brand btn-sm" disabled={!changesNote.trim() || actioning}
                onClick={async ()=>{
                  setShowChangesModal(false);
                  await moderateListing('REJECTED', changesNote.trim());
                }}>
                Send & reject
              </button>
            </div>
          </div>
        </div>
      )}
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
  const [actionMsg, setActionMsg] = useState('');

  const toast = (msg, isError=false) => {
    setActionMsg((isError ? '✕ ' : '✓ ') + msg);
    setTimeout(() => setActionMsg(''), 3000);
  };

  const handleUserStatus = async (userId, patch) => {
    try {
      const res = await authFetch(`/api/v1/users/${userId}/status`, {
        method:'PATCH', headers:{'Content-Type':'application/json'},
        body: JSON.stringify(patch),
      });
      if (res.ok) {
        const newStatus = patch.isBanned ? 'flagged' : patch.isVerified ? 'verified' : 'active';
        setUsers(us => us.map(u => u.id === userId ? {...u, status: newStatus} : u));
        toast(patch.isBanned ? 'User banned' : patch.isVerified ? 'User verified' : 'User unblocked');
      } else {
        const e = await res.json().catch(() => ({}));
        toast(`Error: ${e.message || res.status}`, true);
      }
    } catch { toast('Network error', true); }
  };

  useEffect(() => {
    setLoadingUsers(true);
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
        actions={<button className="btn btn-outline btn-sm">Export CSV</button>}/>

      {actionMsg && (
        <div style={{padding:'12px 18px', marginBottom:12, borderRadius:'var(--r-md)',
          background: actionMsg.startsWith('✕') ? '#FEE2E2' : '#DCFCE7',
          color: actionMsg.startsWith('✕') ? '#7F1D1D' : '#14532D',
          fontSize:13, fontWeight:600}}>
          {actionMsg}
        </div>
      )}

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
                    {u.status === 'pending' && (
                      <button className="btn btn-sm" style={{background:'var(--success)', color:'#fff'}}
                        onClick={()=>handleUserStatus(u.id, {isBanned:false, isActive:true, isVerified:true})}>
                        Verify
                      </button>
                    )}
                    {u.status === 'verified' && (
                      <button className="btn btn-sm btn-ghost" style={{color:'var(--error)', fontSize:11}}
                        onClick={()=>{ if(confirm('Ban this user?')) handleUserStatus(u.id, {isBanned:true, isActive:false}); }}>
                        Ban
                      </button>
                    )}
                    {u.status === 'flagged' && (
                      <button className="btn btn-sm" style={{background:'var(--warning)', color:'#fff'}}
                        onClick={()=>handleUserStatus(u.id, {isBanned:false, isActive:true})}>
                        Unban
                      </button>
                    )}
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
        // API returns: { totalUnlocks, totalRevenue, totalGst, cityBreakdown }
        const d = raw?.data ?? raw;
        if (d) {
          setRevData({
            netRevenue:    d.totalRevenue  ?? 0,
            gstAmount:     d.totalGst      ?? 0,
            grossRevenue:  (d.totalRevenue ?? 0) + (d.totalGst ?? 0),
            totalUnlocks:  d.totalUnlocks  ?? 0,
            cityBreakdown: d.cityBreakdown ?? {},
          });
        }
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
        <StatCard label="Gross revenue (30d)" value={loadingRev ? '…' : `₹${fmt(revData?.grossRevenue)}`} sub="platform fee + GST"/>
        <StatCard label="GST collected" value={loadingRev ? '…' : `₹${fmt(revData?.gstAmount)}`} sub="18% of platform fee"/>
        <StatCard label="Net revenue" value={loadingRev ? '…' : `₹${fmt(revData?.netRevenue)}`} sub="platform fee post-GST"/>
        <StatCard label="Total unlocks" value={loadingRev ? '…' : String(revData?.totalUnlocks ?? 0)} sub="contact reveals this period"/>
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
          {loadingRev ? (
            <div style={{padding:'24px 0', textAlign:'center', color:'var(--text-muted)', fontSize:13}}>Loading…</div>
          ) : revData?.cityBreakdown && Object.keys(revData.cityBreakdown).length > 0 ? (
            (() => {
              const entries = Object.entries(revData.cityBreakdown)
                .sort(([,a],[,b]) => (b as number) - (a as number));
              const maxVal = Math.max(...entries.map(([,v]) => v as number), 1);
              return entries.map(([city, val], i) => (
                <div key={city} style={{display:'grid', gridTemplateColumns:'140px 1fr 100px', alignItems:'center', gap:14, padding:'10px 0', borderBottom: i === entries.length-1 ? 0 : '1px solid var(--border)'}}>
                  <div style={{fontWeight:600, fontSize:14}}>{city}</div>
                  <div style={{height:8, background:'var(--surface-sunken)', borderRadius:99, overflow:'hidden'}}>
                    <div style={{height:'100%', width:`${((val as number)/maxVal)*100}%`, background: i===0 ? 'var(--brand-500)' : `color-mix(in oklab, var(--brand-500) ${90 - i*12}%, var(--surface-sunken))`, borderRadius:99}}/>
                  </div>
                  <div style={{fontVariantNumeric:'tabular-nums', fontWeight:700, fontSize:14, textAlign:'right'}}>₹{fmt(val as number)}</div>
                </div>
              ));
            })()
          ) : (
            <div style={{padding:'24px 0', textAlign:'center', color:'var(--text-muted)', fontSize:13}}>No revenue data yet.</div>
          )}
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

function apiStatusToUi(s) {
  if (s === 'ACTIVE') return 'live';
  if (s === 'REJECTED') return 'rejected';
  if (s === 'PENDING_REVIEW') return 'pending';
  if (s === 'PAUSED') return 'paused';
  if (s === 'RENTED_SOLD') return 'rented';
  return 'pending';
}
function uiStatusToApi(s) {
  if (s === 'live') return 'ACTIVE';
  if (s === 'rejected') return 'REJECTED';
  return 'PENDING_REVIEW';
}
function normalizeAdminListing(l) {
  const base = normalizeApiListing(l);
  return {
    ...base,
    status: apiStatusToUi(l.status),
    addedBy: l.owner?.phone || l.ownerId?.slice(-6) || 'Unknown',
    addedOn: l.createdAt ? new Date(l.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short' }) : '—',
    propertyType: l.propertySubType || 'Apartment',
  };
}

const EMPTY_PROP_FORM = {
  title:'', propertyType:'Apartment', city:'Bangalore', locality:'',
  bhk:'2', area:'', floor:'', totalFloors:'', furnishing:'Semi-furnished',
  facing:'East', rent:'', deposit:'', listingType:'rent',
  ownerName:'', ownerPhone:'', ownerEmail:'', description:'',
  amenities:[], photos:['','',''], status:'pending',
};

function AdminPropertiesPage({nav}) {
  const adminUser = useAdminUser();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiPage, setApiPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCity, setFilterCity] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editProp, setEditProp] = useState(null);
  const [viewProp, setViewProp] = useState(null);
  const [actionMsg, setActionMsg] = useState('');
  const PER_PAGE = 20;

  const loadProperties = useCallback((pg = 1) => {
    setLoading(true);
    const statusParam = filterStatus !== 'all' ? `&status=${uiStatusToApi(filterStatus)}` : '';
    authFetch(`/api/v1/properties/admin/all?page=${pg}&limit=${PER_PAGE}${statusParam}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        const items = Array.isArray(data) ? data : (data?.data || []);
        const tot = data?.total ?? items.length;
        setTotal(tot);
        setProperties(items.map(normalizeAdminListing));
        setApiPage(pg);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filterStatus]);

  useEffect(() => { loadProperties(1); }, [filterStatus]);

  const filtered = properties.filter(p => {
    const q = search.toLowerCase();
    if (q && !p.title?.toLowerCase().includes(q) && !p.locality?.toLowerCase().includes(q) && !p.city?.toLowerCase().includes(q)) return false;
    if (filterCity !== 'all' && p.city !== filterCity) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  const toast = (msg) => { setActionMsg(msg); setTimeout(() => setActionMsg(''), 3000); };

  const handleStatusChange = async (propId, newStatus) => {
    const apiStatus = uiStatusToApi(newStatus);
    try {
      const res = await authFetch(`/api/v1/properties/admin/${propId}/moderate`, {
        method:'PATCH', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ status: apiStatus }),
      });
      if (res.ok) {
        setProperties(ps => ps.map(p => p.id === propId ? {...p, status: newStatus} : p));
        toast(`Status updated to ${newStatus}`);
      } else {
        const e = await res.json().catch(() => ({}));
        toast(`Error: ${e.message || res.status}`);
      }
    } catch { toast('Network error'); }
  };

  const handleDelete = async (propId) => {
    if (!confirm('Delete this property permanently?')) return;
    try {
      const res = await authFetch(`/api/v1/properties/${propId}`, { method:'DELETE' });
      if (res.ok || res.status === 204) {
        setProperties(ps => ps.filter(p => p.id !== propId));
        setTotal(t => t - 1);
        toast('Property deleted');
      } else {
        const e = await res.json().catch(() => ({}));
        toast(`Error: ${e.message || res.status}`);
      }
    } catch { toast('Network error'); }
  };

  const handleSave = async (data) => {
    if (editProp) {
      // Update existing — use moderate for status changes
      const apiStatus = uiStatusToApi(data.status || editProp.status);
      const res = await authFetch(`/api/v1/properties/admin/${editProp.id}/moderate`, {
        method:'PATCH', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ status: apiStatus, note: data.description }),
      });
      if (res.ok) {
        setProperties(ps => ps.map(p => p.id === editProp.id ? {...p, ...data, status: data.status || editProp.status} : p));
        toast('Property updated');
      }
    } else {
      // Create new listing via POST /api/v1/properties
      const listingType = data.listingType === 'sale' ? 'RESIDENTIAL_SALE' : 'RESIDENTIAL_RENTAL';
      const payload = {
        listingType,
        locality: data.locality,
        city: data.city,
        state: data.state || 'Karnataka',
        pincode: data.pincode || '560001',
        fullAddress: data.address || `${data.locality}, ${data.city}`,
        bhk: parseInt(data.bhk) || 2,
        areaSqFt: parseInt(data.area) || 0,
        floor: parseInt(data.floor) || 1,
        totalFloors: parseInt(data.totalFloors) || 10,
        furnishingStatus: data.furnishing === 'Fully furnished' ? 'FULLY_FURNISHED' : data.furnishing === 'Semi-furnished' ? 'SEMI_FURNISHED' : 'UNFURNISHED',
        facing: data.facing?.toUpperCase().replace(/ /g,'_') || 'EAST',
        rentOrPrice: parseInt(data.rent) || 0,
        securityDeposit: parseInt(data.deposit) || (parseInt(data.rent) * 2) || 0,
        availableFrom: data.availableFrom || new Date().toISOString(),
        title: data.title || `${data.bhk} BHK in ${data.locality}`,
        description: data.description || '',
        amenities: data.amenities || [],
        isNegotiable: false,
      };
      const res = await authFetch('/api/v1/properties', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast('Property created — pending review (or live if admin)');
        loadProperties(1);
      } else {
        const e = await res.json().catch(() => ({}));
        toast(`Error: ${e.message || res.status}`);
        return; // don't close modal on error
      }
    }
    setShowModal(false);
  };

  return (
    <PortalShell user={adminUser} navItems={ADMIN_NAV()} current="adminProperties" onNav={(id)=>nav(id)}>
      <DashHeader title="Properties"
        subtitle={loading ? 'Loading…' : `${total.toLocaleString('en-IN')} total · ${properties.filter(p=>p.status==='pending').length} pending review`}
        actions={
          <>
            <button className="btn btn-outline btn-sm" onClick={()=>loadProperties(apiPage)}>↺ Refresh</button>
            <button className="btn btn-brand btn-sm" onClick={()=>{setEditProp(null);setShowModal(true);}}>＋ Add property</button>
          </>
        }/>

      {/* Toast */}
      {actionMsg && (
        <div style={{padding:'12px 18px', marginBottom:12, borderRadius:'var(--r-md)',
          background: actionMsg.startsWith('Error') ? '#FEE2E2' : '#DCFCE7',
          color: actionMsg.startsWith('Error') ? '#7F1D1D' : '#14532D',
          fontSize:13, fontWeight:600}}>
          {actionMsg}
        </div>
      )}

      {/* Stats */}
      <div className="admin-props-stats">
        {[
          {label:'Total', value: total, color:'var(--brand-500)'},
          {label:'Live',    value: properties.filter(p=>p.status==='live').length,    color:'var(--success)'},
          {label:'Pending', value: properties.filter(p=>p.status==='pending').length, color:'var(--warning)'},
          {label:'Rejected',value: properties.filter(p=>p.status==='rejected').length,color:'var(--error)'},
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
      <div className="card admin-filters" style={{padding:'14px 18px', marginBottom:16}}>
        <div style={{display:'flex', alignItems:'center', gap:8, flex:'1 1 220px'}}>
          <Icon.search/>
          <input value={search} onChange={e=>setSearch(e.target.value)}
            className="input" placeholder="Search by title, locality, city…"
            style={{border:0, background:'transparent', padding:0, height:'auto', flex:1, fontSize:13}}/>
        </div>
        <select className="input select" style={{height:36,fontSize:12}} value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}>
          <option value="all">Any status</option>
          <option value="live">Live</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
        </select>
        <select className="input select" style={{height:36,fontSize:12}} value={filterCity} onChange={e=>setFilterCity(e.target.value)}>
          <option value="all">All cities</option>
          {['Bangalore','Mumbai','Delhi NCR','Pune','Hyderabad','Chennai'].map(c=><option key={c}>{c}</option>)}
        </select>
        <div style={{fontSize:12,color:'var(--text-muted)',marginLeft:'auto',whiteSpace:'nowrap'}}>{filtered.length} shown</div>
      </div>

      {/* Table */}
      <div className="card" style={{padding:0,overflow:'hidden',marginBottom:16}}>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:13,minWidth:640}}>
            <thead style={{background:'var(--surface-sunken)'}}>
              <tr style={{textAlign:'left',color:'var(--text-muted)',fontSize:11,textTransform:'uppercase',letterSpacing:'.08em',fontWeight:600}}>
                <th style={{padding:'12px 20px'}}>Property</th>
                <th style={{padding:'12px 16px'}}>City</th>
                <th style={{padding:'12px 16px'}}>Rent</th>
                <th style={{padding:'12px 16px'}}>Area</th>
                <th style={{padding:'12px 16px'}}>Status</th>
                <th style={{padding:'12px 20px',textAlign:'right'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={6} style={{padding:'48px 20px',textAlign:'center',color:'var(--text-muted)'}}>Loading…</td></tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={6} style={{padding:'48px 20px',textAlign:'center',color:'var(--text-muted)'}}>No properties found.</td></tr>
              )}
              {!loading && filtered.map((p)=>(
                <tr key={p.id} style={{borderTop:'1px solid var(--border)'}}>
                  <td style={{padding:'14px 20px'}}>
                    <div style={{display:'flex',alignItems:'center',gap:12}}>
                      <Img src={p.photo} style={{width:48,height:48,borderRadius:'var(--r-sm)',flexShrink:0}}/>
                      <div style={{minWidth:0}}>
                        <div style={{fontWeight:600,fontSize:13,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:200}}>{p.bhk ? `${p.bhk} BHK · ` : ''}{p.locality}</div>
                        <div style={{fontSize:11,color:'var(--text-muted)',fontFamily:'var(--f-mono)'}}>{p.id?.slice(-10)}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{padding:'14px 16px',fontWeight:500}}>{p.city}</td>
                  <td style={{padding:'14px 16px',fontWeight:700,fontVariantNumeric:'tabular-nums'}}>₹{p.rentK}k</td>
                  <td style={{padding:'14px 16px',color:'var(--text-muted)'}}>{(p.area||0).toLocaleString('en-IN')} sqft</td>
                  <td style={{padding:'14px 16px'}}>
                    <select value={p.status}
                      onChange={e=>handleStatusChange(p.id, e.target.value)}
                      style={{fontSize:11,fontWeight:600,padding:'4px 8px',borderRadius:99,border:'1.5px solid',
                        borderColor:p.status==='live'?'var(--success)':p.status==='pending'?'var(--warning)':'var(--error)',
                        color:p.status==='live'?'var(--success)':p.status==='pending'?'var(--warning)':'var(--error)',
                        background:'transparent',cursor:'pointer'}}>
                      <option value="live">● Live</option>
                      <option value="pending">○ Pending</option>
                      <option value="rejected">✕ Rejected</option>
                    </select>
                  </td>
                  <td style={{padding:'14px 20px',textAlign:'right'}}>
                    <div style={{display:'inline-flex',gap:4}}>
                      <button className="btn btn-ghost btn-sm" onClick={()=>setViewProp(p)}>View</button>
                      <button className="btn btn-outline btn-sm" onClick={()=>{setEditProp(p);setShowModal(true);}}>Edit</button>
                      <button className="btn btn-ghost btn-sm" style={{color:'var(--error)'}} onClick={()=>handleDelete(p.id)}>✕</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{padding:'12px 20px',borderTop:'1px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:12,color:'var(--text-muted)',flexWrap:'wrap',gap:8}}>
          <span>{loading ? 'Loading…' : `Showing page ${apiPage} of ${totalPages} (${total} total)`}</span>
          <div style={{display:'flex',gap:6}}>
            <button className="btn btn-outline btn-sm" disabled={apiPage<=1} onClick={()=>loadProperties(apiPage-1)}>← Prev</button>
            <button className="btn btn-outline btn-sm" disabled={apiPage>=totalPages} onClick={()=>loadProperties(apiPage+1)}>Next →</button>
          </div>
        </div>
      </div>

      {showModal && <PropertyFormModal initial={editProp} onSave={handleSave} onClose={()=>setShowModal(false)}/>}
      {viewProp && <PropertyViewModal prop={viewProp} onClose={()=>setViewProp(null)} onEdit={()=>{setViewProp(null);setEditProp(viewProp);setShowModal(true);}}/>}
    </PortalShell>
  );
}

// ─── Property Form Modal ──────────────────────────────────────────────────
function PropertyFormModal({initial, onSave, onClose}) {
  const isEdit = !!initial;
  const [step, setStep] = useState(1);
  const TOTAL = 4;
  const FURNISHING_OPTS = ['Unfurnished','Semi-furnished','Fully furnished'];
  const FACING_OPTS = ['East','West','North','South','North-East','South-East'];
  const AMENITY_LIST = [
    {id:'parking',label:'Parking'},{id:'lift',label:'Lift'},{id:'gym',label:'Gym'},
    {id:'pool',label:'Pool'},{id:'security',label:'24/7 Security'},{id:'power',label:'Power backup'},
    {id:'garden',label:'Garden'},{id:'play',label:'Kids play area'},{id:'petfr',label:'Pet friendly'},{id:'wifi',label:'Wi-Fi'},
  ];
  const CITIES_LIST = ['Bangalore','Mumbai','Delhi NCR','Pune','Hyderabad','Chennai'];

  const [form, setForm] = useState(() => initial ? {
    title: initial.title||'', propertyType: initial.propertyType||'Apartment',
    city: initial.city||'Bangalore', locality: initial.locality||'',
    bhk: String(initial.bhk||'2'), area: String(initial.area||''),
    floor: String(initial.floor||''), totalFloors: String(initial.total||''),
    furnishing: initial.furnishing||'Semi-furnished', facing: initial.facing||'East',
    rent: String((initial.rentK||0)*1000), deposit: '',
    listingType: 'rent', ownerName:'', ownerPhone:'', ownerEmail:'',
    description: initial.description||'', amenities: initial.amenityIds||[],
    photos: initial.photos ? [...initial.photos.slice(0,3), ...['','','']].slice(0,3) : ['','',''],
    status: initial.status||'pending',
  } : {...EMPTY_PROP_FORM});

  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const toggleAmenity = (id) => set('amenities', form.amenities.includes(id) ? form.amenities.filter(a=>a!==id) : [...form.amenities, id]);

  const canNext = () => {
    if (step===1) return form.propertyType && form.city && form.locality && form.bhk;
    if (step===2) return form.area && form.floor && form.totalFloors;
    if (step===3) return !!form.rent;
    return true;
  };

  const handleSubmit = () => {
    onSave({
      ...form,
      bhk: parseInt(form.bhk)||2,
      area: parseInt(form.area)||0,
      floor: parseInt(form.floor)||1,
      totalFloors: parseInt(form.totalFloors)||10,
      rent: form.rent,
      photos: form.photos.filter(Boolean),
      photo: form.photos.filter(Boolean)[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
      title: form.title || `${form.bhk} BHK ${form.propertyType} in ${form.locality}`,
    });
  };

  const steps = ['Basic info','Location & specs','Owner & pricing','Photos & publish'];

  return (
    <div style={{position:'fixed',inset:0,zIndex:200,background:'rgba(0,0,0,.55)',backdropFilter:'blur(4px)',display:'flex',alignItems:'center',justifyContent:'center',padding:16}}
      onClick={e=>{if(e.target===e.currentTarget) onClose();}}>
      <div style={{background:'var(--surface)',borderRadius:'var(--r-lg)',width:'100%',maxWidth:680,maxHeight:'92vh',overflow:'hidden',display:'flex',flexDirection:'column',boxShadow:'var(--sh-pop)'}}>
        {/* Header */}
        <div style={{padding:'18px 24px 14px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
          <div>
            <div style={{fontSize:18,fontWeight:800,letterSpacing:'-0.025em'}}>{isEdit?'Edit property':'Add new property'}</div>
            <div style={{fontSize:12,color:'var(--text-muted)',marginTop:2}}>Step {step} of {TOTAL} · {steps[step-1]}</div>
          </div>
          <button onClick={onClose} style={{background:'var(--surface-sunken)',border:0,borderRadius:'50%',width:32,height:32,cursor:'pointer',fontSize:15,display:'grid',placeItems:'center'}}>✕</button>
        </div>
        {/* Progress */}
        <div style={{height:3,background:'var(--surface-sunken)',flexShrink:0}}>
          <div style={{height:'100%',width:`${(step/TOTAL)*100}%`,background:'var(--brand-500)',transition:'width .3s',borderRadius:99}}/>
        </div>
        {/* Step tabs */}
        <div style={{padding:'12px 24px',borderBottom:'1px solid var(--border)',display:'flex',gap:4,flexShrink:0,overflowX:'auto'}}>
          {steps.map((t,i)=>(
            <div key={i} onClick={()=>{if(i+1<step) setStep(i+1);}}
              style={{display:'flex',alignItems:'center',gap:6,fontSize:11,fontWeight:600,whiteSpace:'nowrap',
                color:step===i+1?'var(--text)':step>i+1?'var(--success)':'var(--text-faint)',
                cursor:i+1<step?'pointer':'default'}}>
              <div style={{width:20,height:20,borderRadius:'50%',display:'grid',placeItems:'center',fontSize:10,fontWeight:700,
                background:step===i+1?'var(--brand-500)':step>i+1?'var(--success)':'var(--surface-sunken)',
                color:step===i+1||step>i+1?'#fff':'var(--text-muted)'}}>{step>i+1?'✓':i+1}</div>
              {t}
              {i<steps.length-1 && <span style={{color:'var(--border-strong)',marginLeft:2}}>›</span>}
            </div>
          ))}
        </div>

        {/* Body */}
        <div style={{flex:1,overflowY:'auto',padding:'20px 24px'}}>

          {step===1 && (
            <div style={{display:'flex',flexDirection:'column',gap:16}}>
              <Field label="Property type">
                <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
                  {['Apartment','Villa','Studio','PG','Office','Plot'].map(t=>(
                    <button key={t} onClick={()=>set('propertyType',t)}
                      style={{padding:'6px 14px',borderRadius:99,fontSize:12,fontWeight:600,cursor:'pointer',
                        border:'1.5px solid',borderColor:form.propertyType===t?'var(--text)':'var(--border)',
                        background:form.propertyType===t?'var(--text)':'transparent',
                        color:form.propertyType===t?'var(--bg)':'var(--text)'}}>{t}</button>
                  ))}
                </div>
              </Field>
              <div className="form-grid-2">
                <Field label="BHK">
                  <select className="input" value={form.bhk} onChange={e=>set('bhk',e.target.value)}>
                    {['1','2','3','4','5'].map(v=><option key={v}>{v}</option>)}
                  </select>
                </Field>
                <Field label="Furnishing">
                  <select className="input" value={form.furnishing} onChange={e=>set('furnishing',e.target.value)}>
                    {FURNISHING_OPTS.map(f=><option key={f}>{f}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="Custom title (optional)">
                <input className="input" placeholder="Auto-generated if blank" value={form.title} onChange={e=>set('title',e.target.value)}/>
              </Field>
              <Field label="Description">
                <textarea className="input" rows={3} placeholder="Highlights, nearby landmarks, special features…"
                  value={form.description} onChange={e=>set('description',e.target.value)}
                  style={{resize:'vertical',lineHeight:1.6}}/>
              </Field>
            </div>
          )}

          {step===2 && (
            <div style={{display:'flex',flexDirection:'column',gap:16}}>
              <div className="form-grid-2">
                <Field label="City *">
                  <select className="input" value={form.city} onChange={e=>set('city',e.target.value)}>
                    {CITIES_LIST.map(c=><option key={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Locality *">
                  <input className="input" placeholder="e.g. Koramangala" value={form.locality} onChange={e=>set('locality',e.target.value)}/>
                </Field>
              </div>
              <Field label="Full address (admin only)">
                <input className="input" placeholder="Building, street, pincode" value={form['address']||''} onChange={e=>set('address',e.target.value)}/>
              </Field>
              <div className="form-grid-3">
                <Field label="Area (sqft) *">
                  <input className="input" type="number" placeholder="850" value={form.area} onChange={e=>set('area',e.target.value)}/>
                </Field>
                <Field label="Floor *">
                  <input className="input" type="number" placeholder="4" value={form.floor} onChange={e=>set('floor',e.target.value)}/>
                </Field>
                <Field label="Total floors *">
                  <input className="input" type="number" placeholder="12" value={form.totalFloors} onChange={e=>set('totalFloors',e.target.value)}/>
                </Field>
              </div>
              <div className="form-grid-2">
                <Field label="Facing">
                  <select className="input" value={form.facing} onChange={e=>set('facing',e.target.value)}>
                    {FACING_OPTS.map(f=><option key={f}>{f}</option>)}
                  </select>
                </Field>
                <Field label="Available from">
                  <input className="input" type="date" value={form['availableFrom']||''} onChange={e=>set('availableFrom',e.target.value)}/>
                </Field>
              </div>
              <Field label="Amenities">
                <div style={{display:'flex',flexWrap:'wrap',gap:8,marginTop:4}}>
                  {AMENITY_LIST.map(a=>(
                    <button key={a.id} onClick={()=>toggleAmenity(a.id)}
                      style={{padding:'5px 12px',borderRadius:99,fontSize:12,fontWeight:600,cursor:'pointer',
                        border:'1.5px solid',borderColor:form.amenities.includes(a.id)?'var(--brand-500)':'var(--border)',
                        background:form.amenities.includes(a.id)?'var(--brand-50)':'transparent',
                        color:form.amenities.includes(a.id)?'var(--brand-700)':'var(--text-muted)'}}>
                      {form.amenities.includes(a.id)?'✓ ':''}{a.label}
                    </button>
                  ))}
                </div>
              </Field>
            </div>
          )}

          {step===3 && (
            <div style={{display:'flex',flexDirection:'column',gap:16}}>
              <div style={{padding:'12px 16px',borderRadius:'var(--r-md)',background:'var(--surface-sunken)',fontSize:13,color:'var(--text-muted)'}}>
                Owner details are private — tenants only see the locality until they unlock.
              </div>
              <div className="form-grid-2">
                <Field label="Owner name">
                  <input className="input" placeholder="Rajesh Kumar" value={form.ownerName} onChange={e=>set('ownerName',e.target.value)}/>
                </Field>
                <Field label="Owner phone">
                  <input className="input" placeholder="+91 98765 43210" value={form.ownerPhone} onChange={e=>set('ownerPhone',e.target.value)}/>
                </Field>
              </div>
              <Field label="Owner email">
                <input className="input" type="email" placeholder="owner@example.com" value={form.ownerEmail} onChange={e=>set('ownerEmail',e.target.value)}/>
              </Field>
              <div className="form-grid-2">
                <Field label="Monthly rent (₹) *">
                  <input className="input" type="number" placeholder="45000" value={form.rent} onChange={e=>set('rent',e.target.value)}/>
                </Field>
                <Field label="Security deposit (₹)">
                  <input className="input" type="number" placeholder="90000" value={form.deposit} onChange={e=>set('deposit',e.target.value)}/>
                </Field>
              </div>
              {form.rent && (
                <div style={{padding:'12px 16px',borderRadius:'var(--r-md)',background:'var(--brand-50)',border:'1px solid var(--brand-500)',fontSize:12}}>
                  <strong style={{color:'var(--brand-700)'}}>Fee estimate: </strong>
                  <span>₹{Math.round((parseInt(form.rent)||0)/30*7.5).toLocaleString('en-IN')} unlock fee · ₹{Math.round((parseInt(form.rent)||0)/30*7.5*1.18).toLocaleString('en-IN')} incl. GST</span>
                </div>
              )}
            </div>
          )}

          {step===4 && (
            <div style={{display:'flex',flexDirection:'column',gap:16}}>
              <Field label="Photo URLs">
                {form.photos.map((url,i)=>(
                  <div key={i} style={{display:'flex',gap:10,alignItems:'center',marginBottom:8}}>
                    <input className="input" placeholder={`Photo ${i+1} URL`} value={url}
                      onChange={e=>{const p=[...form.photos];p[i]=e.target.value;set('photos',p);}}/>
                    {url && <img src={url} alt="" style={{width:44,height:44,borderRadius:'var(--r-sm)',objectFit:'cover',flexShrink:0}} onError={e=>{(e.target as HTMLImageElement).style.opacity='.2';}}/>}
                  </div>
                ))}
                <button className="btn btn-ghost btn-sm" style={{alignSelf:'flex-start'}} onClick={()=>set('photos',[...form.photos,''])}>+ Add photo</button>
              </Field>
              {form.photos.filter(Boolean).length > 0 && (
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
                  {form.photos.filter(Boolean).slice(0,6).map((url,i)=>(
                    <div key={i} style={{aspectRatio:'4/3',borderRadius:'var(--r-sm)',overflow:'hidden',background:'var(--surface-sunken)'}}>
                      <img src={url} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                    </div>
                  ))}
                </div>
              )}
              <Field label="Initial status">
                <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                  {[{v:'pending',l:'Pending review'},{v:'live',l:'Publish immediately'},{v:'rejected',l:'Rejected'}].map(s=>(
                    <button key={s.v} onClick={()=>set('status',s.v)}
                      style={{padding:'6px 14px',borderRadius:99,fontSize:12,fontWeight:600,cursor:'pointer',
                        border:'1.5px solid',borderColor:form.status===s.v?'var(--text)':'var(--border)',
                        background:form.status===s.v?'var(--text)':'transparent',
                        color:form.status===s.v?'var(--bg)':'var(--text)'}}>{s.l}</button>
                  ))}
                </div>
              </Field>
              <div style={{padding:'16px 18px',borderRadius:'var(--r-md)',background:'var(--surface-sunken)',border:'1px solid var(--border)',fontSize:13}}>
                <strong style={{display:'block',marginBottom:10}}>Summary</strong>
                <div className="form-grid-2" style={{gap:6}}>
                  {[
                    ['Type',`${form.bhk} BHK ${form.propertyType}`],
                    ['Location',`${form.locality}, ${form.city}`],
                    ['Area',form.area?`${form.area} sqft`:'—'],
                    ['Rent',form.rent?`₹${parseInt(form.rent).toLocaleString('en-IN')}`:'—'],
                    ['Furnishing',form.furnishing],
                    ['Photos',`${form.photos.filter(Boolean).length} added`],
                  ].map(([l,v])=>(
                    <div key={l} style={{display:'flex',justifyContent:'space-between',gap:8}}>
                      <span style={{color:'var(--text-muted)'}}>{l}</span>
                      <strong style={{textAlign:'right'}}>{v||'—'}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{padding:'14px 24px',borderTop:'1px solid var(--border)',display:'flex',justifyContent:'space-between',flexShrink:0,background:'var(--surface)'}}>
          <button className="btn btn-ghost" onClick={()=>step>1?setStep(s=>s-1):onClose()}>{step>1?'← Back':'Cancel'}</button>
          {step<TOTAL
            ? <button className="btn btn-brand" disabled={!canNext()} onClick={()=>setStep(s=>s+1)}>Continue →</button>
            : <button className="btn btn-brand" onClick={handleSubmit}>{isEdit?'✓ Save changes':'✓ Add property'}</button>
          }
        </div>
      </div>
    </div>
  );
}

function PropertyViewModal({prop, onClose, onEdit}) {
  const photos = prop.photos?.length ? prop.photos : [prop.photo];
  const [active, setActive] = useState(0);
  return (
    <div style={{position:'fixed',inset:0,zIndex:200,background:'rgba(0,0,0,.6)',backdropFilter:'blur(4px)',display:'flex',alignItems:'center',justifyContent:'center',padding:16}}
      onClick={e=>{if(e.target===e.currentTarget) onClose();}}>
      <div style={{background:'var(--surface)',borderRadius:'var(--r-lg)',width:'100%',maxWidth:720,maxHeight:'92vh',overflow:'hidden',display:'flex',flexDirection:'column'}}>
        <div style={{padding:'16px 22px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
          <div>
            <div style={{fontSize:18,fontWeight:800,letterSpacing:'-0.02em'}}>{prop.bhk} BHK in {prop.locality}</div>
            <div style={{fontSize:12,color:'var(--text-muted)',fontFamily:'var(--f-mono)'}}>{prop.id}</div>
          </div>
          <div style={{display:'flex',gap:8}}>
            <button className="btn btn-outline btn-sm" onClick={onEdit}>Edit</button>
            <button onClick={onClose} style={{background:'var(--surface-sunken)',border:0,borderRadius:'50%',width:32,height:32,cursor:'pointer',fontSize:15,display:'grid',placeItems:'center'}}>✕</button>
          </div>
        </div>
        <div style={{flex:1,overflowY:'auto',padding:20}}>
          <div style={{height:240,borderRadius:'var(--r-md)',overflow:'hidden',marginBottom:8}}>
            <Img src={photos[active]||photos[0]} style={{width:'100%',height:'100%'}}/>
          </div>
          {photos.length>1 && (
            <div style={{display:'flex',gap:8,marginBottom:16,overflowX:'auto'}}>
              {photos.map((p,i)=>(
                <div key={i} onClick={()=>setActive(i)} style={{width:56,height:44,borderRadius:'var(--r-sm)',overflow:'hidden',flexShrink:0,cursor:'pointer',border:'2px solid',borderColor:active===i?'var(--brand-500)':'transparent'}}>
                  <img src={p} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                </div>
              ))}
            </div>
          )}
          <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:10,marginBottom:16}}>
            {[
              {l:'Rent',v:`₹${prop.rentK||0}k/mo`},{l:'Area',v:`${(prop.area||0).toLocaleString('en-IN')} sqft`},
              {l:'Floor',v:`${prop.floor||'—'}/${prop.total||'—'}`},{l:'Furnishing',v:prop.furnishing||'—'},
              {l:'City',v:prop.city},{l:'Type',v:prop.propertyType||'Apartment'},
            ].map(s=>(
              <div key={s.l} style={{padding:'10px 12px',borderRadius:'var(--r-sm)',background:'var(--surface-sunken)'}}>
                <div style={{fontSize:10,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'.08em',fontWeight:600}}>{s.l}</div>
                <div style={{fontSize:14,fontWeight:700,marginTop:3}}>{s.v}</div>
              </div>
            ))}
          </div>
          <div style={{padding:'12px 16px',borderRadius:'var(--r-md)',border:'1px solid var(--border)',fontSize:13}}>
            <span style={{color:'var(--text-muted)'}}>Status: </span>
            <strong style={{color:prop.status==='live'?'var(--success)':prop.status==='pending'?'var(--warning)':'var(--error)',textTransform:'capitalize'}}>{prop.status}</strong>
            <span style={{color:'var(--text-muted)',marginLeft:16}}>Added by: </span><strong>{prop.addedBy||'Admin'}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

export {
  AdminDashPage,
  AdminModPage,
  AdminUsersPage,
  AdminRevenuePage,
  AdminCmsPage,
  AdminPropertiesPage,
};
