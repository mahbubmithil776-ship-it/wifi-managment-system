'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import api from '../../services/api';
import { useRouter } from 'next/navigation';

interface Billing {
  id: number;
  month: string;
  amount: number;
  status: string;
}

interface Complaint {
  id: number;
  subject: string;
  status: string;
}

interface User {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  status: string;
  package?: { name: string; speed?: number };
  createdAt: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [billings, setBillings] = useState<Billing[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileRes = await api.get('/users/profile');
        const userData: User = profileRes.data.user;
        setUser(userData);

        // আলাদা আলাদা call — একটা fail হলেও dashboard load হবে
        const billRes = await api.get(`/users/${userData.id}/billings`).catch(() => ({ data: [] }));
        const complaintRes = await api.get(`/users/${userData.id}/complaints`).catch(() => ({ data: [] }));

        setBillings(billRes.data);
        setComplaints(complaintRes.data);
      } catch {
        router.push('/login');
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

  const unpaidBill = billings.find(b => b.status === 'Unpaid');
  const totalDue = billings
    .filter(b => b.status === 'Unpaid')
    .reduce((s, b) => s + Number(b.amount), 0);
  const pendingComplaints = complaints.filter(
    c => c.status?.toLowerCase() === 'pending' || c.status?.toLowerCase() === 'open'
  ).length;

  if (loading) {
    return (
      <>
        <style>{styles}</style>
        <div className="loading-screen">
          <div className="loading-spinner" />
          <p className="loading-text">Loading dashboard...</p>
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
            <a href="/dashboard" className={`nav-link ${pathname === '/dashboard' ? 'active' : ''}`}>Dashboard</a>
            <a href="/dashboard/billings" className={`nav-link ${pathname === '/dashboard/billings' ? 'active' : ''}`}>Billings</a>
            <a href="/dashboard/complaints" className={`nav-link ${pathname === '/dashboard/complaints' ? 'active' : ''}`}>Complaints</a>
            <a href="/dashboard/profile" className={`nav-link ${pathname === '/dashboard/profile' ? 'active' : ''}`}>Profile</a>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <span className="logout-icon">⏻</span> Logout
          </button>
        </div>
      </nav>

      <div className="page">
        <div className="page-header">
          <div className="page-label">👤 My Account</div>
          <div className="page-title">Welcome back, {user?.fullName?.split(' ')[0] || 'User'}!</div>
          <div className="page-sub">{user?.email}</div>
        </div>

        {unpaidBill && (
          <div className="due-alert">
            <div className="due-alert-left">
              <div className="due-pulse-dot" />
              <div>
                <div className="due-alert-title">⚠️ Bill Due — {unpaidBill.month}</div>
                <div className="due-alert-sub">Pay now to avoid service suspension</div>
              </div>
            </div>
            <a href="/dashboard/billings" className="due-alert-btn">Pay Now →</a>
          </div>
        )}

        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-icon">🌐</div>
            <div className={`stat-val ${user?.status === 'active' ? 'green' : 'red'}`}>
              {user?.status === 'active' ? 'Active' : user?.status || '—'}
            </div>
            <div className="stat-label">Connection</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div className="stat-val">{user?.package?.name || '—'}</div>
            <div className="stat-label">Package</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className={`stat-val ${totalDue > 0 ? 'red' : 'green'}`}>
              {totalDue > 0 ? `৳${totalDue.toLocaleString()}` : '৳0'}
            </div>
            <div className="stat-label">Due Amount</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🎫</div>
            <div className={`stat-val ${pendingComplaints > 0 ? 'gold' : 'green'}`}>
              {pendingComplaints > 0 ? pendingComplaints : '0'}
            </div>
            <div className="stat-label">Pending Complaints</div>
          </div>
        </div>

        <div className="section-title">⚡ Quick Actions</div>
        <div className="quick-grid">
          <a href="/dashboard/billings" className="quick-card">
            <div className="quick-icon">💳</div>
            <div className="quick-label">Pay Bill</div>
            <div className="quick-sub">View & pay your bills</div>
          </a>
          <a href="/dashboard/complaints" className="quick-card">
            <div className="quick-icon">🎧</div>
            <div className="quick-label">Submit Complaint</div>
            <div className="quick-sub">Report an issue or concern</div>
          </a>
          <a href="/dashboard/profile" className="quick-card">
            <div className="quick-icon">👤</div>
            <div className="quick-label">Profile</div>
            <div className="quick-sub">Update your info</div>
          </a>
          <a href="https://wa.me/8801723133845" target="_blank" rel="noopener noreferrer" className="quick-card">
            <div className="quick-icon">💬</div>
            <div className="quick-label">WhatsApp</div>
            <div className="quick-sub">Chat with support</div>
          </a>
        </div>

        {billings.length > 0 && (
          <>
            <div className="section-title">🧾 Recent Bills</div>
            <div className="table-card">
              <table className="table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {billings.slice(0, 3).map(b => (
                    <tr key={b.id}>
                      <td className="td-name">{b.month}</td>
                      <td className="td-muted">৳{Number(b.amount).toLocaleString()}</td>
                      <td>
                        <span className={`badge badge-${b.status.toLowerCase()}`}>
                          <span className="badge-dot" />{b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {complaints.length > 0 && (
          <>
            <div className="section-title">📋 Recent Complaints</div>
            <div className="table-card">
              <table className="table">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.slice(0, 3).map(c => (
                    <tr key={c.id}>
                      <td className="td-name">{c.subject}</td>
                      <td>
                        <span className={`badge badge-${c.status.toLowerCase()}`}>
                          <span className="badge-dot" />{c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
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
.nav-links{display:flex;align-items:center;gap:28px}
.nav-link{font-size:13px;font-weight:600;color:#555;text-decoration:none;padding-bottom:2px;border-bottom:2px solid transparent;transition:color .2s,border-color .2s}
.nav-link:hover{color:var(--green)}
.nav-link.active{color:var(--green);border-bottom-color:var(--green)}
.logout-btn{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:700;color:#fff;background:linear-gradient(135deg,#dc2626,#b91c1c);border:none;border-radius:20px;padding:8px 18px;cursor:pointer;font-family:'Sora',sans-serif;box-shadow:0 4px 12px rgba(220,38,38,0.25);transition:all .2s}
.logout-btn:hover{transform:translateY(-1px);box-shadow:0 6px 18px rgba(220,38,38,0.35)}
.logout-icon{font-size:13px}
.page{max-width:1100px;margin:0 auto;padding:48px 24px}
.page-header{margin-bottom:32px}
.page-label{font-size:11px;font-weight:700;color:var(--green);text-transform:uppercase;letter-spacing:2px;margin-bottom:8px}
.page-title{font-size:28px;font-weight:900;letter-spacing:-1px;color:#0a0a0a;margin-bottom:4px}
.page-sub{font-size:13px;color:#888;font-weight:500}
.due-alert{display:flex;align-items:center;justify-content:space-between;background:linear-gradient(135deg,#fef2f2,#fff5f5);border:1.5px solid #fecaca;border-radius:16px;padding:16px 24px;margin-bottom:24px;gap:16px;flex-wrap:wrap}
.due-alert-left{display:flex;align-items:center;gap:12px}
.due-pulse-dot{width:10px;height:10px;border-radius:50%;background:#dc2626;position:relative;flex-shrink:0}
.due-pulse-dot::after{content:'';position:absolute;inset:-4px;border-radius:50%;border:2px solid #dc2626;animation:ping 1.6s ease-out infinite;opacity:0}
@keyframes ping{0%{transform:scale(1);opacity:.7}100%{transform:scale(2.2);opacity:0}}
.due-alert-title{font-size:14px;font-weight:800;color:#dc2626}
.due-alert-sub{font-size:12px;color:#ef4444;margin-top:2px}
.due-alert-btn{background:#dc2626;color:#fff;padding:10px 22px;border-radius:20px;font-size:12px;font-weight:700;text-decoration:none;white-space:nowrap;transition:all .2s}
.due-alert-btn:hover{background:#b91c1c;transform:translateY(-1px)}
.stats-row{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:32px}
.stat-card{background:#fff;border-radius:18px;border:1.5px solid #e0ede8;padding:28px 24px;box-shadow:0 2px 12px rgba(15,110,86,.05);display:flex;flex-direction:column;gap:8px;transition:transform .2s,box-shadow .2s}
.stat-card:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(15,110,86,.1)}
.stat-icon{font-size:26px}
.stat-val{font-size:22px;font-weight:900;color:var(--green);letter-spacing:-1px;word-break:break-word}
.stat-val.green{color:#16a34a}
.stat-val.red{color:#dc2626}
.stat-val.gold{color:var(--gold)}
.stat-label{font-size:11px;font-weight:700;color:#999;text-transform:uppercase;letter-spacing:1px}
.section-title{font-size:13px;font-weight:800;color:#0a0a0a;margin-bottom:14px;margin-top:32px}
.quick-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:8px}
.quick-card{background:#fff;border-radius:18px;border:1.5px solid #e0ede8;padding:24px 20px;display:flex;flex-direction:column;gap:6px;text-decoration:none;transition:transform .2s,box-shadow .2s,border-color .2s}
.quick-card:hover{transform:translateY(-3px);box-shadow:0 8px 24px rgba(15,110,86,.1);border-color:var(--green)}
.quick-icon{font-size:28px}
.quick-label{font-size:14px;font-weight:800;color:#111}
.quick-sub{font-size:11px;color:#999;font-weight:500}
.table-card{background:#fff;border-radius:18px;border:1.5px solid #e0ede8;overflow:hidden;box-shadow:0 2px 12px rgba(15,110,86,.05);margin-bottom:8px}
.table{width:100%;border-collapse:collapse}
.table thead tr{background:#f4f8f6}
.table th{padding:12px 18px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;color:#888;text-align:left}
.table tbody tr{border-top:1px solid #f0f4f2;transition:background .15s}
.table tbody tr:hover{background:#fafcfb}
.table td{padding:14px 18px;font-size:13px;vertical-align:middle}
.td-name{font-weight:700;color:#111}
.td-muted{color:#666;font-weight:500}
.badge{display:inline-flex;align-items:center;gap:5px;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:700}
.badge-paid,.badge-resolved{background:#dcfce7;color:#16a34a}
.badge-unpaid,.badge-inactive{background:#fee2e2;color:#dc2626}
.badge-pending,.badge-open{background:var(--gold-light);color:var(--gold)}
.badge-dot{width:6px;height:6px;border-radius:50%;background:currentColor}
@media(max-width:768px){.stats-row,.quick-grid{grid-template-columns:repeat(2,1fr)}.nav-links{display:none}.page{padding:24px 16px}}
`;