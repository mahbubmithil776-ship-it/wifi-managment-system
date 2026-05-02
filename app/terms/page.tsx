'use client';
import Link from 'next/link';
import { useEffect, useRef } from 'react';

const SECTIONS = [
  {
    icon: '✅',
    title: 'Eligibility',
    content: `To use SanafISP services, you must meet the following requirements:
• Applicant must be at least 18 years of age
• A valid National ID card or passport must be provided
• You must register with accurate and truthful information
• You must reside within our current coverage area`
  },
  {
    icon: '💳',
    title: 'Payment & Billing',
    content: `Rules regarding bill payment:
• Bills must be paid between the 1st and 7th of each month
• A late fee may apply if payment is made after the due date
• Connections will be suspended if bills remain unpaid for more than 7 days
• Accepted payment methods: bKash, Nagad, Rocket, or bank transfer
• We recommend keeping a copy of your payment receipt`
  },
  {
    icon: '🌐',
    title: 'Acceptable Use Policy',
    content: `The following activities are strictly prohibited on our network:
• Downloading or distributing illegal or copyrighted content
• Unauthorized access to other networks or computer systems
• Sending spam emails or spreading malicious software
• Violating BTRC (Bangladesh Telecommunication Regulatory Commission) guidelines
• Violation of these rules may result in immediate termination without notice`
  },
  {
    icon: '⚙️',
    title: 'Connection & Installation',
    content: `Terms related to connection setup:
• Connection will be provided within 24–48 hours of application
• Installation charges apply once (currently waived for new customers)
• The router and cable remain the property of SanafISP and must be returned upon disconnection
• Customers must provide access to their premises during installation`
  },
  {
    icon: '🔧',
    title: 'Service Level Agreement (SLA)',
    content: `Our service quality guarantees:
• Home Plans: 99.9% uptime guarantee
• Corporate Plans: 99.99% uptime guarantee
• All reported issues will be resolved within 2 hours wherever possible
• Scheduled maintenance notices will be sent at least 24 hours in advance
• Bill credits may apply for extended outages`
  },
  {
    icon: '🔄',
    title: 'Package Changes & Cancellation',
    content: `Rules for changing or cancelling your package:
• You can upgrade your package at any time
• Package downgrades take effect from the next billing month
• A 7-day written notice is required to cancel your connection
• No refund will be issued for unused days in the current billing period
• Referral rewards will be forfeited on cancelled accounts`
  },
  {
    icon: '⚖️',
    title: 'Legal & Liability',
    content: `Legal terms and conditions:
• This agreement is governed by the laws of Bangladesh
• Disputes will first be attempted to be resolved through mutual discussion
• SanafISP reserves the right to update these terms at any time
• We are not liable for service disruptions caused by natural disasters or force majeure events`
  },
];

