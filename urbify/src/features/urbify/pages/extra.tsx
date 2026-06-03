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

function BrokerPortfolioPage({nav}) {
  const { authUser } = useAppData();
  const _brokerName = authUser?.brokerProfile?.fullName || 'Broker';
  const _brokerInitials = _brokerName.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
  const _reraId = authUser?.brokerProfile?.reraId || '';
  const portalUser = { initials: _brokerInitials, name: _brokerName, role: `Verified Broker · ${_reraId}`, color: 'var(--text)' };

  const [view, setView] = useState("table"); // table | grid
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState([]);

  const portfolio = LISTINGS.map((l, i) => ({
    ...l,
    status: ["live","live","pending","rented","live","expired","live","live","live","pending","live","rented","live","live","live","live","pending","rented"][i],
    owner: ["A. Khanna","P. Iyer","R. Verma","S. Rao","M. Kapoor","D. Nair","K. Singh","T. Reddy","V. Joshi","B. Shah","G. Bhat","N. Kumar","M. Pillai","R. Iyengar","S. Patel","H. Gupta","L. Menon","J. Bose"][i],
    commission: l.rentK * 1000,
    daysListed: 1 + (i*3) % 28,
  }));

  const filtered = statusFilter === "all" ? portfolio : portfolio.filter(p => p.status === statusFilter);

  const toggleSel = (id) => setSelected(s => s.includes(id) ? s.filter(x=>x!==id) : [...s, id]);
  const allSelected = selected.length === filtered.length && filtered.length > 0;
  const toggleAll = () => setSelected(allSelected ? [] : filtered.map(p=>p.id));

  return (
    <PortalShell user={portalUser} navItems={BROKER_NAV()} current="brokerList" onNav={(id)=>nav(id)}>
      <DashHeader title="Portfolio"
        subtitle={`${portfolio.length} listings · ${portfolio.filter(p=>p.status==='live').length} live · ${portfolio.filter(p=>p.status==='rented').length} closed this quarter`}
        actions={
          <>
            <button className="btn btn-outline btn-sm"><Icon.download/> Export</button>
            <button className="btn btn-brand btn-sm" onClick={()=>nav('ownerNew')}>＋ Add listing</button>
          </>
        }/>

      {/* filter bar */}
      <div className="card" style={{padding:'14px 18px', display:'flex', alignItems:'center', gap:14, marginBottom:18, flexWrap:'wrap'}}>
        <div style={{display:'flex', gap:6}}>
          {[
            {id:'all', l:`All · ${portfolio.length}`},
            {id:'live', l:`Live · ${portfolio.filter(p=>p.status==='live').length}`},
            {id:'pending', l:`Pending · ${portfolio.filter(p=>p.status==='pending').length}`},
            {id:'rented', l:`Closed · ${portfolio.filter(p=>p.status==='rented').length}`},
            {id:'expired', l:`Expired · ${portfolio.filter(p=>p.status==='expired').length}`},
          ].map(t=>(
            <button key={t.id} onClick={()=>setStatusFilter(t.id)}
              style={{
                padding:'7px 14px', borderRadius:99,
                border:'1.5px solid', borderColor: statusFilter===t.id?'var(--text)':'var(--border)',
                background: statusFilter===t.id?'var(--text)':'transparent',
                color: statusFilter===t.id?'var(--bg)':'var(--text)',
                fontSize:12, fontWeight:600, cursor:'pointer',
              }}>{t.l}</button>
          ))}
        </div>
        <div style={{flex:1, minWidth:200}}>
          <div style={{display:'flex', alignItems:'center', gap:8, padding:'0 12px', background:'var(--surface-sunken)', borderRadius:'var(--r-sm)', height:36}}>
            <Icon.search/>
            <input className="input" placeholder="Search by owner, locality, ID…" style={{border:0, background:'transparent', padding:0, height:'auto', flex:1, fontSize:13}}/>
          </div>
        </div>
        <select className="input select btn-sm" style={{height:36, fontSize:12}}><option>All cities</option><option>Bangalore</option><option>Mumbai</option><option>Pune</option></select>
        <select className="input select btn-sm" style={{height:36, fontSize:12}}><option>Sort: Newest</option><option>Highest rent</option><option>Most unlocks</option></select>
        <div style={{display:'flex', gap:0, border:'1px solid var(--border)', borderRadius:'var(--r-sm)', overflow:'hidden'}}>
          <button onClick={()=>setView('table')} className="btn btn-sm" style={{background: view==='table'?'var(--text)':'transparent', color: view==='table'?'var(--bg)':'var(--text-muted)', border:0, borderRadius:0, height:34}}>⊟ Table</button>
          <button onClick={()=>setView('grid')} className="btn btn-sm" style={{background: view==='grid'?'var(--text)':'transparent', color: view==='grid'?'var(--bg)':'var(--text-muted)', border:0, borderRadius:0, height:34}}>⊞ Grid</button>
        </div>
      </div>

      {/* bulk actions */}
      {selected.length > 0 && (
        <div className="card" style={{padding:'10px 18px', marginBottom:18, background:'var(--text)', color:'var(--bg)', border:0, display:'flex', alignItems:'center', gap:14}}>
          <span style={{fontSize:13, fontWeight:600}}>{selected.length} selected</span>
          <div style={{flex:1}}/>
          <button className="btn btn-sm" style={{background:'rgba(255,255,255,.1)', color:'#fff', border:0}}>Mark as rented</button>
          <button className="btn btn-sm" style={{background:'rgba(255,255,255,.1)', color:'#fff', border:0}}>Pause</button>
          <button className="btn btn-sm" style={{background:'rgba(255,255,255,.1)', color:'#fff', border:0}}>Renew all</button>
          <button className="btn btn-sm" style={{background:'transparent', color:'#fff', border:0}} onClick={()=>setSelected([])}><Icon.close/></button>
        </div>
      )}

      {view === 'table' ? (
        <div className="card" style={{padding:0, overflow:'hidden'}}>
          <table style={{width:'100%', borderCollapse:'collapse', fontSize:13}}>
            <thead style={{background:'var(--surface-sunken)'}}>
              <tr style={{textAlign:'left', color:'var(--text-muted)', fontSize:11, textTransform:'uppercase', letterSpacing:'.08em', fontWeight:600}}>
                <th style={{padding:'12px 22px', width:40}}>
                  <input type="checkbox" checked={allSelected} onChange={toggleAll}/>
                </th>
                <th style={{padding:'12px 22px'}}>Property</th>
                <th style={{padding:'12px 22px'}}>Owner</th>
                <th style={{padding:'12px 22px'}}>Status</th>
                <th style={{padding:'12px 22px'}}>Live for</th>
                <th style={{padding:'12px 22px'}}>Unlocks</th>
                <th style={{padding:'12px 22px'}}>Rent</th>
                <th style={{padding:'12px 22px'}}>Commission</th>
                <th style={{padding:'12px 22px', textAlign:'right'}}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(l=>(
                <tr key={l.id} style={{borderTop:'1px solid var(--border)', background: selected.includes(l.id) ? 'var(--brand-50)' : 'transparent'}}>
                  <td style={{padding:'14px 22px'}}>
                    <input type="checkbox" checked={selected.includes(l.id)} onChange={()=>toggleSel(l.id)}/>
                  </td>
                  <td style={{padding:'14px 22px'}}>
                    <div style={{display:'flex', alignItems:'center', gap:12}}>
                      <Img src={l.photo} style={{width:48, height:48, borderRadius:'var(--r-sm)'}}/>
                      <div>
                        <div style={{fontWeight:600}}>{l.bhk} BHK · {l.locality}</div>
                        <div style={{fontSize:11, color:'var(--text-muted)', fontFamily:'var(--f-mono)'}}>{l.id} · {l.city}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{padding:'14px 22px', color:'var(--text-muted)'}}>{l.owner}</td>
                  <td style={{padding:'14px 22px'}}><StatusBadge status={l.status}/></td>
                  <td style={{padding:'14px 22px', color:'var(--text-muted)', fontVariantNumeric:'tabular-nums'}}>{l.daysListed} days</td>
                  <td style={{padding:'14px 22px', fontWeight:600, fontVariantNumeric:'tabular-nums'}}>{Math.floor(l.pop/4)}</td>
                  <td style={{padding:'14px 22px', fontWeight:600}}>₹{l.rentK}k</td>
                  <td style={{padding:'14px 22px', fontWeight:700, color: l.status === 'rented' ? 'var(--success)' : 'var(--text-muted)', fontVariantNumeric:'tabular-nums'}}>
                    {l.status === 'rented' ? `+₹${l.commission.toLocaleString("en-IN")}` : `~₹${l.commission.toLocaleString("en-IN")}`}
                  </td>
                  <td style={{padding:'14px 22px', textAlign:'right'}}>
                    <div style={{display:'inline-flex', gap:4}}>
                      <button className="btn btn-ghost btn-sm" onClick={()=>nav('detail', l.id)}>View</button>
                      <button className="btn btn-ghost btn-sm">⋯</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{padding:'14px 22px', borderTop:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:12, color:'var(--text-muted)'}}>
            <span>Showing {filtered.length} of {portfolio.length}</span>
            <div style={{display:'flex', gap:6}}>
              <button className="btn btn-outline btn-sm">← Prev</button>
              <span style={{padding:'0 12px', fontWeight:600, color:'var(--text)'}}>1</span>
              <button className="btn btn-outline btn-sm">Next →</button>
            </div>
          </div>
        </div>
      ) : (
        <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:16}}>
          {filtered.map(l=>(
            <div key={l.id} className="card" style={{padding:0, overflow:'hidden'}}>
              <div style={{position:'relative'}}>
                <Img src={l.photo} style={{aspectRatio:'5/3'}}/>
                <div style={{position:'absolute', top:10, left:10}}><StatusBadge status={l.status}/></div>
                <div style={{position:'absolute', top:10, right:10}}>
                  <input type="checkbox" checked={selected.includes(l.id)} onChange={()=>toggleSel(l.id)} style={{width:18, height:18}}/>
                </div>
              </div>
              <div style={{padding:16}}>
                <div className="font-display" style={{fontSize:16, fontWeight:700, letterSpacing:'-0.02em'}}>{l.bhk} BHK · {l.locality}</div>
                <div style={{fontSize:12, color:'var(--text-muted)', marginTop:2}}>Owner: {l.owner}</div>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:12}}>
                  <div className="font-display" style={{fontSize:22, fontWeight:800, letterSpacing:'-0.02em'}}>₹{l.rentK}k</div>
                  <div style={{fontSize:11, color:'var(--text-muted)'}}>{Math.floor(l.pop/4)} unlocks</div>
                </div>
                <div style={{display:'flex', gap:6, marginTop:12}}>
                  <button className="btn btn-outline btn-sm" style={{flex:1}}>Edit</button>
                  <button className="btn btn-outline btn-sm" style={{flex:1}}>Pause</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </PortalShell>
  );
}

// ─── TENANT TRANSACTIONS ─────────────────────────────────────────────────
function ClientTxPage({nav}) {
  const { authUser } = useAppData();
  const _clientName = authUser?.clientProfile?.fullName || 'Tenant';
  const _clientInitials = _clientName.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
  const portalUser = { initials: _clientInitials, name: _clientName, role: 'Tenant', color: 'var(--accent-500)' };

  const [filter, setFilter] = useState("all");
  const [transactions, setTransactions] = useState([]);
  const [loadingTx, setLoadingTx] = useState(true);

  useEffect(() => {
    setLoadingTx(true);
    fetch('/api/v1/users/me/unlocks')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data && Array.isArray(data.unlocks)) setTransactions(data.unlocks);
        else setTransactions([]);
      })
      .catch(() => setTransactions([]))
      .finally(() => setLoadingTx(false));
  }, []);

  const totalSpent = transactions.filter(t=>t.status==='completed').reduce((s,t)=>s+t.amount, 0);
  const refunded = transactions.filter(t=>t.status==='refunded').reduce((s,t)=>s+t.amount, 0);

  const filtered = filter === "all" ? transactions : transactions.filter(t => t.status === filter);

  return (
    <PortalShell user={portalUser} navItems={CLIENT_NAV()} current="clientTx" onNav={(id)=>nav(id)}>
      <DashHeader title="Transactions"
        subtitle={`${transactions.length} unlocks total · all invoices below`}
        actions={
          <>
            <select className="input select btn-sm" style={{height:34, fontSize:13}}><option>All time</option><option>FY 2026-27</option><option>FY 2025-26</option></select>
            <button className="btn btn-outline btn-sm"><Icon.download/> All invoices (ZIP)</button>
          </>
        }/>

      {/* KPIs */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:14, marginBottom:24}}>
        <StatCard label="Total unlocks" value={transactions.filter(t=>t.status==='completed').length.toString()} sub="completed"/>
        <StatCard label="Total spent" value={`₹${(totalSpent/1000).toFixed(1)}k`} sub="across all unlocks"/>
        <StatCard label="GST paid (claimable)" value={`₹${Math.round(totalSpent * 0.18 / 1.18 / 100) * 100 / 1000}k`} sub="for FY 2026-27"/>
        <StatCard label="Refunded" value={`₹${refunded.toLocaleString("en-IN")}`} sub="1 transaction" color="var(--text-faint)"/>
      </div>

      {/* tax summary card */}
      <div className="card" style={{padding:'20px 24px', marginBottom:24, background:'var(--brand-50)', border:0, display:'flex', alignItems:'center', gap:18}}>
        <div style={{width:48, height:48, borderRadius:'var(--r-sm)', background:'var(--brand-500)', color:'#fff', display:'grid', placeItems:'center', fontSize:20}}>₹</div>
        <div style={{flex:1}}>
          <div style={{fontSize:14, fontWeight:600, color:'var(--brand-900)'}}>Tax-saving tip: your GST on platform fees is claimable</div>
          <div style={{fontSize:12, color:'var(--brand-700)', marginTop:2}}>If you're filing for HRA or running a business, this can offset against your input credit. Download the consolidated certificate below.</div>
        </div>
        <button className="btn btn-sm" style={{background:'var(--brand-500)', color:'#fff', border:0}}>Download GST cert</button>
      </div>

      {/* filter chips */}
      <div style={{display:'flex', gap:6, marginBottom:14}}>
        {[
          {id:'all', l:`All · ${transactions.length}`},
          {id:'completed', l:`Completed · ${transactions.filter(t=>t.status==='completed').length}`},
          {id:'refunded', l:`Refunded · ${transactions.filter(t=>t.status==='refunded').length}`},
          {id:'disputed', l:`Disputed · ${transactions.filter(t=>t.status==='disputed').length}`},
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

      {/* transactions list */}
      <div className="card" style={{padding:0, overflow:'hidden'}}>
        {loadingTx ? (
          <div style={{padding:'32px 22px', textAlign:'center', color:'var(--text-muted)', fontSize:14}}>Loading transactions…</div>
        ) : filtered.length === 0 ? (
          <div style={{padding:'32px 22px', textAlign:'center', color:'var(--text-muted)', fontSize:14}}>No transactions yet.</div>
        ) : filtered.map((t, i)=>(
          <div key={t.id} style={{padding:'18px 22px', borderTop: i===0?0:'1px solid var(--border)', display:'flex', alignItems:'center', gap:18}}>
            <Img src={t.listing.photo} style={{width:64, height:64, borderRadius:'var(--r-md)', flexShrink:0}}/>

            <div style={{flex:1, minWidth:0}}>
              <div style={{display:'flex', gap:10, alignItems:'baseline', flexWrap:'wrap'}}>
                <div style={{fontWeight:600, fontSize:15}}>{t.listing.bhk} BHK in {t.listing.locality}</div>
                <div style={{fontSize:11, color:'var(--text-muted)', fontFamily:'var(--f-mono)'}}>{t.id}</div>
              </div>
              <div style={{display:'flex', gap:12, marginTop:4, fontSize:12, color:'var(--text-muted)'}}>
                <span>{t.date}</span><span>·</span>
                <span>Paid via {t.method}</span>
                {t.reason && <><span>·</span><span style={{color:'var(--warning)'}}>{t.reason}</span></>}
              </div>
            </div>

            <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4}}>
              <div className="font-display" style={{fontSize:20, fontWeight:800, letterSpacing:'-0.02em', textDecoration: t.status==='refunded' ? 'line-through' : 'none', color: t.status==='refunded' ? 'var(--text-muted)' : 'var(--text)'}}>
                ₹{t.amount.toLocaleString("en-IN")}
              </div>
              {t.status === 'completed' && <span style={{fontSize:11, color:'var(--success)', fontWeight:600}}>✓ Completed</span>}
              {t.status === 'refunded' && <span style={{fontSize:11, color:'var(--text-muted)', fontWeight:600}}>↺ Refunded to source</span>}
              {t.status === 'disputed' && <span style={{fontSize:11, color:'var(--warning)', fontWeight:600}}>⚠ Under review</span>}
            </div>

            <div style={{display:'flex', flexDirection:'column', gap:6}}>
              <button className="btn btn-outline btn-sm">View listing</button>
              <button className="btn btn-ghost btn-sm"><Icon.download/> Invoice</button>
            </div>
          </div>
        ))}
      </div>

      <div style={{textAlign:'center', marginTop:32, fontSize:12, color:'var(--text-faint)'}}>
        Invoices are also emailed to <strong style={{color:'var(--text-muted)'}}>{authUser?.email || 'your email'}</strong> · Need a custom GST certificate? <a style={{color:'var(--brand-500)', textDecoration:'underline'}}>Contact billing</a>
      </div>
    </PortalShell>
  );
}

