'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

/* ─────────────────────────────────────────
   HELPER — AUTO INITIALS
───────────────────────────────────────── */
function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/* ─────────────────────────────────────────
   DATA
───────────────────────────────────────── */
const PACKAGES = [
  { name: 'Mini', speed: 5, price: 500, features: ['Unlimited Data', 'Basic Support', 'Light Browsing'], featured: false, badge: '' },
  { name: 'Starter', speed: 10, price: 700, features: ['Unlimited Data', '24/7 Support', 'HD Streaming'], featured: false, badge: '' },
  { name: 'Standard', speed: 20, price: 800, features: ['Unlimited Data', 'BDIX Optimized', 'Multi-Device', 'Standard Support'], featured: true, badge: '⭐ Most Popular' },
  { name: 'Premium', speed: 50, price: 1200, features: ['Unlimited Data', 'Free Public IP', 'Priority Support', 'WFH Ready'], featured: false, badge: '' },
];

const BUSINESS_PLANS = [
  { name: 'SME', speed: 50, price: 2500, users: 'Up to 20 users', features: ['Dedicated Bandwidth', 'Static IP', 'SLA 99.9%', 'Business Support'], color: '#185FA5', bg: '#e6f1fb', popular: false },
  { name: 'Corporate', speed: 100, price: 4500, users: 'Up to 100 users', features: ['Dedicated Fiber Line', '2 Static IPs', 'SLA 99.99%', 'Account Manager', 'Priority Repair'], color: '#0F6E56', bg: '#e1f5ee', popular: true },
  { name: 'Enterprise', speed: 200, price: 8000, users: 'Unlimited users', features: ['Redundant Links', 'IP Block /29', 'Custom SLA', 'On-site Engineer', '4hr Response'], color: '#7B3FA0', bg: '#f3ebfb', popular: false },
];

const NETWORK_SERVICES = [
  { name: 'BDIX', status: 'operational', latency: '2ms', uptime: '100%' },
  { name: 'International Gateway', status: 'operational', latency: '18ms', uptime: '99.9%' },
  { name: 'YouTube CDN', status: 'operational', latency: '5ms', uptime: '100%' },
  { name: 'Facebook CDN', status: 'operational', latency: '4ms', uptime: '100%' },
  { name: 'DNS Server', status: 'operational', latency: '1ms', uptime: '100%' },
  { name: 'Core Router', status: 'maintenance', latency: '—', uptime: '99.8%' },
];

const WHY_US = [
  { icon: '⚡', title: 'Blazing Fast Fiber', desc: 'Pure fiber optic all the way to your home — no copper degradation, consistent speeds 24/7.' },
  { icon: '🛡️', title: 'BDIX Optimized', desc: 'Local content from YouTube, Facebook, Netflix at lightning speed through our BDIX peering.' },
  { icon: '📞', title: '2-Hour Support SLA', desc: 'Any issue reported is resolved within 2 hours. Our technicians are always on standby.' },
  { icon: '🔒', title: 'No Data Caps', desc: 'Truly unlimited internet. Download, stream, game — we never throttle your connection.' },
  { icon: '🌐', title: 'Free Static IP', desc: 'Premium and above plans include a free public static IP for remote work and servers.' },
  { icon: '💳', title: 'Easy Payment', desc: 'Pay via bKash, Nagad, Rocket, or bank transfer. Auto-reminders before due date.' },
];

const BLOG_POSTS = [
  {
    tag: 'Tips',
    title: 'How to Get the Best WiFi Coverage in Your Home',
    date: 'Apr 22, 2026',
    read: '4 min read',
    color: '#0F6E56',
    bg: '#e1f5ee',
    emoji: '💡',
    href: 'https://www.tp-link.com/us/support/faq/468/',
  },
  {
    tag: 'News',
    title: 'SanafISP Expands Coverage to Gazipur & Savar in Q3 2026',
    date: 'Apr 15, 2026',
    read: '2 min read',
    color: '#185FA5',
    bg: '#e6f1fb',
    emoji: '📡',
    href: 'https://blog.apnic.net/2025/11/03/bangladeshs-internet-transformation-from-satellite-shadows-to-digital-highways/',
  },
  {
    tag: 'Guide',
    title: 'WFH Setup: Choosing the Right Internet Plan for Remote Work',
    date: 'Apr 8, 2026',
    read: '6 min read',
    color: '#BA7517',
    bg: '#faeeda',
    emoji: '🖥️',
    href: 'https://broadbandnow.com/guides/internet-speed-work-from-home',
  },
];

const AREAS = [
  { name: 'Anodho Bazar', active: true },
  { name: 'Pordhani Chala', active: true },
  { name: 'Bagan Bari', active: true },
  { name: 'Aktapara', active: true },
  { name: 'Chokpara', active: false },
  { name: 'Gazipur', active: false },
];

const TESTIMONIALS = [
  { stars: 5, text: 'Been using it for 2 years now, not a single disconnection. Both speed and service are outstanding.', name: 'Didarul Islam', loc: 'Anodho Bazar', bg: '#e1f5ee', color: '#0F6E56' },
  { stars: 5, text: "Got the business package for our office. Static IP and dedicated support — didn't expect this much at this price.", name: 'Mehedi Miron', loc: 'Pordhani Chala', bg: '#faeeda', color: '#BA7517' },
  { stars: 4, text: 'Running 4K streaming and online gaming simultaneously on the Premium package — zero lag. Support responds even at midnight.', name: 'Sadia Rahman', loc: 'Bagan Bari', bg: '#e6f1fb', color: '#185FA5' },
];

const FAQS = [
  { q: 'How soon can I get a connection?', a: 'Our technician team will visit your home and set up the connection within 24-48 hours of application. In urgent cases, same-day connection is also possible.' },
  { q: 'Is there any connection fee?', a: 'A small installation charge may apply at the time of first connection. However, the connection fee is currently being waived for new customers under a special offer.' },
  { q: 'How do I pay my bill?', a: 'Pay your bill from home via bKash, Nagad, Rocket, or any bank transfer. You can also log in to our online portal to make payments.' },
  { q: 'Can I change my package?', a: 'You can upgrade or downgrade your package at any time. Just call our support line or send a message on WhatsApp.' },
  { q: 'Who do I contact for connection issues?', a: 'Our 24/7 support team is always ready. Raise a complaint via WhatsApp, phone, or our portal — issues are usually resolved within 2 hours.' },
];

const TEAM = [
  { name: 'Shadman Salim', role: 'Founder & CEO', desc: '10+ years of telecom experience. Local entrepreneur.', bg: '#e1f5ee', color: '#0F6E56' },
  { name: 'Maruf Ahmead', role: 'Customer Care Manager', desc: 'Committed to ensuring customer satisfaction.', bg: '#faeeda', color: '#BA7517' },
  { name: 'Masud Hossain', role: 'Network Engineer', desc: 'Expert in fiber infrastructure construction and maintenance.', bg: '#e6f1fb', color: '#185FA5' },
  { name: 'Rakibul Islam', role: 'Technical Support Lead', desc: 'Guaranteed problem resolution within 48 hours.', bg: '#fcebeb', color: '#A32D2D' },
];

