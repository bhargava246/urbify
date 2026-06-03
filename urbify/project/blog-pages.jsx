// blog-pages.jsx — Blog hub + Article

const BLOG_POSTS = [
  {
    id: "tenant-rights-2026",
    title: "Tenant rights in India: the full 2026 guide",
    excerpt: "Notice periods, security deposits, eviction rules, and what your landlord can't legally do — explained without the legalese.",
    category: "Tenant guide",
    author: "Aanya Sharma",
    date: "May 12, 2026",
    read: "12 min read",
    cover: INTERIORS[0],
    featured: true,
  },
  {
    id: "koramangala-area-guide",
    title: "The complete Koramangala area guide for renters",
    excerpt: "Block by block: where to find quiet streets, which corners get traffic, the best cafes, and what to avoid when signing a lease.",
    category: "Area guide",
    author: "Vikram Kumar",
    date: "May 8, 2026",
    read: "8 min read",
    cover: PHOTOS[1],
  },
  {
    id: "rent-index-may-2026",
    title: "Urbify Rent Index · May 2026",
    excerpt: "Bangalore up 1.8%. Mumbai flat. Pune surprising the suburbs. Our monthly rent index across 12 cities, with the data tables.",
    category: "Market report",
    author: "Urbify Data",
    date: "May 5, 2026",
    read: "6 min read",
    cover: PHOTOS[4],
  },
  {
    id: "broker-vs-direct",
    title: "Broker or direct? The honest math on each option",
    excerpt: "When using a broker actually saves you money, when it's pure tax, and how to negotiate the commission down without burning a relationship.",
    category: "Tenant guide",
    author: "Karan Mehta",
    date: "Apr 28, 2026",
    read: "10 min read",
    cover: PHOTOS[2],
  },
  {
    id: "first-rental-checklist",
    title: "Your first rental: the 23-point checklist",
    excerpt: "From water pressure to the fine print on the security deposit — what to inspect on a visit, and what to put in writing before you sign.",
    category: "Tenant guide",
    author: "Aanya Sharma",
    date: "Apr 22, 2026",
    read: "7 min read",
    cover: INTERIORS[3],
  },
  {
    id: "investing-2026",
    title: "Investment property hot-spots for 2026",
    excerpt: "Where rental yields are beating FDs, where they aren't, and the three metro corridors institutional buyers are quietly building in.",
    category: "Investment",
    author: "Vikram Kumar",
    date: "Apr 18, 2026",
    read: "9 min read",
    cover: PHOTOS[7],
  },
  {
    id: "owners-guide-photography",
    title: "How to photograph your rental (without a photographer)",
    excerpt: "Listings with 8+ photos get 3× more unlocks. Here's exactly how to shoot them with just a phone — including what time of day to do it.",
    category: "Owner guide",
    author: "Maya Iyer",
    date: "Apr 14, 2026",
    read: "5 min read",
    cover: INTERIORS[2],
  },
];

const CATEGORIES = ["All", "Tenant guide", "Owner guide", "Area guide", "Market report", "Investment"];

