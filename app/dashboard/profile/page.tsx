'use client';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import api from '../../../services/api';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [uploadingPic, setUploadingPic] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resettingPwd, setResettingPwd] = useState(false);

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
    if (!newPassword.trim()) return alert('Password cannot be empty');
    if (newPassword !== confirmPassword) return alert('Passwords do not match!');
    setResettingPwd(true);
    try {
      await api.patch('/users/reset-password', { newPassword });
      alert('Password changed successfully!');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      alert('Password change failed!');
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
          <div className="logo">Sanaf<span className="logo-accent">ISP</span>.net</div>
          <div className="nav-links">
            <a href="/dashboard" className={`nav-link ${pathname === '/dashboard' ? 'active' : ''}`}>User Dashboard</a>
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
          <div className="page-title">Account Settings</div>
          <div className="page-sub">{user?.email || '—'} — Manage your profile</div>
        </div>

        <div className="section-title">📋 Profile Information</div>
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
              <div className="info-label">Package</div>
              <div className="info-val">{user?.package?.name || 'No package assigned'}</div>
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
                  <span className="avatar-icon">👤</span>
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
              <label className="pwd-label">Confirm Password</label>
              <input
                type="password"
                className="pwd-input"
                placeholder="Re-enter new password..."
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
          <div className="card-footer">
            <button
              className="btn-action"
              onClick={handlePasswordReset}
              disabled={!newPassword || !confirmPassword || resettingPwd}
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
.logo{font-size:20px;font-weight:900;color:var(--green);letter-spacing:-1px}
.logo-accent{color:var(--gold)}
.nav-links{display:flex;align-items:center;gap:22px}
.nav-link{font-size:13px;font-weight:600;color:#555;text-decoration:none;padding-bottom:2px;border-bottom:2px solid transparent;transition:color .2s,border-color .2s}
.nav-link:hover{color:var(--green)}
.nav-link.active{color:var(--green);border-bottom-color:var(--green)}
.logout-btn{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:700;color:#fff;background:linear-gradient(135deg,#dc2626,#b91c1c);border:none;border-radius:20px;padding:8px 18px;cursor:pointer;font-family:'Sora',sans-serif;box-shadow:0 4px 12px rgba(220,38,38,0.25);transition:all .2s}
.logout-btn:hover{transform:translateY(-1px);box-shadow:0 6px 18px rgba(220,38,38,0.35)}
.logout-icon{font-size:13px}
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
.badge-dot{width:6px;height:6px;border-radius:50%;background:currentColor}
.settings-card{background:#fff;border-radius:20px;border:1.5px solid #e0ede8;overflow:hidden;box-shadow:0 2px 12px rgba(15,110,86,.05)}
.upload-area{display:flex;align-items:center;gap:28px;padding:28px}
.avatar-preview{flex-shrink:0;width:88px;height:88px;border-radius:50%;overflow:hidden;border:3px solid var(--green-light);box-shadow:0 4px 16px rgba(15,110,86,.12)}
.avatar-img{width:100%;height:100%;object-fit:cover}
.avatar-placeholder{width:100%;height:100%;background:var(--green-light);display:flex;align-items:center;justify-content:center}
.avatar-icon{font-size:34px;opacity:.5}
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
@media(max-width:768px){.info-grid{grid-template-columns:1fr}.upload-area{flex-direction:column;text-align:center}.nav-links{display:none}}
`;