/* ─────────────────────────────────────────
   NETWORK CANVAS
───────────────────────────────────────── */
function NetworkCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.offsetWidth; const H = canvas.offsetHeight;
    canvas.width = W * dpr; canvas.height = H * dpr; ctx.scale(dpr, dpr);
    type Node = { x: number; y: number; vx: number; vy: number; r: number; hub?: boolean };
    const nodes: Node[] = [];
    for (let i = 0; i < 18; i++) nodes.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4, r: Math.random() * 3 + 3 });
    nodes.push({ x: W / 2, y: H / 2, vx: 0, vy: 0, r: 12, hub: true });
    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const hub = nodes[nodes.length - 1];
      for (let i = 0; i < nodes.length - 1; i++) {
        const n = nodes[i]; const dx = n.x - hub.x; const dy = n.y - hub.y;
        const dist = Math.sqrt(dx * dx + dy * dy); const alpha = Math.max(0, 1 - dist / 200);
        ctx.beginPath(); ctx.moveTo(hub.x, hub.y); ctx.lineTo(n.x, n.y);
        ctx.strokeStyle = `rgba(15,110,86,${alpha * 0.35})`; ctx.lineWidth = 1; ctx.stroke();
        for (let j = i + 1; j < nodes.length - 1; j++) {
          const m = nodes[j]; const d2 = Math.sqrt((n.x - m.x) ** 2 + (n.y - m.y) ** 2);
          if (d2 < 120) { ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(m.x, m.y); ctx.strokeStyle = `rgba(15,110,86,${0.12 * (1 - d2 / 120)})`; ctx.lineWidth = 0.5; ctx.stroke(); }
        }
      }
      for (const n of nodes) {
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = n.hub ? '#0F6E56' : 'rgba(15,110,86,0.55)'; ctx.fill();
        if (n.hub) { ctx.beginPath(); ctx.arc(n.x, n.y, n.r + 6, 0, Math.PI * 2); ctx.strokeStyle = 'rgba(15,110,86,0.2)'; ctx.lineWidth = 2; ctx.stroke(); }
      }
      for (let i = 0; i < nodes.length - 1; i++) {
        const n = nodes[i]; n.x += n.vx; n.y += n.vy;
        if (n.x < 10 || n.x > W - 10) n.vx *= -1; if (n.y < 10 || n.y > H - 10) n.vy *= -1;
      }
      raf = requestAnimationFrame(draw);
    };
    draw(); return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />;
}

/* ─────────────────────────────────────────
   SPEED TEST
───────────────────────────────────────── */
function SpeedTest() {
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [speed, setSpeed] = useState(0);
  const [dl, setDl] = useState('—');
  const [ul, setUl] = useState('—');
  const [ping, setPing] = useState('—');
  const run = () => {
    if (running) return;
    setRunning(true); setDone(false); setSpeed(0); setDl('—'); setUl('—'); setPing('—');
    const maxSpeed = 18 + Math.random() * 6; const start = Date.now();
    const animate = () => {
      const p = Math.min((Date.now() - start) / 3000, 1);
      const ease = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;
      setSpeed(parseFloat((maxSpeed * ease).toFixed(1)));
      if (p < 1) { requestAnimationFrame(animate); }
      else { setDl(maxSpeed.toFixed(1) + ' Mbps'); setUl((maxSpeed * 0.45).toFixed(1) + ' Mbps'); setPing(Math.floor(8 + Math.random() * 12) + ' ms'); setRunning(false); setDone(true); }
    };
    requestAnimationFrame(animate);
  };
  const dashVal = (speed / 50) * 314;
  return (
    <div className="speed-box">
      <div className="speed-gauge">
        <svg className="gauge-svg" viewBox="0 0 180 180">
          <circle cx="90" cy="90" r="75" fill="none" stroke="#e8f0ed" strokeWidth="10" strokeDasharray="471 471" strokeDashoffset="-80" strokeLinecap="round" />
          <circle cx="90" cy="90" r="75" fill="none" stroke="#0F6E56" strokeWidth="10" strokeDasharray={`${dashVal} 471`} strokeDashoffset="-80" strokeLinecap="round" style={{ transition: 'stroke-dasharray 0.5s ease' }} />
        </svg>
        <div className="gauge-text"><div className="gauge-num">{speed.toFixed(1)}</div><div className="gauge-unit">Mbps</div></div>
      </div>
      <div className="speed-grid">
        <div className="speed-card"><div className="speed-card-val">{dl}</div><div className="speed-card-lbl">Download</div></div>
        <div className="speed-card"><div className="speed-card-val">{ul}</div><div className="speed-card-lbl">Upload</div></div>
      </div>
      <div style={{ fontSize: 12, color: '#999', marginBottom: 20 }}>Ping: {ping}</div>
      <button className="test-btn" onClick={run} disabled={running}>{running ? 'Testing...' : done ? 'Test Again' : 'Start Speed Test'}</button>
    </div>
  );
}

/* ─────────────────────────────────────────
   FAQ ITEM
───────────────────────────────────────── */
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`faq-item${open ? ' open' : ''}`}>
      <button className="faq-q" onClick={() => setOpen(o => !o)}>{q}<span className="faq-icon">+</span></button>
      <div className="faq-a">{a}</div>
    </div>
  );
}