// ─── BLOG HUB ─────────────────────────────────────────────────────────────
function BlogPage({nav}) {
  const [cat, setCat] = useState("All");
  const filtered = cat === "All" ? BLOG_POSTS : BLOG_POSTS.filter(p=>p.category === cat);
  const featured = BLOG_POSTS.find(p=>p.featured);
  const rest = filtered.filter(p=>p !== featured || cat !== "All");

  return (
    <div>
      <section style={{padding:'72px 28px 24px', maxWidth:1440, margin:'0 auto'}}>
        <div className="chip" style={{background:'transparent', border:'1px solid var(--border-strong)', marginBottom:24}}>Notes from the field</div>
        <h1 className="font-display" style={{fontSize:'clamp(48px, 7vw, 96px)', fontWeight:800, letterSpacing:'-0.045em', lineHeight:.96, margin:0}}>
          The Urbify journal.
        </h1>
        <p className="muted" style={{fontSize:20, maxWidth:680, marginTop:24, lineHeight:1.4}}>
          Tenant rights, area guides, monthly rent indexes — written by people who actually rent in India.
        </p>
      </section>

      {/* category filter */}
      <section style={{padding:'24px 28px', maxWidth:1440, margin:'0 auto', borderBottom:'1px solid var(--border)'}}>
        <div style={{display:'flex', gap:8, alignItems:'center', flexWrap:'wrap'}}>
          {CATEGORIES.map(c=>(
            <button key={c} onClick={()=>setCat(c)}
              style={{
                padding:'8px 16px', borderRadius:99,
                border:'1.5px solid', borderColor: cat===c ? 'var(--text)' : 'var(--border)',
                background: cat===c ? 'var(--text)' : 'transparent',
                color: cat===c ? 'var(--bg)' : 'var(--text)',
                fontSize:13, fontWeight:600, cursor:'pointer',
              }}>{c}</button>
          ))}
          <div style={{flex:1}}/>
          <div style={{display:'flex', alignItems:'center', gap:10, padding:'0 14px', background:'var(--surface-sunken)', borderRadius:'var(--r-sm)', height:'var(--row-h)', width:280}}>
            <Icon.search/>
            <input className="input" placeholder="Search articles…" style={{border:0, background:'transparent', padding:0, height:'auto', flex:1, fontSize:13}}/>
          </div>
        </div>
      </section>

      {/* featured */}
      {featured && cat === "All" && (
        <section style={{padding:'40px 28px', maxWidth:1440, margin:'0 auto'}}>
          <div onClick={()=>nav('blogPost')} className="card" style={{padding:0, overflow:'hidden', cursor:'pointer', display:'grid', gridTemplateColumns:'1.4fr 1fr', minHeight:480}}>
            <Img src={featured.cover} style={{width:'100%', height:'100%'}}/>
            <div style={{padding:40, display:'flex', flexDirection:'column', justifyContent:'center'}}>
              <div style={{display:'flex', gap:8, marginBottom:16}}>
                <span className="chip chip-accent" style={{height:24}}>FEATURED</span>
                <span className="chip">{featured.category}</span>
              </div>
              <h2 className="font-display" style={{fontSize:'clamp(28px, 3.8vw, 48px)', fontWeight:800, letterSpacing:'-0.035em', lineHeight:1.05, margin:0}}>
                {featured.title}
              </h2>
              <p className="muted" style={{fontSize:16, lineHeight:1.55, marginTop:18}}>{featured.excerpt}</p>
              <div style={{display:'flex', alignItems:'center', gap:14, marginTop:28, fontSize:13, color:'var(--text-muted)'}}>
                <Avatar name={featured.author}/>
                <span style={{fontWeight:600, color:'var(--text)'}}>{featured.author}</span>
                <span>·</span><span>{featured.date}</span>
                <span>·</span><span>{featured.read}</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* grid */}
      <section style={{padding:'40px 28px 80px', maxWidth:1440, margin:'0 auto'}}>
        <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:24}}>
          {rest.map(p=>(
            <article key={p.id} onClick={()=>nav('blogPost')} style={{cursor:'pointer'}}
              onMouseEnter={e=>e.currentTarget.querySelector('img').style.transform='scale(1.04)'}
              onMouseLeave={e=>e.currentTarget.querySelector('img').style.transform='scale(1)'}
            >
              <div style={{borderRadius:'var(--r-lg)', overflow:'hidden', aspectRatio:'4/3'}}>
                <Img src={p.cover} style={{width:'100%', height:'100%', transition:'transform .4s'}}/>
              </div>
              <div style={{padding:'18px 0'}}>
                <div style={{display:'flex', alignItems:'center', gap:8, fontSize:12, color:'var(--text-muted)'}}>
                  <span style={{color:'var(--brand-500)', fontWeight:600}}>{p.category}</span>
                  <span>·</span><span>{p.read}</span>
                </div>
                <h3 className="font-display" style={{fontSize:22, fontWeight:700, letterSpacing:'-0.025em', lineHeight:1.2, margin:'10px 0 12px'}}>
                  {p.title}
                </h3>
                <p className="muted" style={{fontSize:14, lineHeight:1.55, margin:0}}>{p.excerpt}</p>
                <div style={{display:'flex', alignItems:'center', gap:10, marginTop:18, fontSize:12, color:'var(--text-muted)'}}>
                  <Avatar name={p.author} sm/>
                  <span style={{fontWeight:600, color:'var(--text)'}}>{p.author}</span>
                  <span>·</span><span>{p.date}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* newsletter */}
      <section style={{padding:'72px 28px', background:'var(--text)', color:'var(--bg)'}}>
        <div style={{maxWidth:780, margin:'0 auto', textAlign:'center'}}>
          <h2 className="font-display" style={{fontSize:'clamp(32px, 5vw, 56px)', fontWeight:800, letterSpacing:'-0.04em', lineHeight:1, margin:0}}>
            One short email,<br/>once a month.
          </h2>
          <p style={{fontSize:17, opacity:.7, marginTop:18, lineHeight:1.5}}>
            The Urbify rent index, the best new listings in your city, and one essay worth reading. No spam, ever.
          </p>
          <div style={{display:'flex', gap:8, maxWidth:460, margin:'28px auto 0', flexWrap:'wrap'}}>
            <input className="input" placeholder="your@email.com" style={{flex:1, minWidth:240, background:'rgba(255,255,255,.08)', color:'#fff', border:'1px solid rgba(255,255,255,.18)'}}/>
            <button className="btn btn-accent">Subscribe</button>
          </div>
        </div>
      </section>

      <Footer nav={nav}/>
    </div>
  );
}

function Avatar({name, sm}) {
  const init = name.split(' ').map(w=>w[0]).slice(0,2).join('');
  const size = sm ? 26 : 36;
  return (
    <div style={{width:size, height:size, borderRadius:'50%', background:'var(--brand-500)', color:'#fff', display:'grid', placeItems:'center', fontWeight:700, fontSize: sm ? 10 : 13}}>{init}</div>
  );
}

// ─── BLOG POST ────────────────────────────────────────────────────────────
function BlogPostPage({nav}) {
  const p = BLOG_POSTS[0];

  return (
    <div>
      <article>
        {/* hero */}
        <section style={{padding:'56px 28px 32px', maxWidth:820, margin:'0 auto'}}>
          <button className="btn btn-ghost btn-sm" onClick={()=>nav('blog')} style={{marginBottom:24}}><Icon.back/> All articles</button>
          <div style={{display:'flex', gap:8, marginBottom:18, alignItems:'center'}}>
            <span className="chip chip-brand">{p.category}</span>
            <span style={{fontSize:12, color:'var(--text-muted)'}}>{p.date} · {p.read}</span>
          </div>
          <h1 className="font-display" style={{fontSize:'clamp(36px, 5vw, 64px)', fontWeight:800, letterSpacing:'-0.04em', lineHeight:1.05, margin:0}}>
            {p.title}
          </h1>
          <p style={{fontSize:21, color:'var(--text-muted)', marginTop:24, lineHeight:1.45, fontFamily:'var(--f-display)', fontWeight:400}}>
            {p.excerpt}
          </p>
          <div style={{display:'flex', alignItems:'center', gap:12, marginTop:36, paddingTop:24, borderTop:'1px solid var(--border)'}}>
            <Avatar name={p.author}/>
            <div>
              <div style={{fontWeight:600, fontSize:14}}>{p.author}</div>
              <div style={{fontSize:12, color:'var(--text-muted)'}}>Co-founder · CEO</div>
            </div>
            <div style={{flex:1}}/>
            <button className="btn btn-outline btn-sm">↗ Share</button>
            <button className="btn btn-outline btn-sm">♡ Save</button>
          </div>
        </section>

        {/* cover */}
        <section style={{padding:'0 28px 56px', maxWidth:1100, margin:'0 auto'}}>
          <div style={{borderRadius:'var(--r-xl)', overflow:'hidden', aspectRatio:'16/9'}}>
            <Img src={p.cover} style={{width:'100%', height:'100%'}}/>
          </div>
          <div style={{fontSize:12, color:'var(--text-faint)', textAlign:'center', marginTop:10}}>Photo: an apartment in Indiranagar · Unsplash</div>
        </section>

        {/* article body + TOC */}
        <section style={{padding:'24px 28px 56px', maxWidth:1100, margin:'0 auto'}}>
          <div style={{display:'grid', gridTemplateColumns:'200px 1fr', gap:48, alignItems:'start'}}>
            {/* TOC */}
            <aside style={{position:'sticky', top:88}}>
              <div style={{fontSize:11, color:'var(--text-muted)', fontWeight:700, textTransform:'uppercase', letterSpacing:'.1em', marginBottom:14}}>In this article</div>
              <ul style={{listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:10, fontSize:13}}>
                {[
                  {l:"Why tenant rights matter", a:true},
                  {l:"Notice periods, explained"},
                  {l:"Security deposits & legal limits"},
                  {l:"When can a landlord evict you?"},
                  {l:"Rent increases — what's reasonable"},
                  {l:"State-specific laws"},
                  {l:"A model lease clause"},
                  {l:"Where to get help"},
                ].map((s, i)=>(
                  <li key={i} style={{
                    color: s.a ? 'var(--text)' : 'var(--text-muted)',
                    fontWeight: s.a ? 600 : 400,
                    borderLeft:'2px solid', borderLeftColor: s.a ? 'var(--text)' : 'var(--border)',
                    paddingLeft:12, cursor:'pointer',
                  }}>{s.l}</li>
                ))}
              </ul>
            </aside>

            {/* body */}
            <div style={{maxWidth:680, fontSize:18, lineHeight:1.75, color:'var(--text)'}}>
              <p style={{marginTop:0, fontSize:21, lineHeight:1.65, color:'var(--text)'}}>
                Most renters in India have a vague sense of "rights" — but a far clearer sense of the broker's terms. This guide is for the rest of us: the legal floor under your lease, in plain language.
              </p>

              <h2 className="font-display" style={{fontSize:32, fontWeight:800, letterSpacing:'-0.03em', marginTop:48, marginBottom:14}}>Why tenant rights matter</h2>
              <p>India doesn't have a single national tenancy law. The Model Tenancy Act of 2021 set a template, but it's been adopted in only a handful of states. The rest fall under decades-old state Rent Control Acts that vary wildly — Karnataka's is different from Maharashtra's is different from Delhi's.</p>
              <p>What's <em>actually</em> portable across India is what's in your lease, your security deposit, and the Specific Relief Act. So the safest renter is the one who has read the lease, and who knows what a court will and won't enforce.</p>

              <div style={{padding:24, background:'var(--surface-sunken)', borderRadius:'var(--r-md)', margin:'32px 0', display:'flex', gap:18, alignItems:'flex-start'}}>
                <div style={{fontSize:22, color:'var(--brand-500)', marginTop:4, flexShrink:0}}><Icon.shield/></div>
                <div>
                  <div className="font-display" style={{fontSize:17, fontWeight:700, marginBottom:6, letterSpacing:'-0.01em'}}>The one-line rule</div>
                  <div style={{fontSize:15, lineHeight:1.6, color:'var(--text-muted)', margin:0}}>If it's not in writing in your lease, it doesn't exist. Get every promise — paint job, fridge included, deposit refund timeline — typed in before you pay.</div>
                </div>
              </div>

              <h2 className="font-display" style={{fontSize:32, fontWeight:800, letterSpacing:'-0.03em', marginTop:40, marginBottom:14}}>Notice periods, explained</h2>
              <p>Standard practice: a one-month written notice from either side. But this is the most-violated clause in Indian leases — landlords often demand more, tenants often give less. What the law actually says: whatever's in the lease, provided it's reasonable (typically 1-3 months).</p>

              <ul style={{paddingLeft:20, marginTop:18}}>
                <li style={{marginBottom:10}}>If your lease says "1 month written notice", you owe them 30 days from the date the email/letter is delivered — not the date you decide to leave.</li>
                <li style={{marginBottom:10}}>If you're being asked to leave, the same rule applies in reverse. Verbal notice doesn't count.</li>
                <li style={{marginBottom:10}}>If the notice period in your lease is over 3 months, courts have routinely held that unreasonable.</li>
              </ul>

              <blockquote style={{
                margin:'40px 0',
                paddingLeft:24,
                borderLeft:'4px solid var(--brand-500)',
                fontFamily:'var(--f-display)',
                fontSize:24, lineHeight:1.45,
                fontWeight:500,
                fontStyle:'italic',
                color:'var(--text)',
              }}>
                "The most common mistake renters make is treating their lease like a formality. It's the only document that protects you."
                <div style={{fontSize:14, fontStyle:'normal', fontWeight:600, marginTop:12, color:'var(--text-muted)'}}>— Justice (Retd.) S. Murugan, Madras HC</div>
              </blockquote>

              <h2 className="font-display" style={{fontSize:32, fontWeight:800, letterSpacing:'-0.03em', marginTop:40, marginBottom:14}}>Security deposits & legal limits</h2>
              <p>Bangalore landlords routinely ask 10 months. The Model Tenancy Act caps this at 2 months for residential, 6 for commercial — but again, this only applies in adopting states. Outside that, what you sign is what holds.</p>
              <p>Get a written acknowledgement of the exact amount and the refund timeline. The single most-disputed point in any rental is what happens at move-out, and the law leans heavily on documents over conversations.</p>

              {/* CTA mid-article */}
              <div className="card" style={{padding:28, margin:'48px 0', background:'var(--brand-500)', color:'#fff', border:0}}>
                <div className="font-display" style={{fontSize:24, fontWeight:800, letterSpacing:'-0.025em'}}>Looking for your next rental?</div>
                <p style={{fontSize:15, opacity:.85, lineHeight:1.55, marginTop:8}}>Urbify lists 12,400+ verified homes across 12 cities. Owners pay nothing. You pay one flat fee.</p>
                <button className="btn btn-accent btn-sm" style={{marginTop:16}} onClick={()=>nav('search')}>Browse homes <Icon.arrow/></button>
              </div>
            </div>
          </div>
        </section>

        {/* related */}
        <section style={{padding:'56px 28px 96px', maxWidth:1280, margin:'0 auto', borderTop:'1px solid var(--border)'}}>
          <h2 className="font-display" style={{fontSize:'clamp(24px, 3vw, 36px)', fontWeight:800, letterSpacing:'-0.03em', margin:'48px 0 24px'}}>Keep reading</h2>
          <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:24}}>
            {BLOG_POSTS.slice(1, 4).map(rp=>(
              <article key={rp.id} onClick={()=>nav('blogPost')} style={{cursor:'pointer'}}>
                <div style={{borderRadius:'var(--r-md)', overflow:'hidden', aspectRatio:'5/3'}}>
                  <Img src={rp.cover} style={{width:'100%', height:'100%'}}/>
                </div>
                <div style={{paddingTop:14}}>
                  <div style={{fontSize:12, color:'var(--brand-500)', fontWeight:600}}>{rp.category}</div>
                  <h3 className="font-display" style={{fontSize:18, fontWeight:700, letterSpacing:'-0.02em', lineHeight:1.25, margin:'8px 0'}}>{rp.title}</h3>
                  <div style={{fontSize:12, color:'var(--text-muted)'}}>{rp.read}</div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </article>

      <Footer nav={nav}/>
    </div>
  );
}

Object.assign(window, { BlogPage, BlogPostPage });
