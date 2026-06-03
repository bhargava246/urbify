// app-print.jsx — renders every Urbify page stacked for PDF export

const { createRoot: createPrintRoot } = ReactDOM;

const PRINT_PAGES = [
  // PUBLIC
  { id:'home',     title:'Homepage',                  C: HomePage },
  { id:'search',   title:'Search · Bangalore',        C: SearchPage },
  { id:'detail',   title:'Property Detail',           C: (p)=><DetailPage {...p} listingId={LISTINGS[0].id}/> },
  { id:'unlock',   title:'Unlock Flow',               C: (p)=><UnlockPage {...p} listing={LISTINGS[0]}/> },
  { id:'how',      title:'How It Works',              C: HowPage },
  { id:'pricing',  title:'Pricing',                   C: PricingPage },
  { id:'city',     title:'City Landing · Bangalore',  C: CityPage },
  { id:'locality', title:'Locality Landing · Koramangala', C: LocalityPage },
  { id:'auth',     title:'Sign in / Sign up',         C: AuthPage },
  { id:'about',    title:'About',                     C: AboutPage },
  { id:'faq',      title:'FAQ',                       C: FaqPage },
  { id:'contact',  title:'Contact',                   C: ContactPage },
  { id:'blog',     title:'Blog Hub',                  C: BlogPage },
  { id:'blogPost', title:'Blog Article',              C: BlogPostPage },
  { id:'help',     title:'Help Center',               C: HelpPage },
  { id:'notfound', title:'404',                       C: NotFoundPage },
  // OWNER
  { id:'ownerDash',      title:'Owner · Dashboard',       C: OwnerDashPage },
  { id:'ownerList',      title:'Owner · My Listings',     C: OwnerListPage },
  { id:'ownerInquiries', title:'Owner · Inquiries',       C: OwnerInquiriesPage },
  { id:'ownerNew',       title:'Owner · Create Listing',  C: OwnerNewPage },
  // CLIENT
  { id:'clientDash',     title:'Tenant · Dashboard',      C: ClientDashPage },
  { id:'clientTx',       title:'Tenant · Transactions',   C: ClientTxPage },
  // BROKER
  { id:'brokerDash',     title:'Broker · Dashboard',      C: BrokerDashPage },
  { id:'brokerList',     title:'Broker · Portfolio',      C: BrokerPortfolioPage },
  // ADMIN
  { id:'adminDash',      title:'Admin · Overview',        C: AdminDashPage },
  { id:'adminMod',       title:'Admin · Moderation',      C: AdminModPage },
  { id:'adminUsers',     title:'Admin · Users',           C: AdminUsersPage },
  { id:'adminRev',       title:'Admin · Revenue',         C: AdminRevenuePage },
  { id:'adminCms',       title:'Admin · CMS',             C: AdminCmsPage },
  // SETTINGS
  { id:'settings',       title:'Settings',                C: SettingsPage },
];