// ─── SETTINGS / PROFILE ─────────────────────────────────────────────────
function SettingsPage({nav}) {
  const { authUser } = useAppData();
  const _settingsName = authUser?.clientProfile?.fullName || authUser?.ownerProfile?.fullName || authUser?.brokerProfile?.fullName || 'User';
  const _settingsInitials = _settingsName.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
  const portalUser = { initials: _settingsInitials, name: _settingsName, role: 'Tenant', color: 'var(--accent-500)' };

  const [section, setSection] = useState("profile");
  const [notif, setNotif] = useState({sms:true, email:true, push:false, weekly:true});

  // Allow settings from any role — use client by default
  return (
    <PortalShell user={portalUser} navItems={CLIENT_NAV()} current="settings" onNav={(id)=>nav(id)}>
      <DashHeader title="Settings"
        subtitle="Manage your profile, security, and notifications."/>

      <div style={{display:'grid', gridTemplateColumns:'220px 1fr', gap:32, alignItems:'start'}}>
        <nav style={{display:'flex', flexDirection:'column', gap:2, position:'sticky', top:96}}>
          {[
            {id:'profile', l:'Profile'},
            {id:'security', l:'Security'},
            {id:'notif', l:'Notifications'},
            {id:'privacy', l:'Privacy'},
            {id:'pay', l:'Payment methods'},
            {id:'danger', l:'Danger zone'},
          ].map(s=>(
            <button key={s.id} onClick={()=>setSection(s.id)} style={{
              padding:'10px 14px', borderRadius:'var(--r-sm)', textAlign:'left',
              background: section===s.id ? 'var(--text)' : 'transparent',
              color: section===s.id ? 'var(--bg)' : 'var(--text)',
              border:0, cursor:'pointer', fontSize:13, fontWeight: section===s.id?600:500,
            }}>{s.l}</button>
          ))}
        </nav>

        <div>
          {section === 'profile' && (
            <div className="card" style={{padding:32}}>
              <h2 className="font-display" style={{fontSize:22, fontWeight:700, letterSpacing:'-0.02em', margin:'0 0 4px'}}>Profile</h2>
              <p className="muted" style={{margin:'0 0 28px', fontSize:14}}>This is what owners and brokers see when you unlock a listing.</p>

              <div style={{display:'flex', alignItems:'center', gap:18, marginBottom:28}}>
                <div style={{width:72, height:72, borderRadius:'50%', background:'var(--accent-500)', color:'#1A1100', display:'grid', placeItems:'center', fontWeight:800, fontSize:22}}>AS</div>
                <div>
                  <button className="btn btn-outline btn-sm">Upload photo</button>
                  <div style={{fontSize:11, color:'var(--text-faint)', marginTop:6}}>JPG or PNG · max 2 MB</div>
                </div>
              </div>

              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
                <Field label="First name"><input className="input" defaultValue="Aanya"/></Field>
                <Field label="Last name"><input className="input" defaultValue="Sharma"/></Field>
                <Field label="Email"><input className="input" type="email" defaultValue="aanya@example.com"/></Field>
                <Field label="Phone">
                  <div style={{display:'flex', gap:8}}>
                    <div className="input" style={{width:90, display:'flex', alignItems:'center', justifyContent:'center'}}>+91</div>
                    <input className="input" defaultValue="98217 33342" style={{flex:1}}/>
                  </div>
                </Field>
              </div>

              <div style={{marginTop:16}}>
                <Field label="Bio (optional)">
                  <textarea className="input" rows="3" style={{height:'auto', padding:'12px 14px', resize:'vertical', lineHeight:1.5}} defaultValue="Product designer at PhonePe. Quiet neighbourhood preferred."/>
                </Field>
              </div>

              <div style={{marginTop:32, paddingTop:20, borderTop:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <div>
                  <div style={{fontSize:14, fontWeight:600}}>Profile completion</div>
                  <div style={{fontSize:12, color:'var(--text-muted)'}}>Add income proof to reach 100% — verified tenants get 2.3× faster replies.</div>
                  <div style={{height:6, background:'var(--surface-sunken)', borderRadius:99, marginTop:8, overflow:'hidden', width:280}}>
                    <div style={{height:'100%', width:'76%', background:'var(--brand-500)', borderRadius:99}}/>
                  </div>
                </div>
                <div className="font-display" style={{fontSize:32, fontWeight:800, letterSpacing:'-0.03em'}}>76%</div>
              </div>

              <div style={{display:'flex', gap:10, marginTop:24, justifyContent:'flex-end'}}>
                <button className="btn btn-outline">Cancel</button>
                <button className="btn btn-brand">Save changes</button>
              </div>
            </div>
          )}

          {section === 'security' && (
            <div className="card" style={{padding:32}}>
              <h2 className="font-display" style={{fontSize:22, fontWeight:700, letterSpacing:'-0.02em', margin:'0 0 4px'}}>Security</h2>
              <p className="muted" style={{margin:'0 0 28px', fontSize:14}}>Keep your account safe.</p>

              <SettingRow title="Two-factor authentication" sub="Add an extra OTP at every login from a new device." action={<button className="btn btn-outline btn-sm">Enable</button>}/>
              <SettingRow title="Phone number" sub="+91 98217 33342 · verified Aug 2025" action={<button className="btn btn-outline btn-sm">Change</button>}/>
              <SettingRow title="Email address" sub="aanya@example.com · verified" action={<button className="btn btn-outline btn-sm">Change</button>}/>
              <SettingRow title="Active sessions" sub="3 devices · last activity 2 min ago" action={<button className="btn btn-outline btn-sm">Manage</button>}/>
              <SettingRow title="Login history" sub="Last 10 logins available for review" action={<button className="btn btn-outline btn-sm">View</button>} last/>
            </div>
          )}

          {section === 'notif' && (
            <div className="card" style={{padding:32}}>
              <h2 className="font-display" style={{fontSize:22, fontWeight:700, letterSpacing:'-0.02em', margin:'0 0 4px'}}>Notifications</h2>
              <p className="muted" style={{margin:'0 0 28px', fontSize:14}}>Pick what we ping you about.</p>

              {[
                {key:'sms', t:'SMS alerts', s:'For new matches on saved searches'},
                {key:'email', t:'Email alerts', s:'Daily digest of new listings in your areas'},
                {key:'push', t:'Push notifications', s:'On the mobile app (currently disabled)'},
                {key:'weekly', t:'Weekly Urbify newsletter', s:'One email, every Monday morning'},
              ].map((n, i)=>(
                <div key={n.key} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 0', borderTop: i===0 ? 0 : '1px solid var(--border)'}}>
                  <div>
                    <div style={{fontSize:14, fontWeight:600}}>{n.t}</div>
                    <div style={{fontSize:12, color:'var(--text-muted)', marginTop:2}}>{n.s}</div>
                  </div>
                  <Toggle on={notif[n.key]}/>
                </div>
              ))}
            </div>
          )}

          {section === 'privacy' && (
            <div className="card" style={{padding:32}}>
              <h2 className="font-display" style={{fontSize:22, fontWeight:700, letterSpacing:'-0.02em', margin:'0 0 4px'}}>Privacy</h2>
              <p className="muted" style={{margin:'0 0 28px', fontSize:14}}>You control what's shared.</p>

              <SettingRow title="Show my name to owners after unlock" sub="When off, owners see 'Tenant'." action={<Toggle on={true}/>}/>
              <SettingRow title="Allow owners to WhatsApp me" sub="They can text but not call without your consent." action={<Toggle on={true}/>}/>
              <SettingRow title="Show me in 'verified tenant' lists" sub="Some owners filter to verified-only — being visible boosts replies." action={<Toggle on={true}/>}/>
              <SettingRow title="Marketing analytics" sub="Allow Urbify to use anonymised data for product analytics." action={<Toggle on={false}/>} last/>

              <div style={{marginTop:24, padding:'14px 18px', borderRadius:'var(--r-md)', background:'var(--surface-sunken)', display:'flex', gap:12, alignItems:'center'}}>
                <span style={{color:'var(--success)', fontSize:18}}><Icon.shield/></span>
                <div style={{fontSize:13, color:'var(--text-muted)'}}>
                  We never sell your data. Ever. <a style={{color:'var(--brand-500)', textDecoration:'underline'}}>Read full privacy policy →</a>
                </div>
              </div>
            </div>
          )}

          {section === 'pay' && (
            <div className="card" style={{padding:32}}>
              <h2 className="font-display" style={{fontSize:22, fontWeight:700, letterSpacing:'-0.02em', margin:'0 0 4px'}}>Payment methods</h2>
              <p className="muted" style={{margin:'0 0 28px', fontSize:14}}>Saved methods speed up checkout.</p>

              <div style={{display:'flex', flexDirection:'column', gap:10}}>
                {[
                  { type:'UPI', name:'rahul@oksbi', sub:'Default', primary:true },
                  { type:'Card', name:'HDFC •••• 4242', sub:'Expires 12/27' },
                  { type:'NetBank', name:'ICICI Bank', sub:'Saved Sep 2025' },
                ].map((m, i)=>(
                  <div key={i} style={{display:'flex', alignItems:'center', gap:14, padding:'14px 18px', borderRadius:'var(--r-md)', border: m.primary ? '1.5px solid var(--text)' : '1px solid var(--border)'}}>
                    <div style={{width:42, height:42, borderRadius:'var(--r-sm)', background:'var(--surface-sunken)', display:'grid', placeItems:'center'}}>
                      {m.type === 'UPI' && <Icon.upi/>}
                      {m.type === 'Card' && <Icon.card/>}
                      {m.type === 'NetBank' && <Icon.bank/>}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:14, fontWeight:600}}>{m.name}</div>
                      <div style={{fontSize:11, color:'var(--text-muted)'}}>{m.sub}</div>
                    </div>
                    {m.primary && <span className="chip" style={{height:22, fontSize:10, background:'var(--text)', color:'var(--bg)', border:0}}>DEFAULT</span>}
                    <button className="btn btn-ghost btn-sm">⋯</button>
                  </div>
                ))}
              </div>

              <button className="btn btn-outline" style={{marginTop:16}}>＋ Add payment method</button>
            </div>
          )}

          {section === 'danger' && (
            <div className="card" style={{padding:32, borderColor:'var(--error)'}}>
              <h2 className="font-display" style={{fontSize:22, fontWeight:700, letterSpacing:'-0.02em', margin:'0 0 4px', color:'var(--error)'}}>Danger zone</h2>
              <p className="muted" style={{margin:'0 0 28px', fontSize:14}}>Permanent actions. Read carefully.</p>

              <SettingRow title="Pause my account" sub="Hide your shortlists and saved searches. You can resume anytime." action={<button className="btn btn-outline btn-sm">Pause</button>}/>
              <SettingRow title="Export my data" sub="GDPR-style data dump — JSON + PDFs of every invoice." action={<button className="btn btn-outline btn-sm">Request export</button>}/>
              <SettingRow title="Delete my account" sub="Permanently erases your profile. Past transactions are retained for compliance." action={<button className="btn btn-sm" style={{background:'var(--error)', color:'#fff', border:0}}>Delete</button>} last/>
            </div>
          )}
        </div>
      </div>
    </PortalShell>
  );
}

