'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

type ComplaintType = '' | 'slow' | 'nonet' | 'billing' | 'hardware' | 'newconn' | 'other';
type Priority = 'normal' | 'urgent' | 'critical';
type Step = 1 | 2 | 3;

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function StepBar({ step }: { step: Step }) {
  const steps = ['Your Info', 'Issue Details', 'Review & Submit'];
  return (
    <div className="step-bar">
      {steps.map((label, i) => {
        const n = (i + 1) as Step;
        const active = step === n;
        const done = step > n;
        return (
          <div key={label} className="step-item">
            <div className={`step-circle ${active ? 'active' : done ? 'done' : ''}`}>
              {done ? '✓' : n}
            </div>
            <div className={`step-label ${active ? 'active' : done ? 'done' : ''}`}>{label}</div>
            {i < steps.length - 1 && <div className={`step-line ${done ? 'done' : ''}`} />}
          </div>
        );
      })}
    </div>
  );
}

function SuccessScreen({ ticketId }: { ticketId: string }) {
  return (
    <div className="success-wrap">
      <div className="success-icon">✓</div>
      <h2 className="success-title">Complaint Submitted Successfully!</h2>
      <p className="success-sub">
        Our support team has received your complaint and will contact you soon.<br />
        Issues are usually resolved within 2 hours.
      </p>
      <div className="ticket-box">
        <div className="ticket-label">Your Ticket Number</div>
        <div className="ticket-id">{ticketId}</div>
        <div className="ticket-hint">Save this number — you may need it when contacting support</div>
      </div>
      <div className="success-actions">
        <a href="https://wa.me/8801605952881" target="_blank" rel="noopener noreferrer" className="btn-wa-sm">
          💬 Follow up on WhatsApp
        </a>
        <Link href="/" className="btn-outline-sm">← Back to Home</Link>
      </div>
    </div>
  );
}

