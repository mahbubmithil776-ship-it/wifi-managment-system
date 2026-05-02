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
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
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
            ctx.strokeStyle = `rgba(15,110,86,${0.18 * (1 - d / 160)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }
      for (const n of nodes) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(15,110,86,0.45)';
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

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => { setTimeout(() => setMounted(true), 60); }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/users/login', { email, password });
      localStorage.setItem('token', res.data.access_token);

const payload = JSON.parse(atob(res.data.access_token.split('.')[1]));

if (payload.role === 'admin') {
  router.push('/admin');
} else {
  router.push('/dashboard');
}
    } catch {
      setError('The email or password is incorrect. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        :root{--green:#0F6E56;--green-dark:#085041;--green-light:#e1f5ee;--gold:#BA7517;--gold-light:#faeeda}
        body{font-family:'Sora',sans-serif;overflow:hidden}

        .login-bg {
          min-height: 100vh;
          background: linear-gradient(160deg, #e8f7f1 0%, #f9fffe 40%, #fffef8 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 20px;
        }

        /* orbs */
        .orb {
          position: fixed;
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
        }
        .orb1 {
          width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(15,110,86,.12) 0%, transparent 70%);
          top: -150px; right: -100px;
          animation: drift1 12s ease-in-out infinite alternate;
        }
        .orb2 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(186,117,23,.09) 0%, transparent 70%);
          bottom: -80px; left: -100px;
          animation: drift2 10s ease-in-out infinite alternate;
        }
        @keyframes drift1 { from{transform:translate(0,0)} to{transform:translate(-40px,30px)} }
        @keyframes drift2 { from{transform:translate(0,0)} to{transform:translate(30px,-20px)} }

        /* card */
        .login-card {
          position: relative;
          z-index: 10;
          background: rgba(255,255,255,0.88);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1.5px solid rgba(15,110,86,0.15);
          border-radius: 32px;
          padding: 48px 44px;
          width: 100%;
          max-width: 460px;
          box-shadow: 0 32px 80px rgba(15,110,86,0.13), 0 2px 8px rgba(0,0,0,0.04);
          opacity: 0;
          transform: translateY(32px);
          transition: opacity 0.7s cubic-bezier(.22,1,.36,1), transform 0.7s cubic-bezier(.22,1,.36,1);
        }
        .login-card.visible { opacity: 1; transform: translateY(0); }

        /* logo */
        .card-logo {
          text-align: center;
          margin-bottom: 8px;
        }
        .logo-text {
          font-size: 28px;
          font-weight: 900;
          color: var(--green);
          letter-spacing: -1.5px;
          text-decoration: none;
          display: inline-block;
        }
        .logo-text span { color: var(--gold); }

        .card-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: var(--green-light);
          color: var(--green-dark);
          font-size: 10px;
          font-weight: 700;
          padding: 5px 14px;
          border-radius: 20px;
          text-transform: uppercase;
          letter-spacing: 1.2px;
          margin: 12px auto 0;
        }
        .badge-dot {
          width: 6px; height: 6px;
          background: var(--green);
          border-radius: 50%;
          position: relative;
        }
        .badge-dot::after {
          content: '';
          position: absolute;
          inset: -3px;
          border-radius: 50%;
          border: 1.5px solid var(--green);
          animation: ping 1.6s ease-out infinite;
          opacity: 0;
        }
        @keyframes ping {
          0%{transform:scale(1);opacity:.7}
          100%{transform:scale(2.2);opacity:0}
        }

        .card-title {
          text-align: center;
          font-size: 22px;
          font-weight: 800;
          color: #0a0a0a;
          letter-spacing: -0.8px;
          margin: 24px 0 6px;
        }
        .card-sub {
          text-align: center;
          font-size: 13px;
          color: #888;
          margin-bottom: 32px;
        }

        /* form fields */
        .field {
          margin-bottom: 18px;
          opacity: 0;
          transform: translateY(16px);
          transition: opacity 0.5s ease, transform 0.5s ease;
        }
        .field.visible { opacity: 1; transform: translateY(0); }
        .field:nth-child(1) { transition-delay: 0.1s; }
        .field:nth-child(2) { transition-delay: 0.2s; }
        .field:nth-child(3) { transition-delay: 0.3s; }

        .field-label {
          display: block;
          font-size: 12px;
          font-weight: 700;
          color: #444;
          margin-bottom: 8px;
          letter-spacing: 0.3px;
        }
        .field-wrap {
          position: relative;
        }
        .field-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 16px;
          pointer-events: none;
          opacity: 0.5;
        }
        .field-input {
          width: 100%;
          padding: 14px 16px 14px 44px;
          border: 1.5px solid #e0ede8;
          border-radius: 14px;
          font-family: 'Sora', sans-serif;
          font-size: 14px;
          color: #111;
          background: #fafffe;
          outline: none;
          transition: border-color 0.25s, box-shadow 0.25s, background 0.25s;
        }
        .field-input:focus {
          border-color: var(--green);
          box-shadow: 0 0 0 4px rgba(15,110,86,0.1);
          background: #fff;
        }
        .field-input::placeholder { color: #bbb; }
        .pass-toggle {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          font-size: 18px;
          opacity: 0.45;
          transition: opacity 0.2s;
          padding: 4px;
        }
        .pass-toggle:hover { opacity: 0.8; }

        /* forgot */
        .forgot-row {
          text-align: right;
          margin-top: -10px;
          margin-bottom: 22px;
        }
        .forgot-link {
          font-size: 12px;
          font-weight: 600;
          color: var(--green);
          text-decoration: none;
          opacity: 0.75;
          transition: opacity 0.2s;
        }
        .forgot-link:hover { opacity: 1; }

        /* error */
        .error-box {
          background: #fff1f1;
          border: 1.5px solid #fecaca;
          border-radius: 12px;
          padding: 12px 16px;
          font-size: 12px;
          color: #c0392b;
          font-weight: 600;
          margin-bottom: 18px;
          display: flex;
          align-items: center;
          gap: 8px;
          animation: shake 0.4s ease;
        }
        @keyframes shake {
          0%,100%{transform:translateX(0)}
          20%{transform:translateX(-6px)}
          40%{transform:translateX(6px)}
          60%{transform:translateX(-4px)}
          80%{transform:translateX(4px)}
        }

        /* submit btn */
        .submit-btn {
          width: 100%;
          padding: 15px;
          background: var(--green);
          color: #fff;
          border: none;
          border-radius: 50px;
          font-family: 'Sora', sans-serif;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          box-shadow: 0 6px 24px rgba(15,110,86,0.32);
          transition: background 0.25s, transform 0.2s, box-shadow 0.25s;
          letter-spacing: 0.3px;
        }
        .submit-btn:hover:not(:disabled) {
          background: var(--green-dark);
          transform: translateY(-2px);
          box-shadow: 0 10px 32px rgba(15,110,86,0.4);
        }
        .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }
        .submit-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
          transform: translateX(-100%);
          transition: transform 0.5s;
        }
        .submit-btn:not(:disabled):hover::after { transform: translateX(100%); }

        /* spinner */
        .spinner {
          display: inline-block;
          width: 16px; height: 16px;
          border: 2.5px solid rgba(255,255,255,0.4);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.75s linear infinite;
          vertical-align: middle;
          margin-right: 8px;
        }
        @keyframes spin { to{transform:rotate(360deg)} }

        /* divider */
        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 24px 0;
          color: #ccc;
          font-size: 11px;
          font-weight: 600;
        }
        .divider::before,.divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #eaeaea;
        }

        /* register link */
        .register-link-row {
          text-align: center;
          font-size: 13px;
          color: #888;
        }
        .register-link-row a {
          color: var(--green);
          font-weight: 700;
          text-decoration: none;
          margin-left: 4px;
          transition: color 0.2s;
        }
        .register-link-row a:hover { color: var(--green-dark); }

        /* bottom home link */
        .home-link {
          position: fixed;
          top: 24px;
          left: 28px;
          z-index: 100;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 700;
          color: var(--green);
          text-decoration: none;
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(10px);
          padding: 8px 18px;
          border-radius: 30px;
          border: 1.5px solid rgba(15,110,86,0.15);
          box-shadow: 0 4px 16px rgba(15,110,86,0.08);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .home-link:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(15,110,86,0.15); }

        @media(max-width:480px){
          .login-card { padding: 36px 24px; border-radius: 24px; }
        }
      `}</style>

      <Link href="/" className="home-link">← Back To Home</Link>

      <div className="login-bg">
        <div className="orb orb1" />
        <div className="orb orb2" />
        <BgCanvas />

        <div className={`login-card${mounted ? ' visible' : ''}`}>
          <div className="card-logo">
            <Link href="/" className="logo-text">Sanaf<span>ISP</span>.net</Link>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div className="card-badge">
                <span className="badge-dot" /> Customer Portal
              </div>
            </div>
          </div>

          <h1 className="card-title">Welcome! Login</h1>
          <p className="card-sub">Log in to your account.</p>

          <form onSubmit={handleLogin}>
            <div className={`field${mounted ? ' visible' : ''}`}>
              <label className="field-label">Email Address</label>
              <div className="field-wrap">
                <span className="field-icon">✉️</span>
                <input
                  type="email"
                  className="field-input"
                  placeholder="example@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className={`field${mounted ? ' visible' : ''}`}>
              <label className="field-label">Password</label>
              <div className="field-wrap">
                <span className="field-icon">🔒</span>
                <input
                  type={showPass ? 'text' : 'password'}
                  className="field-input"
                  placeholder="Your Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button type="button" className="pass-toggle" onClick={() => setShowPass(v => !v)}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div className="forgot-row">
              <Link href="/forgot-password" className="forgot-link">Forgot your password?</Link>
            </div>

            {error && (
              <div className="error-box">
                <span>⚠️</span> {error}
              </div>
            )}

            <div className={`field${mounted ? ' visible' : ''}`}>
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? <><span className="spinner" />Logging in...</> : 'Login →'}
              </button>
            </div>
          </form>

          <div className="divider">Or</div>

          <div className="register-link-row">
            New customer?
            <Link href="/register">Create an account</Link>
          </div>
        </div>
      </div>
    </>
  );
}
