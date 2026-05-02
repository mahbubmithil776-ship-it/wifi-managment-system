'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import api from '../../../services/api';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  status: string;
  package?: { id?: number; name: string };
}

interface Package {
  id: number;
  name: string;
  price: number;
}

const emptyForm = { fullName: '', email: '', phone: '', password: '', packageId: '' };

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [disabling, setDisabling] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const loadData = async () => {
    try {
      const [usersRes, pkgRes] = await Promise.all([
        api.get('/users'),
        api.get('/packages'),
      ]);
      setUsers(usersRes.data);
      setPackages(pkgRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const openCreate = () => {
    setEditUser(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (user: User) => {
    setEditUser(user);
    setForm({
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      password: '',
      packageId: user.package?.id?.toString() || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.fullName || !form.email || !form.phone) {
      alert('Enter Name, Email and Phone!');
      return;
    }
    if (!editUser && !form.password) {
      alert('Enter Password!');
      return;
    }
    setSubmitting(true);
    try {
      if (editUser) {
        const updateData: any = {
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
        };
        if (form.packageId) updateData.packageId = Number(form.packageId);
        await api.patch(`/users/${editUser.id}`, updateData);
        alert('User updated successfully!');
      } else {
        const createData: any = {
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          password: form.password,
        };
        if (form.packageId) createData.packageId = Number(form.packageId);
        await api.post('/users', createData);
        alert('User created successfully!');
      }
      setShowModal(false);
      await loadData();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed!');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (userId: number, name: string) => {
    if (!confirm(`Delete "${name}"? This action cannot be undone!`)) return;
    setDeleting(userId);
    try {
      await api.delete(`/users/${userId}`);
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch {
      alert('Delete failed!');
    } finally {
      setDeleting(null);
    }
  };

  const createBill = async (userId: number) => {
    const amount = prompt('Enter Monthly Bill Amount (e.g. 500):');
    if (!amount) return;
    try {
      await api.post(`/users/${userId}/billings`, {
        amount: Number(amount),
        month: new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' }),
        status: 'Unpaid',
      });
      alert('Bill Generated Successfully!');
    } catch {
      alert('Failed to generate bill');
    }
  };

  const toggleStatus = async (userId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    if (!confirm(`Are you sure you want to ${newStatus} this user?`)) return;
    setDisabling(userId);
    try {
      await api.patch(`/users/${userId}/status`, { status: newStatus });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
    } catch {
      alert('Failed to update status');
    } finally {
      setDisabling(null);
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
          <p className="loading-text">Loading users...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{editUser ? '✏️ Edit User' : '➕ Create New User'}</div>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  className="form-input"
                  placeholder="e.g. John Doe"
                  value={form.fullName}
                  onChange={e => setForm({ ...form, fullName: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  className="form-input"
                  placeholder="e.g. john@example.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Phone *</label>
                <input
                  className="form-input"
                  placeholder="e.g. 01700000000"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              {!editUser && (
                <div className="form-group">
                  <label>Password *</label>
                  <input
                    className="form-input"
                    type="password"
                    placeholder="Minimum 6 characters"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                  />
                </div>
              )}
              <div className="form-group">
                <label>Package</label>
                <select
                  className="form-input"
                  value={form.packageId}
                  onChange={e => setForm({ ...form, packageId: e.target.value })}
                >
                  <option value="">— Select Package —</option>
                  {packages.map(pkg => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.name} — ৳{pkg.price}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel-modal" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-submit-modal" onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Saving...' : editUser ? '✅ Update User' : '✅ Create User'}
              </button>
            </div>
          </div>
        </div>
      )}

      <nav className="nav">
        <div className="nav-inner">
          <div className="logo">Sanaf<span className="logo-accent">ISP</span>.net</div>
          <div className="nav-links">
            <a href="/admin" className={`nav-link admin ${pathname === '/admin' ? 'active' : ''}`}>Admin Home</a>
            <a href="/admin/users" className={`nav-link admin ${pathname === '/admin/users' ? 'active' : ''}`}>Manage Users</a>
            <a href="/admin/complaints" className={`nav-link admin ${pathname === '/admin/complaints' ? 'active' : ''}`}>Complaints</a>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <span className="logout-icon">⏻</span> Logout
          </button>
        </div>
      </nav>

      <div className="page">
        <div className="page-header">
          <div className="page-label">🛠️ Admin Panel</div>
          <div className="page-title">User Management</div>
          <div className="page-sub">Manage all ISP users, generate bills and control connections</div>
        </div>

        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-val">{users.length}</div>
            <div className="stat-label">Total Users</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-val">{users.filter(u => u.status === 'active').length}</div>
            <div className="stat-label">Active</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🚫</div>
            <div className="stat-val">{users.filter(u => u.status === 'inactive').length}</div>
            <div className="stat-label">Inactive</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-val">{users.filter(u => u.status === 'pending').length}</div>
            <div className="stat-label">Pending</div>
          </div>
        </div>

        <div className="section-header">
          <div className="section-title">📋 All Users</div>
          <button className="btn-create" onClick={openCreate}>➕ Create User</button>
        </div>

        <div className="table-card">
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Package</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr key={user.id}>
                    <td className="td-num">{index + 1}</td>
                    <td className="td-name">{user.fullName}</td>
                    <td className="td-muted">{user.email}</td>
                    <td className="td-muted">{user.phone}</td>
                    <td className="td-muted">{user.package?.name || '—'}</td>
                    <td>
                      <span className={`badge badge-${user.status?.toLowerCase()}`}>
                        <span className="badge-dot" />
                        {user.status || '—'}
                      </span>
                    </td>
                    <td>
                      <div className="action-btns">
                        <button className="btn-bill" onClick={() => createBill(user.id)}>🧾 Bill</button>
                        <button className="btn-edit" onClick={() => openEdit(user)}>✏️ Edit</button>
                        <button
                          className={user.status === 'active' ? 'btn-disable' : 'btn-enable'}
                          onClick={() => toggleStatus(user.id, user.status)}
                          disabled={disabling === user.id}
                        >
                          {disabling === user.id ? '...' : user.status === 'active' ? '🚫 Disable' : '✅ Enable'}
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(user.id, user.fullName)}
                          disabled={deleting === user.id}
                        >
                          {deleting === user.id ? '...' : '🗑️ Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={7} className="td-empty">No users found</td>
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
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --green: #0F6E56; --green-dark: #085041; --green-light: #e1f5ee;
  --gold: #BA7517; --gold-light: #faeeda; --bg: #f4f8f6;
}
body { font-family: 'Sora', sans-serif; background: var(--bg); color: #111; min-height: 100vh; }
.loading-screen { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; background: var(--bg); gap: 16px; }
.loading-spinner { width: 36px; height: 36px; border: 3px solid #e0ede8; border-top-color: var(--green); border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.loading-text { font-size: 13px; font-weight: 700; color: var(--green); }
.nav { background: rgba(255,255,255,0.95); backdrop-filter: blur(12px); border-bottom: 1px solid #e0ede8; padding: 0 5vw; position: sticky; top: 0; z-index: 100; box-shadow: 0 4px 24px rgba(15,110,86,.07); }
.nav-inner { max-width: 1160px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; height: 64px; }
.logo { font-size: 20px; font-weight: 900; color: var(--green); letter-spacing: -1px; }
.logo-accent { color: var(--gold); }
.nav-links { display: flex; align-items: center; gap: 22px; }
.nav-link { font-size: 13px; font-weight: 600; color: #555; text-decoration: none; padding-bottom: 2px; border-bottom: 2px solid transparent; transition: color .2s, border-color .2s; }
.nav-link:hover { color: var(--green); }
.nav-link.active { color: var(--green); border-bottom-color: var(--green); }
.nav-link.admin { color: var(--green); font-size: 13px; }
.logout-btn { background: #fee2e2; color: #dc2626; border: 1.5px solid #fca5a5; border-radius: 20px; padding: 7px 16px; font-size: 12px; font-weight: 700; cursor: pointer; font-family: 'Sora', sans-serif; display: flex; align-items: center; gap: 6px; transition: all .2s; }
.logout-btn:hover { background: #dc2626; color: #fff; }
.logout-icon { font-size: 14px; }
.page { max-width: 1200px; margin: 0 auto; padding: 48px 24px; }
.page-header { margin-bottom: 32px; }
.page-label { font-size: 11px; font-weight: 700; color: var(--green); text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px; }
.page-title { font-size: 28px; font-weight: 900; letter-spacing: -1px; color: #0a0a0a; margin-bottom: 4px; }
.page-sub { font-size: 13px; color: #888; font-weight: 500; }
.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
.stat-card { background: #fff; border-radius: 18px; border: 1.5px solid #e0ede8; padding: 20px 24px; box-shadow: 0 2px 12px rgba(15,110,86,.05); display: flex; flex-direction: column; gap: 6px; }
.stat-icon { font-size: 22px; }
.stat-val { font-size: 26px; font-weight: 900; color: var(--green); letter-spacing: -1px; }
.stat-label { font-size: 11px; font-weight: 700; color: #999; text-transform: uppercase; letter-spacing: 1px; }
.section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; margin-top: 8px; }
.section-title { font-size: 13px; font-weight: 800; color: #0a0a0a; }
.btn-create { background: var(--green); color: #fff; border: none; border-radius: 20px; padding: 9px 20px; font-size: 12px; font-weight: 700; cursor: pointer; font-family: 'Sora', sans-serif; transition: all .2s; }
.btn-create:hover { background: var(--green-dark); transform: translateY(-1px); box-shadow: 0 4px 14px rgba(15,110,86,.25); }
.table-card { background: #fff; border-radius: 20px; border: 1.5px solid #e0ede8; overflow: hidden; box-shadow: 0 2px 12px rgba(15,110,86,.05); }
.table-wrap { overflow-x: auto; }
.table { width: 100%; border-collapse: collapse; }
.table thead tr { background: #f4f8f6; }
.table th { padding: 14px 18px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #888; text-align: left; white-space: nowrap; }
.table tbody tr { border-top: 1px solid #f0f4f2; transition: background .15s; }
.table tbody tr:hover { background: #fafcfb; }
.table td { padding: 12px 18px; font-size: 13px; vertical-align: middle; white-space: nowrap; }
.td-num { font-size: 12px; color: #bbb; font-weight: 700; width: 40px; }
.td-name { font-weight: 700; color: #111; }
.td-muted { color: #666; font-weight: 500; }
.td-empty { text-align: center; color: #bbb; font-size: 13px; padding: 40px !important; }
.badge { display: inline-flex; align-items: center; gap: 5px; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; }
.badge-active { background: #dcfce7; color: #16a34a; }
.badge-inactive { background: #fee2e2; color: #dc2626; }
.badge-pending { background: var(--gold-light); color: var(--gold); }
.badge-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
.action-btns { display: flex; gap: 4px; flex-wrap: nowrap; align-items: center; }
.btn-bill { background: var(--green-light); color: var(--green); border: 1.5px solid #c0e6d8; border-radius: 20px; padding: 5px 10px; font-size: 11px; font-weight: 700; cursor: pointer; font-family: 'Sora', sans-serif; transition: all .2s; white-space: nowrap; }
.btn-bill:hover { background: #c5eed8; }
.btn-edit { background: #eff6ff; color: #2563eb; border: 1.5px solid #bfdbfe; border-radius: 20px; padding: 5px 10px; font-size: 11px; font-weight: 700; cursor: pointer; font-family: 'Sora', sans-serif; transition: all .2s; white-space: nowrap; }
.btn-edit:hover { background: #dbeafe; }
.btn-disable { background: #fee2e2; color: #dc2626; border: 1.5px solid #fecaca; border-radius: 20px; padding: 5px 10px; font-size: 11px; font-weight: 700; cursor: pointer; font-family: 'Sora', sans-serif; transition: all .2s; white-space: nowrap; }
.btn-disable:hover { background: #fecaca; }
.btn-disable:disabled { opacity: .4; cursor: not-allowed; }
.btn-enable { background: #dcfce7; color: #16a34a; border: 1.5px solid #bbf7d0; border-radius: 20px; padding: 5px 10px; font-size: 11px; font-weight: 700; cursor: pointer; font-family: 'Sora', sans-serif; transition: all .2s; white-space: nowrap; }
.btn-enable:hover { background: #bbf7d0; }
.btn-delete { background: #fff1f2; color: #e11d48; border: 1.5px solid #fecdd3; border-radius: 20px; padding: 5px 10px; font-size: 11px; font-weight: 700; cursor: pointer; font-family: 'Sora', sans-serif; transition: all .2s; white-space: nowrap; }
.btn-delete:hover { background: #fecdd3; }
.btn-delete:disabled { opacity: .4; cursor: not-allowed; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); backdrop-filter: blur(4px); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 24px; }
.modal { background: #fff; border-radius: 24px; width: 100%; max-width: 480px; box-shadow: 0 24px 80px rgba(0,0,0,0.18); overflow: hidden; }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 24px 28px 0; }
.modal-title { font-size: 16px; font-weight: 800; color: #0a0a0a; }
.modal-close { background: #f4f4f4; border: none; border-radius: 50%; width: 32px; height: 32px; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background .2s; }
.modal-close:hover { background: #e5e5e5; }
.modal-body { padding: 20px 28px; display: flex; flex-direction: column; gap: 14px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group label { font-size: 11px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 1px; }
.form-input { border: 1.5px solid #e0ede8; border-radius: 10px; padding: 10px 14px; font-size: 13px; font-family: 'Sora', sans-serif; outline: none; color: #111; transition: border-color .2s; background: #fafcfb; }
.form-input:focus { border-color: var(--green); background: #fff; }
.modal-footer { padding: 0 28px 24px; display: flex; gap: 10px; justify-content: flex-end; }
.btn-cancel-modal { background: #f4f4f4; color: #555; border: none; border-radius: 10px; padding: 10px 20px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'Sora', sans-serif; transition: background .2s; }
.btn-cancel-modal:hover { background: #e5e5e5; }
.btn-submit-modal { background: var(--green); color: #fff; border: none; border-radius: 10px; padding: 10px 24px; font-size: 13px; font-weight: 700; cursor: pointer; font-family: 'Sora', sans-serif; transition: all .2s; }
.btn-submit-modal:hover { background: var(--green-dark); }
.btn-submit-modal:disabled { opacity: .5; cursor: not-allowed; }
@media (max-width: 768px) { .stats-row { grid-template-columns: repeat(2, 1fr); } .nav-links { display: none; } .page { padding: 24px 16px; } .action-btns { flex-wrap: wrap; } }
`;