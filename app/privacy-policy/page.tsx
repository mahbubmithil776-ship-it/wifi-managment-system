'use client';
import Link from 'next/link';
import { useEffect, useRef } from 'react';

const SECTIONS = [
  {
    icon: '📋',
    title: 'Information We Collect',
    content: `We collect the following information from our customers:
• Full name, phone number, email address, and home address — for connection setup
• Payment details (bKash/Nagad/Rocket numbers) — for billing and invoicing
• Network usage data — to monitor and improve service quality
• Device and browser information — for technical support purposes`
  },
  {
    icon: '🔒',
    title: 'Data Security',
    content: `We are fully committed to keeping your personal data safe:
• All data is stored on encrypted, secure servers
• We never sell or share your information with third parties
• Only authorized staff members have access to your personal data
• Regular security audits are conducted to maintain data integrity`
  },
  {
    icon: '📡',
    title: 'Network Data Usage',
    content: `We use network data for the following purposes only:
• Monitoring and improving connection quality
• Diagnosing and resolving network issues quickly
• Managing bandwidth allocation fairly across all users
• We do NOT monitor or log individual browsing history`
  },
  {
    icon: '🍪',
    title: 'Cookie Policy',
    content: `Our website uses cookies for the following purposes:
• Keeping your login session active
• Improving overall website functionality and performance
• Analyzing traffic patterns (via Google Analytics)
• You can disable cookies at any time from your browser settings`
  },
  {
    icon: '👤',
    title: 'Your Rights',
    content: `As a customer, you have the following rights:
• Right to request access to your stored personal data
• Right to request correction of any inaccurate information
• Right to request deletion of your data upon account closure
• To exercise these rights, contact: mdsalimahmed3331@gmail.com`
  },
  {
    icon: '🔄',
    title: 'Policy Updates',
    content: `When this Privacy Policy is updated:
• A notice will be posted on our website
• Registered customers will be notified via SMS or email
• For significant changes, at least 7 days' prior notice will be given
• Last updated: May 2026`
  },
];

