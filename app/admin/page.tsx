'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import api from '../../services/api';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    api.get('/users/admin/dashboard')
      .then(res => setStats(res.data))
      .catch(() => alert('Admin access denied!'));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (!stats) {
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
            <a href="/admin" className={`nav-link admin ${pathname === '/admin' ? 'active' : ''}`}>Admin Home</a>
            <a href="/admin/users" className={`nav-link admin ${pathname === '/admin/users' ? 'active' : ''}`}>Manage Users</a>
            <a href="/admin/complaints" className={`nav-link admin ${pathname === '/admin/complaints' ? 'active' : ''}`}>Complaints</a>
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
            <a href="/admin" className="mobile-link" onClick={() => setMenuOpen(false)}>🏠 Admin Home</a>
            <a href="/admin/users" className="mobile-link" onClick={() => setMenuOpen(false)}>👥 Manage Users</a>
            <a href="/admin/complaints" className="mobile-link" onClick={() => setMenuOpen(false)}>📋 Complaints</a>
          </div>
        )}
      </nav>

      <div className="page">
        <div className="page-header">
          <div className="page-label">🛠️ Admin Panel</div>
          <div className="page-title">Admin Overview</div>
          <div className="page-sub">System summary and key metrics at a glance</div>
        </div>

        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-val">{stats.totalUsers}</div>
            <div className="stat-label">Total Users</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📋</div>
            <div className="stat-val">{stats.pendingComplaints}</div>
            <div className="stat-label">Pending Complaints</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-val">{stats.totalEarnings}</div>
            <div className="stat-label">Total Earnings</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🟢</div>
            <div className="stat-val">{stats.systemStatus}</div>
            <div className="stat-label">System Status</div>
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
.nav-link{font-size:13px;font-weight:600;color:#555;text-decoration:none;padding-bottom:2px;border-bottom:2px solid transparent;transition:color .2s,border-color .2s}
.nav-link:hover{color:var(--green)}
.nav-link.active{color:var(--green);border-bottom-color:var(--green)}
.nav-link.admin{color:var(--green);font-size:13px}
.logout-btn{background:#fee2e2;color:#dc2626;border:1.5px solid #fca5a5;border-radius:20px;padding:7px 16px;font-size:12px;font-weight:700;cursor:pointer;font-family:'Sora',sans-serif;display:flex;align-items:center;gap:6px;transition:all .2s}
.logout-btn:hover{background:#dc2626;color:#fff}
.logout-icon{font-size:14px}
.hamburger{display:none;background:var(--green-light);border:1.5px solid rgba(15,110,86,0.2);border-radius:10px;padding:7px 12px;font-size:18px;cursor:pointer;color:var(--green)}
.mobile-menu{background:#fff;border-top:1px solid #e0ede8;padding:12px 20px;display:flex;flex-direction:column;gap:4px}
.mobile-link{display:block;padding:12px 16px;font-size:14px;font-weight:700;color:var(--green);text-decoration:none;border-radius:10px;transition:background .2s}
.mobile-link:hover{background:var(--green-light)}
.page{max-width:1100px;margin:0 auto;padding:48px 24px}
.page-header{margin-bottom:32px}
.page-label{font-size:11px;font-weight:700;color:var(--green);text-transform:uppercase;letter-spacing:2px;margin-bottom:8px}
.page-title{font-size:28px;font-weight:900;letter-spacing:-1px;color:#0a0a0a;margin-bottom:4px}
.page-sub{font-size:13px;color:#888;font-weight:500}
.stats-row{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:32px}
.stat-card{background:#fff;border-radius:18px;border:1.5px solid #e0ede8;padding:28px 24px;box-shadow:0 2px 12px rgba(15,110,86,.05);display:flex;flex-direction:column;gap:8px}
.stat-icon{font-size:26px}
.stat-val{font-size:30px;font-weight:900;color:var(--green);letter-spacing:-1px}
.stat-label{font-size:11px;font-weight:700;color:#999;text-transform:uppercase;letter-spacing:1px}
@media(max-width:768px){
  .stats-row{grid-template-columns:repeat(2,1fr)}
  .nav-links{display:none}
  .hamburger{display:block}
  .page{padding:24px 16px}
}
`;