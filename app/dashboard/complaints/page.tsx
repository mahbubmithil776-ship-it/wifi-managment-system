'use client';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import api from '../../../services/api';
import { useRouter } from 'next/navigation';

type ComplaintType = '' | 'slow' | 'nonet' | 'billing' | 'hardware' | 'newconn' | 'other';
type Priority = 'normal' | 'urgent' | 'critical';
type Step = 1 | 2 | 3;

interface Complaint {
  id: number;
  ticketId?: string;
  subject: string;
  type?: string;
  description: string;
  priority?: string;
  status: string;
  createdAt: string;
}

const AREAS = ['Anodho Bazar', 'Pordhani Chala', 'Bagan Bari', 'Aktapara', 'Chokpara', 'Other'];

const TYPE_LABELS: Record<string, string> = {
  slow: 'Slow Internet / Low Speed',
  nonet: 'No Connection / Disconnected',
  billing: 'Billing Issue',
  hardware: 'Device / Router Problem',
  newconn: 'New Connection Request',
  other: 'Other',
};

const TYPE_ICON: Record<string, string> = {
  slow: '🐢', nonet: '❌', billing: '💳',
  hardware: '📡', newconn: '🔌', other: '💬',
};

const PRIORITY_LABELS: Record<Priority, string> = {
  normal: 'Normal', urgent: 'Urgent', critical: 'Critical',
};

const PRIORITY_STYLE: Record<Priority, { bg: string; color: string }> = {
  normal:   { bg: '#e1f5ee', color: '#0F6E56' },
  urgent:   { bg: '#fef3c7', color: '#d97706' },
  critical: { bg: '#fee2e2', color: '#dc2626' },
};

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

