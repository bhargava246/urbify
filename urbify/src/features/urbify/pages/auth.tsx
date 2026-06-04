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


function AuthPage({nav}) {
  const [tab,      setTab]      = useState("tenant");   // owner | tenant | broker
  const [mode,     setMode]     = useState("login");    // login | signup | forgot | reset
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [fullName, setFullName] = useState("");
  const [reraId,   setReraId]   = useState("");
  const [otp,      setOtp]      = useState(["","","","","",""]);
  const [showPass,  setShowPass]  = useState(false);
  const [showConf,  setShowConf]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const otpRefs = useRef([]);
  const { refreshAuth } = useAppData();

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer(n => n - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const tabs = [
    { id:"owner",  l:"I'm an owner",    sub:"List your property for free" },
    { id:"tenant", l:"I'm a tenant / buyer", sub:"Find a home, unlock contact" },
    { id:"broker", l:"I'm a broker",    sub:"Manage listings & earn 100%" },
  ];
  const cur = tabs.find(t => t.id === tab);

  const updateOtp = (i, v) => {
    const next = [...otp]; next[i] = v.slice(-1); setOtp(next);
    if (v && i < 5) otpRefs.current[i+1]?.focus();
  };

  const role = tab === "owner" ? "OWNER" : tab === "broker" ? "BROKER" : "CLIENT";

  // ── Login ──────────────────────────────────────────────────────────────────
  const dashFor = (userObj) => {
    const r = userObj?.role;
    if (r === 'OWNER')  return '/owner/dashboard';
    if (r === 'BROKER') return '/broker/dashboard';
    if (r === 'ADMIN')  return '/admin';
    return '/dashboard'; // CLIENT
  };

  const handleLogin = async () => {
    setError(""); setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/login', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Invalid credentials');
      if (data.accessToken)  localStorage.setItem('urb_access',  data.accessToken);
      if (data.refreshToken) localStorage.setItem('urb_refresh', data.refreshToken);
      let userObj = data.user || null;
      if (!userObj) {
        const me = await fetch('/api/v1/users/me', { headers: { Authorization: `Bearer ${data.accessToken}` } });
        if (me.ok) { userObj = await me.json(); }
      }
      if (userObj) localStorage.setItem('urb_user', JSON.stringify(userObj));
      window.dispatchEvent(new Event('urbify:auth'));
      window.location.href = '/';
    } catch(err) { setError(err.message); }
    finally { setLoading(false); }
  };

  // ── Signup ─────────────────────────────────────────────────────────────────
  const handleSignup = async () => {
    setError("");
    if (password !== confirm) { setError("Passwords don't match"); return; }
    if (password.length < 8)  { setError("Password must be at least 8 characters"); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/register', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ email, password, role, fullName, ...(reraId && { reraId }) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      setOtp(["","","","","",""]);
      setMode('verify');
      setSuccess('Account created! Verification code sent to your email.');
    } catch(err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleVerifySignup = async () => {
    setError(""); setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/otp/verify', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ email, otp: otp.join('') }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Verification failed');
      if (data.accessToken)  localStorage.setItem('urb_access',  data.accessToken);
      if (data.refreshToken) localStorage.setItem('urb_refresh', data.refreshToken);
      let userObj = data.user || null;
      if (!userObj) {
        const me = await fetch('/api/v1/users/me', { headers: { Authorization: `Bearer ${data.accessToken}` } });
        if (me.ok) { userObj = await me.json(); }
      }
      if (userObj) localStorage.setItem('urb_user', JSON.stringify(userObj));
      window.dispatchEvent(new Event('urbify:auth'));
      window.location.href = '/';
    } catch(err) { setError(err.message); }
    finally { setLoading(false); }
  };

  // ── Forgot password ─────────────────────────────────────────────────────────
  const handleForgot = async () => {
    setError(""); setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/forgot-password', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send OTP');
      setMode('reset'); setResendTimer(30);
    } catch(err) { setError(err.message); }
    finally { setLoading(false); }
  };

  // ── Reset password ──────────────────────────────────────────────────────────
  const handleReset = async () => {
    setError("");
    if (password !== confirm) { setError("Passwords don't match"); return; }
    if (password.length < 8)  { setError("Password must be at least 8 characters"); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/reset-password', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ email, otp: otp.join(''), newPassword: password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Reset failed');
      setSuccess('Password updated! Please sign in.'); setMode('login');
      setPassword(''); setConfirm(''); setOtp(["","","","","",""]);
    } catch(err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const eyeBtn = (show, toggle) => (
    <button type="button" onClick={toggle}
      style={{position:'absolute', right:12, top:'50%', transform:'translateY(-50%)',
              background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', fontSize:16}}>
      {show ? '🙈' : '👁'}
    </button>
  );

  return (
    <div style={{minHeight:'calc(100vh - 64px)', display:'grid', gridTemplateColumns:'1.1fr 1fr', background:'var(--surface-sunken)'}}>

      {/* LEFT brand panel */}
      <div style={{background:'var(--text)', color:'var(--bg)', padding:'80px 64px', position:'relative', overflow:'hidden', display:'flex', flexDirection:'column', justifyContent:'space-between'}}>
        <div>
          <div className="font-display" style={{fontSize:32, fontWeight:800, letterSpacing:'-0.04em'}}>urbify</div>
          <h1 className="font-display" style={{fontSize:'clamp(40px, 4.5vw, 64px)', fontWeight:800, letterSpacing:'-0.045em', lineHeight:.98, marginTop:64}}>
            One account.<br/>Every door.
          </h1>
          <p style={{fontSize:17, opacity:.7, marginTop:20, maxWidth:420, lineHeight:1.55}}>
            List, search, or manage portfolios — all from one login. No spam, no resold data, ever.
          </p>
        </div>
        <div style={{display:'flex', flexDirection:'column', gap:12, marginTop:48}}>
          {["256-bit encrypted at rest", "Email OTP — no passwords to leak", "RERA-verified brokers only", "Your email is never shared without consent"].map((s,i)=>(
            <div key={i} style={{display:'flex', alignItems:'center', gap:14, fontSize:14, opacity:.85}}>
              <span style={{width:24, height:24, borderRadius:'50%', background:'rgba(255,255,255,.1)', display:'grid', placeItems:'center', fontSize:11}}>✓</span>
              {s}
            </div>
          ))}
        </div>
        <div style={{position:'absolute', right:-100, top:-80, width:340, height:340, borderRadius:'50%', background:'var(--brand-500)', filter:'blur(80px)', opacity:.25}}/>
        <div style={{position:'absolute', right:80, bottom:-80, width:240, height:240, borderRadius:'50%', background:'var(--accent-500)', filter:'blur(60px)', opacity:.2}}/>
      </div>

      {/* RIGHT form */}
      <div style={{padding:'64px 56px', display:'flex', flexDirection:'column', justifyContent:'center', maxWidth:560, overflowY:'auto'}}>

        {/* Header */}
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:8}}>
          <h2 className="font-display" style={{fontSize:30, fontWeight:800, letterSpacing:'-0.03em', margin:0}}>
            {mode === 'login' ? 'Welcome back' : mode === 'signup' ? 'Get started' : mode === 'forgot' ? 'Reset password' : mode === 'verify' ? 'Verify email' : 'Choose new password'}
          </h2>
          {(mode === 'login' || mode === 'signup') && (
            <button onClick={()=>{ setMode(mode==='login'?'signup':'login'); setError(''); }} className="btn btn-ghost btn-sm">
              {mode === 'login' ? 'Create account' : 'Sign in instead'}
            </button>
          )}
          {(mode === 'forgot' || mode === 'reset' || mode === 'verify') && (
            <button onClick={()=>{ setMode('login'); setError(''); }} className="btn btn-ghost btn-sm">← Back to login</button>
          )}
        </div>
        <p className="muted" style={{fontSize:15, marginBottom:24}}>{mode === 'login' || mode === 'signup' ? cur.sub : mode === 'forgot' ? "We'll email you a one-time code" : mode === 'verify' ? "Enter the OTP sent to your email to verify your account" : "Enter the OTP sent to your email"}</p>

        {/* Role tabs — only on login/signup */}
        {(mode === 'login' || mode === 'signup') && (
          <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:8, marginBottom:24}}>
            {tabs.map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)} style={{
                padding:'14px 12px', borderRadius:'var(--r-md)', cursor:'pointer',
                border:'1.5px solid', borderColor: tab===t.id?'var(--text)':'var(--border)',
                background: tab===t.id?'var(--surface)':'transparent',
                textAlign:'left', font:'inherit', color:'var(--text)',
              }}>
                <div style={{fontSize:13, fontWeight:600}}>{t.l}</div>
              </button>
            ))}
          </div>
        )}

        {/* Error / Success */}
        {error && <div style={{marginBottom:14, fontSize:13, color:'var(--danger)', padding:'10px 14px', background:'var(--danger-50,#fef2f2)', borderRadius:'var(--r-sm)'}}>{error}</div>}
        {success && <div style={{marginBottom:14, fontSize:13, color:'var(--success)', padding:'10px 14px', background:'#f0fdf4', borderRadius:'var(--r-sm)'}}>{success}</div>}

        {/* ── LOGIN ── */}
        {mode === 'login' && (
          <div style={{display:'flex', flexDirection:'column', gap:14}}>
            <div>
              <label style={{fontSize:12, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.08em'}}>Email address</label>
              <input className="input" type="email" placeholder="you@example.com"
                value={email} onChange={e=>setEmail(e.target.value)} style={{display:'block', width:'100%', marginTop:8}}/>
            </div>
            <div>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <label style={{fontSize:12, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.08em'}}>Password</label>
                <button type="button" className="btn btn-ghost btn-sm" style={{fontSize:12, padding:'2px 6px'}}
                  onClick={()=>{ setMode('forgot'); setError(''); }}>Forgot password?</button>
              </div>
              <div style={{position:'relative', marginTop:8}}>
                <input className="input" type={showPass?'text':'password'} placeholder="••••••••"
                  value={password} onChange={e=>setPassword(e.target.value)}
                  style={{display:'block', width:'100%', paddingRight:40}}
                  onKeyDown={e=>e.key==='Enter' && handleLogin()}/>
                {eyeBtn(showPass, ()=>setShowPass(v=>!v))}
              </div>
            </div>
            <button className="btn btn-brand btn-lg btn-block" style={{marginTop:6}}
              disabled={!email || !password || loading} onClick={handleLogin}>
              {loading ? 'Signing in…' : <>Sign in <Icon.arrow/></>}
            </button>
          </div>
        )}

        {/* ── SIGNUP ── */}
        {mode === 'signup' && (
          <div style={{display:'flex', flexDirection:'column', gap:14}}>
            <div>
              <label style={{fontSize:12, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.08em'}}>Full name</label>
              <input className="input" placeholder="Your full name" value={fullName} onChange={e=>setFullName(e.target.value)} style={{display:'block', width:'100%', marginTop:8}}/>
            </div>
            <div>
              <label style={{fontSize:12, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.08em'}}>Email address</label>
              <input className="input" type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} style={{display:'block', width:'100%', marginTop:8}}/>
            </div>
            <div>
              <label style={{fontSize:12, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.08em'}}>Password</label>
              <div style={{position:'relative', marginTop:8}}>
                <input className="input" type={showPass?'text':'password'} placeholder="Min 8 characters"
                  value={password} onChange={e=>setPassword(e.target.value)} style={{display:'block', width:'100%', paddingRight:40}}/>
                {eyeBtn(showPass, ()=>setShowPass(v=>!v))}
              </div>
            </div>
            <div>
              <label style={{fontSize:12, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.08em'}}>Confirm password</label>
              <div style={{position:'relative', marginTop:8}}>
                <input className="input" type={showConf?'text':'password'} placeholder="Repeat password"
                  value={confirm} onChange={e=>setConfirm(e.target.value)} style={{display:'block', width:'100%', paddingRight:40}}/>
                {eyeBtn(showConf, ()=>setShowConf(v=>!v))}
              </div>
            </div>
            {tab === 'broker' && (
              <div>
                <label style={{fontSize:12, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.08em'}}>RERA Broker ID <span style={{textTransform:'none', fontWeight:400}}>(optional)</span></label>
                <input className="input" placeholder="e.g. KA/RERA/AGT/1234" value={reraId} onChange={e=>setReraId(e.target.value)} style={{display:'block', width:'100%', marginTop:8}}/>
              </div>
            )}
            <button className="btn btn-brand btn-lg btn-block" style={{marginTop:6}}
              disabled={!email||!password||!fullName||loading} onClick={handleSignup}>
              {loading ? 'Creating account…' : <>Create account <Icon.arrow/></>}
            </button>
          </div>
        )}

        {/* ── FORGOT PASSWORD ── */}
        {mode === 'forgot' && (
          <div style={{display:'flex', flexDirection:'column', gap:14}}>
            <div>
              <label style={{fontSize:12, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.08em'}}>Email address</label>
              <input className="input" type="email" placeholder="you@example.com"
                value={email} onChange={e=>setEmail(e.target.value)} style={{display:'block', width:'100%', marginTop:8}}/>
            </div>
            <button className="btn btn-brand btn-lg btn-block"
              disabled={!email.includes('@')||loading} onClick={handleForgot}>
              {loading ? 'Sending…' : <>Send reset OTP <Icon.arrow/></>}
            </button>
          </div>
        )}

        {/* ── RESET PASSWORD ── */}
        {mode === 'reset' && (
          <div style={{display:'flex', flexDirection:'column', gap:14}}>
            <div style={{fontSize:13, color:'var(--text-muted)', padding:'10px 14px', background:'var(--surface-sunken)', borderRadius:'var(--r-sm)'}}>
              OTP sent to <strong style={{color:'var(--text)'}}>{email}</strong>
            </div>
            <div>
              <label style={{fontSize:12, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.08em'}}>Enter OTP</label>
              <div style={{display:'flex', gap:8, marginTop:8}}>
                {otp.map((d,i)=>(
                  <input key={i} ref={el=>otpRefs.current[i]=el} className="input"
                    value={d} onChange={e=>updateOtp(i,e.target.value)}
                    onKeyDown={e=>{ if(e.key==='Backspace'&&!d&&i>0) otpRefs.current[i-1]?.focus(); }}
                    maxLength="1" inputMode="numeric"
                    style={{width:48, height:56, textAlign:'center', fontSize:22, fontWeight:700}}/>
                ))}
              </div>
              <div style={{fontSize:12, color:'var(--text-muted)', marginTop:10}}>
                {resendTimer > 0
                  ? <span>Resend in <strong>{String(resendTimer).padStart(2,'0')}s</strong></span>
                  : <span>Didn't get it? <a style={{color:'var(--brand-500)', cursor:'pointer', fontWeight:600}} onClick={handleForgot}>Resend OTP</a></span>
                }
              </div>
            </div>
            <div>
              <label style={{fontSize:12, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.08em'}}>New password</label>
              <div style={{position:'relative', marginTop:8}}>
                <input className="input" type={showPass?'text':'password'} placeholder="Min 8 characters"
                  value={password} onChange={e=>setPassword(e.target.value)} style={{display:'block', width:'100%', paddingRight:40}}/>
                {eyeBtn(showPass, ()=>setShowPass(v=>!v))}
              </div>
            </div>
            <div>
              <label style={{fontSize:12, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.08em'}}>Confirm new password</label>
              <div style={{position:'relative', marginTop:8}}>
                <input className="input" type={showConf?'text':'password'} placeholder="Repeat password"
                  value={confirm} onChange={e=>setConfirm(e.target.value)} style={{display:'block', width:'100%', paddingRight:40}}/>
                {eyeBtn(showConf, ()=>setShowConf(v=>!v))}
              </div>
            </div>
            <button className="btn btn-brand btn-lg btn-block"
              disabled={otp.filter(Boolean).length!==6||!password||loading} onClick={handleReset}>
              {loading ? 'Resetting…' : <>Reset password <Icon.arrow/></>}
            </button>
          </div>
        )}

        {/* ── VERIFY EMAIL ── */}
        {mode === 'verify' && (
          <div style={{display:'flex', flexDirection:'column', gap:14}}>
            <div style={{fontSize:13, color:'var(--text-muted)', padding:'10px 14px', background:'var(--surface-sunken)', borderRadius:'var(--r-sm)'}}>
              A 6-digit verification code has been sent to <strong style={{color:'var(--text)'}}>{email}</strong>. Please enter it below to activate your account.
            </div>
            <div>
              <label style={{fontSize:12, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.08em'}}>Enter OTP</label>
              <div style={{display:'flex', gap:8, marginTop:8}}>
                {otp.map((d,i)=>(
                  <input key={i} ref={el=>otpRefs.current[i]=el} className="input"
                    value={d} onChange={e=>updateOtp(i,e.target.value)}
                    onKeyDown={e=>{ if(e.key==='Backspace'&&!d&&i>0) otpRefs.current[i-1]?.focus(); }}
                    maxLength="1" inputMode="numeric"
                    style={{width:48, height:56, textAlign:'center', fontSize:22, fontWeight:700}}/>
                ))}
              </div>
            </div>
            <button className="btn btn-brand btn-lg btn-block"
              disabled={otp.filter(Boolean).length!==6||loading} onClick={handleVerifySignup}>
              {loading ? 'Verifying…' : <>Verify & Complete Signup <Icon.arrow/></>}
            </button>
          </div>
        )}

        <div style={{marginTop:28, fontSize:11, color:'var(--text-faint)', lineHeight:1.5}}>
          By continuing, you agree to Urbify's <a style={{textDecoration:'underline'}}>Terms</a> and <a style={{textDecoration:'underline'}}>Privacy Policy</a>. Your data is never shared.
        </div>
      </div>
    </div>
  );
}

function PricingPage({nav}) {
  const [rent, setRent] = useState(40000);
  const [calcRent, setCalcRent] = useState(40000);
  const dailyRent = Math.round(rent / 30);
  const base = Math.round(dailyRent * 7.5);
  const gst = Math.round(base * 0.18);
  const total = base + gst;
  const fmt = (n) => n.toLocaleString("en-IN");

  return (
    <div>
      <section style={{padding:'72px 28px 24px', maxWidth:1280, margin:'0 auto'}}>
        <div className="chip" style={{background:'transparent', border:'1px solid var(--border-strong)', marginBottom:24}}>Pricing</div>
        <h1 className="font-display" style={{fontSize:'clamp(48px, 7vw, 96px)', fontWeight:800, letterSpacing:'-0.045em', lineHeight:.96, margin:0}}>
          Honest pricing.<br/>No surprises.
        </h1>
        <p className="muted" style={{fontSize:20, maxWidth:680, marginTop:24, lineHeight:1.4}}>
          Owners and brokers pay <strong style={{color:'var(--text)'}}>nothing</strong>. Tenants pay one flat fee of <strong style={{color:'var(--text)'}}>50% of market brokerage</strong>. That's it.
        </p>
      </section>

      {/* Calculator */}
      <section style={{padding:'40px 28px 72px', maxWidth:1280, margin:'0 auto'}}>
        <div className="card" style={{padding:0, overflow:'hidden', boxShadow:'var(--sh-2)'}}>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1.2fr'}}>
            {/* slider side */}
            <div style={{padding:'48px 48px', background:'var(--text)', color:'var(--bg)'}}>
              <div style={{fontSize:12, opacity:.6, textTransform:'uppercase', letterSpacing:'.08em', fontWeight:600}}>Try the calculator</div>
              <div className="font-display" style={{fontSize:24, fontWeight:700, letterSpacing:'-0.02em', marginTop:14}}>Monthly rent</div>
              <div className="font-display" style={{fontSize:64, fontWeight:800, letterSpacing:'-0.045em', marginTop:8, lineHeight:1}}>₹{fmt(rent)}</div>

              <input type="range" min="5000" max="200000" step="500" value={rent}
                onChange={e=>setRent(+e.target.value)}
                style={{width:'100%', marginTop:36, accentColor:'var(--accent-500)'}}/>

              <div style={{display:'flex', justifyContent:'space-between', fontSize:11, opacity:.6, marginTop:6}}>
                <span>₹5k</span><span>₹2L</span>
              </div>

              <div style={{display:'flex', gap:6, marginTop:24, flexWrap:'wrap'}}>
                {[15000, 25000, 40000, 65000, 100000].map(r=>(
                  <button key={r} onClick={()=>setRent(r)} className="chip"
                    style={{cursor:'pointer', background: rent===r ? 'var(--bg)' : 'rgba(255,255,255,.1)', color: rent===r ? 'var(--text)' : 'var(--bg)', border:0, height:30, fontSize:12}}>
                    ₹{fmt(r/1000)}k
                  </button>
                ))}
              </div>
            </div>

            {/* breakdown side */}
            <div style={{padding:'48px 48px'}}>
              <div style={{fontSize:12, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.08em', fontWeight:600}}>You pay</div>
              <div style={{display:'flex', alignItems:'baseline', gap:8, marginTop:12}}>
                <div className="font-display" style={{fontSize:80, fontWeight:800, letterSpacing:'-0.045em', color:'var(--brand-500)', lineHeight:1}}>
                  ₹{fmt(total)}
                </div>
              </div>
              <div style={{fontSize:13, color:'var(--text-muted)', marginTop:4}}>one-time · all-in · incl. GST</div>

              <div style={{marginTop:36, padding:'18px 22px', background:'var(--surface-sunken)', borderRadius:'var(--r-md)'}}>
                <Row label={`Daily rent (₹${fmt(rent)} ÷ 30)`} value={`₹${fmt(dailyRent)}`}/>
                <Row label="× 50% of market rate" value={`₹${fmt(base)}`}/>
                <Row label="+ GST 18%" value={`₹${fmt(gst)}`}/>
                <div style={{height:1, background:'var(--border)', margin:'10px 0'}}/>
                <Row label="Total" value={`₹${fmt(total)}`} big/>
              </div>

              <div style={{marginTop:24, padding:'14px 18px', background:'#FEF3C7', borderRadius:'var(--r-md)', display:'flex', gap:12, alignItems:'center'}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:11, color:'#78350F', fontWeight:600, textTransform:'uppercase', letterSpacing:'.08em'}}>Traditional broker</div>
                  <div className="font-display" style={{fontSize:32, fontWeight:800, letterSpacing:'-0.03em', color:'#78350F', textDecoration:'line-through'}}>₹{fmt(Math.round(rent * 1.18))}</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:11, color:'#78350F', fontWeight:600}}>You save</div>
                  <div className="font-display" style={{fontSize:24, fontWeight:800, letterSpacing:'-0.03em', color:'#92400E'}}>₹{fmt(Math.round(rent * 1.18) - total)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section style={{padding:'72px 28px', background:'var(--surface-sunken)'}}>
        <div style={{maxWidth:1280, margin:'0 auto'}}>
          <h2 className="font-display" style={{fontSize:'clamp(32px, 4vw, 52px)', fontWeight:800, letterSpacing:'-0.035em', textAlign:'center', margin:'0 0 48px'}}>
            How we stack up.
          </h2>

          <div style={{display:'grid', gridTemplateColumns:'1.4fr 1fr 1fr 1fr', borderRadius:'var(--r-lg)', overflow:'hidden', background:'var(--surface)', boxShadow:'var(--sh-2)'}}>
            <CompHeader/>
            <CompCol name="urbify" winner subtitle="Built differently"/>
            <CompCol name="NoBroker" subtitle="Subscription model"/>
            <CompCol name="99acres / MagicBricks" subtitle="Classifieds + brokers"/>

            <CompRow row="Owner listing cost" cells={["FREE", "₹2,499 – ₹9,999", "FREE listing + paid boost"]} good={[true, false, false]}/>
            <CompRow row="Tenant fee" cells={["50% of market brokerage", "₹1,000 – ₹5,000 / month sub", "Broker commission (1 mo)"]} good={[true, false, false]}/>
            <CompRow row="Broker model" cells={["Keep 100% commission", "Not supported", "Pay-per-lead"]} good={[true, false, false]}/>
            <CompRow row="Address privacy" cells={["Hidden until paid", "Partial", "Always visible"]} good={[true, false, false]}/>
            <CompRow row="Refund policy" cells={["24h auto-refund", "Limited", "None"]} good={[true, false, false]}/>
            <CompRow row="RERA verification" cells={["Mandatory for brokers", "Optional", "Optional"]} good={[true, false, false]}/>
            <CompRow row="Land deals" cells={["Yes", "No", "Yes"]} good={[true, false, true]} last/>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{padding:'120px 28px'}}>
        <div style={{maxWidth:780, margin:'0 auto', textAlign:'center'}}>
          <h2 className="font-display" style={{fontSize:'clamp(40px, 6vw, 72px)', lineHeight:1, letterSpacing:'-0.045em', fontWeight:800, margin:0}}>
            Pricing this honest<br/>shouldn't feel rare.
          </h2>
          <div style={{display:'flex', gap:12, justifyContent:'center', marginTop:32}}>
            <button className="btn btn-brand btn-lg" onClick={()=>nav('search')}>Find a home <Icon.arrow/></button>
            <button className="btn btn-outline btn-lg" onClick={()=>nav('auth')}>List for ₹0</button>
          </div>
        </div>
      </section>

    </div>
  );
}

function CompHeader() {
  return (
    <div style={{padding:'24px', borderBottom:'1px solid var(--border)'}}>
      <div style={{fontSize:11, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.08em'}}>Compare</div>
    </div>
  );
}

function CompCol({name, subtitle, winner}) {
  return (
    <div style={{padding:'24px', borderBottom:'1px solid var(--border)', background: winner ? 'var(--text)' : 'transparent', color: winner ? 'var(--bg)' : 'inherit', position:'relative'}}>
      {winner && <span className="chip chip-accent" style={{position:'absolute', top:14, right:14, height:22, fontSize:10}}>BEST</span>}
      <div className="font-display" style={{fontSize:22, fontWeight:800, letterSpacing:'-0.02em'}}>{name}</div>
      <div style={{fontSize:12, opacity:.7, marginTop:4}}>{subtitle}</div>
    </div>
  );
}

function CompRow({row, cells, good, last}) {
  return (
    <>
      <div style={{padding:'20px 24px', fontSize:14, fontWeight:600, borderBottom: last ? 0 : '1px solid var(--border)'}}>{row}</div>
      {cells.map((c, i)=>(
        <div key={i} style={{padding:'20px 24px', fontSize:14, borderBottom: last ? 0 : '1px solid var(--border)', background: i===0 ? 'color-mix(in oklab, var(--brand-500) 6%, transparent)' : 'transparent', display:'flex', alignItems:'center', gap:8}}>
          {good[i] ? <span style={{color:'var(--success)'}}>✓</span> : <span style={{color:'var(--text-faint)'}}>·</span>}
          <span>{c}</span>
        </div>
      ))}
    </>
  );
}

function Row({label, value, big}) {
  return (
    <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', padding:'8px 0'}}>
      <span style={{fontSize:13, color: big ? 'var(--text)' : 'var(--text-muted)', fontWeight: big ? 700 : 500}}>{label}</span>
      <span className="font-mono" style={{fontSize: big ? 16 : 14, fontWeight: big ? 800 : 600}}>{value}</span>
    </div>
  );
}

export { AuthPage, PricingPage };
