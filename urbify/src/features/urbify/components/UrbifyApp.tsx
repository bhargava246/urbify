// @ts-nocheck
"use client";
// ─────────────────────────────────────────────────────────────────────────────
// UrbifyApp.tsx — thin routing shell (~160 lines)
// All feature logic lives in ../pages/* and ../_shared.tsx
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect } from 'react';

// ── Shared infrastructure ────────────────────────────────────────────────────
import {
  LISTINGS, AppDataContext,
  normalizeApiListing, Icon, Logo,
} from '../_shared';
import { useTweaks } from '../_tweaks';

// ── Page components ──────────────────────────────────────────────────────────
import { HomePage, Footer }                              from '../pages/home';
import { SearchPage }                                    from '../pages/search';
import { DetailPage }                                    from '../pages/detail';
import { UnlockPage }                                    from '../pages/unlock';
import { HowPage }                                       from '../pages/how';
import { AuthPage, PricingPage }                         from '../pages/auth';
import { OwnerDashPage, OwnerListPage,
         OwnerInquiriesPage, OwnerNewPage }              from '../pages/owner';
import { ClientDashPage, BrokerDashPage,
         ClientShortlistPage,
         ClientSearchesPage }                            from '../pages/client-broker';
import { AdminDashPage, AdminModPage, AdminUsersPage,
         AdminRevenuePage, AdminCmsPage }                from '../pages/admin';
import { AboutPage, FaqPage, ContactPage }               from '../pages/info';
import { CityPage, LocalityPage }                        from '../pages/city';
import { BlogPage, BlogPostPage }                        from '../pages/blog';
import { BrokerPortfolioPage, ClientTxPage,
         SettingsPage, HelpPage, NotFoundPage }          from '../pages/extra';
import { TermsPage, PrivacyPage, RefundPage }            from '../pages/legal';
import { ComparePage }                                   from '../pages/compare';
import { NotificationsPage }                             from '../pages/notifications';

// ── Colour mixing utility (for CSS variable theming) ─────────────────────────
function mix(hex1, hex2, t) {
  const parse = (h) => {
    const s = h.replace('#','').padEnd(6,'0');
    return [parseInt(s.slice(0,2),16), parseInt(s.slice(2,4),16), parseInt(s.slice(4,6),16)];
  };
  const [r1,g1,b1] = parse(hex1), [r2,g2,b2] = parse(hex2);
  const r = Math.round(r1*(1-t)+r2*t), g = Math.round(g1*(1-t)+g2*t), b = Math.round(b1*(1-t)+b2*t);
  return `#${[r,g,b].map(x=>x.toString(16).padStart(2,'0')).join('')}`;
}

// ─────────────────────────────────────────────────────────────────────────────
const TWEAK_DEFAULTS = {
  palette: ["#0D7C66","#F59E0B"],
  density: "regular",
  cardStyle: "regular",
  dark: false,
};

const PORTAL_PAGES = new Set([
  'ownerDash','ownerList','ownerInquiries','ownerNew',
  'clientDash','clientShort','clientTx','clientSearches',
  'brokerDash','brokerList','brokerInq','brokerCommission',
  'adminDash','adminMod','adminUsers','adminRev','adminCms',
  'settings',
]);

const AUTH_PAGES = new Set(['auth']);

const ALL_PAGES = [
  'home','search','rent','detail','unlock','auth','how','pricing',
  'about','faq','contact','city','locality','blog','blogPost','compare',
  'terms','privacy','refund','help','notFound',
  'ownerDash','ownerList','ownerInquiries','ownerNew',
  'clientDash','clientShort','clientTx','clientSearches',
  'brokerDash','brokerList','brokerInq','brokerCommission',
  'adminDash','adminMod','adminUsers','adminRev','adminCms',
  'settings','notifications',
];

