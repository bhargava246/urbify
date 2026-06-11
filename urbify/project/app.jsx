// app.jsx — Urbify router + tweaks
const { createRoot } = ReactDOM;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": ["#0D7C66", "#F59E0B"],
  "density": "regular",
  "cardStyle": "regular",
  "dark": false
}/*EDITMODE-END*/;

const PORTAL_PAGES = new Set([
  'adminDash','adminMod','adminProperties','adminUsers','adminRev','adminCms',
  'settings',
]);

const AUTH_PAGES = new Set(['auth']);

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [page, setPage] = useState('home');
  const [listingId, setListingId] = useState(LISTINGS[0].id);
  const [savedIds, setSavedIds] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(()=>{
    document.documentElement.dataset.dark = t.dark ? "true" : "false";
    document.documentElement.dataset.density = t.density;
    document.documentElement.dataset.card = t.cardStyle;
    document.documentElement.style.setProperty('--brand-500', t.palette[0]);
    document.documentElement.style.setProperty('--accent-500', t.palette[1] || '#F59E0B');
    document.documentElement.style.setProperty('--brand-50', mix(t.palette[0], '#ffffff', .88));
    document.documentElement.style.setProperty('--brand-600', mix(t.palette[0], '#000000', .12));
    document.documentElement.style.setProperty('--brand-700', mix(t.palette[0], '#000000', .25));
    document.documentElement.style.setProperty('--brand-900', mix(t.palette[0], '#000000', .55));
  }, [t]);

  const nav = (p, id) => {
    if (id) setListingId(id);
    setPage(p);
    setMoreOpen(false);
    window.scrollTo({top:0, behavior:'instant'});
  };

  const toggleSave = (id) => {
    setSavedIds(s => s.includes(id) ? s.filter(x=>x!==id) : [...s, id]);
  };

  const handleUnlock = (l) => {
    setListingId(l.id);
    setPage('unlock');
    window.scrollTo({top:0, behavior:'instant'});
  };

  const listing = LISTINGS.find(l=>l.id === listingId) || LISTINGS[0];

  // alias routes — no-op, just for clarity

  // Hide global topbar inside portal pages — they have their own structure
  const isPortal = PORTAL_PAGES.has(page);
  const isAuth = AUTH_PAGES.has(page);

  return (
    <div className="app">
      {/* TOP BAR */}
      <header className="topbar">
        <Logo onClick={()=>nav('home')}/>
        <nav>
          <a data-active={page==='search'} onClick={()=>nav('search')}>Rent</a>
          <a onClick={()=>nav('search')}>Buy</a>
          <a onClick={()=>nav('search')}>Land</a>
          <a data-active={page==='how'} onClick={()=>nav('how')}>How it works</a>
          <a data-active={page==='pricing'} onClick={()=>nav('pricing')}>Pricing</a>

          <div style={{position:'relative'}}>
            <a data-active={['about','faq','contact','adminDash','adminMod','adminProperties','adminUsers','adminRev','adminCms','auth'].includes(page)} onClick={()=>setMoreOpen(!moreOpen)}>
              More ▾
            </a>
            {moreOpen && (
              <div style={{
                position:'absolute', top:'calc(100% + 8px)', left:0,
                background:'var(--surface)', border:'1px solid var(--border)',
                borderRadius:'var(--r-md)', boxShadow:'var(--sh-pop)',
                padding:8, minWidth:240, zIndex:50,
                display:'grid', gridTemplateColumns:'1fr 1fr', gap:14,
              }} onMouseLeave={()=>setMoreOpen(false)}>
                <MenuGroup title="Company">
                  <MenuItem onClick={()=>nav('about')}>About</MenuItem>
                  <MenuItem onClick={()=>nav('blog')}>Blog</MenuItem>
                  <MenuItem onClick={()=>nav('faq')}>FAQ</MenuItem>
                  <MenuItem onClick={()=>nav('help')}>Help center</MenuItem>
                  <MenuItem onClick={()=>nav('contact')}>Contact</MenuItem>
                  <MenuItem onClick={()=>nav('terms')}>Terms</MenuItem>
                  <MenuItem onClick={()=>nav('privacy')}>Privacy</MenuItem>
                </MenuGroup>
                <MenuGroup title="Admin">
                  <MenuItem onClick={()=>nav('adminDash')}>Overview</MenuItem>
                  <MenuItem onClick={()=>nav('adminProperties')}>Properties</MenuItem>
                  <MenuItem onClick={()=>nav('adminMod')}>Moderation</MenuItem>
                  <MenuItem onClick={()=>nav('adminUsers')}>Users</MenuItem>
                  <MenuItem onClick={()=>nav('adminRev')}>Revenue</MenuItem>
                  <MenuItem onClick={()=>nav('adminCms')}>CMS / SEO</MenuItem>
                </MenuGroup>
              </div>
            )}
          </div>
        </nav>
        <div className="spacer"/>
        <div className="right">
          <button className="btn btn-ghost btn-sm" onClick={()=>setMobileOpen(!mobileOpen)} aria-label="toggle mobile preview" title="View on mobile">
            <Icon.mobile/> {mobileOpen ? "Hide phone" : "Mobile"}
          </button>
          <button className="btn btn-outline btn-sm" onClick={()=>nav('adminProperties')}>Add property</button>
          <button className="btn btn-primary btn-sm" onClick={()=>nav('adminDash')}>Admin panel</button>
        </div>
      </header>

      {/* PAGES */}
      {page === 'home'           && <HomePage   nav={nav} savedIds={savedIds} onSave={toggleSave} onUnlock={handleUnlock}/>}
      {page === 'search'         && <SearchPage nav={nav} savedIds={savedIds} onSave={toggleSave} onUnlock={handleUnlock}/>}
      {page === 'detail'         && <DetailPage nav={nav} listingId={listingId} savedIds={savedIds} onSave={toggleSave} onUnlock={handleUnlock}/>}
      {page === 'unlock'         && <UnlockPage nav={nav} listing={listing}/>}
      {page === 'how'            && <HowPage    nav={nav}/>}
      {page === 'auth'           && <AuthPage   nav={nav}/>}
      {page === 'pricing'        && <PricingPage nav={nav}/>}
      {page === 'about'          && <AboutPage  nav={nav}/>}
      {page === 'faq'            && <FaqPage    nav={nav}/>}
      {page === 'contact'        && <ContactPage nav={nav}/>}

      {/* City / locality landings */}
      {page === 'city'     && <CityPage     nav={nav} savedIds={savedIds} onSave={toggleSave} onUnlock={handleUnlock}/>}
      {page === 'locality' && <LocalityPage nav={nav} savedIds={savedIds} onSave={toggleSave} onUnlock={handleUnlock}/>}

      {/* Blog */}
      {page === 'blog'     && <BlogPage nav={nav}/>}
      {page === 'blogPost' && <BlogPostPage nav={nav}/>}

      {/* Admin */}
      {page === 'adminDash'       && <AdminDashPage nav={nav}/>}
      {page === 'adminMod'        && <AdminModPage nav={nav}/>}
      {page === 'adminProperties' && <AdminPropertiesPage nav={nav}/>}
      {page === 'adminUsers'      && <AdminUsersPage nav={nav}/>}
      {page === 'adminRev'        && <AdminRevenuePage nav={nav}/>}
      {page === 'adminCms'        && <AdminCmsPage nav={nav}/>}

      {/* Settings, Help, 404 */}
      {page === 'settings' && <SettingsPage nav={nav}/>}
      {page === 'help' && <HelpPage nav={nav}/>}
      {page === '404' && <NotFoundPage nav={nav}/>}

      {/* Legal */}
      {page === 'terms'   && <TermsPage   nav={nav}/>}
      {page === 'privacy' && <PrivacyPage nav={nav}/>}
      {page === 'refund'  && <RefundPage  nav={nav}/>}

      {/* Compare + Notifications */}
      {page === 'compare'       && <ComparePage       nav={nav} savedIds={savedIds} onSave={toggleSave} onUnlock={handleUnlock}/>}
      {page === 'notifications' && <NotificationsPage  nav={nav}/>}

      {/* MOBILE PREVIEW (toggleable) */}
      <MobilePreview open={mobileOpen} onClose={()=>setMobileOpen(false)} page={page} listing={listing} savedIds={savedIds}/>

      {/* TWEAKS PANEL */}
      <TweaksPanel title="Tweaks">
        <TweakSection label="Theme"/>
        <TweakColor label="Palette" value={t.palette}
          options={[
            ["#0D7C66","#F59E0B"],
            ["#1B1B1B","#FF5A1F"],
            ["#1E3A8A","#FBBF24"],
            ["#7C3AED","#F472B6"],
            ["#065F46","#FCD34D"],
            ["#DC2626","#0F172A"],
          ]}
          onChange={(v)=>setTweak('palette', v)}/>
        <TweakToggle label="Dark mode" value={t.dark}
          onChange={(v)=>setTweak('dark', v)}/>

        <TweakSection label="Layout"/>
        <TweakRadio label="Density" value={t.density}
          options={['compact','regular','comfy']}
          onChange={(v)=>setTweak('density', v)}/>
        <TweakRadio label="Cards" value={t.cardStyle}
          options={['sharp','regular','soft']}
          onChange={(v)=>setTweak('cardStyle', v)}/>

        <TweakSection label="Public pages"/>
        <PageGrid current={page} onNav={nav} pages={[
          {p:'home', l:'Home'},
          {p:'search', l:'Search'},
          {p:'detail', l:'Detail'},
          {p:'unlock', l:'Unlock'},
          {p:'city', l:'City landing'},
          {p:'locality', l:'Locality'},
          {p:'how', l:'How'},
          {p:'pricing', l:'Pricing'},
          {p:'auth', l:'Sign in'},
          {p:'about', l:'About'},
          {p:'faq', l:'FAQ'},
          {p:'contact', l:'Contact'},
          {p:'blog', l:'Blog hub'},
          {p:'blogPost', l:'Blog post'},
        ]}/>

        <TweakSection label="Account"/>
        <PageGrid current={page} onNav={nav} pages={[
          {p:'settings', l:'Settings'},
          {p:'help', l:'Help center'},
          {p:'notifications', l:'Inbox'},
          {p:'compare', l:'Compare'},
          {p:'404', l:'404'},
        ]}/>

        <TweakSection label="Legal"/>
        <PageGrid current={page} onNav={nav} pages={[
          {p:'terms', l:'Terms'},
          {p:'privacy', l:'Privacy'},
          {p:'refund', l:'Refund'},
        ]}/>

        <TweakSection label="Admin"/>
        <PageGrid current={page} onNav={nav} pages={[
          {p:'adminDash',       l:'Overview'},
          {p:'adminMod',        l:'Moderation'},
          {p:'adminProperties', l:'Properties'},
          {p:'adminUsers',      l:'Users'},
          {p:'adminRev',        l:'Revenue'},
          {p:'adminCms',        l:'CMS'},
        ]}/>
      </TweaksPanel>
    </div>
  );
}

