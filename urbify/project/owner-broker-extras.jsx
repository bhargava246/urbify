// owner-broker-extras.jsx — Lead detail · Owner analytics · Broker-owner · Payout ledger

// ─── LEAD DETAIL ─────────────────────────────────────────────────────────
function LeadDetailPage({nav}) {
  const lead = {
    id: "LD-89231",
    listing: LISTINGS[0],
    tenant: { name:"Priya Mehta", phone:"+91 98450 33 423", since:"Oct 2024", verified:true, profileComplete:88 },
    unlocked: "2 hours ago",
    payment: { amount:6250, method:"UPI", txn:"TXN-89231" },
    activity: [
      { t:"2h ago", e:"Unlocked address + phone", k:'unlock' },
      { t:"2h ago", e:"Paid ₹6,250 via UPI", k:'pay' },
      { t:"3h ago", e:"Shortlisted listing", k:'heart' },
      { t:"yesterday", e:"Viewed listing details", k:'view' },
      { t:"yesterday", e:"Searched '2 BHK Koramangala'", k:'search' },
    ],
    notes: "Said she's moving from Indiranagar — current lease ends 15 Dec. Wants to do visit this weekend.",
  };

  return (
    <PortalShell user={OWNER_USER} navItems={OWNER_NAV()} current="ownerInquiries" onNav={(id)=>nav(id)}>
      <div style={{marginBottom:18}}>
        <button className="btn btn-ghost btn-sm" onClick={()=>nav('ownerInquiries')}><Icon.back/> All inquiries</button>
      </div>

      <DashHeader title="Inquiry details"
        subtitle={`${lead.id} · ${lead.unlocked}`}/>

      <div style={{display:'grid', gridTemplateColumns:'1.6fr 1fr', gap:18}}>
        {/* LEFT — main */}
        <div style={{display:'flex', flexDirection:'column', gap:18}}>
          {/* Tenant card */}
          <div className="card" style={{padding:28}}>
            <div style={{display:'flex', alignItems:'flex-start', gap:18}}>
              <div style={{width:72, height:72, borderRadius:'50%', background:'var(--brand-500)', color:'#fff', display:'grid', placeItems:'center', fontWeight:800, fontSize:22}}>
                {lead.tenant.name.split(' ').map(w=>w[0]).join('')}
              </div>
              <div style={{flex:1}}>
                <div style={{display:'flex', alignItems:'center', gap:10}}>
                  <div className="font-display" style={{fontSize:24, fontWeight:800, letterSpacing:'-0.025em'}}>{lead.tenant.name}</div>
                  {lead.tenant.verified && <span className="chip" style={{background:'var(--success)', color:'#fff', height:22, fontSize:11, border:0}}>✓ Verified tenant</span>}
                </div>
                <div style={{fontSize:13, color:'var(--text-muted)', marginTop:4}}>On Urbify since {lead.tenant.since}</div>

                <div style={{display:'flex', gap:8, marginTop:14}}>
                  <button className="btn btn-brand btn-sm"><Icon.phone/> Call · {lead.tenant.phone}</button>
                  <button className="btn btn-outline btn-sm">WhatsApp</button>
                  <button className="btn btn-outline btn-sm">Mark as 'no interest'</button>
                </div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontSize:11, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.08em', fontWeight:600}}>Profile</div>
                <div className="font-display" style={{fontSize:28, fontWeight:800, letterSpacing:'-0.03em', marginTop:4}}>{lead.tenant.profileComplete}%</div>
                <div style={{fontSize:11, color:'var(--text-muted)'}}>complete</div>
              </div>
            </div>

            <div style={{marginTop:24, paddingTop:20, borderTop:'1px solid var(--border)', display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:24}}>
              <DetailItem label="Occupation" value="Product Designer"/>
              <DetailItem label="Income range" value="₹15-20 L / year" verified/>
              <DetailItem label="Family size" value="Single occupant"/>
            </div>
          </div>

          {/* Activity timeline */}
          <div className="card" style={{padding:28}}>
            <div className="font-display" style={{fontSize:18, fontWeight:700, letterSpacing:'-0.02em'}}>Activity timeline</div>
            <div style={{marginTop:18, position:'relative'}}>
              <div style={{position:'absolute', left:11, top:8, bottom:8, width:2, background:'var(--border)'}}/>
              {lead.activity.map((a, i)=>(
                <div key={i} style={{display:'flex', gap:18, paddingBottom:18, position:'relative'}}>
                  <div style={{
                    width:24, height:24, borderRadius:'50%',
                    background: i === 0 ? 'var(--brand-500)' : 'var(--surface)',
                    border: i === 0 ? 0 : '2px solid var(--border-strong)',
                    color: i === 0 ? '#fff' : 'var(--text-muted)',
                    display:'grid', placeItems:'center', fontSize:11, flexShrink:0,
                    zIndex:1,
                  }}>
                    {a.k === 'unlock' && '🔓'}
                    {a.k === 'pay' && '₹'}
                    {a.k === 'heart' && '♡'}
                    {a.k === 'view' && '👁'}
                    {a.k === 'search' && '⌕'}
                  </div>
                  <div style={{flex:1, paddingTop:2}}>
                    <div style={{fontSize:14, fontWeight: i === 0 ? 600 : 500}}>{a.e}</div>
                    <div style={{fontSize:11, color:'var(--text-faint)', marginTop:2}}>{a.t}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="card" style={{padding:28}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline'}}>
              <div className="font-display" style={{fontSize:18, fontWeight:700, letterSpacing:'-0.02em'}}>Your notes</div>
              <button className="btn btn-ghost btn-sm">Edit</button>
            </div>
            <p style={{fontSize:14, color:'var(--text-muted)', marginTop:14, lineHeight:1.6, padding:'14px 16px', background:'var(--surface-sunken)', borderRadius:'var(--r-md)'}}>
              {lead.notes}
            </p>
          </div>
        </div>

        {/* RIGHT — sidebar */}
        <div style={{display:'flex', flexDirection:'column', gap:18}}>
          <div className="card" style={{padding:0, overflow:'hidden'}}>
            <Img src={lead.listing.photo} style={{height:160}}/>
            <div style={{padding:18}}>
              <div className="font-display" style={{fontSize:16, fontWeight:700, letterSpacing:'-0.02em'}}>{lead.listing.bhk} BHK · {lead.listing.locality}</div>
              <div style={{fontSize:12, color:'var(--text-muted)', marginTop:4, fontFamily:'var(--f-mono)'}}>{lead.listing.id}</div>
              <div className="font-display" style={{fontSize:22, fontWeight:800, marginTop:10, letterSpacing:'-0.02em'}}>₹{lead.listing.rentK}k<span style={{fontSize:12, color:'var(--text-muted)', fontWeight:500}}>/mo</span></div>
              <button className="btn btn-outline btn-sm btn-block" style={{marginTop:14}} onClick={()=>nav('detail', lead.listing.id)}>View listing →</button>
            </div>
          </div>

          <div className="card" style={{padding:22}}>
            <div className="font-display" style={{fontSize:16, fontWeight:700, letterSpacing:'-0.02em'}}>Payment</div>
            <Row label="Amount" value={`₹${lead.payment.amount.toLocaleString("en-IN")}`}/>
            <Row label="Method" value={lead.payment.method}/>
            <Row label="Transaction ID" value={lead.payment.txn} mono/>
            <Row label="Refund window" value="closes in 22h 12m"/>
          </div>

          <div className="card" style={{padding:22, background:'var(--accent-500)', color:'#1A1100', border:0}}>
            <div className="font-display" style={{fontSize:16, fontWeight:700, letterSpacing:'-0.02em'}}>Tip: respond fast</div>
            <div style={{fontSize:13, lineHeight:1.55, marginTop:8, opacity:.85}}>Owners who reply within 1 hour close deals 4.2× more often. The fee is paid — this tenant is serious.</div>
          </div>
        </div>
      </div>
    </PortalShell>
  );
}

function DetailItem({label, value, verified}) {
  return (
    <div>
      <div style={{fontSize:11, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.08em'}}>{label}</div>
      <div style={{fontSize:14, fontWeight:600, marginTop:4, display:'flex', alignItems:'center', gap:6}}>
        {value} {verified && <span style={{fontSize:11, color:'var(--success)'}}>✓</span>}
      </div>
    </div>
  );
}

// ─── OWNER ANALYTICS ─────────────────────────────────────────────────────
function OwnerAnalyticsPage({nav}) {
  const [listing, setListing] = useState(LISTINGS[0]);

  return (
    <PortalShell user={OWNER_USER} navItems={OWNER_NAV()} current="ownerList" onNav={(id)=>nav(id)}>
      <DashHeader title="Listing analytics"
        subtitle={`${listing.bhk} BHK · ${listing.locality} · live for 14 days`}
        actions={
          <>
            <select className="input select btn-sm" style={{height:34, fontSize:13}} value={listing.id} onChange={e=>setListing(LISTINGS.find(l=>l.id===e.target.value))}>
              {LISTINGS.slice(0, 4).map(l => <option key={l.id} value={l.id}>{l.bhk} BHK · {l.locality}</option>)}
            </select>
            <button className="btn btn-outline btn-sm">Share insights</button>
          </>
        }/>

      <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:14, marginBottom:18}}>
        <StatCard label="Total views" value="847" trend="+34%" sub="last 7 days"/>
        <StatCard label="Shortlists" value="42" trend="+18%" sub="conversion 4.9%"/>
        <StatCard label="Unlocks" value="12" trend="+50%" sub="₹74,800 to you"/>
        <StatCard label="Visit requests" value="8" sub="3 scheduled this week"/>
      </div>

      {/* daily traffic chart */}
      <div className="card" style={{padding:28, marginBottom:18}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:14}}>
          <div>
            <div style={{fontSize:12, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.08em', fontWeight:600}}>Daily traffic · last 14 days</div>
            <div className="font-display" style={{fontSize:30, fontWeight:800, letterSpacing:'-0.035em', marginTop:6}}>Strong performance</div>
          </div>
          <div style={{display:'flex', gap:14, fontSize:12}}>
            <Legend2 c="var(--brand-500)" l="Views"/>
            <Legend2 c="var(--accent-500)" l="Unlocks"/>
          </div>
        </div>
        <svg viewBox="0 0 700 200" style={{width:'100%', height:200}}>
          {[0, 40, 80, 120, 160].map(y=>(
            <line key={y} x1="40" y1={y+20} x2="700" y2={y+20} stroke="var(--border)" strokeDasharray="4 4"/>
          ))}
          {Array.from({length:14}).map((_, i)=>{
            const views = 30 + Math.sin(i*0.4)*15 + i*4 + Math.random()*10;
            const unlocks = views * 0.06 + Math.random()*0.5;
            const x = 50 + i * 47;
            return (
              <g key={i}>
                <rect x={x} y={180 - views * 1.4} width={18} height={views * 1.4} fill="var(--brand-500)" opacity={0.85} rx={2}/>
                <rect x={x+20} y={180 - unlocks * 1.4 * 10} width={6} height={unlocks * 1.4 * 10} fill="var(--accent-500)" rx={2}/>
              </g>
            );
          })}
        </svg>
        <div style={{display:'flex', justifyContent:'space-between', marginTop:8, fontSize:10, color:'var(--text-faint)'}}>
          <span>14 days ago</span><span>7 days ago</span><span>Today</span>
        </div>
      </div>

      {/* Where viewers come from + conversion funnel */}
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:18, marginBottom:18}}>
        <div className="card" style={{padding:24}}>
          <div style={{fontSize:12, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.08em', fontWeight:600, marginBottom:14}}>Where viewers came from</div>
          {[
            { src:"Search · Bangalore", c:412, pct:48 },
            { src:"Locality · Koramangala", c:214, pct:25 },
            { src:"Direct / saved", c:128, pct:15 },
            { src:"Google Search", c:62, pct:7 },
            { src:"Social / WhatsApp", c:31, pct:5 },
          ].map((s, i)=>(
            <div key={s.src} style={{marginBottom:12}}>
              <div style={{display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:6}}>
                <span style={{fontWeight:500}}>{s.src}</span>
                <span style={{fontWeight:700, fontVariantNumeric:'tabular-nums'}}>{s.c}</span>
              </div>
              <div style={{height:6, background:'var(--surface-sunken)', borderRadius:99, overflow:'hidden'}}>
                <div style={{height:'100%', width:`${s.pct*2}%`, background: `color-mix(in oklab, var(--brand-500) ${90 - i*10}%, var(--surface-sunken))`, borderRadius:99}}/>
              </div>
            </div>
          ))}
        </div>

        <div className="card" style={{padding:24}}>
          <div style={{fontSize:12, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.08em', fontWeight:600, marginBottom:18}}>Conversion funnel</div>
          {[
            { l:"Views", v:847, pct:100, c:'var(--brand-500)' },
            { l:"Tapped photos / scrolled", v:521, pct:62, c:'var(--brand-500)' },
            { l:"Shortlisted", v:42, pct:4.9, c:'var(--accent-500)' },
            { l:"Unlocked contact", v:12, pct:1.4, c:'var(--success)' },
          ].map((s, i)=>(
            <div key={s.l} style={{marginBottom:14, position:'relative'}}>
              <div style={{display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:6}}>
                <span style={{fontWeight:600}}>{s.l}</span>
                <span style={{fontWeight:700, fontVariantNumeric:'tabular-nums'}}>{s.v} <span style={{color:'var(--text-muted)', fontWeight:500}}>· {s.pct}%</span></span>
              </div>
              <div style={{height:36, background:'var(--surface-sunken)', borderRadius:'var(--r-sm)', overflow:'hidden', position:'relative'}}>
                <div style={{height:'100%', width:`${s.pct}%`, background:s.c, borderRadius:'var(--r-sm)'}}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI tips */}
      <div className="card" style={{padding:24, background:'var(--brand-50)', border:0, display:'flex', gap:18, alignItems:'flex-start'}}>
        <div style={{width:42, height:42, borderRadius:'var(--r-sm)', background:'var(--brand-500)', color:'#fff', display:'grid', placeItems:'center', fontSize:18, flexShrink:0}}><Icon.sparkle/></div>
        <div style={{flex:1}}>
          <div className="font-display" style={{fontSize:16, fontWeight:700, color:'var(--brand-900)', letterSpacing:'-0.02em'}}>Suggestions to lift your unlock rate</div>
          <ul style={{paddingLeft:20, marginTop:10, marginBottom:0, fontSize:13, color:'var(--brand-700)', lineHeight:1.7}}>
            <li>Add 4 more photos — listings with 8+ photos get 3× more unlocks. You have 5.</li>
            <li>Your photo 2 appears dark — try a daylight shot of the same room.</li>
            <li>Comparable 2 BHK Koramangala listings average ₹42k — yours at ₹38k is well-positioned.</li>
          </ul>
        </div>
      </div>
    </PortalShell>
  );
}

function Legend2({c, l}) {
  return <div style={{display:'flex', alignItems:'center', gap:6}}><span style={{width:10, height:10, background:c, borderRadius:2}}/>{l}</div>;
}

// ─── BROKER · OWNER RELATIONSHIP ─────────────────────────────────────────
function BrokerOwnerPage({nav}) {
  const owner = {
    initials: "AK",
    name: "Aditya Khanna",
    phone: "+91 98217 33342",
    since: "Mar 2025",
    totalListings: 4,
    totalCommission: 156000,
    activeListings: LISTINGS.slice(0, 3),
    closedListings: [LISTINGS[3]],
  };

  return (
    <PortalShell user={BROKER_USER} navItems={BROKER_NAV()} current="brokerList" onNav={(id)=>nav(id)}>
      <div style={{marginBottom:18}}>
        <button className="btn btn-ghost btn-sm" onClick={()=>nav('brokerList')}><Icon.back/> All listings</button>
      </div>

      {/* owner header */}
      <div className="card" style={{padding:32, marginBottom:18, background:'var(--text)', color:'var(--bg)', border:0}}>
        <div style={{display:'flex', alignItems:'center', gap:24}}>
          <div style={{width:80, height:80, borderRadius:'50%', background:'var(--accent-500)', color:'#1A1100', display:'grid', placeItems:'center', fontWeight:800, fontSize:28}}>{owner.initials}</div>
          <div style={{flex:1}}>
            <div className="font-display" style={{fontSize:32, fontWeight:800, letterSpacing:'-0.035em'}}>{owner.name}</div>
            <div style={{fontSize:14, opacity:.7, marginTop:4}}>{owner.phone} · with you since {owner.since}</div>
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontSize:11, opacity:.7, textTransform:'uppercase', letterSpacing:'.08em', fontWeight:600}}>Lifetime commission</div>
            <div className="font-display" style={{fontSize:36, fontWeight:800, letterSpacing:'-0.035em', marginTop:4, color:'var(--accent-500)'}}>₹{(owner.totalCommission/1000).toFixed(0)}k</div>
          </div>
        </div>
        <div style={{marginTop:24, paddingTop:20, borderTop:'1px solid rgba(255,255,255,.12)', display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:18}}>
          <KpiInverse n={owner.totalListings} l="Total listings"/>
          <KpiInverse n={owner.activeListings.length} l="Currently active"/>
          <KpiInverse n={owner.closedListings.length} l="Closed deals"/>
          <KpiInverse n="98%" l="Owner satisfaction"/>
        </div>
        <div style={{display:'flex', gap:8, marginTop:24}}>
          <button className="btn btn-accent btn-sm"><Icon.phone/> Call owner</button>
          <button className="btn btn-sm" style={{background:'rgba(255,255,255,.1)', color:'#fff', border:0}}>WhatsApp</button>
          <button className="btn btn-sm" style={{background:'rgba(255,255,255,.1)', color:'#fff', border:0}} onClick={()=>nav('ownerNew')}>＋ Add new listing for them</button>
        </div>
      </div>

      {/* active listings */}
      <div style={{marginBottom:24}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:14}}>
          <div className="font-display" style={{fontSize:18, fontWeight:700, letterSpacing:'-0.02em'}}>Active for this owner</div>
          <span style={{fontSize:13, color:'var(--text-muted)'}}>{owner.activeListings.length} listings</span>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:16}}>
          {owner.activeListings.map(l=>(
            <div key={l.id} className="card" style={{padding:0, overflow:'hidden'}}>
              <div style={{position:'relative'}}>
                <Img src={l.photo} style={{aspectRatio:'5/3'}}/>
                <div style={{position:'absolute', top:10, left:10}}><StatusBadge status="live"/></div>
              </div>
              <div style={{padding:16}}>
                <div className="font-display" style={{fontSize:16, fontWeight:700, letterSpacing:'-0.02em'}}>{l.bhk} BHK · {l.locality}</div>
                <div className="font-display" style={{fontSize:20, fontWeight:800, letterSpacing:'-0.025em', marginTop:10}}>₹{l.rentK}k<span style={{fontSize:12, color:'var(--text-muted)', fontWeight:500}}>/mo</span></div>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginTop:10, fontSize:11, color:'var(--text-muted)'}}>
                  <span>{Math.floor(l.pop/4)} unlocks · {l.pop} views</span>
                  <span style={{fontWeight:600, color:'var(--text)'}}>Est. ₹{l.rentK}k commission</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* relationship log */}
      <div className="card" style={{padding:28}}>
        <div className="font-display" style={{fontSize:18, fontWeight:700, letterSpacing:'-0.02em', marginBottom:18}}>Relationship history</div>
        {[
          { t:"3 days ago", e:"Added Indiranagar 3 BHK to portfolio", k:'add' },
          { t:"2 weeks ago", e:"Closed Powai 2 BHK · earned ₹95k commission", k:'close', amt:95000 },
          { t:"1 month ago", e:"Added Powai 2 BHK to portfolio", k:'add' },
          { t:"3 months ago", e:"Closed Koramangala 1 BHK · earned ₹38k commission", k:'close', amt:38000 },
          { t:"6 months ago", e:"Added Koramangala 1 BHK to portfolio", k:'add' },
          { t:"8 months ago", e:"Owner signed up via your referral", k:'signup' },
        ].map((a, i)=>(
          <div key={i} style={{display:'flex', alignItems:'center', gap:14, padding:'14px 0', borderTop: i===0 ? 0 : '1px solid var(--border)'}}>
            <div style={{
              width:32, height:32, borderRadius:'50%',
              background: a.k === 'close' ? 'var(--success)' : a.k === 'signup' ? 'var(--accent-500)' : 'var(--surface-sunken)',
              color: a.k === 'close' || a.k === 'signup' ? '#fff' : 'var(--text)',
              display:'grid', placeItems:'center', fontSize:13,
            }}>
              {a.k === 'add' && '＋'}
              {a.k === 'close' && '✓'}
              {a.k === 'signup' && '👋'}
            </div>
            <div style={{flex:1, fontSize:14}}>{a.e}</div>
            {a.amt && <div style={{fontWeight:700, color:'var(--success)', fontSize:14}}>+₹{a.amt.toLocaleString("en-IN")}</div>}
            <div style={{fontSize:11, color:'var(--text-faint)', minWidth:90, textAlign:'right'}}>{a.t}</div>
          </div>
        ))}
      </div>
    </PortalShell>
  );
}

function KpiInverse({n, l}) {
  return (
    <div>
      <div className="font-display" style={{fontSize:24, fontWeight:800, letterSpacing:'-0.03em', lineHeight:1}}>{n}</div>
      <div style={{fontSize:11, opacity:.7, marginTop:6, textTransform:'uppercase', letterSpacing:'.08em', fontWeight:600}}>{l}</div>
    </div>
  );
}

// ─── BROKER PAYOUT LEDGER ────────────────────────────────────────────────
function BrokerCommissionPage({nav}) {
  const [period, setPeriod] = useState("This quarter");

  const payouts = [
    { id:"PAY-1024", date:"15 Nov 2025", owner:"M. Kapoor", listing:"Powai 2 BHK · URB-1003", commission:95000, fee:0, net:95000, status:"settled", utr:"UTR8923109" },
    { id:"PAY-1023", date:"28 Oct 2025", owner:"A. Khanna", listing:"Koramangala 1 BHK · URB-1042", commission:38000, fee:0, net:38000, status:"settled", utr:"UTR8901234" },
    { id:"PAY-1022", date:"12 Oct 2025", owner:"R. Verma", listing:"Whitefield 3 BHK · URB-1011", commission:62000, fee:0, net:62000, status:"settled", utr:"UTR8845671" },
    { id:"PAY-1021", date:"3 Oct 2025",  owner:"D. Nair",   listing:"Bandra 2 BHK · URB-1019", commission:78000, fee:0, net:78000, status:"settled", utr:"UTR8801456" },
    { id:"PAY-1020", date:"22 Sep 2025", owner:"P. Iyer",   listing:"HSR Layout 2 BHK · URB-1006", commission:42000, fee:0, net:42000, status:"settled", utr:"UTR8743298" },
    { id:"PAY-1019", date:"in-flight",    owner:"S. Rao",    listing:"Indiranagar 3 BHK · URB-1027", commission:58000, fee:0, net:58000, status:"in-progress" },
  ];

  const settled = payouts.filter(p=>p.status==='settled').reduce((s,p)=>s+p.net, 0);
  const inflight = payouts.filter(p=>p.status==='in-progress').reduce((s,p)=>s+p.net, 0);

  return (
    <PortalShell user={BROKER_USER} navItems={BROKER_NAV()} current="brokerCommission" onNav={(id)=>nav(id)}>
      <DashHeader title="Commission ledger"
        subtitle="Every rupee you've earned through Urbify."
        actions={
          <>
            <select className="input select btn-sm" style={{height:34, fontSize:13}} value={period} onChange={e=>setPeriod(e.target.value)}>
              <option>This quarter</option><option>This year</option><option>All time</option><option>FY 2025-26</option>
            </select>
            <button className="btn btn-outline btn-sm"><Icon.download/> Export ledger</button>
          </>
        }/>

      {/* big number banner */}
      <div className="card" style={{padding:36, marginBottom:18, background:'var(--brand-500)', color:'#fff', border:0, display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:36}}>
        <div>
          <div style={{fontSize:12, opacity:.7, textTransform:'uppercase', letterSpacing:'.08em', fontWeight:600}}>{period} · Settled</div>
          <div className="font-display" style={{fontSize:48, fontWeight:800, letterSpacing:'-0.045em', marginTop:8, lineHeight:1}}>₹{(settled/100000).toFixed(2)}L</div>
          <div style={{fontSize:13, opacity:.85, marginTop:6}}>5 deals · directly to your bank</div>
        </div>
        <div>
          <div style={{fontSize:12, opacity:.7, textTransform:'uppercase', letterSpacing:'.08em', fontWeight:600}}>In flight</div>
          <div className="font-display" style={{fontSize:48, fontWeight:800, letterSpacing:'-0.045em', marginTop:8, lineHeight:1}}>₹{(inflight/1000).toFixed(0)}k</div>
          <div style={{fontSize:13, opacity:.85, marginTop:6}}>1 payout · arrives by Nov 22</div>
        </div>
        <div>
          <div style={{fontSize:12, opacity:.7, textTransform:'uppercase', letterSpacing:'.08em', fontWeight:600}}>Platform fees taken</div>
          <div className="font-display" style={{fontSize:48, fontWeight:800, letterSpacing:'-0.045em', marginTop:8, lineHeight:1}}>₹0</div>
          <div style={{fontSize:13, opacity:.85, marginTop:6}}>Always. Forever.</div>
        </div>
      </div>

      {/* ledger table */}
      <div className="card" style={{padding:0, overflow:'hidden'}}>
        <div style={{padding:'18px 22px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
          <div className="font-display" style={{fontSize:18, fontWeight:700, letterSpacing:'-0.02em'}}>All payouts</div>
          <div style={{display:'flex', gap:8}}>
            <input className="input btn-sm" placeholder="Search payouts…" style={{height:32, fontSize:12, width:220}}/>
            <select className="input select btn-sm" style={{height:32, fontSize:12}}><option>All status</option><option>Settled</option><option>In progress</option></select>
          </div>
        </div>
        <table style={{width:'100%', borderCollapse:'collapse', fontSize:13}}>
          <thead style={{background:'var(--surface-sunken)'}}>
            <tr style={{textAlign:'left', color:'var(--text-muted)', fontSize:11, textTransform:'uppercase', letterSpacing:'.08em', fontWeight:600}}>
              <th style={{padding:'12px 22px'}}>Payout ID</th>
              <th style={{padding:'12px 22px'}}>Listing / Owner</th>
              <th style={{padding:'12px 22px'}}>Commission</th>
              <th style={{padding:'12px 22px'}}>Platform fee</th>
              <th style={{padding:'12px 22px'}}>Net to you</th>
              <th style={{padding:'12px 22px'}}>Status</th>
              <th style={{padding:'12px 22px', textAlign:'right'}}></th>
            </tr>
          </thead>
          <tbody>
            {payouts.map(p=>(
              <tr key={p.id} style={{borderTop:'1px solid var(--border)'}}>
                <td style={{padding:'14px 22px'}}>
                  <div style={{fontFamily:'var(--f-mono)', fontWeight:600, fontSize:12}}>{p.id}</div>
                  <div style={{fontSize:11, color:'var(--text-muted)', marginTop:2}}>{p.date}</div>
                </td>
                <td style={{padding:'14px 22px'}}>
                  <div style={{fontWeight:600}}>{p.listing}</div>
                  <div style={{fontSize:11, color:'var(--text-muted)', marginTop:2}}>Owner: {p.owner}</div>
                </td>
                <td style={{padding:'14px 22px', fontWeight:600, fontVariantNumeric:'tabular-nums'}}>₹{p.commission.toLocaleString("en-IN")}</td>
                <td style={{padding:'14px 22px', fontWeight:600, color:'var(--success)'}}>₹0</td>
                <td style={{padding:'14px 22px', fontWeight:700, fontVariantNumeric:'tabular-nums', color: p.status === 'settled' ? 'var(--text)' : 'var(--text-muted)'}}>₹{p.net.toLocaleString("en-IN")}</td>
                <td style={{padding:'14px 22px'}}>
                  {p.status === 'settled' ? <span style={{fontSize:11, color:'var(--success)', fontWeight:600}}>● Settled</span> : <span style={{fontSize:11, color:'var(--warning)', fontWeight:600}}>● In progress</span>}
                  {p.utr && <div style={{fontSize:10, color:'var(--text-faint)', marginTop:2, fontFamily:'var(--f-mono)'}}>{p.utr}</div>}
                </td>
                <td style={{padding:'14px 22px', textAlign:'right'}}>
                  <button className="btn btn-ghost btn-sm"><Icon.download/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* bank account */}
      <div className="card" style={{padding:24, marginTop:24, display:'flex', alignItems:'center', gap:18, background:'var(--surface)'}}>
        <div style={{width:48, height:48, borderRadius:'var(--r-sm)', background:'var(--surface-sunken)', display:'grid', placeItems:'center'}}><Icon.bank/></div>
        <div style={{flex:1}}>
          <div className="font-display" style={{fontSize:16, fontWeight:700, letterSpacing:'-0.02em'}}>Settlement bank account</div>
          <div style={{fontSize:13, color:'var(--text-muted)', marginTop:4, fontFamily:'var(--f-mono)'}}>HDFC Bank · ××××4297 · IFSC HDFC0001129</div>
        </div>
        <button className="btn btn-outline btn-sm">Change account</button>
      </div>
    </PortalShell>
  );
}

Object.assign(window, { LeadDetailPage, OwnerAnalyticsPage, BrokerOwnerPage, BrokerCommissionPage });