// ─────────────────────────────────────────────────────────────────────────────
export function UrbifyApp({ initialPage = 'home' }) {
  const [t, setTweak]           = useTweaks(TWEAK_DEFAULTS);
  const [page, setPage]         = useState(initialPage);
  const [listingId, setListingId] = useState(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const [searchParams, setSearchParams] = useState({ q: '', bhk: 'Any', type: 'Apartment' });

  // ── API-backed state ──────────────────────────────────────────────────────
  const [apiListings,        setApiListings]        = useState([]);
  const [apiCities,          setApiCities]          = useState([]);
  const [shortlistIds,       setShortlistIds]       = useState([]);
  const [isLoadingListings,  setIsLoadingListings]  = useState(false);
  const [isLoadingCities,    setIsLoadingCities]    = useState(false);
  const [authUser,           setAuthUser]           = useState(null);

  // ── Boot: restore auth + fetch data ──────────────────────────────────────
  useEffect(() => {
    try {
      const stored = localStorage.getItem('urb_user');
      if (stored) setAuthUser(JSON.parse(stored));
    } catch {}

    try { (window).__OLA_KEY__ = process.env.NEXT_PUBLIC_OLA_MAPS_API_KEY || ''; } catch {}

    setIsLoadingListings(true);
    fetch('/api/v1/properties?limit=18&sortBy=NEWEST')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.data?.length) setApiListings(data.data.map(normalizeApiListing));
      })
      .catch(() => {})
      .finally(() => setIsLoadingListings(false));

    setIsLoadingCities(true);
    fetch('/api/v1/properties/cities')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (Array.isArray(data) && data.length) setApiCities(data); })
      .catch(() => {})
      .finally(() => setIsLoadingCities(false));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('urb_access');
    if (!token) return;
    fetch('/api/v1/search/shortlist', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : [])
      .then(items => { if (Array.isArray(items)) setShortlistIds(items.map(i => i.listingId || i.id)); })
      .catch(() => {});
  }, [authUser]);

  // ── Theming ───────────────────────────────────────────────────────────────
  useEffect(() => {
    document.documentElement.dataset.dark    = t.dark ? "true" : "false";
    document.documentElement.dataset.density = t.density;
    document.documentElement.dataset.card    = t.cardStyle;
    document.documentElement.style.setProperty('--brand-500', t.palette[0]);
    document.documentElement.style.setProperty('--accent-500', t.palette[1] || '#F59E0B');
    document.documentElement.style.setProperty('--brand-50',  mix(t.palette[0], '#ffffff', .88));
    document.documentElement.style.setProperty('--brand-600', mix(t.palette[0], '#000000', .12));
    document.documentElement.style.setProperty('--brand-700', mix(t.palette[0], '#000000', .25));
    document.documentElement.style.setProperty('--brand-900', mix(t.palette[0], '#000000', .55));
  }, [t]);

  // ── Auth helpers ──────────────────────────────────────────────────────────
  const refreshAuth = async () => {
    const token = localStorage.getItem('urb_access');
    if (!token) return;
    try {
      const res = await fetch('/api/v1/users/me', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const user = await res.json();
        localStorage.setItem('urb_user', JSON.stringify(user));
        setAuthUser(user);
      }
    } catch {}
  };

  const doLogout = async () => {
    const token = localStorage.getItem('urb_access');
    if (token) {
      try { await fetch('/api/v1/auth/logout', { method: 'POST', headers: { Authorization: `Bearer ${token}` } }); } catch {}
    }
    localStorage.removeItem('urb_access');
    localStorage.removeItem('urb_refresh');
    localStorage.removeItem('urb_user');
    setAuthUser(null);
    setShortlistIds([]);
    setPage('home');
  };

  const addShortlist = async (id) => {
    setShortlistIds(s => s.includes(id) ? s : [...s, id]);
    const token = localStorage.getItem('urb_access');
    if (!token) return;
    try { await fetch(`/api/v1/search/shortlist/${id}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } }); } catch {}
  };

  const removeShortlist = async (id) => {
    setShortlistIds(s => s.filter(x => x !== id));
    const token = localStorage.getItem('urb_access');
    if (!token) return;
    try { await fetch(`/api/v1/search/shortlist/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }); } catch {}
  };

  // ── Navigation — URL-based for cross-page, state-based for intra-page ───────
  const PAGE_URLS: Record<string, string> = {
    home: '/', search: '/rent', rent: '/rent',
    auth: '/auth', how: '/how-it-works', pricing: '/pricing',
    ownerDash: '/owner/dashboard', brokerDash: '/broker/dashboard',
    clientDash: '/dashboard',
    settings: '/settings', notifications: '/notifications',
  };

  const nav = (p: string, id?: string, params?: any) => {
    if (id) setListingId(id);
    if (params) setSearchParams((prev: any) => ({ ...prev, ...params }));
    // Cross-page navigation — use URL
    if (PAGE_URLS[p]) {
      window.location.href = PAGE_URLS[p];
      return;
    }
    // Intra-page navigation (detail, unlock, portal sub-pages) — use state
    setPage(p);
    setMoreOpen(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const toggleSave    = (id) => shortlistIds.includes(id) ? removeShortlist(id) : addShortlist(id);
  const handleUnlock  = (l)  => { setListingId(l.id); setPage('unlock'); window.scrollTo({ top:0, behavior:'instant' }); };

  // ── Derived ───────────────────────────────────────────────────────────────
  const listing     = apiListings.find(l => l.id === listingId) || apiListings[0] || null;
  const savedIds    = shortlistIds;
  const isPortal    = PORTAL_PAGES.has(page);
  const isAuth      = AUTH_PAGES.has(page);
  const displayName = authUser
    ? (authUser.ownerProfile?.fullName || authUser.brokerProfile?.fullName || authUser.clientProfile?.fullName || 'Account')
    : null;
  const initials = displayName ? displayName.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() : null;

  // ── Context ───────────────────────────────────────────────────────────────
  const ctx = {
    listings: apiListings, cities: apiCities, shortlistIds,
    addShortlist, removeShortlist, isLoadingListings, isLoadingCities,
    authUser, refreshAuth, doLogout,
  };

  // ── Common props bundles ──────────────────────────────────────────────────
  const pub  = { nav, savedIds, onSave: toggleSave, onUnlock: handleUnlock };
  const port = { nav };

  return (
    <AppDataContext.Provider value={ctx}>
      <div className="app">

        {/* ── Top bar hidden — SiteHeader in layout.tsx handles navigation ── */}
        {false && !isPortal && (
          <header className="topbar">
            <Logo onClick={() => nav('home')}/>
            <nav style={{alignItems:'center'}}>
              <a data-active={page==='search'} onClick={()=>nav('search')}>Rent</a>
              <a onClick={()=>nav('search')}>Buy</a>
              <a onClick={()=>nav('how')}>How it works</a>
              <a onClick={()=>nav('pricing')}>Pricing</a>
              {authUser ? (
                <div style={{position:'relative'}}>
                  <button onClick={()=>setMoreOpen(o=>!o)} style={{
                    width:34, height:34, borderRadius:'50%', background:'var(--brand-500)', color:'#fff',
                    border:0, cursor:'pointer', fontWeight:700, fontSize:13, display:'grid', placeItems:'center',
                  }}>{initials}</button>
                  {moreOpen && (
                    <div style={{
                      position:'absolute', right:0, top:42, zIndex:200, background:'var(--surface)',
                      border:'1px solid var(--border)', borderRadius:'var(--r-md)', boxShadow:'var(--sh-2)',
                      minWidth:180, padding:'6px 0',
                    }}>
                      {authUser.role==='OWNER'  && <a style={{display:'block',padding:'10px 16px',fontSize:13,cursor:'pointer'}} onClick={()=>nav('ownerDash')}>My dashboard</a>}
                      {authUser.role==='BROKER' && <a style={{display:'block',padding:'10px 16px',fontSize:13,cursor:'pointer'}} onClick={()=>nav('brokerDash')}>My dashboard</a>}
                      {authUser.role==='CLIENT' && <a style={{display:'block',padding:'10px 16px',fontSize:13,cursor:'pointer'}} onClick={()=>nav('clientDash')}>My dashboard</a>}
                      <a style={{display:'block',padding:'10px 16px',fontSize:13,cursor:'pointer'}} onClick={()=>nav('notifications')}>Notifications</a>
                      <a style={{display:'block',padding:'10px 16px',fontSize:13,cursor:'pointer'}} onClick={()=>nav('settings')}>Settings</a>
                      <div style={{height:1,background:'var(--border)',margin:'4px 0'}}/>
                      <a style={{display:'block',padding:'10px 16px',fontSize:13,cursor:'pointer',color:'var(--danger)'}} onClick={doLogout}>Sign out</a>
                    </div>
                  )}
                </div>
              ) : (
                <button className="btn btn-brand btn-sm" onClick={()=>nav('auth')}>Sign in</button>
              )}
            </nav>
          </header>
        )}

        {/* ── Page routing ── */}
        {page==='home'      && <HomePage     {...pub}/>}
        {page==='search'    && <SearchPage   {...pub} initialSearchParams={searchParams}/>}
        {page==='rent'      && <SearchPage   {...pub} initialSearchParams={searchParams}/>}
        {page==='detail'    && <DetailPage   {...pub} listing={listing}/>}
        {page==='unlock'    && <UnlockPage   nav={nav} listing={listing}/>}
        {page==='auth'      && <AuthPage     nav={nav}/>}
        {page==='how'       && <HowPage      nav={nav}/>}
        {page==='pricing'   && <PricingPage  nav={nav}/>}
        {page==='about'     && <AboutPage    nav={nav}/>}
        {page==='faq'       && <FaqPage      nav={nav}/>}
        {page==='contact'   && <ContactPage  nav={nav}/>}
        {page==='city'      && <CityPage     {...pub}/>}
        {page==='locality'  && <LocalityPage {...pub}/>}
        {page==='blog'      && <BlogPage     nav={nav}/>}
        {page==='blogPost'  && <BlogPostPage nav={nav}/>}
        {page==='compare'   && <ComparePage  {...pub}/>}
        {page==='terms'     && <TermsPage    nav={nav}/>}
        {page==='privacy'   && <PrivacyPage  nav={nav}/>}
        {page==='refund'    && <RefundPage   nav={nav}/>}
        {page==='help'      && <HelpPage     nav={nav}/>}
        {page==='notFound'  && <NotFoundPage nav={nav}/>}
        {/* Owner */}
        {page==='ownerDash'      && <OwnerDashPage      {...port}/>}
        {page==='ownerList'      && <OwnerListPage      {...port}/>}
        {page==='ownerInquiries' && <OwnerInquiriesPage {...port}/>}
        {page==='ownerNew'       && <OwnerNewPage       {...port}/>}
        {/* Client */}
        {page==='clientDash'     && <ClientDashPage     {...port}/>}
        {page==='clientShort'    && <ClientShortlistPage {...pub}/>}
        {page==='clientTx'       && <ClientTxPage       {...port}/>}
        {page==='clientSearches' && <ClientSearchesPage  nav={nav}/>}
        {/* Broker */}
        {page==='brokerDash'       && <BrokerDashPage      {...port}/>}
        {page==='brokerList'       && <BrokerPortfolioPage {...port}/>}
        {page==='brokerInq'        && <OwnerInquiriesPage  {...port}/>}
        {page==='brokerCommission' && <AdminRevenuePage    {...port}/>}
        {/* Admin */}
        {page==='adminDash'  && <AdminDashPage    {...port}/>}
        {page==='adminMod'   && <AdminModPage     {...port}/>}
        {page==='adminUsers' && <AdminUsersPage   {...port}/>}
        {page==='adminRev'   && <AdminRevenuePage {...port}/>}
        {page==='adminCms'   && <AdminCmsPage     {...port}/>}
        {/* Shared */}
        {page==='settings'      && <SettingsPage     nav={nav}/>}
        {page==='notifications' && <NotificationsPage nav={nav}/>}
        {/* 404 fallback */}
        {!ALL_PAGES.includes(page) && <NotFoundPage nav={nav}/>}

        {!isPortal && !isAuth && <Footer nav={nav}/>}
      </div>
    </AppDataContext.Provider>
  );
}

export default UrbifyApp;
