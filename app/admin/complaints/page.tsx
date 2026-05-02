'use client';
import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import api from '../../../services/api';
import { useRouter } from 'next/navigation';

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [expanded, setExpanded] = useState<number | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    fetchComplaints();
    const interval = setInterval(fetchComplaints, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchComplaints = () => {
    api.get('/users/complaints/all')
      .then(res => {
        setComplaints(res.data);
        const p = res.data.filter((c: any) => c.status?.toLowerCase() === 'pending').length;
        setPendingCount(p);
      })
      .finally(() => setLoading(false));
  };

  const handleResolve = async (id: number) => {
    if (!confirm('Mark this complaint as Resolved?')) return;
    setResolving(id);
    try {
      await api.patch('/users/complaints/' + id + '/status', { status: 'Resolved' });
      setComplaints(prev =>
        prev.map(c => c.id === id ? { ...c, status: 'Resolved' } : c)
      );
      setPendingCount(prev => Math.max(0, prev - 1));
    } catch {
      alert('Action failed');
    } finally {
      setResolving(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const buildWhatsAppLink = (c: any): string => {
    const num = '88' + String(c.phone).replace(/^0/, '');
    const msg =
      'Hello ' + (c.name || '') + ',\n\n' +
      'We have received your complaint ticket ' + (c.ticketId || '#' + String(c.id)) +
      ' and are working on it. A solution will be provided soon.\n\n' +
      '- SanafISP Support';
    return 'https://wa.me/' + num + '?text=' + encodeURIComponent(msg);
  };

  const total    = complaints.length;
  const pending  = complaints.filter(c => c.status?.toLowerCase() === 'pending').length;
  const resolved = complaints.filter(c => c.status?.toLowerCase() === 'resolved').length;
  const open     = complaints.filter(c => c.status?.toLowerCase() === 'open').length;
  const critical = complaints.filter(c => c.priority === 'critical').length;

  const filtered = filter === 'all'
    ? complaints
    : complaints.filter(c => c.status?.toLowerCase() === filter);

  const TYPE_ICON: Record<string, string> = {
    slow: '🐢', nonet: '❌', billing: '💳',
    hardware: '📡', newconn: '🔌', other: '💬',
  };

  const PRIORITY_STYLE: Record<string, { bg: string; color: string; label: string }> = {
    normal:   { bg: '#e1f5ee', color: '#0F6E56', label: 'Normal' },
    urgent:   { bg: '#fef3c7', color: '#d97706', label: 'Urgent' },
    critical: { bg: '#fee2e2', color: '#dc2626', label: 'Critical' },
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
            <a href="/admin" className={'nav-link admin' + (pathname === '/admin' ? ' active' : '')}>
              Admin Home
            </a>
            <a href="/admin/users" className={'nav-link admin' + (pathname === '/admin/users' ? ' active' : '')}>
              Manage Users
            </a>
            <a href="/admin/complaints" className={'nav-link admin' + (pathname === '/admin/complaints' ? ' active' : '')}>
              Customer Complaints
              {pendingCount > 0 && <span className="nav-badge">{pendingCount}</span>}
            </a>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <span className="logout-icon">⏻</span> Logout
          </button>
        </div>
      </nav>

      <div className="page">

        <div className="page-header">
          <div className="page-label">🛠️ Admin Panel</div>
          <div className="page-title">Customer Complaints</div>
          <div className="page-sub">View and resolve all customer complaints and support requests</div>
        </div>

        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-icon">🎫</div>
            <div className="stat-val">{total}</div>
            <div className="stat-label">Total Tickets</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-val">{pending}</div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-val">{resolved}</div>
            <div className="stat-label">Resolved</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🔴</div>
            <div className="stat-val">{critical}</div>
            <div className="stat-label">Critical</div>
          </div>
        </div>

        <div className="filter-row">
          {(['all', 'pending', 'open', 'resolved'] as string[]).map(f => (
            <button
              key={f}
              className={'filter-tab' + (filter === f ? ' active' : '')}
              onClick={() => setFilter(f)}
            >
              {f === 'all'      && 'All (' + total + ')'}
              {f === 'pending'  && 'Pending (' + pending + ')'}
              {f === 'open'     && 'Open (' + open + ')'}
              {f === 'resolved' && 'Resolved (' + resolved + ')'}
            </button>
          ))}
        </div>

        <div className="section-title">📋 All Customer Complaints</div>
        <div className="table-card">
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Ticket</th>
                  <th>Customer</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c: any, index: number) => {
                  const pStyle = PRIORITY_STYLE[c.priority] || PRIORITY_STYLE.normal;
                  const isExpanded = expanded === c.id;
                  const statusClass = 'badge badge-' + (c.status || 'pending').toLowerCase().replace(' ', '-');
                  const rowClass = c.priority === 'critical' ? 'tr-critical' : '';
                  const dateStr = c.createdAt
                    ? new Date(c.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                    : '—';

                  return (
                    <React.Fragment key={c.id}>
                      <tr className={rowClass}>

                        <td className="td-num">{index + 1}</td>

                        <td>
                          <span className="ticket-id-badge">
                            {c.ticketId || '#' + c.id}
                          </span>
                        </td>

                        <td>
                          <div className="customer-cell">
                            <div className="customer-name">{c.name || c.user?.name || '—'}</div>
                            <div className="customer-phone">{c.phone || c.user?.phone || c.user?.email || '—'}</div>
                            {c.area && <div className="customer-area">📍 {c.area}</div>}
                          </div>
                        </td>

                        <td>
                          <span className="type-badge">
                            {TYPE_ICON[c.type] || '📋'} {c.type || c.subject || '—'}
                          </span>
                        </td>

                        <td className="td-desc">
                          <span
                            className="desc-text"
                            title={c.description}
                            onClick={() => setExpanded(isExpanded ? null : c.id)}
                            style={{ cursor: 'pointer' }}
                          >
                            {isExpanded
                              ? c.description
                              : c.description?.length > 60
                                ? c.description.slice(0, 60) + '…'
                                : c.description || '—'}
                          </span>
                          {c.description?.length > 60 && (
                            <span
                              className="expand-btn"
                              onClick={() => setExpanded(isExpanded ? null : c.id)}
                            >
                              {isExpanded ? ' less' : ' more'}
                            </span>
                          )}
                        </td>

                        <td>
                          <span className="priority-pill" style={{ background: pStyle.bg, color: pStyle.color }}>
                            {c.priority === 'critical' ? '🔴' : c.priority === 'urgent' ? '🟡' : '🟢'} {pStyle.label}
                          </span>
                        </td>

                        <td>
                          <span className={statusClass}>
                            <span className="badge-dot" />
                            {c.status || 'Pending'}
                          </span>
                        </td>

                        <td className="td-muted td-date">{dateStr}</td>

                        <td>
                          <div className="action-btns">
                            {c.status?.toLowerCase() === 'resolved' ? (
                              <span className="resolved-label">✓ Resolved</span>
                            ) : (
                              <button
                                className="btn-resolve"
                                onClick={() => handleResolve(c.id)}
                                disabled={resolving === c.id}
                              >
                                {resolving === c.id ? '...' : '✔ Resolve'}
                              </button>
                            )}
                            {c.phone && (
                              <a
                                href={buildWhatsAppLink(c)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-contact"
                                title="Reply on WhatsApp"
                              >
                                💬
                              </a>
                            )}
                          </div>
                        </td>

                      </tr>
                    </React.Fragment>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={9} className="td-empty">No tickets found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </>
  );
}

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800;900&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--green:#0F6E56;--green-dark:#085041;--green-light:#e1f5ee;--gold:#BA7517;--gold-light:#faeeda;--bg:#f4f8f6}
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
.nav-link{font-size:13px;font-weight:600;color:#555;text-decoration:none;padding-bottom:2px;border-bottom:2px solid transparent;transition:color .2s,border-color .2s;display:flex;align-items:center;gap:6px}
.nav-link:hover{color:var(--green)}
.nav-link.active{color:var(--green);border-bottom-color:var(--green)}
.nav-link.admin{color:var(--green);font-size:13px}
.nav-badge{background:#dc2626;color:#fff;font-size:10px;font-weight:800;border-radius:20px;padding:2px 7px;min-width:20px;text-align:center;animation:pulse 1.5s ease-in-out infinite}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.85;transform:scale(1.08)}}
.logout-btn{background:#fee2e2;color:#dc2626;border:1.5px solid #fca5a5;border-radius:20px;padding:7px 16px;font-size:12px;font-weight:700;cursor:pointer;font-family:'Sora',sans-serif;display:flex;align-items:center;gap:6px;transition:all .2s}
.logout-btn:hover{background:#dc2626;color:#fff}
.logout-icon{font-size:14px}
.page{max-width:1200px;margin:0 auto;padding:48px 24px}
.page-header{margin-bottom:32px}
.page-label{font-size:11px;font-weight:700;color:var(--green);text-transform:uppercase;letter-spacing:2px;margin-bottom:8px}
.page-title{font-size:28px;font-weight:900;letter-spacing:-1px;color:#0a0a0a;margin-bottom:4px}
.page-sub{font-size:13px;color:#888;font-weight:500}
.stats-row{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px}
.stat-card{background:#fff;border-radius:18px;border:1.5px solid #e0ede8;padding:20px 24px;box-shadow:0 2px 12px rgba(15,110,86,.05);display:flex;flex-direction:column;gap:6px}
.stat-icon{font-size:22px}
.stat-val{font-size:26px;font-weight:900;color:var(--green);letter-spacing:-1px}
.stat-label{font-size:11px;font-weight:700;color:#999;text-transform:uppercase;letter-spacing:1px}
.filter-row{display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap}
.filter-tab{padding:8px 18px;border-radius:20px;font-size:12px;font-weight:700;cursor:pointer;border:1.5px solid #e0ede8;color:#888;background:#fff;font-family:'Sora',sans-serif;transition:all .2s}
.filter-tab:hover{border-color:var(--green);color:var(--green)}
.filter-tab.active{background:var(--green);color:#fff;border-color:var(--green)}
.section-title{font-size:13px;font-weight:800;color:#0a0a0a;margin-bottom:14px;margin-top:8px}
.table-card{background:#fff;border-radius:20px;border:1.5px solid #e0ede8;overflow:hidden;box-shadow:0 2px 12px rgba(15,110,86,.05)}
.table-wrap{overflow-x:auto}
.table{width:100%;border-collapse:collapse}
.table thead tr{background:#f4f8f6}
.table th{padding:14px 16px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;color:#888;text-align:left;white-space:nowrap}
.table tbody tr{border-top:1px solid #f0f4f2;transition:background .15s}
.table tbody tr:hover{background:#fafcfb}
.table tbody tr.tr-critical{background:#fff8f8}
.table tbody tr.tr-critical:hover{background:#fff0f0}
.table td{padding:12px 16px;font-size:13px;vertical-align:middle}
.td-num{font-size:12px;color:#bbb;font-weight:700;width:36px}
.td-muted{color:#666;font-weight:500}
.td-date{white-space:nowrap;font-size:11px}
.td-desc{max-width:220px}
.td-empty{text-align:center;color:#bbb;font-size:13px;padding:40px !important}
.ticket-id-badge{font-size:11px;font-weight:800;color:var(--green);background:var(--green-light);padding:4px 10px;border-radius:8px;font-family:monospace;white-space:nowrap}
.customer-cell{display:flex;flex-direction:column;gap:2px}
.customer-name{font-size:13px;font-weight:700;color:#111}
.customer-phone{font-size:11px;color:#888;font-weight:500}
.customer-area{font-size:10px;color:#aaa;margin-top:2px}
.type-badge{font-size:11px;font-weight:700;color:#555;white-space:nowrap}
.desc-text{font-size:12px;color:#666;line-height:1.5;word-break:break-word}
.expand-btn{font-size:11px;color:var(--green);font-weight:700;cursor:pointer;margin-left:4px}
.expand-btn:hover{text-decoration:underline}
.priority-pill{display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:20px;font-size:10px;font-weight:700;white-space:nowrap}
.badge{display:inline-flex;align-items:center;gap:5px;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:700;white-space:nowrap}
.badge-resolved{background:#dcfce7;color:#16a34a}
.badge-pending{background:var(--gold-light);color:var(--gold)}
.badge-open{background:#fee2e2;color:#dc2626}
.badge-in-progress{background:#dbeafe;color:#2563eb}
.badge-dot{width:6px;height:6px;border-radius:50%;background:currentColor;flex-shrink:0}
.action-btns{display:flex;gap:6px;align-items:center}
.btn-resolve{background:var(--green-light);color:var(--green);border:1.5px solid #c0e6d8;border-radius:20px;padding:6px 12px;font-size:11px;font-weight:700;cursor:pointer;font-family:'Sora',sans-serif;transition:all .2s;white-space:nowrap}
.btn-resolve:hover{background:#c5eed8;transform:translateY(-1px)}
.btn-resolve:disabled{opacity:.4;cursor:not-allowed;transform:none}
.resolved-label{font-size:11px;font-weight:700;color:#16a34a;background:#dcfce7;padding:6px 12px;border-radius:20px;white-space:nowrap}
.btn-contact{width:30px;height:30px;border-radius:50%;background:#e7f7ef;border:1.5px solid #c0e6d8;display:flex;align-items:center;justify-content:center;font-size:14px;text-decoration:none;transition:all .2s;flex-shrink:0}
.btn-contact:hover{background:var(--green-light);border-color:var(--green);transform:scale(1.1)}
@media(max-width:768px){.stats-row{grid-template-columns:repeat(2,1fr)}.nav-links{display:none}.page{padding:24px 16px}}
`;
