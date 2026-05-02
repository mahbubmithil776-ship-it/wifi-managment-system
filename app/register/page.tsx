'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import api from '../../services/api';
import { useRouter } from 'next/navigation';

function BgCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);
    type Node = { x: number; y: number; vx: number; vy: number; r: number };
    const nodes: Node[] = Array.from({ length: 22 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      r: Math.random() * 2.5 + 1.5,
    }));
    let raf: number;
    const draw = () => {
      const W = window.innerWidth, H = window.innerHeight;
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 160) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(15,110,86,${0.16 * (1 - d / 160)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }
      for (const n of nodes) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(15,110,86,0.4)';
        ctx.fill();
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={ref} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />;
}

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    packageId: null as number | null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showPass, setShowPass] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<{ name: string; speed: number; price: number } | null>(null);
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => setMounted(true), 60);
    const params = new URLSearchParams(window.location.search);
    const pkgName = params.get('package');
    if (pkgName) {
      api.get('/packages').then(res => {
        const pkg = res.data.find((p: any) => p.name === pkgName);
        if (pkg) {
          setSelectedPackage({ name: pkg.name, speed: pkg.speed, price: pkg.price });
          setFormData(prev => ({ ...prev, packageId: pkg.id }));
        }
      }).catch((err) => {
        console.error('Packages fetch error:', err);
      }).finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  // ✅ Validation
  const validate = () => {
    const e: Record<string, string> = {};

    if (!formData.fullName.trim())
      e.fullName = 'Please enter your full name';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim())
      e.email = 'Please enter your email';
    else if (!emailRegex.test(formData.email))
      e.email = 'Please enter a valid email (example@email.com)';

    if (!formData.password)
      e.password = 'Please enter a password';
    else if (formData.password.length < 6)
      e.password = 'Password must be at least 6 characters';

    const phoneRegex = /^01[0-9]{9}$/;
    if (!formData.phone.trim())
      e.phone = 'Please enter your phone number';
    else if (!phoneRegex.test(formData.phone))
      e.phone = 'Enter a valid phone number (01XXXXXXXXX — 11 digits)';

    setFieldErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;
    setLoading(true);
    try {
      await api.post('/users', formData);
      alert('Registration Successful! Please Login.');
      router.push('/login');
    } catch {
      setError('Registration Failed! Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        :root{--green:#0F6E56;--green-dark:#085041;--green-light:#e1f5ee;--gold:#BA7517}
        body{font-family:'Sora',sans-serif;overflow-x:hidden}

        .reg-bg{
          min-height:100vh;
          background:linear-gradient(160deg,#e8f7f1 0%,#f9fffe 40%,#fffef8 100%);
          display:flex;align-items:center;justify-content:center;
          position:relative;padding:80px 20px 40px;
        }
        .orb{position:fixed;border-radius:50%;pointer-events:none;z-index:0}
        .orb1{width:600px;height:600px;background:radial-gradient(circle,rgba(15,110,86,.12) 0%,transparent 70%);top:-150px;right:-100px;animation:drift1 12s ease-in-out infinite alternate}
        .orb2{width:400px;height:400px;background:radial-gradient(circle,rgba(186,117,23,.09) 0%,transparent 70%);bottom:-80px;left:-100px;animation:drift2 10s ease-in-out infinite alternate}
        @keyframes drift1{from{transform:translate(0,0)}to{transform:translate(-40px,30px)}}
        @keyframes drift2{from{transform:translate(0,0)}to{transform:translate(30px,-20px)}}

        .reg-card{
          position:relative;z-index:10;
          background:rgba(255,255,255,0.88);
          backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);
          border:1.5px solid rgba(15,110,86,0.15);border-radius:32px;
          padding:48px 44px;width:100%;max-width:460px;
          box-shadow:0 32px 80px rgba(15,110,86,0.13),0 2px 8px rgba(0,0,0,0.04);
          opacity:0;transform:translateY(32px);
          transition:opacity 0.7s cubic-bezier(.22,1,.36,1),transform 0.7s cubic-bezier(.22,1,.36,1);
        }
        .reg-card.visible{opacity:1;transform:translateY(0)}
        .card-logo{text-align:center;margin-bottom:8px}
        .logo-text{font-size:26px;font-weight:900;color:var(--green);letter-spacing:-1.5px;text-decoration:none;display:inline-block}
        .logo-text span{color:var(--gold)}
        .card-badge{
          display:inline-flex;align-items:center;gap:6px;
          background:var(--green-light);color:var(--green-dark);
          font-size:10px;font-weight:700;padding:5px 14px;
          border-radius:20px;text-transform:uppercase;letter-spacing:1.2px;
          margin:12px auto 0;
        }
        .badge-dot{width:6px;height:6px;background:var(--green);border-radius:50%;position:relative}
        .badge-dot::after{content:'';position:absolute;inset:-3px;border-radius:50%;border:1.5px solid var(--green);animation:ping 1.6s ease-out infinite;opacity:0}
        @keyframes ping{0%{transform:scale(1);opacity:.7}100%{transform:scale(2.2);opacity:0}}
        .card-title{text-align:center;font-size:22px;font-weight:800;color:#0a0a0a;letter-spacing:-0.8px;margin:24px 0 6px}
        .card-sub{text-align:center;font-size:13px;color:#888;margin-bottom:32px}

        .pkg-selected{
          background:var(--green-light);
          border:1.5px solid rgba(15,110,86,0.2);
          border-radius:14px;padding:14px 18px;
          margin-bottom:20px;
          display:flex;align-items:center;justify-content:space-between;
        }
        .pkg-selected-label{font-size:10px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px}
        .pkg-selected-name{font-size:15px;font-weight:800;color:var(--green)}
        .pkg-selected-price{font-size:20px;font-weight:900;color:#111}
        .pkg-selected-price span{font-size:11px;font-weight:400;color:#999}
        .pkg-change{font-size:11px;color:var(--green);font-weight:700;text-decoration:none;display:block;margin-top:4px;opacity:0.7}
        .pkg-change:hover{opacity:1}

        .field{
          margin-bottom:18px;
          opacity:0;transform:translateY(16px);
          transition:opacity 0.5s ease,transform 0.5s ease;
        }
        .field.visible{opacity:1;transform:translateY(0)}
        .field:nth-child(1){transition-delay:0.08s}
        .field:nth-child(2){transition-delay:0.16s}
        .field:nth-child(3){transition-delay:0.24s}
        .field:nth-child(4){transition-delay:0.32s}
        .field:nth-child(5){transition-delay:0.40s}
        .field-label{display:block;font-size:12px;font-weight:700;color:#444;margin-bottom:7px;letter-spacing:0.3px}
        .field-wrap{position:relative}
        .field-icon{position:absolute;left:15px;top:50%;transform:translateY(-50%);font-size:15px;pointer-events:none;opacity:0.45}
        .field-input{
          width:100%;padding:14px 14px 14px 44px;
          border:1.5px solid #e0ede8;border-radius:14px;
          font-family:'Sora',sans-serif;font-size:14px;color:#111;
          background:#fafffe;outline:none;
          transition:border-color 0.25s,box-shadow 0.25s,background 0.25s;
        }
        .field-input:focus{border-color:var(--green);box-shadow:0 0 0 4px rgba(15,110,86,0.1);background:#fff}
        .field-input::placeholder{color:#bbb}
        .field-input.err{border-color:#ef4444;background:#fff5f5}
        .field-error{font-size:11px;color:#ef4444;font-weight:600;margin-top:5px;display:flex;align-items:center;gap:4px}
        .pass-toggle{position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;font-size:17px;opacity:0.4;transition:opacity 0.2s;padding:4px}
        .pass-toggle:hover{opacity:0.75}
        .strength-bar{margin-top:7px;height:3px;border-radius:3px;background:#eee;overflow:hidden}
        .strength-fill{height:100%;border-radius:3px;transition:width 0.35s,background 0.35s}
        .strength-label{font-size:10px;font-weight:600;margin-top:4px}
        .error-box{
          background:#fff1f1;border:1.5px solid #fecaca;border-radius:12px;
          padding:11px 14px;font-size:12px;color:#c0392b;font-weight:600;
          margin-bottom:16px;display:flex;align-items:center;gap:8px;
          animation:shake 0.4s ease;
        }
        @keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}
        .submit-btn{
          width:100%;padding:15px;background:var(--green);color:#fff;
          border:none;border-radius:50px;font-family:'Sora',sans-serif;
          font-size:14px;font-weight:700;cursor:pointer;
          position:relative;overflow:hidden;
          box-shadow:0 6px 24px rgba(15,110,86,0.32);
          transition:background 0.25s,transform 0.2s,box-shadow 0.25s;
        }
        .submit-btn:hover:not(:disabled){background:var(--green-dark);transform:translateY(-2px);box-shadow:0 10px 32px rgba(15,110,86,0.4)}
        .submit-btn:disabled{opacity:0.7;cursor:not-allowed;transform:none}
        .spinner{display:inline-block;width:15px;height:15px;border:2.5px solid rgba(255,255,255,0.4);border-top-color:#fff;border-radius:50%;animation:spin 0.75s linear infinite;vertical-align:middle;margin-right:8px}
        @keyframes spin{to{transform:rotate(360deg)}}
        .divider{display:flex;align-items:center;gap:12px;margin:24px 0;color:#ccc;font-size:11px;font-weight:600}
        .divider::before,.divider::after{content:'';flex:1;height:1px;background:#eaeaea}
        .login-link-row{text-align:center;font-size:13px;color:#888}
        .login-link-row a{color:var(--green);font-weight:700;text-decoration:none;margin-left:4px;transition:color 0.2s}
        .login-link-row a:hover{color:var(--green-dark)}
        .home-link{
          position:fixed;top:24px;left:28px;z-index:100;
          display:flex;align-items:center;gap:8px;
          font-size:13px;font-weight:700;color:var(--green);text-decoration:none;
          background:rgba(255,255,255,0.85);backdrop-filter:blur(10px);
          padding:8px 18px;border-radius:30px;
          border:1.5px solid rgba(15,110,86,0.15);
          box-shadow:0 4px 16px rgba(15,110,86,0.08);
          transition:transform 0.2s,box-shadow 0.2s;
        }
        .home-link:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(15,110,86,0.15)}
        @media(max-width:480px){.reg-card{padding:36px 22px 32px;border-radius:24px}}
      `}</style>

      <Link href="/" className="home-link">← Back To Home</Link>

      <div className="reg-bg">
        <div className="orb orb1" />
        <div className="orb orb2" />
        <BgCanvas />

        <div className={`reg-card${mounted ? ' visible' : ''}`}>
          <div className="card-logo">
            <Link href="/" className="logo-text">Sanaf<span>ISP</span>.net</Link>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div className="card-badge">
                <span className="badge-dot" /> New Connection
              </div>
            </div>
          </div>

          <h1 className="card-title">Create Account</h1>
          <p className="card-sub">Just a few minutes to get high-speed internet</p>

          {selectedPackage && (
            <div className="pkg-selected">
              <div>
                <div className="pkg-selected-label">📦 Selected Package</div>
                <div className="pkg-selected-name">{selectedPackage.name} — {selectedPackage.speed} Mbps</div>
                <Link href="/#packages" className="pkg-change">Change package →</Link>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="pkg-selected-price">৳{selectedPackage.price}<span>/mo</span></div>
              </div>
            </div>
          )}

          <form onSubmit={handleRegister}>

            {/* Full Name */}
            <div className={`field${mounted ? ' visible' : ''}`}>
              <label className="field-label">Full Name</label>
              <div className="field-wrap">
                <span className="field-icon">👤</span>
                <input
                  type="text"
                  className={`field-input${fieldErrors.fullName ? ' err' : ''}`}
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChange={e => {
                    setFormData({ ...formData, fullName: e.target.value });
                    if (fieldErrors.fullName) setFieldErrors(prev => ({ ...prev, fullName: '' }));
                  }}
                />
              </div>
              {fieldErrors.fullName && <div className="field-error">⚠ {fieldErrors.fullName}</div>}
            </div>

            {/* Email */}
            <div className={`field${mounted ? ' visible' : ''}`}>
              <label className="field-label">Email Address</label>
              <div className="field-wrap">
                <span className="field-icon">✉️</span>
                <input
                  type="text"
                  className={`field-input${fieldErrors.email ? ' err' : ''}`}
                  placeholder="example@email.com"
                  value={formData.email}
                  onChange={e => {
                    setFormData({ ...formData, email: e.target.value });
                    if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: '' }));
                  }}
                />
              </div>
              {fieldErrors.email && <div className="field-error">⚠ {fieldErrors.email}</div>}
            </div>

            {/* Password */}
            <div className={`field${mounted ? ' visible' : ''}`}>
              <label className="field-label">Password</label>
              <div className="field-wrap">
                <span className="field-icon">🔒</span>
                <input
                  type={showPass ? 'text' : 'password'}
                  className={`field-input${fieldErrors.password ? ' err' : ''}`}
                  placeholder="Password"
                  value={formData.password}
                  onChange={e => {
                    setFormData({ ...formData, password: e.target.value });
                    if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: '' }));
                  }}
                />
                <button type="button" className="pass-toggle" onClick={() => setShowPass(v => !v)}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
              {fieldErrors.password && <div className="field-error">⚠ {fieldErrors.password}</div>}
              {formData.password && !fieldErrors.password && (() => {
                const len = formData.password.length;
                const hasNum = /\d/.test(formData.password);
                const hasSym = /[^a-zA-Z0-9]/.test(formData.password);
                const score = (len >= 8 ? 1 : 0) + (len >= 12 ? 1 : 0) + (hasNum ? 1 : 0) + (hasSym ? 1 : 0);
                const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e'];
                const labels = ['Weak', 'Fair', 'Good', 'Strong'];
                return (
                  <>
                    <div className="strength-bar">
                      <div className="strength-fill" style={{ width: `${(score / 4) * 100}%`, background: colors[score - 1] || '#ef4444' }} />
                    </div>
                    <div className="strength-label" style={{ color: colors[score - 1] || '#ef4444' }}>{labels[score - 1] || 'Weak'}</div>
                  </>
                );
              })()}
            </div>

            {/* Phone */}
            <div className={`field${mounted ? ' visible' : ''}`}>
              <label className="field-label">Phone Number</label>
              <div className="field-wrap">
                <span className="field-icon">📞</span>
                <input
                  type="text"
                  className={`field-input${fieldErrors.phone ? ' err' : ''}`}
                  placeholder="01XXXXXXXXX"
                  value={formData.phone}
                  maxLength={11}
                  onChange={e => {
                    const val = e.target.value.replace(/\D/g, '');
                    setFormData({ ...formData, phone: val });
                    if (fieldErrors.phone) setFieldErrors(prev => ({ ...prev, phone: '' }));
                  }}
                />
              </div>
              {fieldErrors.phone && <div className="field-error">⚠ {fieldErrors.phone}</div>}
            </div>

            {error && <div className="error-box"><span>⚠️</span>{error}</div>}

            <div className={`field${mounted ? ' visible' : ''}`}>
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? <><span className="spinner" />Please wait...</> : 'Register →'}
              </button>
            </div>
          </form>

          <div className="divider">Already have account?</div>
          <div className="login-link-row">
            <Link href="/login">Login →</Link>
          </div>
        </div>
      </div>
    </>
  );
}