function SettingRow({title, sub, action, last}) {
  return (
    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'18px 0', borderBottom: last ? 0 : '1px solid var(--border)'}}>
      <div style={{flex:1, paddingRight:24}}>
        <div style={{fontSize:14, fontWeight:600}}>{title}</div>
        <div style={{fontSize:12, color:'var(--text-muted)', marginTop:4}}>{sub}</div>
      </div>
      {action}
    </div>
  );
}

// ─── HELP CENTER ────────────────────────────────────────────────────────
function HelpPage({nav}) {
  const [q, setQ] = useState("");

  const categories = [
    { icon:'⌕', title:'Search & shortlist', count:18, desc:"Finding the right home, saving searches, filters" },
    { icon:'🔓', title:'Unlocking contacts', count:14, desc:"The fee, the payment, how the reveal works" },
    { icon:'📋', title:'Listing your home', count:22, desc:"For owners — photos, pricing, moderation" },
    { icon:'🤝', title:'Brokers & RERA', count:11, desc:"Onboarding, verification, commission" },
    { icon:'₹', title:'Payments & refunds', count:9, desc:"UPI, GST, invoices, the 24-hour window" },
    { icon:'🛡', title:'Privacy & security', count:13, desc:"What's hidden, what's shared, account safety" },
    { icon:'⚖', title:'Legal & RERA', count:8, desc:"Tenancy law, RERA compliance, grievances" },
    { icon:'💬', title:'Account & profile', count:7, desc:"Login issues, profile setup, notifications" },
  ];

  const popular = [
    "How is the Urbify fee calculated?",
    "What happens after I unlock a listing?",
    "When does Urbify issue a refund?",
    "How do I list my home for free?",
    "Are brokers required to be RERA-registered?",
    "How long does listing verification take?",
  ];

  return (
    <div>
      {/* Hero search */}
      <section style={{background:'var(--brand-500)', color:'#fff', padding:'72px 28px 96px', position:'relative', overflow:'hidden'}}>
        <div style={{maxWidth:780, margin:'0 auto', textAlign:'center'}}>
          <div className="chip" style={{background:'rgba(255,255,255,.15)', color:'#fff', border:0, marginBottom:24}}>Help center</div>
          <h1 className="font-display" style={{fontSize:'clamp(40px, 6vw, 72px)', fontWeight:800, letterSpacing:'-0.04em', lineHeight:1, margin:0}}>
            How can we help?
          </h1>
          <p style={{fontSize:18, opacity:.8, marginTop:18, maxWidth:520, marginInline:'auto'}}>
            Browse 102 articles, or ask us anything.
          </p>

          <div style={{position:'relative', marginTop:36, maxWidth:560, marginInline:'auto'}}>
            <input className="input" placeholder="Search for an answer…"
              value={q} onChange={e=>setQ(e.target.value)}
              style={{
                width:'100%', height:60, fontSize:16, padding:'0 60px 0 24px',
                background:'rgba(255,255,255,.95)', color:'var(--text)', border:0,
                borderRadius:'var(--r-pill)', boxShadow:'var(--sh-3)',
              }}/>
            <button style={{
              position:'absolute', right:8, top:8, width:44, height:44,
              borderRadius:'50%', background:'var(--text)', color:'#fff',
              border:0, cursor:'pointer', display:'grid', placeItems:'center', fontSize:18,
            }}><Icon.search/></button>
          </div>

          {q && (
            <div style={{marginTop:14, fontSize:13, opacity:.85}}>
              {popular.filter(p=>p.toLowerCase().includes(q.toLowerCase())).length} results for "{q}"
            </div>
          )}
        </div>

        {/* decorative blobs */}
        <div style={{position:'absolute', left:-100, top:-50, width:300, height:300, borderRadius:'50%', background:'var(--accent-500)', filter:'blur(80px)', opacity:.2}}/>
      </section>

      {/* Popular */}
      <section style={{padding:'56px 28px 24px', maxWidth:1280, margin:'-72px auto 0', position:'relative', zIndex:2}}>
        <div className="card" style={{padding:32, boxShadow:'var(--sh-3)'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:18}}>
            <h2 className="font-display" style={{fontSize:22, fontWeight:700, letterSpacing:'-0.02em', margin:0}}>Most asked, this week</h2>
            <span style={{fontSize:12, color:'var(--text-muted)'}}>Updated daily</span>
          </div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:0}}>
            {popular.map((p, i)=>(
              <a key={i} style={{
                display:'flex', alignItems:'center', gap:12, padding:'14px 0',
                borderBottom: i >= popular.length-2 ? 0 : '1px solid var(--border)',
                cursor:'pointer', fontSize:14,
              }} onClick={()=>nav('faq')}>
                <span style={{color:'var(--brand-500)', fontSize:16}}>→</span>
                <span style={{flex:1, fontWeight:500}}>{p}</span>
                <span style={{fontSize:11, color:'var(--text-faint)'}}>2 min read</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section style={{padding:'72px 28px', maxWidth:1280, margin:'0 auto'}}>
        <h2 className="font-display" style={{fontSize:'clamp(28px, 4vw, 40px)', fontWeight:800, letterSpacing:'-0.03em', margin:'0 0 32px'}}>Browse by topic</h2>
        <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:16}}>
          {categories.map(c=>(
            <div key={c.title} className="card" style={{padding:24, cursor:'pointer', transition:'transform .15s, box-shadow .2s'}}
              onMouseEnter={e=>{e.currentTarget.style.boxShadow='var(--sh-3)'; e.currentTarget.style.transform='translateY(-2px)';}}
              onMouseLeave={e=>{e.currentTarget.style.boxShadow=''; e.currentTarget.style.transform='';}}
              onClick={()=>nav('faq')}
            >
              <div style={{fontSize:32}}>{c.icon}</div>
              <div className="font-display" style={{fontSize:17, fontWeight:700, letterSpacing:'-0.02em', marginTop:14}}>{c.title}</div>
              <div style={{fontSize:13, color:'var(--text-muted)', lineHeight:1.5, marginTop:6}}>{c.desc}</div>
              <div style={{fontSize:12, color:'var(--brand-500)', fontWeight:600, marginTop:14}}>{c.count} articles →</div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact options */}
      <section style={{padding:'72px 28px', background:'var(--surface-sunken)'}}>
        <div style={{maxWidth:1100, margin:'0 auto', textAlign:'center'}}>
          <h2 className="font-display" style={{fontSize:'clamp(28px, 4vw, 40px)', fontWeight:800, letterSpacing:'-0.03em', margin:0}}>Didn't find it? Talk to a human.</h2>
          <p className="muted" style={{fontSize:16, marginTop:14, maxWidth:540, marginInline:'auto', lineHeight:1.5}}>Real people, 9 AM – 8 PM IST, every day of the week.</p>
        </div>

        <div style={{maxWidth:1100, margin:'40px auto 0', display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:16}}>
          <div className="card" style={{padding:28, textAlign:'center'}}>
            <div style={{fontSize:32}}>💬</div>
            <div className="font-display" style={{fontSize:18, fontWeight:700, marginTop:14, letterSpacing:'-0.02em'}}>Live chat</div>
            <div style={{fontSize:13, color:'var(--text-muted)', marginTop:6, lineHeight:1.5}}>Median reply time: 47 seconds</div>
            <button className="btn btn-brand btn-sm" style={{marginTop:18}}>Open chat</button>
          </div>
          <div className="card" style={{padding:28, textAlign:'center'}}>
            <div style={{fontSize:32}}>✉</div>
            <div className="font-display" style={{fontSize:18, fontWeight:700, marginTop:14, letterSpacing:'-0.02em'}}>Email us</div>
            <div style={{fontSize:13, color:'var(--text-muted)', marginTop:6, lineHeight:1.5}}>help@urbify.in · 4-hour median reply</div>
            <button className="btn btn-outline btn-sm" style={{marginTop:18}} onClick={()=>nav('contact')}>Compose →</button>
          </div>
          <div className="card" style={{padding:28, textAlign:'center'}}>
            <div style={{fontSize:32}}>📞</div>
            <div className="font-display" style={{fontSize:18, fontWeight:700, marginTop:14, letterSpacing:'-0.02em'}}>Call us</div>
            <div style={{fontSize:13, color:'var(--text-muted)', marginTop:6, lineHeight:1.5}}>+91 80-4567-8900 · all cities</div>
            <button className="btn btn-outline btn-sm" style={{marginTop:18}}>Show numbers</button>
          </div>
        </div>
      </section>

      <Footer nav={nav}/>
    </div>
  );
}

// ─── 404 ────────────────────────────────────────────────────────────────
function NotFoundPage({nav}) {
  return (
    <div style={{minHeight:'calc(100vh - 64px)', display:'grid', placeItems:'center', padding:'72px 28px', textAlign:'center'}}>
      <div style={{maxWidth:680}}>
        <div className="font-display" style={{
          fontSize:'clamp(120px, 22vw, 280px)',
          fontWeight:800, letterSpacing:'-0.06em', lineHeight:1,
          color:'transparent',
          WebkitTextStroke: '2px var(--text)',
        }}>404</div>
        <h1 className="font-display" style={{fontSize:'clamp(28px, 4vw, 44px)', fontWeight:800, letterSpacing:'-0.035em', margin:'24px 0 12px'}}>
          This door doesn't open.
        </h1>
        <p style={{fontSize:17, color:'var(--text-muted)', maxWidth:480, marginInline:'auto', lineHeight:1.5}}>
          The page you're looking for has moved out — or never existed. Try one of these instead.
        </p>
        <div style={{display:'flex', gap:10, justifyContent:'center', marginTop:32, flexWrap:'wrap'}}>
          <button className="btn btn-brand btn-lg" onClick={()=>nav('home')}>Go home <Icon.arrow/></button>
          <button className="btn btn-outline btn-lg" onClick={()=>nav('search')}>Browse homes</button>
          <button className="btn btn-outline btn-lg" onClick={()=>nav('help')}>Help center</button>
        </div>

        <div style={{marginTop:64, fontSize:13, color:'var(--text-faint)'}}>
          Found a broken link from outside Urbify? <a style={{color:'var(--brand-500)', textDecoration:'underline', cursor:'pointer'}} onClick={()=>nav('contact')}>Let us know</a>
        </div>
      </div>
    </div>
  );
}


export { BrokerPortfolioPage, ClientTxPage, SettingsPage, SettingRow, HelpPage, NotFoundPage };