export default function ComplaintPage() {
  const [userId, setUserId]         = useState<number | null>(null);
  const [userEmail, setUserEmail]   = useState('');
  const [userName, setUserName]     = useState('');
  const [userPhone, setUserPhone]   = useState('');
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading]       = useState(true);
  const [menuOpen, setMenuOpen]     = useState(false);
  const router   = useRouter();
  const pathname = usePathname();

  const [step, setStep]                   = useState<Step>(1);
  const [area, setArea]                   = useState('');
  const [contactPref, setContactPref]     = useState<'phone' | 'whatsapp'>('phone');
  const [type, setType]                   = useState<ComplaintType>('');
  const [priority, setPriority]           = useState<Priority>('normal');
  const [description, setDescription]     = useState('');
  const [submitting, setSubmitting]       = useState(false);
  const [submitError, setSubmitError]     = useState('');
  const [successTicket, setSuccessTicket] = useState('');
  const [errors, setErrors]               = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileRes = await api.get('/users/profile');
        const user = profileRes.data.user;
        if (!user?.id) { router.push('/login'); return; }
        setUserId(user.id);
        setUserEmail(user.email || '');
        setUserName(user.fullName || '');
        setUserPhone(user.phone || '');
        const res = await api.get(`/users/${user.id}/complaints`);
        setComplaints(res.data);
      } catch (err) {
        if ((err as any)?.response?.status === 401) router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const total    = complaints.length;
  const resolved = complaints.filter(c => c.status === 'Resolved').length;
  const pending  = complaints.filter(c => c.status === 'Pending').length;

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!area) e.area = 'Please select your area';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (!type) e.type = 'Please select a complaint type';
    if (!description.trim() || description.trim().length < 20)
      e.description = 'Please write at least 20 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    if (step === 2 && validateStep2()) setStep(3);
  };

  const handleSubmit = async () => {
    if (!userId) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await api.post(`/users/${userId}/complaints`, {
        name: userName,
        phone: userPhone,
        area,
        contactPref,
        subject: type,
        type,
        priority,
        description,
      });

      const ticket = res.data?.ticketId || `#${res.data?.id || ''}`;
      setSuccessTicket(ticket);

      const updated = await api.get(`/users/${userId}/complaints`);
      setComplaints(updated.data);

      setStep(1);
      setArea('');
      setContactPref('phone');
      setType('');
      setPriority('normal');
      setDescription('');

      const waMsg = encodeURIComponent(
        `🔔 *New Complaint Submitted*\n\n` +
        `👤 Name: ${userName}\n` +
        `📞 Phone: ${userPhone}\n` +
        `📍 Area: ${area}\n` +
        `🎫 Ticket: ${ticket}\n` +
        `📋 Type: ${TYPE_LABELS[type] || type}\n` +
        `⚡ Priority: ${PRIORITY_LABELS[priority]}\n\n` +
        `📝 ${description}`
      );
      window.open(`https://wa.me/8801723133845?text=${waMsg}`, '_blank');

    } catch {
      setSubmitError('Failed to submit complaint. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <style>{styles}</style>
        <div className="loading-screen">
          <div className="loading-spinner" />
          <p className="loading-text">Loading complaints...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>

      <nav className="nav">
        <div className="nav-inner">
          <div className="logo">Sanaf<span className="logo-accent">ISP</span>.net</div>
          <div className="nav-links">
            <a href="/dashboard"            className={`nav-link ${pathname === '/dashboard'            ? 'active' : ''}`}>Dashboard</a>
            <a href="/dashboard/billings"   className={`nav-link ${pathname === '/dashboard/billings'   ? 'active' : ''}`}>Billings</a>
            <a href="/dashboard/complaints" className={`nav-link ${pathname === '/dashboard/complaints' ? 'active' : ''}`}>Complaints</a>
            <a href="/dashboard/profile"    className={`nav-link ${pathname === '/dashboard/profile'    ? 'active' : ''}`}>Profile</a>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
            <button className="logout-btn" onClick={handleLogout}>
              <span className="logout-icon">⏻</span> Logout
            </button>
            <button className="hamburger" onClick={() => setMenuOpen(v => !v)}>
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="mobile-menu">
            <a href="/dashboard" className="mobile-link" onClick={() => setMenuOpen(false)}>🏠 Dashboard</a>
            <a href="/dashboard/billings" className="mobile-link" onClick={() => setMenuOpen(false)}>💳 Billings</a>
            <a href="/dashboard/complaints" className="mobile-link" onClick={() => setMenuOpen(false)}>🎧 Complaints</a>
            <a href="/dashboard/profile" className="mobile-link" onClick={() => setMenuOpen(false)}>👤 Profile</a>
          </div>
        )}
      </nav>

      <div className="page">

        <div className="page-header">
          <div className="page-label">🎧 Support</div>
          <div className="page-title">My Complaints</div>
          <div className="page-sub">{userEmail} — Submit & track your issues</div>
        </div>

        <div className="cards">
          <div className="card c-blue">
            <div className="card-label">Total Submitted</div>
            <div className="card-val">{total}</div>
            <div className="card-icon">📋</div>
          </div>
          <div className="card c-green">
            <div className="card-label">Resolved</div>
            <div className="card-val">{resolved}</div>
            <div className="card-icon">✅</div>
          </div>
          <div className="card c-gold">
            <div className="card-label">Pending</div>
            <div className="card-val">{pending}</div>
            <div className="card-icon">⏳</div>
          </div>
        </div>

        {successTicket && (
          <div className="success-banner">
            <div className="success-check">✓</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14 }}>Complaint submitted successfully!</div>
              <div style={{ fontSize: 12, opacity: .8, marginTop: 2 }}>
                Ticket: <strong>{successTicket}</strong> — Our team will contact you soon.
              </div>
            </div>
            <button className="success-close" onClick={() => setSuccessTicket('')}>✕</button>
          </div>
        )}

        <div className="section-title">📝 Submit a New Complaint</div>
        <div className="form-card">
          <StepBar step={step} />

          {step === 1 && (
            <div className="step-body">
              <div className="step-heading">Your Information</div>
              <p className="step-sub">Your name and phone are filled automatically from your profile.</p>

              <div className="field-row">
                <div className="field">
                  <div className="field-label">Full Name</div>
                  <div className="readonly-field">
                    <span className="readonly-icon">👤</span> {userName || '—'}
                  </div>
                </div>
                <div className="field">
                  <div className="field-label">Phone Number</div>
                  <div className="readonly-field">
                    <span className="readonly-icon">📞</span> {userPhone || '—'}
                  </div>
                </div>
              </div>

              <div className="field">
                <div className="field-label">Area <span className="req">*</span></div>
                <select
                  className={`form-select ${errors.area ? 'err' : ''}`}
                  value={area}
                  onChange={e => setArea(e.target.value)}
                >
                  <option value="">-- Select your area --</option>
                  {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
                {errors.area && <div className="field-error">⚠ {errors.area}</div>}
              </div>

              <div className="field">
                <div className="field-label">Preferred Contact Method</div>
                <div className="pref-group">
                  <button type="button"
                    className={`pref-chip ${contactPref === 'phone' ? 'sel' : ''}`}
                    onClick={() => setContactPref('phone')}>📞 Phone Call</button>
                  <button type="button"
                    className={`pref-chip ${contactPref === 'whatsapp' ? 'sel' : ''}`}
                    onClick={() => setContactPref('whatsapp')}>💬 WhatsApp</button>
                </div>
              </div>

              <div className="btn-row" style={{ justifyContent: 'flex-end' }}>
                <button className="btn-primary" onClick={handleNext}>Next Step →</button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="step-body">
              <div className="step-heading">Issue Details</div>

              <div className="field">
                <div className="field-label">Complaint Type <span className="req">*</span></div>
                <div className="type-grid">
                  {[
                    { val: 'slow',     icon: '🐢', label: 'Slow Internet' },
                    { val: 'nonet',    icon: '❌', label: 'No Connection' },
                    { val: 'billing',  icon: '💳', label: 'Billing Issue' },
                    { val: 'hardware', icon: '📡', label: 'Router Problem' },
                    { val: 'newconn',  icon: '🔌', label: 'New Connection' },
                    { val: 'other',    icon: '💬', label: 'Other' },
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
                  className={`form-textarea ${errors.description ? 'err' : ''}`}
                  rows={5}
                  placeholder="When did the issue start? How is it affecting you? — Describe in detail..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
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
            </div>
          )}

          {step === 3 && (
            <div className="step-body">
              <div className="step-heading">Review & Submit</div>

              <div className="review-section">
                <div className="review-title">Your Information</div>
                <div className="review-grid">
                  <div className="review-item">
                    <div className="review-label">Name</div>
                    <div className="review-val">{userName}</div>
                  </div>
                  <div className="review-item">
                    <div className="review-label">Phone</div>
                    <div className="review-val">{userPhone}</div>
                  </div>
                  <div className="review-item">
                    <div className="review-label">Area</div>
                    <div className="review-val">{area}</div>
                  </div>
                  <div className="review-item">
                    <div className="review-label">Contact Preference</div>
                    <div className="review-val">{contactPref === 'phone' ? '📞 Phone Call' : '💬 WhatsApp'}</div>
                  </div>
                </div>
              </div>

              <div className="review-section">
                <div className="review-title">Issue Details</div>
                <div className="review-grid">
                  <div className="review-item">
                    <div className="review-label">Type</div>
                    <div className="review-val">{TYPE_ICON[type]} {TYPE_LABELS[type] || '—'}</div>
                  </div>
                  <div className="review-item">
                    <div className="review-label">Priority</div>
                    <div className="review-val">
                      <span className="priority-pill"
                        style={{ background: PRIORITY_STYLE[priority].bg, color: PRIORITY_STYLE[priority].color }}>
                        {priority === 'normal' ? '🟢' : priority === 'urgent' ? '🟡' : '🔴'} {PRIORITY_LABELS[priority]}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="review-item" style={{ marginTop: 10 }}>
                  <div className="review-label">Description</div>
                  <div className="review-val" style={{ color: '#444', lineHeight: 1.7, marginTop: 4 }}>{description}</div>
                </div>
              </div>

              {submitError && <div className="error-banner">⚠ {submitError}</div>}

              <div className="btn-row">
                <button className="btn-back" onClick={() => setStep(2)}>← Back</button>
                <button className="btn-primary" onClick={handleSubmit} disabled={submitting}>
                  {submitting
                    ? <><div className="spinner" /> Submitting...</>
                    : '✓ Submit Complaint'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="section-title">🕓 Complaint History</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Ticket</th>
                <th>Type</th>
                <th>Description</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {complaints.length > 0 ? (
                complaints.map((c, i) => {
                  const p = (c.priority as Priority) || 'normal';
                  const pStyle = PRIORITY_STYLE[p] || PRIORITY_STYLE.normal;
                  return (
                    <tr key={c.id}>
                      <td className="idx-cell">{i + 1}</td>
                      <td><span className="ticket-badge">{c.ticketId || `#${c.id}`}</span></td>
                      <td>
                        <span className="type-label">
                          {TYPE_ICON[c.type || ''] || '📋'} {c.type ? TYPE_LABELS[c.type] : c.subject || '—'}
                        </span>
                      </td>
                      <td className="desc-cell">{c.description}</td>
                      <td>
                        <span className="priority-pill" style={{ background: pStyle.bg, color: pStyle.color }}>
                          {p === 'normal' ? '🟢' : p === 'urgent' ? '🟡' : '🔴'} {PRIORITY_LABELS[p]}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-${c.status.toLowerCase().replace(' ', '-')}`}>
                          <span className="badge-dot" />{c.status}
                        </span>
                      </td>
                      <td className="date-cell">
                        {new Date(c.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7}>
                    <div className="empty">
                      <div className="empty-icon">🎧</div>
                      No complaints submitted yet.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </>
  );
}

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800;900&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--green:#0F6E56;--green-dark:#085041;--green-light:#e1f5ee;--gold:#BA7517;--gold-light:#faeeda;--bg:#f4f8f6;--red:#dc2626;--red-light:#fef2f2}
body{font-family:'Sora',sans-serif;background:var(--bg);color:#111;min-height:100vh}
.loading-screen{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;background:var(--bg);gap:16px}
.loading-spinner{width:36px;height:36px;border:3px solid #e0ede8;border-top-color:var(--green);border-radius:50%;animation:spin 0.8s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.loading-text{font-size:13px;font-weight:700;color:var(--green)}
.nav{background:rgba(255,255,255,0.95);backdrop-filter:blur(12px);border-bottom:1px solid #e0ede8;padding:0 5vw;position:sticky;top:0;z-index:100;box-shadow:0 4px 24px rgba(15,110,86,.07)}
.nav-inner{max-width:1160px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;height:64px}
.logo{font-size:20px;font-weight:900;color:var(--green);letter-spacing:-1px}
.logo-accent{color:var(--gold)}
.nav-links{display:flex;align-items:center;gap:22px}
.nav-link{font-size:13px;font-weight:600;color:#555;text-decoration:none;padding-bottom:2px;border-bottom:2px solid transparent;transition:color .2s,border-color .2s}
.nav-link:hover{color:var(--green)}
.nav-link.active{color:var(--green);border-bottom-color:var(--green)}
.logout-btn{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:700;color:#fff;background:linear-gradient(135deg,#dc2626,#b91c1c);border:none;border-radius:20px;padding:8px 18px;cursor:pointer;font-family:'Sora',sans-serif;transition:all .2s}
.logout-btn:hover{transform:translateY(-1px)}
.logout-icon{font-size:13px}
.hamburger{display:none;background:var(--green-light);border:1.5px solid rgba(15,110,86,0.2);border-radius:10px;padding:7px 12px;font-size:18px;cursor:pointer;color:var(--green)}
.mobile-menu{background:#fff;border-top:1px solid #e0ede8;padding:12px 20px;display:flex;flex-direction:column;gap:4px}
.mobile-link{display:block;padding:12px 16px;font-size:14px;font-weight:700;color:var(--green);text-decoration:none;border-radius:10px;transition:background .2s}
.mobile-link:hover{background:var(--green-light)}
.page{max-width:1000px;margin:0 auto;padding:48px 24px}
.page-header{margin-bottom:36px}
.page-label{font-size:11px;font-weight:700;color:var(--green);text-transform:uppercase;letter-spacing:2px;margin-bottom:8px}
.page-title{font-size:28px;font-weight:900;letter-spacing:-1px;color:#0a0a0a;margin-bottom:4px}
.page-sub{font-size:13px;color:#888;font-weight:500}
.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-bottom:28px}
.card{background:#fff;border-radius:20px;padding:24px;border:1.5px solid #e0ede8;position:relative;overflow:hidden;transition:transform .3s,box-shadow .3s}
.card:hover{transform:translateY(-4px);box-shadow:0 16px 40px rgba(15,110,86,.10)}
.card::before{content:'';position:absolute;top:0;left:0;width:4px;height:100%;border-radius:4px 0 0 4px}
.c-blue::before{background:linear-gradient(180deg,var(--green),#1db87e)}
.c-green::before{background:linear-gradient(180deg,#22c55e,#16a34a)}
.c-gold::before{background:linear-gradient(180deg,var(--gold),#e8961c)}
.card-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#999;margin-bottom:10px}
.card-val{font-size:32px;font-weight:900;letter-spacing:-1px}
.c-blue .card-val{color:var(--green)}
.c-green .card-val{color:#16a34a}
.c-gold .card-val{color:var(--gold)}
.card-icon{position:absolute;right:18px;top:50%;transform:translateY(-50%);font-size:32px;opacity:.12}
.success-banner{background:#e1f5ee;border:1.5px solid #b6e5d4;border-radius:16px;padding:16px 20px;display:flex;align-items:center;gap:14px;margin-bottom:24px}
.success-check{width:36px;height:36px;border-radius:50%;background:var(--green);color:#fff;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:900;flex-shrink:0}
.success-close{margin-left:auto;background:none;border:none;font-size:16px;color:#888;cursor:pointer;padding:4px}
.section-title{font-size:13px;font-weight:800;color:#0a0a0a;margin-bottom:14px;margin-top:8px}
.form-card{background:#fff;border-radius:20px;border:1.5px solid #e0ede8;overflow:hidden;box-shadow:0 2px 12px rgba(15,110,86,.05);margin-bottom:36px}
.step-bar{display:flex;align-items:center;justify-content:center;padding:24px 28px 0}
.step-item{display:flex;align-items:center}
.step-circle{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;background:#fff;border:2px solid #d0ddd8;color:#aaa;transition:all .3s;flex-shrink:0}
.step-circle.active{background:var(--green);border-color:var(--green);color:#fff;box-shadow:0 4px 12px rgba(15,110,86,.3)}
.step-circle.done{background:var(--green-light);border-color:var(--green);color:var(--green)}
.step-label{font-size:11px;font-weight:600;color:#aaa;margin-left:7px;white-space:nowrap;transition:color .3s}
.step-label.active{color:var(--green)}
.step-label.done{color:var(--green-dark)}
.step-line{width:48px;height:2px;background:#e0ede8;margin:0 8px;transition:background .3s}
.step-line.done{background:var(--green)}
.step-body{padding:24px 28px 28px}
.step-heading{font-size:15px;font-weight:800;color:#111;margin-bottom:4px}
.step-sub{font-size:12px;color:#999;margin-bottom:20px}
.field-row{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.field{margin-bottom:16px}
.field-label{font-size:11px;font-weight:700;color:#777;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;display:flex;align-items:center;gap:4px}
.req{color:var(--red)}
.readonly-field{background:#f4f8f6;border:1.5px solid #e0ede8;border-radius:12px;padding:11px 14px;font-size:13px;font-weight:600;color:#444;display:flex;align-items:center;gap:8px}
.readonly-icon{font-size:15px}
.form-select,.form-textarea{width:100%;border:1.5px solid #e0ede8;border-radius:12px;padding:11px 14px;font-size:13px;font-family:'Sora',sans-serif;background:#fafcfb;outline:none;color:#111;transition:border-color .2s}
.form-select:focus,.form-textarea:focus{border-color:var(--green);background:#fff;box-shadow:0 0 0 3px rgba(15,110,86,.08)}
.form-select.err,.form-textarea.err{border-color:var(--red);background:var(--red-light)}
.form-textarea{resize:vertical}
.field-error{font-size:11px;color:var(--red);margin-top:5px;font-weight:600}
.pref-group{display:flex;gap:10px}
.pref-chip{padding:9px 18px;border-radius:30px;font-size:12px;font-weight:700;cursor:pointer;border:1.5px solid #e0ede8;color:#888;background:#fff;font-family:'Sora',sans-serif;transition:all .2s}
.pref-chip.sel{border-color:var(--green);color:var(--green);background:var(--green-light)}
.type-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:4px}
.type-chip{padding:14px 10px;border-radius:14px;border:1.5px solid #e0ede8;background:#fafcfb;cursor:pointer;text-align:center;font-size:12px;font-weight:600;color:#666;transition:all .2s;font-family:'Sora',sans-serif}
.type-chip:hover{border-color:var(--green);color:var(--green)}
.type-chip.sel{border-color:var(--green);background:var(--green-light);color:var(--green)}
.type-icon{font-size:24px;display:block;margin-bottom:6px}
.priority-group{display:flex;gap:10px;flex-wrap:wrap;margin-top:8px}
.priority-chip{padding:8px 16px;border-radius:30px;font-size:12px;font-weight:700;cursor:pointer;border:1.5px solid #e0ede8;color:#888;background:#fff;font-family:'Sora',sans-serif;transition:all .2s}
.priority-chip.normal.sel{border-color:var(--green);color:var(--green);background:var(--green-light)}
.priority-chip.urgent.sel{border-color:#d97706;color:#d97706;background:#fef3c7}
.priority-chip.critical.sel{border-color:var(--red);color:var(--red);background:var(--red-light)}
.review-section{margin-bottom:16px}
.review-title{font-size:11px;font-weight:700;color:var(--green);text-transform:uppercase;letter-spacing:1.5px;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid #e8f0ed}
.review-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.review-item{background:var(--bg);border-radius:12px;padding:12px 14px}
.review-label{font-size:10px;font-weight:700;color:#999;text-transform:uppercase;letter-spacing:1px;margin-bottom:3px}
.review-val{font-size:13px;font-weight:600;color:#111}
.priority-pill{display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:20px;font-size:11px;font-weight:700}
.error-banner{background:var(--red-light);border:1.5px solid #fca5a5;border-radius:12px;padding:12px 16px;font-size:13px;color:var(--red);font-weight:600;margin-bottom:16px}
.btn-row{display:flex;gap:10px;justify-content:space-between;margin-top:20px;padding-top:20px;border-top:1px solid #f0f0f0}
.btn-primary{background:var(--green);color:#fff;padding:11px 24px;border-radius:30px;font-size:13px;font-weight:700;border:none;cursor:pointer;font-family:'Sora',sans-serif;box-shadow:0 4px 16px rgba(15,110,86,.28);transition:all .25s;display:inline-flex;align-items:center;gap:8px}
.btn-primary:hover{background:var(--green-dark);transform:translateY(-1px)}
.btn-primary:disabled{opacity:.5;cursor:not-allowed;transform:none;box-shadow:none}
.btn-back{background:transparent;color:#888;padding:11px 18px;border-radius:30px;font-size:13px;font-weight:600;border:1.5px solid #e0ede8;cursor:pointer;font-family:'Sora',sans-serif;transition:all .2s}
.btn-back:hover{border-color:#aaa;color:#555}
.spinner{width:16px;height:16px;border:2px solid rgba(255,255,255,.4);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite}
.table-wrap{background:#fff;border-radius:20px;border:1.5px solid #e0ede8;overflow:hidden;box-shadow:0 2px 12px rgba(15,110,86,.05)}
table{width:100%;border-collapse:collapse}
thead{background:linear-gradient(90deg,#f4f8f6,#f0faf6)}
thead th{padding:14px 18px;text-align:left;font-size:10px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:1.2px;white-space:nowrap}
tbody tr{border-top:1px solid #f0f4f2;transition:background .15s}
tbody tr:hover{background:#f9fcfb}
tbody td{padding:14px 18px;font-size:13px;font-weight:500;vertical-align:middle}
.idx-cell{color:#bbb;font-size:12px;width:36px}
.ticket-badge{font-size:11px;font-weight:800;color:var(--green);background:var(--green-light);padding:4px 10px;border-radius:8px;font-family:monospace;white-space:nowrap}
.type-label{font-size:12px;font-weight:600;color:#555;white-space:nowrap}
.desc-cell{color:#888;font-size:12px;max-width:240px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.date-cell{color:#aaa;font-size:12px;white-space:nowrap}
.badge{display:inline-flex;align-items:center;gap:5px;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:700;white-space:nowrap}
.badge-resolved{background:#dcfce7;color:#16a34a}
.badge-pending{background:var(--gold-light);color:var(--gold)}
.badge-in-progress{background:#dbeafe;color:#2563eb}
.badge-dot{width:6px;height:6px;border-radius:50%;background:currentColor;flex-shrink:0}
.empty{text-align:center;padding:48px;color:#bbb;font-size:13px}
.empty-icon{font-size:40px;margin-bottom:12px}
@media(max-width:768px){
  .cards{grid-template-columns:1fr}
  .type-grid{grid-template-columns:repeat(2,1fr)}
  .field-row{grid-template-columns:1fr}
  .nav-links{display:none}
  .hamburger{display:block}
  .review-grid{grid-template-columns:1fr}
  .step-label{display:none}
  .step-line{width:32px}
  .desc-cell{display:none}
}
`;