export default function PrivacyPolicy() {
  const navRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const onScroll = () => navRef.current?.classList.toggle('scrolled', window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        :root{--green:#0F6E56;--green-dark:#085041;--green-light:#e1f5ee;--gold:#BA7517;--gold-light:#faeeda;--bg:#f4f8f6}
        body{font-family:'Sora',sans-serif;background:var(--bg);color:#111;overflow-x:hidden}
        .isp-nav{position:fixed;top:0;left:0;right:0;z-index:1000;background:rgba(255,255,255,0.95);backdrop-filter:blur(12px);border-bottom:1px solid transparent;transition:border-color .3s,box-shadow .3s;padding:0 5vw}
        .isp-nav.scrolled{border-color:#e0ede8;box-shadow:0 4px 24px rgba(15,110,86,.09)}
        .nav-inner{max-width:1160px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;height:68px}
        .logo{font-size:22px;font-weight:900;color:var(--green);letter-spacing:-1px;text-decoration:none}
        .logo span{color:var(--gold)}
        .nav-back{display:inline-flex;align-items:center;gap:8px;font-size:13px;font-weight:600;color:#555;text-decoration:none;padding:8px 16px;border-radius:30px;border:1.5px solid #e0ede8;transition:all .2s}
        .nav-back:hover{border-color:var(--green);color:var(--green);background:var(--green-light)}
        .page-hero{background:linear-gradient(160deg,#e8f7f1 0%,#f9fffe 60%,#fffef8 100%);padding:120px 5vw 64px;text-align:center}
        .page-hero-inner{max-width:700px;margin:0 auto}
        .page-badge{display:inline-flex;align-items:center;gap:8px;background:var(--green-light);color:var(--green-dark);font-size:11px;font-weight:700;padding:6px 16px;border-radius:30px;margin-bottom:20px;text-transform:uppercase;letter-spacing:1.2px}
        .page-title{font-size:clamp(30px,4vw,48px);font-weight:900;color:#0a0a0a;letter-spacing:-2px;margin-bottom:16px;line-height:1.1}
        .page-sub{font-size:14px;color:#777;line-height:1.8}
        .page-updated{display:inline-block;margin-top:16px;font-size:11px;color:#999;background:#fff;border:1px solid #e0ede8;padding:4px 14px;border-radius:20px}
        .content-wrap{max-width:860px;margin:0 auto;padding:64px 5vw 80px}
        .intro-card{background:#fff;border:1.5px solid #e8f0ed;border-radius:20px;padding:28px 32px;margin-bottom:48px;display:flex;gap:20px;align-items:flex-start}
        .intro-icon{font-size:32px;flex-shrink:0;margin-top:4px}
        .intro-text{font-size:13px;color:#555;line-height:1.85}
        .intro-text strong{color:#111;font-weight:700}
        .sections-grid{display:flex;flex-direction:column;gap:20px}
        .section-card{background:#fff;border:1.5px solid #e8f0ed;border-radius:20px;padding:28px 32px;transition:border-color .25s,box-shadow .25s}
        .section-card:hover{border-color:#b6e5d4;box-shadow:0 8px 32px rgba(15,110,86,.07)}
        .section-card-header{display:flex;align-items:center;gap:14px;margin-bottom:16px}
        .section-card-icon{width:44px;height:44px;background:var(--green-light);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0}
        .section-card-title{font-size:16px;font-weight:800;color:#111}
        .section-card-body{font-size:13px;color:#555;line-height:2;white-space:pre-line;padding-left:58px}
        .contact-cta{background:linear-gradient(135deg,#063d2f 0%,var(--green-dark) 100%);border-radius:24px;padding:40px;text-align:center;margin-top:48px}
        .cta-title{font-size:20px;font-weight:800;color:#fff;margin-bottom:10px}
        .cta-sub{font-size:13px;color:rgba(255,255,255,.65);line-height:1.7;margin-bottom:24px}
        .cta-btn{display:inline-flex;align-items:center;gap:8px;background:#fff;color:var(--green);padding:12px 28px;border-radius:50px;font-size:13px;font-weight:700;text-decoration:none;transition:transform .2s,box-shadow .2s}
        .cta-btn:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.2)}
        .isp-footer{background:#0a0f0d;color:rgba(255,255,255,.5);padding:32px 5vw}
        .footer-inner{max-width:1160px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;font-size:13px}
        .footer-logo{font-size:18px;font-weight:900;color:#fff;letter-spacing:-1px}
        .footer-logo span{color:var(--gold)}
        .footer-links{display:flex;gap:24px;flex-wrap:wrap}
        .footer-links a{color:rgba(255,255,255,.45);text-decoration:none;font-size:12px;transition:color .2s}
        .footer-links a:hover{color:#fff}
        @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        .page-hero-inner{animation:fadeUp .7s ease both}
        .intro-card{animation:fadeUp .7s .1s ease both}
        .section-card:nth-child(1){animation:fadeUp .6s .15s ease both}
        .section-card:nth-child(2){animation:fadeUp .6s .22s ease both}
        .section-card:nth-child(3){animation:fadeUp .6s .29s ease both}
        .section-card:nth-child(4){animation:fadeUp .6s .36s ease both}
        .section-card:nth-child(5){animation:fadeUp .6s .43s ease both}
        .section-card:nth-child(6){animation:fadeUp .6s .50s ease both}
        @media(max-width:600px){.section-card-body{padding-left:0}.intro-card{flex-direction:column;gap:12px}.contact-cta{padding:28px 20px}}
      `}</style>

      <nav ref={navRef} className="isp-nav">
        <div className="nav-inner">
          <Link href="/" className="logo">Sanaf<span>ISP</span>.net</Link>
          <Link href="/" className="nav-back">← Back to Home</Link>
        </div>
      </nav>

      <div className="page-hero">
        <div className="page-hero-inner">
          <div className="page-badge">🔒 Legal</div>
          <h1 className="page-title">Privacy Policy</h1>
          <p className="page-sub">SanafISP is fully committed to protecting your personal information.<br />Please read this policy to understand how your data is collected and used.</p>
          <div className="page-updated">Last Updated: May 2026</div>
        </div>
      </div>

      <div className="content-wrap">
        <div className="intro-card">
          <div className="intro-icon">ℹ️</div>
          <div className="intro-text">
            <strong>SanafISP</strong> (owned by Md. Salim Ahmed) is an internet service provider based in Dhaka, Bangladesh. By using our services, you agree to this Privacy Policy. We will never sell your personal information to any third party.
          </div>
        </div>

        <div className="sections-grid">
          {SECTIONS.map((s) => (
            <div key={s.title} className="section-card">
              <div className="section-card-header">
                <div className="section-card-icon">{s.icon}</div>
                <div className="section-card-title">{s.title}</div>
              </div>
              <div className="section-card-body">{s.content}</div>
            </div>
          ))}
        </div>

        <div className="contact-cta">
          <div className="cta-title">Have a Question?</div>
          <div className="cta-sub">For any privacy-related concerns, feel free to reach out to us.<br />We will respond within 24 hours.</div>
          <a href="mailto:mdsalimahmed3331@gmail.com" className="cta-btn">✉️ Send us an Email</a>
        </div>
      </div>

      <footer className="isp-footer">
        <div className="footer-inner">
          <div>
            <div className="footer-logo">Sanaf<span>ISP</span>.net</div>
            <div style={{ marginTop: 6, fontSize: 12 }}>© 2026 All Rights Reserved</div>
          </div>
          <div className="footer-links">
            <Link href="/privacy-policy">Privacy Policy</Link>
            <Link href="/terms">Terms & Conditions</Link>
            <a href="mailto:mdsalimahmed3331@gmail.com">Contact</a>
          </div>
        </div>
      </footer>
    </>
  );
}