/* ─────────────────────────────────────────
   NETWORK STATUS
───────────────────────────────────────── */
function NetworkStatus() {
  const allOk = NETWORK_SERVICES.filter(s => s.status === 'operational').length;
  return (
    <div className="status-wrap">
      <div className="status-banner">
        <span className="status-pulse" />
        <strong>{allOk} / {NETWORK_SERVICES.length} Systems Operational</strong>
        <span className="status-time">Last checked: just now</span>
      </div>
      <div className="status-grid">
        {NETWORK_SERVICES.map(s => (
          <div key={s.name} className="status-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className={`status-dot-sm ${s.status}`} />
              <span className="status-name">{s.name}</span>
            </div>
            <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
              <span className="status-meta">Latency: <strong>{s.latency}</strong></span>
              <span className="status-meta">Uptime: <strong>{s.uptime}</strong></span>
              <span className={`status-tag ${s.status}`}>{s.status === 'operational' ? 'Operational' : 'Maintenance'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   REFERRAL SECTION
───────────────────────────────────────── */
function ReferralSection() {
  const [copied, setCopied] = useState(false);
  const code = 'SANAF-REF-2026';
  const copy = () => { navigator.clipboard?.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <div className="referral-wrap">
      <div className="referral-left">
        <div className="referral-icon">🎁</div>
        <h3 className="referral-title">Refer a Friend, Earn Rewards</h3>
        <p className="referral-sub">Share your unique code. When your friend signs up and pays their first month, you both get <strong>1 month free!</strong></p>
        <div className="referral-steps">
          {['Share your code with a friend', 'They sign up using your code', 'Both of you get 1 month FREE'].map((s, i) => (
            <div key={i} className="ref-step"><div className="ref-num">{i + 1}</div><span>{s}</span></div>
          ))}
        </div>
      </div>
      <div className="referral-right">
        <div className="ref-card">
          <div className="ref-card-label">Your Referral Code</div>
          <div className="ref-code">{code}</div>
          <button className="ref-copy-btn" onClick={copy}>{copied ? '✓ Copied!' : 'Copy Code'}</button>
          <div className="ref-share-row">
            <span className="ref-share-lbl">Share via:</span>
            <a href="https://wa.me/8801736636777" target="_blank" rel="noopener noreferrer" className="ref-share-btn wa">WhatsApp</a>
            <button className="ref-share-btn fb">Facebook</button>
          </div>
          <div className="ref-earned"><span className="ref-earned-num">৳0</span><span className="ref-earned-lbl">Rewards Earned</span></div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   USE INTERSECTION OBSERVER
───────────────────────────────────────── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { el.classList.add('revealed'); obs.disconnect(); }
    }, { threshold: 0.12 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

/* ─────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────── */
export default function HomePage() {
  const navRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const onScroll = () => navRef.current?.classList.toggle('scrolled', window.scrollY > 40);
    window.addEventListener('scroll', onScroll); return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const whyRef = useReveal();
  const pkgRef = useReveal();
  const bizRef = useReveal();
  const testiRef = useReveal();
  const teamRef = useReveal();
  const blogRef = useReveal();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        :root{--green:#0F6E56;--green-dark:#085041;--green-light:#e1f5ee;--gold:#BA7517;--gold-light:#faeeda;--bg:#f4f8f6}
        body{font-family:'Sora',sans-serif;background:var(--bg);color:#111;overflow-x:hidden}
        .reveal{opacity:0;transform:translateY(32px);transition:opacity .65s ease,transform .65s ease}
        .reveal.revealed{opacity:1;transform:translateY(0)}
        .reveal .why-card,.reveal .pkg-card,.reveal .biz-card,.reveal .testi-card,.reveal .team-card,.reveal .blog-card{opacity:0;transform:translateY(24px);transition:opacity .5s ease,transform .5s ease,box-shadow .3s,border-color .3s}
        .reveal.revealed .why-card,.reveal.revealed .pkg-card,.reveal.revealed .biz-card,.reveal.revealed .testi-card,.reveal.revealed .team-card,.reveal.revealed .blog-card{opacity:1;transform:translateY(0)}
        .reveal.revealed .why-card:nth-child(1),.reveal.revealed .pkg-card:nth-child(1),.reveal.revealed .biz-card:nth-child(1),.reveal.revealed .testi-card:nth-child(1),.reveal.revealed .team-card:nth-child(1),.reveal.revealed .blog-card:nth-child(1){transition-delay:.05s}
        .reveal.revealed .why-card:nth-child(2),.reveal.revealed .pkg-card:nth-child(2),.reveal.revealed .biz-card:nth-child(2),.reveal.revealed .testi-card:nth-child(2),.reveal.revealed .team-card:nth-child(2),.reveal.revealed .blog-card:nth-child(2){transition-delay:.15s}
        .reveal.revealed .why-card:nth-child(3),.reveal.revealed .pkg-card:nth-child(3),.reveal.revealed .biz-card:nth-child(3),.reveal.revealed .testi-card:nth-child(3),.reveal.revealed .team-card:nth-child(3),.reveal.revealed .blog-card:nth-child(3){transition-delay:.25s}
        .reveal.revealed .why-card:nth-child(4),.reveal.revealed .pkg-card:nth-child(4),.reveal.revealed .team-card:nth-child(4){transition-delay:.35s}
        .reveal.revealed .why-card:nth-child(5){transition-delay:.45s}
        .reveal.revealed .why-card:nth-child(6){transition-delay:.55s}
        .isp-nav{position:fixed;top:0;left:0;right:0;z-index:1000;background:rgba(255,255,255,0.92);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-bottom:1px solid transparent;transition:border-color .3s,box-shadow .3s;padding:0 5vw}
        .isp-nav.scrolled{border-color:#e0ede8;box-shadow:0 4px 24px rgba(15,110,86,.09)}
        .nav-inner{max-width:1160px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;height:68px}
        .logo{font-size:22px;font-weight:900;color:var(--green);letter-spacing:-1px;text-decoration:none}
        .logo span{color:var(--gold)}
        .nav-links{display:flex;align-items:center;gap:24px}
        .nav-links a{font-size:13px;font-weight:600;color:#555;text-decoration:none;position:relative;padding-bottom:3px;transition:color .2s}
        .nav-links a::after{content:'';position:absolute;bottom:0;left:0;width:0;height:2px;background:var(--green);border-radius:2px;transition:width .25s}
        .nav-links a:hover{color:var(--green)}
        .nav-links a:hover::after{width:100%}
        .nav-btn{background:var(--green)!important;color:#fff!important;padding:9px 22px;border-radius:30px;font-size:13px;font-weight:700;border:none;cursor:pointer;font-family:'Sora',sans-serif;transition:background .2s,transform .2s;text-decoration:none;display:inline-block}
        .nav-btn:hover{background:var(--green-dark)!important;transform:translateY(-1px)}
        .nav-btn::after{display:none!important}
        .hero{min-height:100vh;background:linear-gradient(160deg,#e8f7f1 0%,#f9fffe 40%,#fffef8 100%);display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;padding-top:68px}
        .hero-orb{position:absolute;border-radius:50%;pointer-events:none}
        .orb1{width:520px;height:520px;background:radial-gradient(circle,rgba(15,110,86,.10) 0%,transparent 70%);top:-80px;right:-60px}
        .orb2{width:380px;height:380px;background:radial-gradient(circle,rgba(186,117,23,.08) 0%,transparent 70%);bottom:60px;left:-80px}
        .hero-content{max-width:1160px;width:100%;margin:0 auto;padding:80px 5vw;display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center}
        .hero-badge{display:inline-flex;align-items:center;gap:8px;background:var(--green-light);color:var(--green-dark);font-size:11px;font-weight:700;padding:6px 16px;border-radius:30px;margin-bottom:24px;text-transform:uppercase;letter-spacing:1.2px}
        .live-dot{width:7px;height:7px;background:var(--green);border-radius:50%;position:relative;flex-shrink:0}
        .live-dot::after{content:'';position:absolute;inset:-3px;border-radius:50%;border:2px solid var(--green);animation:ping 1.6s ease-out infinite;opacity:0}
        @keyframes ping{0%{transform:scale(1);opacity:.7}100%{transform:scale(2.2);opacity:0}}
        .hero-title{font-size:clamp(34px,4vw,58px);font-weight:900;line-height:1.08;letter-spacing:-2px;color:#0a0a0a;margin-bottom:20px}
        .hl{background:linear-gradient(90deg,#0F6E56,#1db87e,#0F6E56);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shimmer 3s linear infinite}
        @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
        .hero-sub{font-size:15px;color:#666;line-height:1.8;margin-bottom:32px;max-width:460px}
        .hero-btns{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:48px}
        .btn-primary{background:var(--green);color:#fff;padding:14px 30px;border-radius:50px;font-size:14px;font-weight:700;border:none;cursor:pointer;font-family:'Sora',sans-serif;box-shadow:0 6px 24px rgba(15,110,86,.32);transition:background .25s,transform .2s,box-shadow .25s;text-decoration:none;display:inline-block}
        .btn-primary:hover{background:var(--green-dark);transform:translateY(-2px);box-shadow:0 10px 32px rgba(15,110,86,.4)}
        .btn-outline{background:transparent;color:var(--green);padding:14px 30px;border-radius:50px;font-size:14px;font-weight:700;border:2px solid rgba(15,110,86,.25);cursor:pointer;font-family:'Sora',sans-serif;transition:border-color .25s,transform .2s;text-decoration:none;display:inline-block}
        .btn-outline:hover{border-color:var(--green);transform:translateY(-2px)}
        .hero-stats{display:grid;grid-template-columns:repeat(3,1fr);border:1px solid #e0ede8;border-radius:16px;overflow:hidden;background:#fff}
        .stat-item{padding:20px 16px;text-align:center;border-right:1px solid #e0ede8}
        .stat-item:last-child{border-right:none}
        .stat-num{font-size:26px;font-weight:900;color:var(--green);letter-spacing:-1px}
        .stat-lbl{font-size:11px;color:#999;margin-top:4px;font-weight:600;letter-spacing:.5px}
        .hero-right{position:relative;height:420px}
        @keyframes fadeUp{from{opacity:0;transform:translateY(36px)}to{opacity:1;transform:translateY(0)}}
        .hero-badge{animation:fadeUp .7s ease both}
        .hero-title{animation:fadeUp .7s .12s ease both}
        .hero-sub{animation:fadeUp .7s .22s ease both}
        .hero-btns{animation:fadeUp .7s .32s ease both}
        .hero-stats{animation:fadeUp .7s .42s ease both}
        .hero-right{animation:fadeUp .9s .2s ease both}
        .section{max-width:1160px;margin:0 auto;padding:80px 5vw}
        .section-header{text-align:center;margin-bottom:48px}
        .section-label{font-size:11px;font-weight:700;color:var(--green);text-transform:uppercase;letter-spacing:2px;margin-bottom:12px}
        .section-title{font-size:clamp(24px,3vw,36px);font-weight:800;color:#0a0a0a;letter-spacing:-1px;margin-bottom:12px}
        .section-sub{font-size:14px;color:#888;line-height:1.7}
        .whyus-bg{background:linear-gradient(160deg,#f0faf6 0%,#fff 100%)}
        .why-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
        .why-card{background:#fff;border:1.5px solid #e8f0ed;border-radius:20px;padding:28px 24px;transition:transform .3s,box-shadow .3s,border-color .3s}
        .why-card:hover{transform:translateY(-6px);box-shadow:0 20px 48px rgba(15,110,86,.11);border-color:var(--green)}
        .why-icon{font-size:36px;margin-bottom:16px}
        .why-title{font-size:15px;font-weight:800;color:#111;margin-bottom:8px}
        .why-desc{font-size:13px;color:#666;line-height:1.7}
        .packages-bg{background:#fff}
        .pkg-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px}
        .pkg-card{background:#fff;border:1.5px solid #e8f0ed;border-radius:24px;padding:28px 20px;text-align:center;position:relative;transition:transform .3s,box-shadow .3s,border-color .3s;cursor:pointer}
        .pkg-card:hover{transform:translateY(-8px);box-shadow:0 24px 56px rgba(15,110,86,.13);border-color:var(--green)}
        .pkg-card.featured{border:2px solid var(--green);background:linear-gradient(160deg,#f0faf6 0%,#fff 70%);transform:scale(1.04)}
        .pkg-card.featured:hover{transform:scale(1.04) translateY(-8px)}
        .pkg-badge-pill{position:absolute;top:-13px;left:50%;transform:translateX(-50%);background:var(--green);color:#fff;font-size:10px;font-weight:700;padding:4px 14px;border-radius:20px;letter-spacing:.8px;text-transform:uppercase;white-space:nowrap}
        .pkg-name{font-size:11px;font-weight:700;color:#999;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:16px}
        .pkg-speed{font-size:52px;font-weight:900;color:var(--green);line-height:1;letter-spacing:-3px}
        .pkg-unit{font-size:13px;font-weight:500;letter-spacing:0}
        .pkg-price{font-size:22px;font-weight:800;color:#111;margin:10px 0 6px}
        .pkg-price span{font-size:12px;font-weight:400;color:#999}
        .pkg-divider{border:none;border-top:1px solid #f0f0f0;margin:16px 0}
        .pkg-feature{font-size:12px;color:#555;margin:7px 0;text-align:left;display:flex;align-items:center;gap:7px}
        .pkg-check{color:var(--green);font-weight:800;font-size:13px}
        .pkg-btn{margin-top:20px;width:100%;padding:11px 0;border-radius:30px;font-size:13px;font-weight:700;cursor:pointer;font-family:'Sora',sans-serif;border:2px solid var(--green);color:var(--green);background:transparent;transition:all .25s;text-decoration:none;display:block}
        .pkg-btn:hover,.pkg-card.featured .pkg-btn{background:var(--green);color:#fff}
        .biz-bg{background:linear-gradient(160deg,#0a1f18 0%,#0d2d22 100%)}
        .biz-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
        .biz-card{border-radius:24px;padding:32px 24px;position:relative;transition:transform .3s,box-shadow .3s}
        .biz-card:hover{transform:translateY(-8px);box-shadow:0 28px 64px rgba(0,0,0,.35)}
        .biz-card.popular-biz{border:2px solid rgba(255,255,255,.25);background:rgba(255,255,255,.07)}
        .biz-card:not(.popular-biz){border:1.5px solid rgba(255,255,255,.08);background:rgba(255,255,255,.04)}
        .biz-popular-badge{position:absolute;top:-13px;left:50%;transform:translateX(-50%);background:#22c55e;color:#fff;font-size:10px;font-weight:700;padding:4px 14px;border-radius:20px;white-space:nowrap;letter-spacing:.8px}
        .biz-icon{width:48px;height:48px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:22px;margin-bottom:20px}
        .biz-name{font-size:11px;font-weight:700;color:rgba(255,255,255,.5);text-transform:uppercase;letter-spacing:2px;margin-bottom:8px}
        .biz-speed{font-size:44px;font-weight:900;color:#fff;line-height:1;letter-spacing:-2px}
        .biz-unit{font-size:12px;color:rgba(255,255,255,.5)}
        .biz-users{font-size:12px;color:rgba(255,255,255,.45);margin:6px 0 4px}
        .biz-price{font-size:24px;font-weight:800;color:#4ade80;margin:12px 0 16px}
        .biz-price span{font-size:12px;font-weight:400;color:rgba(255,255,255,.4)}
        .biz-divider{border:none;border-top:1px solid rgba(255,255,255,.08);margin:16px 0}
        .biz-feature{font-size:12px;color:rgba(255,255,255,.7);margin:8px 0;display:flex;align-items:center;gap:8px}
        .biz-check{color:#4ade80;font-weight:800}
        .biz-btn{margin-top:24px;width:100%;padding:12px 0;border-radius:30px;font-size:13px;font-weight:700;cursor:pointer;font-family:'Sora',sans-serif;border:1.5px solid rgba(255,255,255,.25);color:#fff;background:rgba(255,255,255,.08);transition:all .25s;text-decoration:none;display:block;text-align:center}
        .biz-btn:hover,.biz-card.popular-biz .biz-btn{background:#22c55e;border-color:#22c55e;color:#fff}
        .biz-section-label{font-size:11px;font-weight:700;color:#4ade80;text-transform:uppercase;letter-spacing:2px;margin-bottom:12px}
        .biz-section-title{font-size:clamp(24px,3vw,36px);font-weight:800;color:#fff;letter-spacing:-1px;margin-bottom:12px}
        .biz-section-sub{font-size:14px;color:rgba(255,255,255,.5);line-height:1.7}
        .netstatus-bg{background:var(--bg)}
        .status-wrap{max-width:800px;margin:0 auto}
        .status-banner{display:flex;align-items:center;gap:12px;background:var(--green-light);border:1.5px solid #b6e5d4;border-radius:14px;padding:14px 20px;margin-bottom:24px;font-size:13px;font-weight:600;color:var(--green-dark)}
        .status-time{margin-left:auto;font-size:11px;font-weight:400;color:#888}
        .status-pulse{width:10px;height:10px;border-radius:50%;background:#22c55e;position:relative;flex-shrink:0}
        .status-pulse::after{content:'';position:absolute;inset:-4px;border-radius:50%;border:2px solid #22c55e;animation:ping 1.8s ease-out infinite;opacity:0}
        .status-grid{display:flex;flex-direction:column;gap:10px}
        .status-row{display:flex;align-items:center;justify-content:space-between;background:#fff;border:1.5px solid #e8f0ed;border-radius:12px;padding:14px 20px;flex-wrap:wrap;gap:10px}
        .status-dot-sm{width:9px;height:9px;border-radius:50%;flex-shrink:0}
        .status-dot-sm.operational{background:#22c55e}
        .status-dot-sm.maintenance{background:#f59e0b}
        .status-name{font-size:13px;font-weight:700;color:#111}
        .status-meta{font-size:12px;color:#888}
        .status-meta strong{color:#333}
        .status-tag{font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px;text-transform:uppercase;letter-spacing:.6px}
        .status-tag.operational{background:#dcfce7;color:#16a34a}
        .status-tag.maintenance{background:#fef9c3;color:#b45309}
        .speedtest-bg{background:#fff}
        .speed-box{background:var(--bg);border-radius:28px;border:1.5px solid #e0ede8;padding:48px;text-align:center;max-width:520px;margin:0 auto}
        .speed-gauge{width:180px;height:180px;margin:0 auto 32px;position:relative}
        .gauge-svg{width:100%;height:100%}
        .gauge-text{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center}
        .gauge-num{font-size:36px;font-weight:900;color:var(--green);letter-spacing:-2px}
        .gauge-unit{font-size:12px;color:#999;font-weight:600}
        .speed-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:24px 0}
        .speed-card{background:var(--green-light);border-radius:14px;padding:16px;text-align:center}
        .speed-card-val{font-size:22px;font-weight:800;color:var(--green)}
        .speed-card-lbl{font-size:11px;color:#555;margin-top:4px;font-weight:600}
        .test-btn{background:var(--green);color:#fff;padding:14px 40px;border-radius:50px;font-size:14px;font-weight:700;border:none;cursor:pointer;font-family:'Sora',sans-serif;box-shadow:0 6px 24px rgba(15,110,86,.3);transition:all .25s}
        .test-btn:hover{background:var(--green-dark);transform:translateY(-2px)}
        .test-btn:disabled{opacity:.6;cursor:not-allowed;transform:none}
        .coverage-bg{background:var(--bg)}
        .coverage-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px}
        .area-card{background:#fff;border:1.5px solid #e0ede8;border-radius:14px;padding:16px 14px;display:flex;align-items:center;gap:10px;transition:all .25s}
        .area-card:hover{border-color:var(--green);background:var(--green-light);transform:translateY(-3px)}
        .area-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0}
        .area-dot.active{background:#22c55e}
        .area-dot.coming{background:#f59e0b}
        .area-name{font-size:13px;font-weight:600;color:#333}
        .area-status{font-size:10px;color:#888}
        .legend{display:flex;align-items:center;gap:24px;justify-content:center;margin-top:28px;font-size:12px;color:#666;flex-wrap:wrap}
        .legend-dot{width:10px;height:10px;border-radius:50%;display:inline-block;margin-right:6px;vertical-align:middle}
        .app-bg{background:#fff}
        .app-wrap{display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center}
        .app-mockup{background:var(--bg);border:1.5px solid #e0ede8;border-radius:32px;padding:32px;display:flex;flex-direction:column;gap:16px;box-shadow:0 20px 60px rgba(15,110,86,.08)}
        .app-mock-header{display:flex;align-items:center;gap:12px;padding-bottom:16px;border-bottom:1px solid #e8f0ed}
        .app-mock-logo{width:40px;height:40px;background:var(--green);border-radius:10px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:14px}
        .app-mock-title{font-size:14px;font-weight:800;color:#111}
        .app-mock-sub{font-size:11px;color:#999}
        .app-mock-stat{background:#fff;border:1.5px solid #e8f0ed;border-radius:12px;padding:14px 16px;display:flex;align-items:center;justify-content:space-between}
        .app-mock-stat-label{font-size:11px;color:#666;font-weight:600}
        .app-mock-stat-val{font-size:18px;font-weight:900;color:var(--green)}
        .app-mock-bar{height:8px;background:#e8f0ed;border-radius:8px;overflow:hidden}
        .app-mock-bar-fill{height:100%;border-radius:8px;background:linear-gradient(90deg,var(--green),#1db87e)}
        .app-features{display:flex;flex-direction:column;gap:12px;margin:24px 0}
        .app-feature-item{display:flex;align-items:center;gap:12px;font-size:13px;color:#444}
        .app-feature-icon{width:32px;height:32px;background:var(--green-light);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0}
        .app-btns{display:flex;gap:12px;flex-wrap:wrap}
        .app-store-btn{display:flex;align-items:center;gap:10px;background:#111;color:#fff;padding:12px 20px;border-radius:12px;font-family:'Sora',sans-serif;font-size:12px;font-weight:600;border:none;cursor:pointer;transition:background .2s,transform .2s}
        .app-store-btn:hover{background:#333;transform:translateY(-2px)}
        .app-store-icon{font-size:22px}
        .app-store-sub{font-size:10px;color:rgba(255,255,255,.6);font-weight:400}
        .referral-bg{background:linear-gradient(160deg,#fdf8ee 0%,#fffef8 100%)}
        .referral-wrap{display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center}
        .referral-icon{font-size:52px;margin-bottom:16px}
        .referral-title{font-size:clamp(22px,2.5vw,30px);font-weight:800;color:#111;margin-bottom:12px;letter-spacing:-1px}
        .referral-sub{font-size:14px;color:#666;line-height:1.7;margin-bottom:24px}
        .referral-steps{display:flex;flex-direction:column;gap:12px}
        .ref-step{display:flex;align-items:center;gap:14px;font-size:13px;color:#444;font-weight:500}
        .ref-num{width:28px;height:28px;border-radius:50%;background:var(--gold-light);color:var(--gold);font-size:12px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .ref-card{background:#fff;border:2px solid #f0e0b0;border-radius:24px;padding:32px;text-align:center;box-shadow:0 12px 40px rgba(186,117,23,.12)}
        .ref-card-label{font-size:11px;font-weight:700;color:#999;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:12px}
        .ref-code{font-size:20px;font-weight:900;color:#111;letter-spacing:3px;background:var(--gold-light);border:1.5px dashed #e8c97a;border-radius:12px;padding:14px 20px;margin-bottom:16px;font-family:monospace}
        .ref-copy-btn{width:100%;padding:12px 0;border-radius:30px;background:var(--gold);color:#fff;font-size:13px;font-weight:700;border:none;cursor:pointer;font-family:'Sora',sans-serif;transition:all .25s;margin-bottom:16px}
        .ref-copy-btn:hover{background:#9a6010;transform:translateY(-1px)}
        .ref-share-row{display:flex;align-items:center;gap:8px;justify-content:center;margin-bottom:20px;flex-wrap:wrap}
        .ref-share-lbl{font-size:12px;color:#888}
        .ref-share-btn{padding:6px 14px;border-radius:20px;font-size:11px;font-weight:700;border:none;cursor:pointer;font-family:'Sora',sans-serif;transition:transform .2s;text-decoration:none;display:inline-block}
        .ref-share-btn:hover{transform:translateY(-1px)}
        .ref-share-btn.wa{background:#25D366;color:#fff}
        .ref-share-btn.fb{background:#1877F2;color:#fff}
        .ref-earned{border-top:1px solid #f0f0f0;padding-top:16px;display:flex;flex-direction:column;align-items:center;gap:4px}
        .ref-earned-num{font-size:28px;font-weight:900;color:var(--gold)}
        .ref-earned-lbl{font-size:11px;color:#999;font-weight:600}
        .testi-bg{background:var(--bg)}
        .testi-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
        .testi-card{background:#fff;border-radius:20px;border:1.5px solid #e8f0ed;padding:24px;transition:transform .3s,box-shadow .3s}
        .testi-card:hover{transform:translateY(-5px);box-shadow:0 16px 40px rgba(15,110,86,.10)}
        .testi-stars{color:var(--gold);font-size:14px;margin-bottom:12px}
        .testi-text{font-size:13px;color:#444;line-height:1.75;margin-bottom:20px}
        .testi-author{display:flex;align-items:center;gap:12px}
        .testi-avatar{width:42px;height:42px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;flex-shrink:0}
        .testi-name{font-size:13px;font-weight:700;color:#111}
        .testi-loc{font-size:11px;color:#999;margin-top:2px}
        .blog-bg{background:#fff}
        .blog-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
        .blog-card{background:#f8fbf9;border:1.5px solid #e8f0ed;border-radius:20px;overflow:hidden;transition:transform .3s,box-shadow .3s,border-color .3s;cursor:pointer;text-decoration:none;display:block}
        .blog-card:hover{transform:translateY(-6px);box-shadow:0 20px 48px rgba(15,110,86,.12);border-color:var(--green)}
        .blog-thumb{height:140px;display:flex;align-items:center;justify-content:center;font-size:56px}
        .blog-body{padding:20px}
        .blog-tag{font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px;text-transform:uppercase;letter-spacing:.6px;display:inline-block;margin-bottom:10px}
        .blog-title{font-size:14px;font-weight:800;color:#111;line-height:1.45;margin-bottom:12px}
        .blog-meta{display:flex;align-items:center;justify-content:space-between;font-size:11px;color:#999}
        .blog-more{display:flex;align-items:center;justify-content:center;margin-top:36px}
        .faq-bg{background:var(--bg)}
        .faq-wrap{max-width:720px;margin:0 auto}
        .faq-item{border-bottom:1px solid #eef0ee}
        .faq-q{width:100%;background:none;border:none;cursor:pointer;display:flex;align-items:center;justify-content:space-between;padding:20px 0;font-family:'Sora',sans-serif;font-size:14px;font-weight:700;color:#111;text-align:left;transition:color .2s}
        .faq-q:hover{color:var(--green)}
        .faq-icon{width:28px;height:28px;border-radius:50%;background:var(--green-light);color:var(--green);display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:400;flex-shrink:0;transition:transform .3s,background .3s}
        .faq-item.open .faq-icon{transform:rotate(45deg);background:var(--green);color:#fff}
        .faq-a{max-height:0;overflow:hidden;font-size:13px;color:#666;line-height:1.8;transition:max-height .4s ease,padding .4s}
        .faq-item.open .faq-a{max-height:200px;padding-bottom:20px}
        .team-bg{background:#fff}
        .team-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:20px}
        .team-card{background:var(--bg);border-radius:20px;border:1.5px solid #e8f0ed;padding:28px 20px;text-align:center;transition:transform .3s,box-shadow .3s}
        .team-card:hover{transform:translateY(-5px);box-shadow:0 16px 40px rgba(15,110,86,.10)}
        .team-avatar{width:72px;height:72px;border-radius:50%;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:800}
        .team-name{font-size:15px;font-weight:700;color:#111;margin-bottom:4px}
        .team-role{font-size:12px;color:var(--green);font-weight:600;margin-bottom:8px}
        .team-desc{font-size:12px;color:#888;line-height:1.6}
        .contact-section{background:linear-gradient(135deg,#063d2f 0%,var(--green-dark) 50%,#0f6e56 100%)}
        .contact-inner{max-width:1160px;margin:0 auto;padding:80px 5vw;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:32px}
        .contact-title{font-size:clamp(22px,3vw,34px);font-weight:800;color:#fff;margin-bottom:10px}
        .contact-sub{font-size:14px;color:rgba(255,255,255,.7);line-height:1.7}
        .contact-btns{display:flex;gap:12px;flex-wrap:wrap}
        .btn-wa{background:#25D366;color:#fff;padding:14px 28px;border-radius:50px;font-size:14px;font-weight:700;border:none;cursor:pointer;font-family:'Sora',sans-serif;transition:transform .2s,box-shadow .2s;text-decoration:none;display:inline-flex;align-items:center;gap:8px}
        .btn-wa:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.25)}
        .btn-ghost{background:rgba(255,255,255,.1);color:#fff;padding:14px 28px;border-radius:50px;font-size:14px;font-weight:700;border:1.5px solid rgba(255,255,255,.25);cursor:pointer;font-family:'Sora',sans-serif;transition:background .2s;text-decoration:none;display:inline-flex;align-items:center;gap:8px}
        .btn-ghost:hover{background:rgba(255,255,255,.2)}
        .isp-footer{background:#0a0f0d;color:rgba(255,255,255,.5);padding:40px 5vw}
        .footer-inner{max-width:1160px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;font-size:13px}
        .footer-logo{font-size:18px;font-weight:900;color:#fff;letter-spacing:-1px}
        .footer-logo span{color:var(--gold)}
        .footer-links{display:flex;gap:24px;flex-wrap:wrap}
        .footer-links a{color:rgba(255,255,255,.45);text-decoration:none;font-size:12px;transition:color .2s}
        .footer-links a:hover{color:#fff}
        .float-wa{position:fixed;bottom:28px;right:28px;z-index:999;width:56px;height:56px;background:#25D366;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:26px;box-shadow:0 6px 24px rgba(37,211,102,.45);text-decoration:none;transition:transform .25s,box-shadow .25s;animation:waPop .5s 1.5s ease both}
        .float-wa:hover{transform:scale(1.12);box-shadow:0 10px 32px rgba(37,211,102,.6)}
        @keyframes waPop{from{opacity:0;transform:scale(.5)}to{opacity:1;transform:scale(1)}}
        @media(max-width:900px){.hero-content,.app-wrap,.referral-wrap{grid-template-columns:1fr;gap:40px}.hero-right{height:280px}.pkg-grid,.biz-grid,.why-grid,.blog-grid{grid-template-columns:1fr 1fr}.testi-grid{grid-template-columns:1fr}.pkg-card.featured{transform:none}.pkg-card.featured:hover{transform:translateY(-8px)}}
        @media(max-width:600px){.pkg-grid,.biz-grid,.why-grid,.blog-grid{grid-template-columns:1fr}.nav-links a:not(.nav-btn){display:none}.contact-inner{flex-direction:column;align-items:flex-start}.status-row{flex-direction:column;align-items:flex-start}}
      `}</style>

      <a href="https://wa.me/8801723133845" target="_blank" rel="noopener noreferrer" className="float-wa" title="Chat on WhatsApp">💬</a>

      <nav ref={navRef} className="isp-nav">
        <div className="nav-inner">
          <Link href="/" className="logo">Sanaf<span>ISP</span>.net</Link>
          <div className="nav-links">
            <a href="#packages">Packages</a>
            <a href="#business">Business</a>
            <a href="#status">Network</a>
            <a href="#coverage">Coverage</a>
            <a href="#app">App</a>
            <a href="#faq">FAQ</a>
            <a href="#contact">Contact</a>
            <Link href="/login" className="nav-btn">Login</Link>
          </div>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-orb orb1" /><div className="hero-orb orb2" />
        <div className="hero-content">
          <div>
            <div className="hero-badge"><div className="live-dot" />Ultra-fast fiber internet</div>
            <h1 className="hero-title">In Your Area <br /><span className="hl">The best fiber.</span><br />Network</h1>
            <p className="hero-sub">Uninterrupted high-speed connectivity and 24/7 dedicated support at affordable prices. Join our family of 500+ satisfied customers today.</p>
            <div className="hero-btns">
              <Link href="/register" className="btn-primary">Get Connected →</Link>
              <a href="#packages" className="btn-outline">View Packages</a>
            </div>
            <div className="hero-stats">
              <div className="stat-item"><div className="stat-num">500+</div><div className="stat-lbl">Happy Customers</div></div>
              <div className="stat-item"><div className="stat-num">99.9%</div><div className="stat-lbl">Uptime</div></div>
              <div className="stat-item"><div className="stat-num">24/7</div><div className="stat-lbl">Support</div></div>
            </div>
          </div>
          <div className="hero-right"><NetworkCanvas /></div>
        </div>
      </section>

      <section id="whyus" className="whyus-bg">
        <div className="section">
          <div className="section-header">
            <div className="section-label">Why SanafISP</div>
            <h2 className="section-title">Everything You Need, Nothing You Don't</h2>
            <p className="section-sub">Built for Dhaka. Designed for reliability. Priced for everyone.</p>
          </div>
          <div ref={whyRef} className="why-grid reveal">
            {WHY_US.map(w => (
              <div key={w.title} className="why-card">
                <div className="why-icon">{w.icon}</div>
                <div className="why-title">{w.title}</div>
                <div className="why-desc">{w.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="packages" className="packages-bg">
        <div className="section">
          <div className="section-header">
            <div className="section-label">Home Packages</div>
            <h2 className="section-title">Choose Your Preferred Plan</h2>
            <p className="section-sub">Simple pricing, no hidden charges. Change anytime.</p>
          </div>
          <div ref={pkgRef} className="pkg-grid reveal">
            {PACKAGES.map(pkg => (
              <div key={pkg.name} className={`pkg-card${pkg.featured ? ' featured' : ''}`}>
                {pkg.badge && <div className="pkg-badge-pill">{pkg.badge}</div>}
                <div className="pkg-name">{pkg.name}</div>
                <div className="pkg-speed">{pkg.speed}<span className="pkg-unit"> Mbps</span></div>
                <div className="pkg-price">৳{pkg.price} <span>/ month</span></div>
                <hr className="pkg-divider" />
                {pkg.features.map(f => <div key={f} className="pkg-feature"><span className="pkg-check">✓</span> {f}</div>)}
                <Link href={`/register?package=${pkg.name}`} className="pkg-btn">Get It Now ↗</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="business" className="biz-bg">
        <div className="section">
          <div className="section-header">
            <div className="biz-section-label">Business & Corporate</div>
            <h2 className="biz-section-title">Enterprise-Grade Connectivity</h2>
            <p className="biz-section-sub">Dedicated bandwidth, guaranteed SLAs, and a named account manager for your business.</p>
          </div>
          <div ref={bizRef} className="biz-grid reveal">
            {BUSINESS_PLANS.map(b => (
              <div key={b.name} className={`biz-card${b.popular ? ' popular-biz' : ''}`}>
                {b.popular && <div className="biz-popular-badge">⭐ Most Chosen</div>}
                <div className="biz-icon" style={{ background: b.bg, color: b.color }}>🏢</div>
                <div className="biz-name">{b.name}</div>
                <div className="biz-speed">{b.speed}<span className="biz-unit"> Mbps</span></div>
                <div className="biz-users">{b.users}</div>
                <div className="biz-price">৳{b.price.toLocaleString()} <span>/ month</span></div>
                <hr className="biz-divider" />
                {b.features.map(f => <div key={f} className="biz-feature"><span className="biz-check">✓</span> {f}</div>)}
                <Link href={`/register?package=${b.name}`} className="biz-btn">
                  Get a Quote →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="status" className="netstatus-bg">
        <div className="section">
          <div className="section-header">
            <div className="section-label">Live Network Status</div>
            <h2 className="section-title">Real-Time System Health</h2>
            <p className="section-sub">Live monitoring of all network nodes and services</p>
          </div>
          <NetworkStatus />
        </div>
      </section>

      <section id="speedtest" className="speedtest-bg">
        <div className="section">
          <div className="section-header">
            <div className="section-label">Speed Test</div>
            <h2 className="section-title">How Fast Is Your Internet?</h2>
            <p className="section-sub">Test your current connection speed right now</p>
          </div>
          <SpeedTest />
        </div>
      </section>

      <section id="coverage" className="coverage-bg">
        <div className="section">
          <div className="section-header">
            <div className="section-label">Coverage Areas</div>
            <h2 className="section-title">Where Are We Available?</h2>
            <p className="section-sub">Contact us to get a connection in your area</p>
          </div>
          <div className="coverage-grid">
            {AREAS.map(a => (
              <div key={a.name} className="area-card">
                <span className={`area-dot ${a.active ? 'active' : 'coming'}`} />
                <div><div className="area-name">{a.name}</div><div className="area-status">{a.active ? 'Active' : 'Coming Soon'}</div></div>
              </div>
            ))}
          </div>
          <div className="legend">
            <span><span className="legend-dot" style={{ background: '#22c55e' }} />Active Area</span>
            <span><span className="legend-dot" style={{ background: '#f59e0b' }} />Coming Soon</span>
          </div>
        </div>
      </section>

      <section id="app" className="app-bg">
        <div className="section">
          <div className="app-wrap">
            <div>
              <div className="section-label" style={{ textAlign: 'left' }}>Mobile App</div>
              <h2 className="section-title" style={{ textAlign: 'left' }}>Manage Your Internet<br />From Your Phone</h2>
              <p className="section-sub" style={{ textAlign: 'left', marginBottom: 24 }}>Check your usage, pay bills, raise support tickets, and monitor your connection speed — all from the SanafISP app.</p>
              <div className="app-features">
                {[['📊', 'Live usage & speed monitor'], ['💳', 'One-tap bill payment (bKash, Nagad)'], ['🎫', 'Instant support ticket submission'], ['🔔', 'Bill due & outage notifications']].map(([icon, txt]) => (
                  <div key={txt as string} className="app-feature-item">
                    <div className="app-feature-icon">{icon}</div>{txt}
                  </div>
                ))}
              </div>
              <div className="app-btns">
                <button className="app-store-btn"><div className="app-store-icon">🤖</div><div><div className="app-store-sub">Get it on</div><div>Google Play</div></div></button>
                <button className="app-store-btn"><div className="app-store-icon">🍎</div><div><div className="app-store-sub">Download on the</div><div>App Store</div></div></button>
              </div>
            </div>
            <div className="app-mockup">
              <div className="app-mock-header">
                <div className="app-mock-logo">SI</div>
                <div><div className="app-mock-title">SanafISP App</div><div className="app-mock-sub">Account Dashboard</div></div>
              </div>
              <div className="app-mock-stat"><span className="app-mock-stat-label">📶 Current Speed</span><span className="app-mock-stat-val">22.4 Mbps</span></div>
              <div className="app-mock-stat"><span className="app-mock-stat-label">📦 Data Used This Month</span><span className="app-mock-stat-val">Unlimited ∞</span></div>
              <div style={{ background: '#fff', border: '1.5px solid #e8f0ed', borderRadius: 12, padding: '14px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#999', marginBottom: 8 }}><span>Monthly Bill</span><span>Due Apr 30</span></div>
                <div className="app-mock-bar"><div className="app-mock-bar-fill" style={{ width: '100%' }} /></div>
                <div style={{ fontSize: 11, color: '#16a34a', marginTop: 6, fontWeight: 700 }}>৳800 — Paid ✓</div>
              </div>
              <div className="app-mock-stat"><span className="app-mock-stat-label">⏱ Uptime This Month</span><span className="app-mock-stat-val">99.9%</span></div>
            </div>
          </div>
        </div>
      </section>

      <section id="referral" className="referral-bg">
        <div className="section"><ReferralSection /></div>
      </section>

      <section id="testimonials" className="testi-bg">
        <div className="section">
          <div className="section-header">
            <div className="section-label">Customer Reviews</div>
            <h2 className="section-title">What Our Customers Say</h2>
            <p className="section-sub">Some experiences from 500+ satisfied customers</p>
          </div>
          <div ref={testiRef} className="testi-grid reveal">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="testi-card">
                <div className="testi-stars">{'★'.repeat(t.stars)}{'☆'.repeat(5 - t.stars)}</div>
                <p className="testi-text">&ldquo;{t.text}&rdquo;</p>
                <div className="testi-author">
                  <div className="testi-avatar" style={{ background: t.bg, color: t.color }}>{getInitials(t.name)}</div>
                  <div><div className="testi-name">{t.name}</div><div className="testi-loc">{t.loc}</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="blog" className="blog-bg">
        <div className="section">
          <div className="section-header">
            <div className="section-label">Blog & News</div>
            <h2 className="section-title">Tips, Guides & Updates</h2>
            <p className="section-sub">Stay informed with the latest from SanafISP</p>
          </div>
          <div ref={blogRef} className="blog-grid reveal">
            {BLOG_POSTS.map(p => (
              <a key={p.title} href={p.href} className="blog-card" target="_blank" rel="noopener noreferrer">
                <div className="blog-thumb" style={{ background: p.bg }}>{p.emoji}</div>
                <div className="blog-body">
                  <div className="blog-tag" style={{ background: p.bg, color: p.color }}>{p.tag}</div>
                  <div className="blog-title">{p.title}</div>
                  <div className="blog-meta"><span>{p.date}</span><span>{p.read}</span></div>
                </div>
              </a>
            ))}
          </div>
          <div className="blog-more"><a href="https://blog.apnic.net" target="_blank" rel="noopener noreferrer" className="btn-outline">View All Articles →</a></div>
        </div>
      </section>

      <section id="faq" className="faq-bg">
        <div className="section">
          <div className="section-header">
            <div className="section-label">Frequently Asked Questions</div>
            <h2 className="section-title">What You Want to Know</h2>
          </div>
          <div className="faq-wrap">{FAQS.map(f => <FaqItem key={f.q} q={f.q} a={f.a} />)}</div>
        </div>
      </section>

      <section id="team" className="team-bg">
        <div className="section">
          <div className="section-header">
            <div className="section-label">Our Team</div>
            <h2 className="section-title">Meet the People Behind Us</h2>
            <p className="section-sub">An experienced and dedicated team always ready to serve you</p>
          </div>
          <div ref={teamRef} className="team-grid reveal">
            {TEAM.map(m => (
              <div key={m.name} className="team-card">
                <div className="team-avatar" style={{ background: m.bg, color: m.color }}>{getInitials(m.name)}</div>
                <div className="team-name">{m.name}</div>
                <div className="team-role">{m.role}</div>
                <div className="team-desc">{m.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="contact-section">
        <div className="contact-inner">
          <div>
            <h3 className="contact-title">We Are Here for You Whenever You Need</h3>
            <p className="contact-sub">
              Contact us for new connections or technical support<br />
              Our team is ready to serve you 24/7<br />
              <span style={{ opacity: .85 }}>📞 01723-133845 &nbsp;|&nbsp; ✉️ mdsalimahmed3331@gmail.com</span>
            </p>
          </div>
          <div className="contact-btns">
            <a href="https://wa.me/8801723133845" target="_blank" rel="noopener noreferrer" className="btn-wa">💬 WhatsApp Us</a>
            <Link href="/support" className="btn-ghost">📋 File a Complaint</Link>
            <a href="tel:+8801723133845" className="btn-ghost">📞 Call Us</a>
          </div>
        </div>
      </section>

      <footer className="isp-footer">
        <div className="footer-inner">
          <div>
            <div className="footer-logo">Sanaf<span>ISP</span>.net</div>
            <div style={{ marginTop: 6, fontSize: 12 }}>© 2026 All Rights Reserved</div>
          </div>
          <div className="footer-links">
            <Link href="/privacy-policy">Privacy Policy</Link>
            <Link href="/terms">Terms & Conditions</Link>
            <a href="https://www.google.com/maps/search/Anodho+Bazar,+Dhaka,+Bangladesh" target="_blank" rel="noopener noreferrer">Sitemap</a>
            <a href="mailto:mdsalimahmed3331@gmail.com">Contact</a>
          </div>
        </div>
      </footer>
    </>
  );
}