export default function SupportPage() {
  const navRef = useRef<HTMLElement>(null);
  const [step, setStep] = useState<Step>(1);
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [area, setArea] = useState('');
  const [type, setType] = useState<ComplaintType>('');
  const [priority, setPriority] = useState<Priority>('normal');
  const [description, setDescription] = useState('');
  const [contactPref, setContactPref] = useState<'phone' | 'whatsapp'>('phone');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const onScroll = () => navRef.current?.classList.toggle('scrolled', window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Please enter your name';
    if (!phone.trim() || !/^01[3-9]\d{8}$/.test(phone.trim())) e.phone = 'Enter a valid phone number';
    if (!area) e.area = 'Please select your area';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (!type) e.type = 'Please select a complaint type';
    if (!description.trim() || description.trim().length < 20) e.description = 'Please write at least 20 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    if (step === 2 && validateStep2()) setStep(3);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch(`${API_BASE}/users/complaints/public`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          customerId,
          area,
          contactPref,
          type,
          subject: type,   // subject field ও পূরণ হবে (existing column)
          priority,
          description,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data.message || 'Something went wrong. Please try again.');
        return;
      }

      setTicketId(data.ticketId);
      setSubmitted(true);
    } catch {
      setSubmitError('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const TYPE_LABELS: Record<string, string> = {
    slow: 'Slow Internet / Low Speed',
    nonet: 'No Connection / Disconnected',
    billing: 'Billing Issue',
    hardware: 'Device / Router Problem',
    newconn: 'New Connection Request',
    other: 'Other',
  };

  const PRIORITY_LABELS: Record<Priority, string> = {
    normal: 'Normal', urgent: 'Urgent', critical: 'Critical',
  };

  const AREAS = ['Anodho Bazar', 'Pordhani Chala', 'Bagan Bari', 'Aktapara', 'Chokpara', 'Other'];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        :root{--green:#0F6E56;--green-dark:#085041;--green-light:#e1f5ee;--gold:#BA7517;--gold-light:#faeeda;--bg:#f4f8f6;--red:#dc2626;--red-light:#fef2f2}
        body{font-family:'Sora',sans-serif;background:var(--bg);color:#111;overflow-x:hidden}
        .isp-nav{position:fixed;top:0;left:0;right:0;z-index:1000;background:rgba(255,255,255,0.92);backdrop-filter:blur(12px);border-bottom:1px solid transparent;transition:border-color .3s,box-shadow .3s;padding:0 5vw}
        .isp-nav.scrolled{border-color:#e0ede8;box-shadow:0 4px 24px rgba(15,110,86,.09)}
        .nav-inner{max-width:1160px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;height:68px}
        .logo{font-size:22px;font-weight:900;color:var(--green);letter-spacing:-1px;text-decoration:none}
        .logo span{color:var(--gold)}
        .nav-links{display:flex;align-items:center;gap:24px}
        .nav-links a{font-size:13px;font-weight:600;color:#555;text-decoration:none;position:relative;padding-bottom:3px;transition:color .2s}
        .nav-links a::after{content:'';position:absolute;bottom:0;left:0;width:0;height:2px;background:var(--green);border-radius:2px;transition:width .25s}
        .nav-links a:hover{color:var(--green)}
        .nav-links a:hover::after{width:100%}
        .nav-btn{background:var(--green)!important;color:#fff!important;padding:9px 22px;border-radius:30px;font-size:13px;font-weight:700;text-decoration:none;display:inline-block;transition:background .2s}
        .nav-btn:hover{background:var(--green-dark)!important}
        .nav-btn::after{display:none!important}
        .support-hero{background:linear-gradient(160deg,#063d2f 0%,var(--green-dark) 50%,#0f6e56 100%);padding:120px 5vw 60px;text-align:center;position:relative;overflow:hidden}
        .support-hero::before{content:'';position:absolute;inset:0;background:url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")}
        .hero-badge-sm{display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,.12);color:rgba(255,255,255,.9);font-size:11px;font-weight:700;padding:6px 16px;border-radius:30px;margin-bottom:20px;text-transform:uppercase;letter-spacing:1.2px;border:1px solid rgba(255,255,255,.15)}
        .support-hero h1{font-size:clamp(28px,4vw,48px);font-weight:900;color:#fff;letter-spacing:-2px;margin-bottom:12px}
        .support-hero p{font-size:14px;color:rgba(255,255,255,.7);line-height:1.7;max-width:480px;margin:0 auto}
        .support-body{max-width:900px;margin:0 auto;padding:40px 5vw 80px}
        .step-bar{display:flex;align-items:center;justify-content:center;margin-bottom:40px}
        .step-item{display:flex;align-items:center}
        .step-circle{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;background:#fff;border:2px solid #d0ddd8;color:#aaa;transition:all .3s;flex-shrink:0}
        .step-circle.active{background:var(--green);border-color:var(--green);color:#fff;box-shadow:0 4px 16px rgba(15,110,86,.35)}
        .step-circle.done{background:var(--green-light);border-color:var(--green);color:var(--green)}
        .step-label{font-size:11px;font-weight:600;color:#aaa;margin-left:8px;white-space:nowrap;transition:color .3s}
        .step-label.active{color:var(--green)}
        .step-label.done{color:var(--green-dark)}
        .step-line{width:60px;height:2px;background:#e0ede8;margin:0 8px;transition:background .3s}
        .step-line.done{background:var(--green)}
        .form-card{background:#fff;border-radius:24px;border:1.5px solid #e0ede8;padding:36px;box-shadow:0 8px 32px rgba(15,110,86,.06)}
        .support-layout{display:grid;grid-template-columns:1fr 300px;gap:28px;align-items:start}
        .field{margin-bottom:20px}
        .field-label{font-size:12px;font-weight:700;color:#555;margin-bottom:6px;display:flex;align-items:center;gap:4px}
        .req{color:var(--red);font-size:14px;line-height:1}
        .field input,.field select,.field textarea{width:100%;padding:11px 14px;border-radius:12px;border:1.5px solid #e0ede8;font-size:13px;font-family:'Sora',sans-serif;color:#111;background:#fafcfb;transition:border-color .2s,box-shadow .2s;outline:none}
        .field input:focus,.field select:focus,.field textarea:focus{border-color:var(--green);box-shadow:0 0 0 3px rgba(15,110,86,.10);background:#fff}
        .field input.err,.field select.err,.field textarea.err{border-color:var(--red);background:var(--red-light)}
        .field-error{font-size:11px;color:var(--red);margin-top:5px;font-weight:600}
        .field textarea{resize:vertical;min-height:120px;line-height:1.7}
        .field-row{display:grid;grid-template-columns:1fr 1fr;gap:16px}
        .priority-group{display:flex;gap:10px;flex-wrap:wrap}
        .priority-chip{padding:9px 18px;border-radius:30px;font-size:12px;font-weight:700;cursor:pointer;border:1.5px solid #e0ede8;color:#888;background:#fff;font-family:'Sora',sans-serif;transition:all .2s}
        .priority-chip.normal.sel{border-color:var(--green);color:var(--green);background:var(--green-light)}
        .priority-chip.urgent.sel{border-color:#d97706;color:#d97706;background:#fef3c7}
        .priority-chip.critical.sel{border-color:var(--red);color:var(--red);background:var(--red-light)}
        .pref-group{display:flex;gap:10px}
        .pref-chip{padding:9px 18px;border-radius:30px;font-size:12px;font-weight:700;cursor:pointer;border:1.5px solid #e0ede8;color:#888;background:#fff;font-family:'Sora',sans-serif;transition:all .2s}
        .pref-chip.sel{border-color:var(--green);color:var(--green);background:var(--green-light)}
        .type-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
        .type-chip{padding:12px 10px;border-radius:14px;border:1.5px solid #e0ede8;background:#fafcfb;cursor:pointer;text-align:center;font-size:12px;font-weight:600;color:#666;transition:all .2s;font-family:'Sora',sans-serif}
        .type-chip:hover{border-color:var(--green);color:var(--green)}
        .type-chip.sel{border-color:var(--green);background:var(--green-light);color:var(--green)}
        .type-icon{font-size:22px;display:block;margin-bottom:6px}
        .review-section{margin-bottom:20px}
        .review-title{font-size:11px;font-weight:700;color:var(--green);text-transform:uppercase;letter-spacing:1.5px;margin-bottom:12px;padding-bottom:8px;border-bottom:1px solid #e8f0ed}
        .review-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
        .review-item{background:var(--bg);border-radius:12px;padding:12px 16px}
        .review-item-label{font-size:10px;font-weight:700;color:#999;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px}
        .review-item-val{font-size:13px;font-weight:600;color:#111}
        .review-desc{background:var(--bg);border-radius:12px;padding:14px 16px;margin-top:10px}
        .review-desc p{font-size:13px;color:#444;line-height:1.7}
        .priority-badge{display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:700}
        .priority-badge.normal{background:var(--green-light);color:var(--green)}
        .priority-badge.urgent{background:#fef3c7;color:#d97706}
        .priority-badge.critical{background:var(--red-light);color:var(--red)}
        .btn-row{display:flex;gap:12px;justify-content:space-between;margin-top:28px;padding-top:24px;border-top:1px solid #f0f0f0}
        .btn-primary{background:var(--green);color:#fff;padding:13px 28px;border-radius:50px;font-size:14px;font-weight:700;border:none;cursor:pointer;font-family:'Sora',sans-serif;box-shadow:0 6px 24px rgba(15,110,86,.3);transition:all .25s;display:inline-flex;align-items:center;gap:8px}
        .btn-primary:hover{background:var(--green-dark);transform:translateY(-2px)}
        .btn-primary:disabled{opacity:.6;cursor:not-allowed;transform:none;box-shadow:none}
        .btn-back{background:transparent;color:#888;padding:13px 20px;border-radius:50px;font-size:14px;font-weight:600;border:1.5px solid #e0ede8;cursor:pointer;font-family:'Sora',sans-serif;transition:all .2s}
        .btn-back:hover{border-color:#aaa;color:#555}
        .error-banner{background:var(--red-light);border:1.5px solid #fca5a5;border-radius:12px;padding:12px 16px;font-size:13px;color:var(--red);font-weight:600;margin-top:16px;display:flex;align-items:center;gap:8px}
        .success-wrap{text-align:center;padding:60px 20px}
        .success-icon{width:80px;height:80px;border-radius:50%;background:var(--green-light);border:3px solid var(--green);color:var(--green);font-size:36px;font-weight:900;display:flex;align-items:center;justify-content:center;margin:0 auto 24px}
        .success-title{font-size:26px;font-weight:900;color:#111;letter-spacing:-1px;margin-bottom:12px}
        .success-sub{font-size:14px;color:#666;line-height:1.8;margin-bottom:32px}
        .ticket-box{background:var(--bg);border:2px dashed #b6e5d4;border-radius:20px;padding:28px;margin:0 auto 32px;max-width:360px}
        .ticket-label{font-size:11px;font-weight:700;color:#999;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:10px}
        .ticket-id{font-size:26px;font-weight:900;color:var(--green);letter-spacing:3px;font-family:monospace;margin-bottom:10px}
        .ticket-hint{font-size:11px;color:#999;line-height:1.6}
        .success-actions{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
        .btn-wa-sm{background:#25D366;color:#fff;padding:12px 22px;border-radius:50px;font-size:13px;font-weight:700;text-decoration:none;display:inline-flex;align-items:center;gap:6px;transition:transform .2s}
        .btn-wa-sm:hover{transform:translateY(-2px)}
        .btn-outline-sm{background:transparent;color:var(--green);padding:12px 22px;border-radius:50px;font-size:13px;font-weight:700;border:2px solid rgba(15,110,86,.25);text-decoration:none;display:inline-flex;align-items:center;gap:6px}
        .btn-outline-sm:hover{border-color:var(--green)}
        .sidebar{display:flex;flex-direction:column;gap:16px}
        .sidebar-card{background:#fff;border-radius:20px;border:1.5px solid #e0ede8;padding:24px}
        .sidebar-card h4{font-size:13px;font-weight:800;color:#111;margin-bottom:14px}
        .sidebar-contact-item{display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid #f0f0f0}
        .sidebar-contact-item:last-child{border-bottom:none}
        .sidebar-icon{width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0}
        .sidebar-contact-label{font-size:10px;color:#999;font-weight:600;display:block}
        .sidebar-contact-val{font-size:12px;color:#111;font-weight:700;text-decoration:none}
        .sidebar-contact-val:hover{color:var(--green)}
        .sla-item{display:flex;align-items:center;gap:10px;margin-bottom:12px;font-size:12px;color:#555}
        .sla-icon{font-size:18px}
        .sla-label{font-weight:700;color:#111;display:block;font-size:12px}
        @keyframes spin{to{transform:rotate(360deg)}}
        .spinner{width:18px;height:18px;border:2px solid rgba(255,255,255,.4);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite}
        .float-wa{position:fixed;bottom:28px;right:28px;z-index:999;width:56px;height:56px;background:#25D366;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:26px;box-shadow:0 6px 24px rgba(37,211,102,.45);text-decoration:none;transition:transform .25s}
        .float-wa:hover{transform:scale(1.12)}
        .isp-footer{background:#0a0f0d;color:rgba(255,255,255,.5);padding:40px 5vw}
        .footer-inner{max-width:1160px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px}
        .footer-logo{font-size:18px;font-weight:900;color:#fff;letter-spacing:-1px}
        .footer-logo span{color:var(--gold)}
        .footer-links{display:flex;gap:24px;flex-wrap:wrap}
        .footer-links a{color:rgba(255,255,255,.45);text-decoration:none;font-size:12px;transition:color .2s}
        .footer-links a:hover{color:#fff}
        @media(max-width:768px){.support-layout{grid-template-columns:1fr}.sidebar{order:-1}.field-row{grid-template-columns:1fr}.type-grid{grid-template-columns:repeat(2,1fr)}.review-grid{grid-template-columns:1fr}.step-label{display:none}.step-line{width:40px}.nav-links a:not(.nav-btn){display:none}.form-card{padding:24px}}
      `}</style>

      <a href="https://wa.me/8801605952881" target="_blank" rel="noopener noreferrer" className="float-wa">💬</a>

      <nav ref={navRef} className="isp-nav">
        <div className="nav-inner">
          <Link href="/" className="logo">Sanaf<span>ISP</span>.net</Link>
          <div className="nav-links">
            <a href="/#packages">Packages</a>
            <a href="/#business">Business</a>
            <a href="/#status">Network</a>
            <a href="/#coverage">Coverage</a>
            <a href="/#faq">FAQ</a>
            <a href="/#contact">Contact</a>
            <Link href="/login" className="nav-btn">Login</Link>
          </div>
        </div>
      </nav>

      <div className="support-hero">
        <div className="hero-badge-sm">📋 Support Center</div>
        <h1>File a Complaint</h1>
        <p>Tell us about your issue and our support team will get back to you. We guarantee resolution within 2 hours.</p>
      </div>

      <div className="support-body">
        {submitted ? (
          <div className="form-card"><SuccessScreen ticketId={ticketId} /></div>
        ) : (
          <>
            <StepBar step={step} />
            <div className="support-layout">
              <div className="form-card">

                {/* ── STEP 1 ── */}
                {step === 1 && (
                  <>
                    <div style={{ marginBottom: 28 }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: '#111', marginBottom: 4 }}>Your Information</div>
                      <div style={{ fontSize: 12, color: '#999' }}>Provide accurate details so we can reach you</div>
                    </div>
                    <div className="field-row">
                      <div className="field">
                        <div className="field-label">Full Name <span className="req">*</span></div>
                        <input type="text" placeholder="e.g. Mohammad Hasan" value={name}
                          onChange={e => setName(e.target.value)} className={errors.name ? 'err' : ''} />
                        {errors.name && <div className="field-error">⚠ {errors.name}</div>}
                      </div>
                      <div className="field">
                        <div className="field-label">Phone Number <span className="req">*</span></div>
                        <input type="tel" placeholder="01XXXXXXXXX" value={phone}
                          onChange={e => setPhone(e.target.value)} className={errors.phone ? 'err' : ''} />
                        {errors.phone && <div className="field-error">⚠ {errors.phone}</div>}
                      </div>
                    </div>
                    <div className="field-row">
                      <div className="field">
                        <div className="field-label">Customer ID (optional)</div>
                        <input type="text" placeholder="e.g. SNF-00123" value={customerId}
                          onChange={e => setCustomerId(e.target.value)} />
                      </div>
                      <div className="field">
                        <div className="field-label">Area <span className="req">*</span></div>
                        <select value={area} onChange={e => setArea(e.target.value)} className={errors.area ? 'err' : ''}>
                          <option value="">-- Select your area --</option>
                          {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                        </select>
                        {errors.area && <div className="field-error">⚠ {errors.area}</div>}
                      </div>
                    </div>
                    <div className="field">
                      <div className="field-label">Preferred Contact Method</div>
                      <div className="pref-group">
                        <button type="button" className={`pref-chip ${contactPref === 'phone' ? 'sel' : ''}`}
                          onClick={() => setContactPref('phone')}>📞 Phone Call</button>
                        <button type="button" className={`pref-chip ${contactPref === 'whatsapp' ? 'sel' : ''}`}
                          onClick={() => setContactPref('whatsapp')}>💬 WhatsApp</button>
                      </div>
                    </div>
                    <div className="btn-row" style={{ justifyContent: 'flex-end' }}>
                      <button className="btn-primary" onClick={handleNext}>Next Step →</button>
                    </div>
                  </>
                )}

                {/* ── STEP 2 ── */}
                {step === 2 && (
                  <>
                    <div style={{ marginBottom: 28 }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: '#111', marginBottom: 4 }}>Issue Details</div>
                      <div style={{ fontSize: 12, color: '#999' }}>Tell us more about the problem you are facing</div>
                    </div>
                    <div className="field">
                      <div className="field-label">Complaint Type <span className="req">*</span></div>
                      <div className="type-grid">
                        {[
                          { val: 'slow', icon: '🐢', label: 'Slow Internet' },
                          { val: 'nonet', icon: '❌', label: 'No Connection' },
                          { val: 'billing', icon: '💳', label: 'Billing Issue' },
                          { val: 'hardware', icon: '📡', label: 'Router Problem' },
                          { val: 'newconn', icon: '🔌', label: 'New Connection' },
                          { val: 'other', icon: '💬', label: 'Other' },
                        ].map(t => (
                          <button key={t.val} type="button"
                            className={`type-chip ${type === t.val ? 'sel' : ''}`}
                            onClick={() => setType(t.val as ComplaintType)}>
                            <span className="type-icon">{t.icon}</span>{t.label}
                          </button>
                        ))}
                      </div>
                      {errors.type && <div className="field-error" style={{ marginTop: 8 }}>⚠ {errors.type}</div>}
                    </div>
                    <div className="field">
                      <div className="field-label">Description <span className="req">*</span></div>
                      <textarea
                        placeholder="When did the issue start? How is it affecting you? — Describe in detail..."
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        className={errors.description ? 'err' : ''}
                      />
                      <div style={{ fontSize: 11, color: description.length < 20 ? '#f59e0b' : '#22c55e', marginTop: 4, fontWeight: 600 }}>
                        {description.length} characters {description.length < 20 ? `(${20 - description.length} more needed)` : '✓'}
                      </div>
                      {errors.description && <div className="field-error">⚠ {errors.description}</div>}
                    </div>
                    <div className="field">
                      <div className="field-label">Priority</div>
                      <div className="priority-group">
                        {(['normal', 'urgent', 'critical'] as Priority[]).map(p => (
                          <button key={p} type="button"
                            className={`priority-chip ${p} ${priority === p ? 'sel' : ''}`}
                            onClick={() => setPriority(p)}>
                            {p === 'normal' ? '🟢' : p === 'urgent' ? '🟡' : '🔴'} {PRIORITY_LABELS[p]}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="btn-row">
                      <button className="btn-back" onClick={() => setStep(1)}>← Back</button>
                      <button className="btn-primary" onClick={handleNext}>Review →</button>
                    </div>
                  </>
                )}

                {/* ── STEP 3 ── */}
                {step === 3 && (
                  <>
                    <div style={{ marginBottom: 28 }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: '#111', marginBottom: 4 }}>Review & Submit</div>
                      <div style={{ fontSize: 12, color: '#999' }}>Please verify your information before submitting</div>
                    </div>
                    <div className="review-section">
                      <div className="review-title">Personal Information</div>
                      <div className="review-grid">
                        <div className="review-item"><div className="review-item-label">Name</div><div className="review-item-val">{name}</div></div>
                        <div className="review-item"><div className="review-item-label">Phone</div><div className="review-item-val">{phone}</div></div>
                        <div className="review-item"><div className="review-item-label">Area</div><div className="review-item-val">{area}</div></div>
                        <div className="review-item"><div className="review-item-label">Customer ID</div><div className="review-item-val">{customerId || '—'}</div></div>
                        <div className="review-item"><div className="review-item-label">Contact Preference</div><div className="review-item-val">{contactPref === 'phone' ? '📞 Phone Call' : '💬 WhatsApp'}</div></div>
                      </div>
                    </div>
                    <div className="review-section">
                      <div className="review-title">Issue Details</div>
                      <div className="review-grid">
                        <div className="review-item"><div className="review-item-label">Type</div><div className="review-item-val">{type ? TYPE_LABELS[type] : '—'}</div></div>
                        <div className="review-item">
                          <div className="review-item-label">Priority</div>
                          <div className="review-item-val">
                            <span className={`priority-badge ${priority}`}>
                              {priority === 'normal' ? '🟢' : priority === 'urgent' ? '🟡' : '🔴'} {PRIORITY_LABELS[priority]}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="review-desc">
                        <div className="review-item-label" style={{ marginBottom: 8 }}>Description</div>
                        <p>{description}</p>
                      </div>
                    </div>
                    {submitError && <div className="error-banner">⚠ {submitError}</div>}
                    <div className="btn-row">
                      <button className="btn-back" onClick={() => setStep(2)}>← Back</button>
                      <button className="btn-primary" onClick={handleSubmit} disabled={submitting}>
                        {submitting ? <><div className="spinner" /> Submitting...</> : '✓ Submit Complaint'}
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* SIDEBAR */}
              <div className="sidebar">
                <div className="sidebar-card">
                  <h4>📞 Contact Us Directly</h4>
                  <div className="sidebar-contact-item">
                    <div className="sidebar-icon" style={{ background: '#e1f5ee' }}>📞</div>
                    <div><span className="sidebar-contact-label">Phone</span>
                      <a href="tel:+8801723133845" className="sidebar-contact-val">01723-133845</a></div>
                  </div>
                  <div className="sidebar-contact-item">
                    <div className="sidebar-icon" style={{ background: '#dcfce7' }}>💬</div>
                    <div><span className="sidebar-contact-label">WhatsApp</span>
                      <a href="https://wa.me/8801605952881" target="_blank" rel="noopener noreferrer" className="sidebar-contact-val">01605-952881</a></div>
                  </div>
                  <div className="sidebar-contact-item">
                    <div className="sidebar-icon" style={{ background: '#e6f1fb' }}>✉️</div>
                    <div><span className="sidebar-contact-label">Email</span>
                      <a href="mailto:mdsalimahmed3331@gmail.com" className="sidebar-contact-val" style={{ fontSize: 11 }}>mdsalimahmed3331@gmail.com</a></div>
                  </div>
                </div>
                <div className="sidebar-card">
                  <h4>⚡ Resolution SLA</h4>
                  <div className="sla-item"><span className="sla-icon">🔴</span><div><span className="sla-label">Critical</span>Within 1 hour</div></div>
                  <div className="sla-item"><span className="sla-icon">🟡</span><div><span className="sla-label">Urgent</span>Within 2 hours</div></div>
                  <div className="sla-item"><span className="sla-icon">🟢</span><div><span className="sla-label">Normal</span>Within 24 hours</div></div>
                </div>
                <div className="sidebar-card" style={{ background: 'linear-gradient(135deg,#063d2f,#0f6e56)', border: 'none' }}>
                  <h4 style={{ color: '#fff' }}>💬 Chat on WhatsApp</h4>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,.7)', lineHeight: 1.6, marginBottom: 16 }}>
                    Message us directly for the fastest support response.
                  </p>
                  <a href="https://wa.me/8801605952881" target="_blank" rel="noopener noreferrer"
                    style={{ display: 'block', background: '#25D366', color: '#fff', padding: '11px 0', borderRadius: 30, fontSize: 13, fontWeight: 700, textAlign: 'center', textDecoration: 'none' }}>
                    💬 WhatsApp Us
                  </a>
                </div>
              </div>
            </div>
          </>
        )}
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
            <Link href="/">Home</Link>
            <a href="mailto:mdsalimahmed3331@gmail.com">Contact</a>
          </div>
        </div>
      </footer>
    </>
  );
}
