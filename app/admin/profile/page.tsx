'use client';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import api from '../../../services/api';
import { useRouter } from 'next/navigation';

export default function AdminProfilePage() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [uploadingPic, setUploadingPic] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resettingPwd, setResettingPwd] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await api.get('/users/profile');
        setUser(res.data.user);
      } catch (err) {
        console.error('Profile load failed', err);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [router]);

  const handleUpload = async () => {
    if (!file || !user?.id) return;
    setUploadingPic(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      await api.post(`/users/upload-profile-pic/${user.id}`, formData);
      alert('Profile picture updated!');
      setFile(null);
    } catch {
      alert('Upload failed');
    } finally {
      setUploadingPic(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!currentPassword.trim()) return alert('Please enter current password');
    if (!newPassword.trim()) return alert('New password cannot be empty');
    if (newPassword !== confirmPassword) return alert('Passwords do not match!');
    setResettingPwd(true);
    try {
      await api.patch('/users/reset-password', { currentPassword, newPassword });
      alert('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      alert('Current password is incorrect!');
    } finally {
      setResettingPwd(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (loading) {
    return (
      <>
        <style>{styles}</style>
        <div className="loading-screen">
          <div className="loading-spinner" />
          <p className="loading-text">Loading profile...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>

      <nav className="nav">
        <div className="nav-inner">
          <div className="logo">Sanaf<span className="logo-accent">ISP</span>.net<span className="admin-badge">Admin</span>
          </div>
          <div className="nav-links">
            <a href="/admin" className={`nav-link admin ${pathname === '/admin' ? 'active' : ''}`}>Admin Home</a>
            <a href="/admin/users" className={`nav-link admin ${pathname === '/admin/users' ? 'active' : ''}`}>Manage Users</a>
            <a href="/admin/complaints" className={`nav-link admin ${pathname === '/admin/complaints' ? 'active' : ''}`}>Complaints</a>
            <a href="/admin/profile" className={`nav-link admin ${pathname === '/admin/profile' ? 'active' : ''}`}>Profile</a>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
            <a href="/admin/profile" className="mobile-link" onClick={() => setMenuOpen(false)}>👤 Profile</a>
          </div>
        )}
      </nav>

      <div className="page">
        <div className="page-header">
          <div className="page-label">🛠️ Admin Panel</div>
          <div className="page-title">Account Settings</div>
          <div className="page-sub">{user?.email || '—'} — Admin profile management</div>
        </div>

        <div className="section-title">📋 Admin Information</div>
        <div className="info-card">
          <div className="info-grid">
            <div className="info-item">
              <div className="info-label">Full Name</div>
              <div className="info-val">{user?.fullName || '—'}</div>
            </div>
            <div className="info-item">
              <div className="info-label">Email</div>
              <div className="info-val">{user?.email || '—'}</div>
            </div>
            <div className="info-item">
              <div className="info-label">Phone</div>
              <div className="info-val">{user?.phone || '—'}</div>
            </div>
            <div className="info-item">
              <div className="info-label">Role</div>
              <div className="info-val">
                <span className="badge badge-admin">
                  <span className="badge-dot" /> Administrator
                </span>
              </div>
            </div>
            <div className="info-item">
              <div className="info-label">Account Status</div>
              <div className="info-val">
                <span className={`badge badge-${user?.status?.toLowerCase()}`}>
                  <span className="badge-dot" />{user?.status || '—'}
                </span>
              </div>
            </div>
            <div className="info-item">
              <div className="info-label">Member Since</div>
              <div className="info-val">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
                  : '—'}
              </div>
            </div>
          </div>
        </div>

        <div className="section-title">🖼️ Profile Picture</div>
        <div className="settings-card">
          <div className="upload-area">
            <div className="avatar-preview">
              {file ? (
                <img src={URL.createObjectURL(file)} alt="Preview" className="avatar-img" />
              ) : user?.profilePic ? (
                <img src={`/${user.profilePic}`} alt="Profile" className="avatar-img" />
              ) : (
                <div className="avatar-placeholder">
                  <span className="avatar-icon">🛡️</span>
                </div>
              )}
            </div>
            <div className="upload-info">
              <p className="upload-title">Change Profile Picture</p>
              <p className="upload-desc">Upload a JPG, PNG or GIF. Max size 2MB.</p>
              <label className="file-label">
                <input
                  type="file"
                  accept="image/*"
                  className="file-input-hidden"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                <span className="btn-choose">📁 Choose File</span>
              </label>
              {file && <p className="file-name">Selected: {file.name}</p>}
            </div>
          </div>
          <div className="card-footer">
            <button className="btn-action" onClick={handleUpload} disabled={!file || uploadingPic}>
              {uploadingPic ? 'Uploading...' : '⬆️ Upload Photo'}
            </button>
          </div>
        </div>

        <div className="section-title">🔒 Change Password</div>
        <div className="settings-card">
          <div className="pwd-area">
            <div className="pwd-field">
              <label className="pwd-label">Current Password</label>
              <input
                type="password"
                className="pwd-input"
                placeholder="Enter current password..."
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="pwd-field">
              <label className="pwd-label">New Password</label>
              <input
                type="password"
                className="pwd-input"
                placeholder="Enter new password..."
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="pwd-field">
              <label className="pwd-label">Confirm New Password</label>
              <input
                type="password"
                className="pwd-input"
                placeholder="Confirm new password..."
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
          <div className="card-footer">
            <button
              className="btn-action"
              onClick={handlePasswordReset}
              disabled={!currentPassword || !newPassword || !confirmPassword || resettingPwd}
            >
              {resettingPwd ? 'Saving...' : '🔑 Update Password'}
            </button>
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
.logo { font-size: 20px; font-weight: 900; color: var(--green); letter-spacing: -1px; }
.logo-accent { color: var(--gold); }
.admin-badge{font-size:10px;font-weight:700;background:var(--gold-light);color:var(--gold);border:1px solid #e8c97a;padding:2px 8px;border-radius:20px;letter-spacing:1px;text-transform:uppercase;margin-left:6px;vertical-align:middle;position:relative;top:-1px}.nav-links{display:flex;align-items:center;gap:22px}
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
.page{max-width:800px;margin:0 auto;padding:48px 24px}
.page-header{margin-bottom:36px}
.page-label{font-size:11px;font-weight:700;color:var(--green);text-transform:uppercase;letter-spacing:2px;margin-bottom:8px}
.page-title{font-size:28px;font-weight:900;letter-spacing:-1px;color:#0a0a0a;margin-bottom:4px}
.page-sub{font-size:13px;color:#888;font-weight:500}
.section-title{font-size:13px;font-weight:800;color:#0a0a0a;margin-bottom:14px;margin-top:32px}
.info-card{background:#fff;border-radius:20px;border:1.5px solid #e0ede8;overflow:hidden;box-shadow:0 2px 12px rgba(15,110,86,.05);padding:28px;margin-bottom:8px}
.info-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:20px}
.info-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#999;margin-bottom:5px}
.info-val{font-size:14px;font-weight:600;color:#111}
.badge{display:inline-flex;align-items:center;gap:5px;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:700}
.badge-active{background:#dcfce7;color:#16a34a}
.badge-inactive{background:#fee2e2;color:#dc2626}
.badge-pending{background:var(--gold-light);color:var(--gold)}
.badge-admin{background:var(--gold-light);color:var(--gold)}
.badge-dot{width:6px;height:6px;border-radius:50%;background:currentColor}
.settings-card{background:#fff;border-radius:20px;border:1.5px solid #e0ede8;overflow:hidden;box-shadow:0 2px 12px rgba(15,110,86,.05)}
.upload-area{display:flex;align-items:center;gap:28px;padding:28px}
.avatar-preview{flex-shrink:0;width:88px;height:88px;border-radius:50%;overflow:hidden;border:3px solid var(--gold-light);box-shadow:0 4px 16px rgba(186,117,23,.15)}
.avatar-img{width:100%;height:100%;object-fit:cover}
.avatar-placeholder{width:100%;height:100%;background:var(--gold-light);display:flex;align-items:center;justify-content:center}
.avatar-icon{font-size:34px;opacity:.6}
.upload-info{flex:1}
.upload-title{font-size:14px;font-weight:700;color:#111;margin-bottom:4px}
.upload-desc{font-size:12px;color:#999;margin-bottom:14px}
.file-label{cursor:pointer;display:inline-block}
.file-input-hidden{display:none}
.btn-choose{display:inline-block;background:var(--green-light);color:var(--green);padding:9px 18px;border-radius:30px;font-size:12px;font-weight:700;transition:all .2s;border:1.5px solid #c0e6d8}
.btn-choose:hover{background:#c5eed8;transform:translateY(-1px)}
.file-name{margin-top:8px;font-size:11px;color:var(--gold);font-weight:600}
.pwd-area{display:flex;flex-direction:column;gap:18px;padding:28px}
.pwd-label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:#888;display:block;margin-bottom:7px}
.pwd-input{width:100%;border:1.5px solid #e0ede8;border-radius:12px;padding:12px 16px;font-size:13px;font-family:'Sora',sans-serif;background:#fafcfb;outline:none;color:#111;transition:border-color .2s}
.pwd-input:focus{border-color:var(--green);background:#fff}
.card-footer{padding:18px 28px;background:#f9fcfb;border-top:1px solid #f0f4f2}
.btn-action{background:var(--green);color:#fff;padding:12px 28px;border-radius:30px;font-size:13px;font-weight:700;border:none;cursor:pointer;font-family:'Sora',sans-serif;transition:all .25s}
.btn-action:hover{background:var(--green-dark);transform:translateY(-1px);box-shadow:0 6px 20px rgba(15,110,86,.25)}
.btn-action:disabled{opacity:.4;cursor:not-allowed;transform:none;box-shadow:none}
@media(max-width:768px){
  .info-grid{grid-template-columns:1fr}
  .upload-area{flex-direction:column;text-align:center}
  .nav-links{display:none}
  .hamburger{display:block}
}
`;