export default function TermsAndConditions() {
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
        .page-hero{background:linear-gradient(160deg,#faeeda 0%,#fffef8 50%,#f9fffe 100%);padding:120px 5vw 64px;text-align:center}
        .page-hero-inner{max-width:700px;margin:0 auto}
        .page-badge{display:inline-flex;align-items:center;gap:8px;background:var(--gold-light);color:#7a4f10;font-size:11px;font-weight:700;padding:6px 16px;border-radius:30px;margin-bottom:20px;text-transform:uppercase;letter-spacing:1.2px}
        .page-title{font-size:clamp(30px,4vw,48px);font-weight:900;color:#0a0a0a;letter-spacing:-2px;margin-bottom:16px;line-height:1.1}
        .page-sub{font-size:14px;color:#777;line-height:1.8}
        .page-updated{display:inline-block;margin-top:16px;font-size:11px;color:#999;background:#fff;border:1px solid #e8d9b0;padding:4px 14px;border-radius:20px}
        .content-wrap{max-width:860px;margin:0 auto;padding:64px 5vw 80px}
        .intro-card{background:#fff;border:1.5px solid #f0e0b0;border-radius:20px;padding:28px 32px;margin-bottom:48px;display:flex;gap:20px;align-items:flex-start}
        .intro-icon{font-size:32px;flex-shrink:0;margin-top:4px}
        .intro-text{font-size:13px;color:#555;line-height:1.85}
        .intro-text strong{color:#111;font-weight:700}
        .toc{background:var(--gold-light);border:1.5px solid #e8d9b0;border-radius:16px;padding:24px 28px;margin-bottom:40px}
        .toc-title{font-size:12px;font-weight:700;color:#7a4f10;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:16px}
        .toc-list{display:flex;flex-direction:column;gap:8px}
        .toc-item{display:flex;align-items:center;gap:10px;font-size:13px;color:#555;font-weight:500}
        .toc-num{width:22px;height:22px;border-radius:50%;background:var(--gold);color:#fff;font-size:10px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .sections-grid{display:flex;flex-direction:column;gap:20px}
        .section-card{background:#fff;border:1.5px solid #e8f0ed;border-radius:20px;padding:28px 32px;transition:border-color .25s,box-shadow .25s}
        .section-card:hover{border-color:#b6e5d4;box-shadow:0 8px 32px rgba(15,110,86,.07)}
        .section-num{font-size:10px;font-weight:700;color:var(--gold);text-transform:uppercase;letter-spacing:2px;margin-bottom:10px}
        .section-card-header{display:flex;align-items:center;gap:14px;margin-bottom:16px}
        .section-card-icon{width:44px;height:44px;background:var(--green-light);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0}
        .section-card-title{font-size:16px;font-weight:800;color:#111}
        .section-card-body{font-size:13px;color:#555;line-height:2;white-space:pre-line;padding-left:58px}
        .agree-box{background:linear-gradient(135deg,#063d2f 0%,var(--green-dark) 100%);border-radius:24px;padding:40px;text-align:center;margin-top:48px}
        .agree-title{font-size:20px;font-weight:800;color:#fff;margin-bottom:10px}
        .agree-sub{font-size:13px;color:rgba(255,255,255,.65);line-height:1.7;margin-bottom:24px}
        .agree-btns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
        .agree-btn-primary{display:inline-flex;align-items:center;gap:8px;background:#fff;color:var(--green);padding:12px 28px;border-radius:50px;font-size:13px;font-weight:700;text-decoration:none;transition:transform .2s,box-shadow .2s}
        .agree-btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.2)}
        .agree-btn-ghost{display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,.1);color:#fff;padding:12px 28px;border-radius:50px;font-size:13px;font-weight:700;text-decoration:none;border:1.5px solid rgba(255,255,255,.25);transition:background .2s}
        .agree-btn-ghost:hover{background:rgba(255,255,255,.2)}
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
        .toc{animation:fadeUp .6s .15s ease both}
        .section-card:nth-child(1){animation:fadeUp .6s .2s ease both}
        .section-card:nth-child(2){animation:fadeUp .6s .27s ease both}
        .section-card:nth-child(3){animation:fadeUp .6s .34s ease both}
        .section-card:nth-child(4){animation:fadeUp .6s .41s ease both}
        .section-card:nth-child(5){animation:fadeUp .6s .48s ease both}
        .section-card:nth-child(6){animation:fadeUp .6s .55s ease both}
        .section-card:nth-child(7){animation:fadeUp .6s .62s ease both}
        @media(max-width:600px){.section-card-body{padding-left:0}.intro-card{flex-direction:column;gap:12px}.agree-box{padding:28px 20px}}
      `}</style>

      <nav ref={navRef} className="isp-nav">
        <div className="nav-inner">
          <Link href="/" className="logo">Sanaf<span>ISP</span>.net</Link>
          <Link href="/" className="nav-back">← Back to Home</Link>
        </div>
      </nav>

      <div className="page-hero">
        <div className="page-hero-inner">
          <div className="page-badge">⚖️ Legal</div>
          <h1 className="page-title">Terms & Conditions</h1>
          <p className="page-sub">Please read these terms carefully before using SanafISP services.<br />By using our service, you agree to be bound by these terms.</p>
          <div className="page-updated">Last Updated: May 2026</div>
        </div>
      </div>

      <div className="content-wrap">
        <div className="intro-card">
          <div className="intro-icon">📜</div>
          <div className="intro-text">
            These Terms & Conditions form a legal agreement between <strong>SanafISP</strong> and the customer. If you do not agree with any of these terms, please do not use our services. If you have any questions, please contact us before signing up.
          </div>
        </div>

        <div className="toc">
          <div className="toc-title">Table of Contents</div>
          <div className="toc-list">
            {SECTIONS.map((s, i) => (
              <div key={i} className="toc-item">
                <div className="toc-num">{i + 1}</div>
                <span>{s.title}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="sections-grid">
          {SECTIONS.map((s, i) => (
            <div key={s.title} className="section-card">
              <div className="section-num">Section {i + 1}</div>
              <div className="section-card-header">
                <div className="section-card-icon">{s.icon}</div>
                <div className="section-card-title">{s.title}</div>
              </div>
              <div className="section-card-body">{s.content}</div>
            </div>
          ))}
        </div>

        <div className="agree-box">
          <div className="agree-title">Ready to Get Connected?</div>
          <div className="agree-sub">By registering with SanafISP, you agree to these Terms & Conditions.<br />Have a question before signing up? We're happy to help.</div>
          <div className="agree-btns">
            <Link href="/register" className="agree-btn-primary">✅ Register Now</Link>
            <a href="https://wa.me/8801723133845" target="_blank" rel="noopener noreferrer" className="agree-btn-ghost">💬 Ask a Question</a>
          </div>
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
