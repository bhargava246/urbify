// components.jsx — Urbify shared components

const { useState, useEffect, useRef, useMemo } = React;

// ─── Icons (stroke, sized via fontSize) ────────────────────────────────────
const Icon = {
  search: () => <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>,
  heart: ({filled}) => <svg width="1em" height="1em" viewBox="0 0 24 24" fill={filled ? "currentColor":"none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  lock: () => <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>,
  unlock: () => <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 7.5-1.9"/></svg>,
  pin: () => <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s7-7.5 7-13a7 7 0 1 0-14 0c0 5.5 7 13 7 13z"/><circle cx="12" cy="9" r="2.5"/></svg>,
  bed: () => <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18V8M21 18v-4a3 3 0 0 0-3-3H3M3 14h18M7 11V8a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"/></svg>,
  area: () => <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>,
  floor: () => <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M6 21V11l6-4 6 4v10M10 21v-6h4v6"/></svg>,
  sparkle: () => <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l3 3M15 15l3 3M18 6l-3 3M9 15l-3 3"/></svg>,
  check: () => <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7"/></svg>,
  arrow: () => <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>,
  back: () => <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>,
  filter: () => <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16M7 12h10M10 18h4"/></svg>,
  camera: () => <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7h4l2-3h6l2 3h4v12H3z"/><circle cx="12" cy="13" r="3.5"/></svg>,
  shield: () => <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3 4 6v6c0 5 3.5 8.5 8 9 4.5-.5 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/></svg>,
  bolt: () => <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></svg>,
  upi: () => <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M7 4v16M17 4v16M7 12h10M11 8h6M7 16h6"/></svg>,
  card: () => <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h3"/></svg>,
  bank: () => <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9 12 4l9 5M5 9v9M19 9v9M9 9v9M15 9v9M3 21h18"/></svg>,
  wallet: () => <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 10h12a3 3 0 0 1 0 6H3"/><circle cx="15" cy="13" r="1.2" fill="currentColor"/></svg>,
  phone: () => <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8 9.6a16 16 0 0 0 6.4 6.4l1.2-1.2a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2z"/></svg>,
  download: () => <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4v12m0 0-4-4m4 4 4-4M4 20h16"/></svg>,
  close: () => <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 6l12 12M6 18 18 6"/></svg>,
  mobile: () => <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="2" width="12" height="20" rx="3"/><path d="M11 19h2"/></svg>,
};

// ─── Brand logo ────────────────────────────────────────────────────────────
function Logo({onClick}) {
  return (
    <div className="logo" onClick={onClick} style={{cursor:'pointer'}}>
      <div className="logo-mark">U</div>
      <span>urbify</span>
    </div>
  );
}

// ─── Inline image with shimmer fallback ────────────────────────────────────
function Img({src, alt, style, className}) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div style={{position:'relative', overflow:'hidden', ...style}} className={className}>
      {!loaded && <div className="shimmer" style={{position:'absolute', inset:0}}/>}
      <img src={src} alt={alt || ""}
        loading="lazy"
        onLoad={()=>setLoaded(true)}
        style={{width:'100%', height:'100%', objectFit:'cover', display:'block',
                opacity: loaded ? 1 : 0, transition:'opacity .3s'}}/>
    </div>
  );
}

// ─── Lock pill — the privacy-first moment ──────────────────────────────────
function LockedAddress({locked, fee, city, locality, onUnlock, compact}) {
  if (!locked) return null;
  return (
    <div style={{
      display:'inline-flex', alignItems:'center', gap: compact ? 6 : 10,
      padding: compact ? '4px 10px' : '8px 14px',
      borderRadius:'999px',
      background:'var(--surface-sunken)',
      border:'1px dashed var(--border-strong)',
      color:'var(--text-muted)',
      fontSize: compact ? 12 : 13,
      fontWeight: 500,
    }}>
      <span style={{fontSize: compact ? 13 : 16, color: 'var(--text)'}}><Icon.lock/></span>
      <span>Address hidden — <span style={{color:'var(--text)', fontWeight:600}}>{locality}, {city}</span></span>
    </div>
  );
}