function PageGrid({current, onNav, pages}) {
  return (
    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:6}}>
      {pages.map(({p, l})=>(
        <button key={p} onClick={()=>onNav(p)} style={{
          padding:'8px 10px', borderRadius:6, fontSize:11,
          background: current===p ? '#29261b' : 'rgba(0,0,0,.06)',
          color: current===p ? '#fff' : '#29261b',
          border:0, cursor:'pointer', fontWeight:500, textAlign:'left',
        }}>{l}</button>
      ))}
    </div>
  );
}

function MenuGroup({title, children}) {
  return (
    <div>
      <div style={{fontSize:10, color:'var(--text-faint)', fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', padding:'8px 10px 4px'}}>{title}</div>
      <div style={{display:'flex', flexDirection:'column', gap:1}}>{children}</div>
    </div>
  );
}
function MenuItem({onClick, children}) {
  return (
    <button onClick={onClick} style={{
      padding:'8px 10px', borderRadius:6, background:'transparent', border:0,
      cursor:'pointer', textAlign:'left', font:'inherit', fontSize:13,
      color:'var(--text)', transition:'background .15s',
    }}
    onMouseEnter={e=>e.currentTarget.style.background='var(--surface-sunken)'}
    onMouseLeave={e=>e.currentTarget.style.background='transparent'}
    >{children}</button>
  );
}

function mix(a, b, t) {
  const ah = a.replace('#',''), bh = b.replace('#','');
  const ar = parseInt(ah.slice(0,2),16), ag = parseInt(ah.slice(2,4),16), ab = parseInt(ah.slice(4,6),16);
  const br = parseInt(bh.slice(0,2),16), bg = parseInt(bh.slice(2,4),16), bb = parseInt(bh.slice(4,6),16);
  const r = Math.round(ar + (br-ar)*t), g = Math.round(ag + (bg-ag)*t), bl = Math.round(ab + (bb-ab)*t);
  return `rgb(${r},${g},${bl})`;
}

createRoot(document.getElementById('root')).render(<App/>);