function PrintApp() {
  // No-op nav; everything renders flat
  const nav = () => {};
  const noop = () => {};

  // Static tokens
  React.useEffect(()=>{
    document.documentElement.dataset.dark = "false";
    document.documentElement.dataset.density = "regular";
    document.documentElement.dataset.card = "regular";
  }, []);

  return (
    <div>
      {/* COVER */}
      <section className="print-page print-cover">
        <div style={{flex:1, display:'flex', flexDirection:'column', justifyContent:'space-between'}}>
          <div style={{display:'flex', alignItems:'center', gap:14}}>
            <div style={{width:48, height:48, borderRadius:12, background:'var(--text)', color:'var(--bg)', display:'grid', placeItems:'center', fontWeight:800, fontSize:24, fontFamily:'Plus Jakarta Sans'}}>U</div>
            <div style={{fontFamily:'Plus Jakarta Sans', fontSize:32, fontWeight:800, letterSpacing:'-0.04em'}}>urbify</div>
          </div>

          <div>
            <div style={{fontSize:14, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.1em', fontWeight:600}}>Design System · v1.0</div>
            <h1 style={{fontFamily:'Plus Jakarta Sans', fontSize:96, fontWeight:800, letterSpacing:'-0.05em', lineHeight:.92, margin:'24px 0 24px'}}>
              The complete<br/>Urbify product.
            </h1>
            <p style={{fontSize:22, color:'var(--text-muted)', maxWidth:680, lineHeight:1.4}}>
              {PRINT_PAGES.length} pages covering the full marketplace, from public-facing search to operator dashboards.
            </p>
          </div>

          <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:24, paddingTop:32, borderTop:'1px solid var(--border)'}}>
            <CoverStat n={`${PRINT_PAGES.filter(p=>!p.id.match(/^(owner|client|broker|admin|settings)/)).length}`} l="Public pages"/>
            <CoverStat n={`${PRINT_PAGES.filter(p=>p.id.match(/^(owner|client|broker)/)).length}`} l="Portal pages"/>
            <CoverStat n={`${PRINT_PAGES.filter(p=>p.id.match(/^admin/)).length}`} l="Admin pages"/>
            <CoverStat n={`${PRINT_PAGES.length}`} l="Total"/>
          </div>
        </div>
      </section>

      {/* CONTENTS */}
      <section className="print-page print-contents">
        <div style={{fontSize:14, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.1em', fontWeight:600}}>Contents</div>
        <h2 style={{fontFamily:'Plus Jakarta Sans', fontSize:56, fontWeight:800, letterSpacing:'-0.04em', margin:'10px 0 36px', lineHeight:1}}>{PRINT_PAGES.length} screens.</h2>

        <div style={{columnCount:2, columnGap:48}}>
          {PRINT_PAGES.map((p, i)=>(
            <div key={p.id} style={{display:'flex', alignItems:'baseline', gap:14, padding:'10px 0', borderBottom:'1px solid var(--border)', breakInside:'avoid'}}>
              <span style={{fontFamily:'JetBrains Mono', fontSize:12, color:'var(--text-faint)', fontWeight:600, width:32}}>{String(i+1).padStart(2,'0')}</span>
              <span style={{fontSize:15, fontWeight:500, flex:1}}>{p.title}</span>
              <span style={{flex:1, height:1, borderBottom:'1px dotted var(--border-strong)', margin:'0 8px'}}/>
              <span style={{fontFamily:'JetBrains Mono', fontSize:12, color:'var(--text-muted)'}}>p.{i+3}</span>
            </div>
          ))}
        </div>
      </section>

      {/* PAGES */}
      {PRINT_PAGES.map((p, i)=>{
        const Comp = p.C;
        return (
          <section key={p.id} className="print-page-wrap">
            <div className="print-page-header">
              <div style={{display:'flex', alignItems:'center', gap:10}}>
                <span style={{fontFamily:'JetBrains Mono', fontSize:11, color:'var(--text-faint)', fontWeight:600}}>{String(i+1).padStart(2,'0')} / {PRINT_PAGES.length}</span>
                <span style={{fontFamily:'Plus Jakarta Sans', fontSize:14, fontWeight:700, letterSpacing:'-0.01em'}}>{p.title}</span>
              </div>
              <div style={{display:'flex', alignItems:'center', gap:6, fontSize:11, color:'var(--text-faint)'}}>
                <div style={{width:18, height:18, borderRadius:5, background:'var(--text)', color:'var(--bg)', display:'grid', placeItems:'center', fontWeight:800, fontSize:10, fontFamily:'Plus Jakarta Sans'}}>U</div>
                <span style={{fontWeight:600, color:'var(--text-muted)'}}>urbify</span>
              </div>
            </div>
            <div className="print-page-content">
              <Comp
                nav={nav}
                savedIds={[LISTINGS[0].id, LISTINGS[2].id, LISTINGS[4].id]}
                onSave={noop}
                onUnlock={noop}
                listingId={LISTINGS[0].id}
                listing={LISTINGS[0]}/>
            </div>
          </section>
        );
      })}
    </div>
  );
}

function CoverStat({n, l}) {
  return (
    <div>
      <div style={{fontFamily:'Plus Jakarta Sans', fontSize:42, fontWeight:800, letterSpacing:'-0.04em', lineHeight:1}}>{n}</div>
      <div style={{fontSize:12, color:'var(--text-muted)', marginTop:8, textTransform:'uppercase', letterSpacing:'.08em', fontWeight:600}}>{l}</div>
    </div>
  );
}

createPrintRoot(document.getElementById('root')).render(<PrintApp/>);