// ─── Listing card ─────────────────────────────────────────────────────────
function ListingCard({listing, onOpen, onUnlock, saved, onSave, variant = "default"}) {
  const fmt = (n) => n.toLocaleString("en-IN");
  return (
    <div className="card" style={{
      padding: 0, overflow:'hidden',
      cursor:'pointer',
      transition:'transform .15s, box-shadow .2s',
      display:'flex', flexDirection:'column',
    }}
    onClick={onOpen}
    onMouseEnter={(e)=>{e.currentTarget.style.boxShadow='var(--sh-3)';e.currentTarget.style.transform='translateY(-2px)';}}
    onMouseLeave={(e)=>{e.currentTarget.style.boxShadow='';e.currentTarget.style.transform='';}}
    >
      <div style={{position:'relative', aspectRatio: variant === "wide" ? "16/9" : "5/4"}}>
        <Img src={listing.photo} alt={listing.title} style={{width:'100%', height:'100%'}}/>
        {/* top row chips */}
        <div style={{position:'absolute', top:12, left:12, right:12, display:'flex', justifyContent:'space-between', gap:8, pointerEvents:'none'}}>
          <div style={{display:'flex', gap:6}}>
            {listing.isNew && <span className="chip chip-dark" style={{height:24, padding:'0 10px', fontSize:11}}>NEW</span>}
            <span className="chip" style={{height:24, padding:'0 10px', fontSize:11, background:'rgba(255,255,255,.85)', color:'#0F1614', border:0, backdropFilter:'blur(6px)'}}>
              <span style={{fontSize:11}}><Icon.camera/></span> {listing.photos.length}
            </span>
          </div>
          <button onClick={(e)=>{e.stopPropagation(); onSave?.(listing.id);}} aria-label="save"
            style={{
              pointerEvents:'auto',
              width:32, height:32, borderRadius:'50%',
              border:0, background:'rgba(255,255,255,.92)',
              display:'grid', placeItems:'center', cursor:'pointer',
              color: saved ? '#EF4444' : '#0F1614',
              fontSize: 14,
            }}>
            <Icon.heart filled={saved}/>
          </button>
        </div>
        {/* locality strip */}
        <div style={{position:'absolute', left:12, bottom:12, color:'#fff', textShadow:'0 1px 8px rgba(0,0,0,.4)', fontSize:12, fontWeight:600, letterSpacing:'.02em', display:'flex', alignItems:'center', gap:4}}>
          <Icon.pin/> {listing.locality} · {listing.city}
        </div>
      </div>

      <div style={{padding:'var(--pad-card)', display:'flex', flexDirection:'column', gap:10, flex:1}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8}}>
          <div className="font-display" style={{fontSize: 17, fontWeight: 700, lineHeight:1.25, letterSpacing:'-0.02em'}}>
            {listing.bhk} BHK · {fmt(listing.area)} sq ft
          </div>
          <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end'}}>
            <div className="font-display" style={{fontSize: 20, fontWeight: 800, letterSpacing:'-0.03em'}}>
              ₹{listing.rentK}k<span style={{fontSize:11, color:'var(--text-muted)', fontWeight:500}}>/mo</span>
            </div>
          </div>
        </div>

        <div style={{display:'flex', flexWrap:'wrap', gap:6, fontSize:12, color:'var(--text-muted)'}}>
          <span>{listing.furnishing}</span><span>·</span>
          <span>Floor {listing.floor}/{listing.total}</span><span>·</span>
          <span>{listing.facing}-facing</span>
        </div>

        <div style={{marginTop:'auto', display:'flex', alignItems:'center', justifyContent:'space-between', gap:10, paddingTop:8, borderTop:'1px dashed var(--border)'}}>
          <div style={{display:'flex', alignItems:'center', gap:6, fontSize:11.5, color:'var(--text-muted)'}}>
            <span style={{display:'inline-flex', alignItems:'center', gap:4, fontSize:13, color:'var(--text)'}}><Icon.lock/></span>
            <span>address locked</span>
          </div>
          <button className="btn btn-brand btn-sm" onClick={(e)=>{e.stopPropagation(); onUnlock(listing);}}>
            Unlock · ₹{fmt(listing.feeGST)}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal shell ──────────────────────────────────────────────────────────
function Modal({open, onClose, children, width = 920, padding = 0}) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{
      position:'fixed', inset:0, zIndex:50,
      background:'rgba(15,22,20,.55)',
      backdropFilter:'blur(6px)', WebkitBackdropFilter:'blur(6px)',
      display:'grid', placeItems:'center',
      padding:'24px',
      animation:'pop-in .25s ease',
    }}>
      <div onClick={(e)=>e.stopPropagation()} className="pop-in"
        style={{
          background:'var(--surface)', color:'var(--text)',
          borderRadius:'var(--r-xl)',
          width:'100%', maxWidth: width,
          maxHeight:'calc(100vh - 48px)',
          overflow:'auto', boxShadow:'var(--sh-pop)',
          padding,
        }}>
        {children}
      </div>
    </div>
  );
}

Object.assign(window, { Icon, Logo, Img, LockedAddress, ListingCard, Modal });
