// search.jsx — Urbify search results

function SearchPage({nav, savedIds, onSave, onUnlock}) {
  const [bhkSel, setBhkSel] = useState([2, 3]);
  const [price, setPrice] = useState([20, 80]); // in ₹k
  const [furn, setFurn] = useState({Unfurnished:false, "Semi-furnished":true, "Fully furnished":true});
  const [type, setType] = useState({Apartment:true, "Independent house":false, Villa:false, "PG / Hostel":false});
  const [sort, setSort] = useState("Newest");
  const [showMap, setShowMap] = useState(true);

  const filtered = useMemo(()=>{
    let r = LISTINGS.filter(l => bhkSel.includes(l.bhk) && l.rentK >= price[0] && l.rentK <= price[1]);
    const anyFurn = Object.values(furn).some(Boolean);
    if (anyFurn) r = r.filter(l => furn[l.furnishing]);
    if (sort === "Price low") r = [...r].sort((a,b)=>a.rentK-b.rentK);
    if (sort === "Price high") r = [...r].sort((a,b)=>b.rentK-a.rentK);
    if (sort === "Area") r = [...r].sort((a,b)=>b.area-a.area);
    return r;
  }, [bhkSel, price, furn, sort]);

  return (
    <div>
      {/* breadcrumb / search header */}
      <div style={{borderBottom:'1px solid var(--border)', background:'var(--surface)', padding:'18px 28px'}}>
        <div style={{maxWidth:1440, margin:'0 auto', display:'flex', alignItems:'center', gap:14, flexWrap:'wrap'}}>
          <div style={{fontSize:12, color:'var(--text-muted)'}}>
            <span style={{cursor:'pointer'}} onClick={()=>nav('home')}>Home</span> / Rent / <span style={{color:'var(--text)'}}>Bangalore</span>
          </div>
          <div style={{flex:1}}/>
          <div style={{display:'flex', gap:8, alignItems:'center'}}>
            <input className="input" defaultValue="Koramangala, Bangalore" style={{width:280}}/>
            <button className="btn btn-primary"><Icon.search/> Search</button>
          </div>
        </div>
      </div>

      <div style={{maxWidth:1440, margin:'0 auto', padding:'24px 28px', display:'grid', gridTemplateColumns: showMap ? '280px 1fr 420px' : '280px 1fr', gap:24, alignItems:'start'}}>

        {/* ─── Filters ──────────────────────────────────── */}
        <aside style={{position:'sticky', top:88, maxHeight:'calc(100vh - 100px)', overflow:'auto', paddingRight:4}}>
          <div className="card" style={{padding:0, overflow:'hidden'}}>
            <div style={{padding:'14px 18px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <div style={{fontSize:13, fontWeight:600}}>Filters</div>
              <button className="btn btn-ghost btn-sm" onClick={()=>{setBhkSel([1,2,3,4]); setPrice([10,150]); setFurn({Unfurnished:false,"Semi-furnished":false,"Fully furnished":false});}}>Clear</button>
            </div>

            <FilterSection title="Property type">
              {Object.keys(type).map(k=>(
                <Checkbox key={k} checked={type[k]} onChange={v=>setType({...type, [k]:v})}>{k}</Checkbox>
              ))}
            </FilterSection>

            <FilterSection title="BHK">
              <div style={{display:'flex', gap:6, flexWrap:'wrap'}}>
                {[1,2,3,4,"4+"].map(n=>{
                  const num = n === "4+" ? 4 : n;
                  const active = bhkSel.includes(num);
                  return (
                    <button key={n} onClick={()=>setBhkSel(active ? bhkSel.filter(x=>x!==num) : [...bhkSel, num])}
                      style={{
                        padding:'8px 14px', borderRadius:'var(--r-pill)',
                        border:'1px solid var(--border-strong)',
                        background: active ? 'var(--text)' : 'transparent',
                        color: active ? 'var(--bg)' : 'var(--text)',
                        fontSize:13, fontWeight:600, cursor:'pointer',
                      }}>{n} BHK</button>
                  );
                })}
              </div>
            </FilterSection>

            <FilterSection title="Monthly rent">
              <RangeSlider min={10} max={150} value={price} onChange={setPrice} format={(v)=>`₹${v}k`}/>
            </FilterSection>

            <FilterSection title="Furnishing">
              {Object.keys(furn).map(k=>(
                <Checkbox key={k} checked={furn[k]} onChange={v=>setFurn({...furn, [k]:v})}>{k}</Checkbox>
              ))}
            </FilterSection>

            <FilterSection title="Area (sq ft)">
              <RangeSlider min={300} max={3000} value={[500, 2000]} onChange={()=>{}} format={(v)=>v}/>
            </FilterSection>

            <FilterSection title="Available from" last>
              <div style={{display:'flex', flexWrap:'wrap', gap:6}}>
                {["Immediate","< 15 days","< 30 days","Any time"].map((o,i)=>(
                  <button key={o} className="chip" style={{cursor:'pointer', background: i===0?'var(--text)':'transparent', color: i===0?'var(--bg)':'var(--text)', border: i===0?0:'1px solid var(--border-strong)'}}>{o}</button>
                ))}
              </div>
            </FilterSection>
          </div>

          <button className="btn btn-outline btn-block" style={{marginTop:12}}>Save this search</button>
        </aside>

        {/* ─── Results ─────────────────────────────────── */}
        <main>
          <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:16, gap:16, flexWrap:'wrap'}}>
            <div>
              <h1 className="font-display" style={{fontSize:28, fontWeight:800, letterSpacing:'-0.03em', margin:0}}>
                {filtered.length} homes for rent in Bangalore
              </h1>
              <div style={{display:'flex', gap:8, marginTop:10, flexWrap:'wrap'}}>
                {bhkSel.map(b=><span key={b} className="chip">{b} BHK <Icon.close/></span>)}
                <span className="chip">₹{price[0]}k – ₹{price[1]}k <Icon.close/></span>
                {Object.entries(furn).filter(([,v])=>v).map(([k])=><span key={k} className="chip">{k} <Icon.close/></span>)}
              </div>
            </div>
            <div style={{display:'flex', gap:8, alignItems:'center'}}>
              <button className={`btn btn-sm ${showMap ? 'btn-outline' : 'btn-primary'}`} onClick={()=>setShowMap(!showMap)}>
                {showMap ? "Hide map" : "Show map"}
              </button>
              <select className="input select btn-sm" style={{height:34, padding:'0 36px 0 12px', fontSize:13}} value={sort} onChange={e=>setSort(e.target.value)}>
                <option>Newest</option><option>Price low</option><option>Price high</option><option>Area</option>
              </select>
            </div>
          </div>

          <div style={{display:'grid', gridTemplateColumns: showMap ? '1fr 1fr' : 'repeat(3, 1fr)', gap:18}}>
            {filtered.map(l=>(
              <ListingCard key={l.id} listing={l}
                onOpen={()=>nav('detail', l.id)}
                onUnlock={onUnlock}
                saved={savedIds.includes(l.id)}
                onSave={onSave}/>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="card" style={{textAlign:'center', padding:'56px 24px'}}>
              <div style={{fontSize:40, marginBottom:8}}>🔍</div>
              <div className="font-display" style={{fontSize:20, fontWeight:700}}>Nothing matches — yet.</div>
              <div style={{color:'var(--text-muted)', marginTop:8}}>Loosen a filter or save this search to get alerts.</div>
            </div>
          )}

          {filtered.length > 0 && (
            <div style={{display:'flex', justifyContent:'center', marginTop:32}}>
              <button className="btn btn-outline">Load more →</button>
            </div>
          )}
        </main>

        {/* ─── Map ────────────────────────────────────── */}
        {showMap && (
          <aside style={{position:'sticky', top:88, height:'calc(100vh - 100px)'}}>
            <MapPanel listings={filtered}/>
          </aside>
        )}
      </div>

      <Footer nav={nav}/>
    </div>
  );
}

function FilterSection({title, children, last}) {
  return (
    <div style={{padding:'14px 18px', borderBottom: last ? 0 : '1px solid var(--border)'}}>
      <div style={{fontSize:12, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.08em', fontWeight:600, marginBottom:10}}>{title}</div>
      <div style={{display:'flex', flexDirection:'column', gap:8}}>{children}</div>
    </div>
  );
}

function Checkbox({checked, onChange, children}) {
  return (
    <label style={{display:'flex', alignItems:'center', gap:10, cursor:'pointer', fontSize:14}}>
      <span style={{
        width:18, height:18, borderRadius:5,
        border:'1.5px solid', borderColor: checked ? 'var(--text)' : 'var(--border-strong)',
        background: checked ? 'var(--text)' : 'transparent',
        display:'grid', placeItems:'center', color:'var(--bg)',
        transition:'all .15s',
      }}>
        {checked && <span style={{fontSize:11}}><Icon.check/></span>}
      </span>
      <input type="checkbox" checked={checked} onChange={e=>onChange(e.target.checked)} style={{position:'absolute', opacity:0, pointerEvents:'none'}}/>
      <span>{children}</span>
    </label>
  );
}

// Dual-thumb range slider
function RangeSlider({min, max, value, onChange, format}) {
  const [a, b] = value;
  const pct = (v) => ((v - min) / (max - min)) * 100;
  return (
    <div style={{paddingTop:6}}>
      <div style={{display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:8}}>
        <span style={{fontWeight:600}}>{format(a)}</span>
        <span style={{fontWeight:600}}>{format(b)}</span>
      </div>
      <div style={{position:'relative', height:24}}>
        <div style={{position:'absolute', top:11, left:0, right:0, height:3, background:'var(--border)', borderRadius:99}}/>
        <div style={{position:'absolute', top:11, left:`${pct(a)}%`, right:`${100-pct(b)}%`, height:3, background:'var(--text)', borderRadius:99}}/>
        <input type="range" min={min} max={max} value={a} onChange={e=>onChange([+e.target.value, b])}
          style={{position:'absolute', inset:0, width:'100%', appearance:'none', background:'transparent', pointerEvents:'none'}}
          className="range-thumb"/>
        <input type="range" min={min} max={max} value={b} onChange={e=>onChange([a, +e.target.value])}
          style={{position:'absolute', inset:0, width:'100%', appearance:'none', background:'transparent', pointerEvents:'none'}}
          className="range-thumb"/>
      </div>
    </div>
  );
}

// Map panel — stylised abstract map w/ locality polygons
function MapPanel({listings}) {
  return (
    <div style={{position:'relative', height:'100%', borderRadius:'var(--r-lg)', overflow:'hidden', background:'#E8F0EE'}}>
      <svg viewBox="0 0 600 800" preserveAspectRatio="xMidYMid slice" style={{width:'100%', height:'100%', display:'block'}}>
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0 L0 0 L0 40" fill="none" stroke="#D0DEDA" strokeWidth=".5"/>
          </pattern>
        </defs>
        <rect width="600" height="800" fill="#E8F0EE"/>
        <rect width="600" height="800" fill="url(#grid)"/>
        {/* roads */}
        <path d="M0 280 Q 200 260, 400 320 T 600 360" stroke="#fff" strokeWidth="14" fill="none"/>
        <path d="M0 280 Q 200 260, 400 320 T 600 360" stroke="#D0DEDA" strokeWidth="14" fill="none" strokeDasharray="2 6"/>
        <path d="M180 0 L 220 200 L 200 480 L 280 800" stroke="#fff" strokeWidth="10" fill="none"/>
        <path d="M460 0 L 420 240 L 480 520 L 440 800" stroke="#fff" strokeWidth="10" fill="none"/>
        {/* polygons */}
        <g opacity=".82">
          <polygon points="80,120 240,80 280,260 100,240" fill="#0D7C66" opacity=".22" stroke="#0D7C66" strokeWidth="1.5"/>
          <polygon points="280,140 480,160 460,340 300,360" fill="#F59E0B" opacity=".22" stroke="#F59E0B" strokeWidth="1.5"/>
          <polygon points="120,360 320,400 300,580 90,560" fill="#0D7C66" opacity=".22" stroke="#0D7C66" strokeWidth="1.5"/>
          <polygon points="340,420 540,400 530,640 360,620" fill="#0D7C66" opacity=".22" stroke="#0D7C66" strokeWidth="1.5"/>
        </g>
        {/* locality labels with counts */}
        <g fontFamily="Plus Jakarta Sans" fontSize="13" fontWeight="700" fill="#074D40">
          <text x="180" y="180" textAnchor="middle">KORAMANGALA</text>
          <text x="180" y="200" textAnchor="middle" fontSize="11" opacity=".7">42 listings</text>
          <text x="380" y="250" textAnchor="middle" fill="#92400E">INDIRANAGAR</text>
          <text x="380" y="270" textAnchor="middle" fontSize="11" opacity=".7" fill="#92400E">28 listings</text>
          <text x="200" y="480" textAnchor="middle">HSR LAYOUT</text>
          <text x="200" y="500" textAnchor="middle" fontSize="11" opacity=".7">63 listings</text>
          <text x="450" y="530" textAnchor="middle">BTM LAYOUT</text>
          <text x="450" y="550" textAnchor="middle" fontSize="11" opacity=".7">31 listings</text>
        </g>
      </svg>

      <div style={{position:'absolute', top:12, left:12, right:12, display:'flex', gap:8}}>
        <span className="chip" style={{background:'rgba(255,255,255,.95)', border:0, fontWeight:600}}>📍 Showing area zones, not exact pins</span>
      </div>
      <div style={{position:'absolute', right:12, bottom:12, display:'flex', flexDirection:'column', gap:4}}>
        <button style={{width:36, height:36, borderRadius:'var(--r-sm)', background:'#fff', border:'1px solid var(--border)', cursor:'pointer'}}>+</button>
        <button style={{width:36, height:36, borderRadius:'var(--r-sm)', background:'#fff', border:'1px solid var(--border)', cursor:'pointer'}}>−</button>
      </div>
    </div>
  );
}

Object.assign(window, { SearchPage });
