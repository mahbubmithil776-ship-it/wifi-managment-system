'use client';
import { useEffect, useState, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import api from '../../../services/api';
import { useRouter } from 'next/navigation';

function BillingsContent() {
  const [billings, setBillings] = useState([]);
  const [transactionId, setTransactionId] = useState('');
  const [selectedBillId, setSelectedBillId] = useState<number | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const profileRes = await api.get('/users/profile');
      const userData = profileRes.data.user || profileRes.data;
      setUser(userData);
      if (userData?.id) {
        const billRes = await api.get(`/users/${userData.id}/billings`);
        setBillings(billRes.data);
      }
    } catch (err) {
      console.error('Data loading failed', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const status = searchParams.get('payment');
    if (status === 'success') {
      setSuccessMsg('✅ Payment successful! Your bill has been marked as Paid.');
      loadData();
      router.replace('/dashboard/billings');
    }
  }, [searchParams]);

  const totalBilled = billings.reduce((s, b: any) => s + Number(b.amount), 0);
  const totalPaid = billings.filter((b: any) => b.status === 'Paid').reduce((s, b: any) => s + Number(b.amount), 0);
  const due = totalBilled - totalPaid;

  const handlePayment = async (billingId: number) => {
  try {
    const res = await api.post(`/users/pay/${billingId}`);
    if (res.data.url) window.location.href = res.data.url;
  } catch {
    alert('Payment initialization failed!');
  }
};

  const handleManualSubmit = async () => {
    if (!selectedBillId || !transactionId.trim()) return;
    setSubmitting(true);
    try {
      await api.post(`/billings/${selectedBillId}/manual-pay`, { transactionId });
      alert('Transaction submitted! Awaiting admin verification.');
      setSelectedBillId(null);
      setTransactionId('');
      await loadData();
    } catch {
      alert('Submission failed!');
    } finally {
      setSubmitting(false);
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
          <p className="loading-text">Loading billing data...</p>
        </div>
      </>
    );
  }

  const unpaidBill: any = billings.find((b: any) => b.status === 'Unpaid');

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
          <div className="page-label">💳 My Account</div>
          <div className="page-title">Billing & Payments</div>
          <div className="page-sub">{user?.email || 'Loading...'} — {user?.package?.name || 'Standard Plan'}</div>
        </div>

        
        {successMsg && (
          <div className="success-banner">
            {successMsg}
            <button className="close-btn" onClick={() => setSuccessMsg('')}>✕</button>
          </div>
        )}

        <div className="cards">
          <div className="card c-blue">
            <div className="card-label">Total Billed</div>
            <div className="card-val">৳ {totalBilled.toLocaleString()}</div>
            <div className="card-icon">📋</div>
          </div>
          <div className="card c-green">
            <div className="card-label">Total Paid</div>
            <div className="card-val">৳ {totalPaid.toLocaleString()}</div>
            <div className="card-icon">✅</div>
          </div>
          <div className="card c-gold">
            <div className="card-label">Due Amount</div>
            <div className="card-val">৳ {due.toLocaleString()}</div>
            <div className="card-icon">⚠️</div>
          </div>
        </div>

        {unpaidBill && (
          <div className="due-banner">
            <div className="due-left">
              <div className="due-tag"><div className="due-pulse" />Payment Due</div>
              <h3 className="due-title">{unpaidBill.month} Bill is Unpaid</h3>
              <p className="due-desc">Pay now to avoid suspension</p>
            </div>
            <div className="due-amount">৳ {unpaidBill.amount} <span className="due-amount-sub">/ this month</span></div>
            <div className="due-btns">
              <button className="btn-pay" onClick={() => handlePayment(unpaidBill.id)}>⚡ Pay Online (SSLCommerz)</button>
              <button className="btn-manual" onClick={() => setSelectedBillId(unpaidBill.id)}>📝 Submit Transaction ID</button>
            </div>
          </div>
        )}

        {selectedBillId && (
          <div className="txn-box">
            <input
              type="text"
              className="txn-input"
              placeholder="Enter bKash / Nagad / Rocket Transaction ID..."
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
            />
            <button className="btn-submit" onClick={handleManualSubmit} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
            <button className="btn-cancel" onClick={() => setSelectedBillId(null)}>Cancel</button>
          </div>
        )}

        <div className="table-header">
          <div className="table-title">Payment History</div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Month</th>
                <th>Package</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Paid On</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {billings.length > 0 ? (
                billings.map((bill: any) => (
                  <tr key={bill.id}>
                    <td><div className="month-cell">{bill.month}</div></td>
                    <td>{user?.package?.name || '—'}</td>
                    <td><strong>৳ {bill.amount}</strong></td>
                    <td>
                      <span className={`badge badge-${bill.status.toLowerCase().replace(' ', '-')}`}>
                        <span className="badge-dot" />{bill.status}
                      </span>
                    </td>
                    <td className="act-na">
                      {bill.status === 'Paid'
                        ? bill.paymentDate
                          ? new Date(bill.paymentDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                          : '—'
                        : '—'}
                    </td>
                    <td>
                      {bill.status === 'Unpaid' ? (
                        <button className="act-btn" onClick={() => handlePayment(bill.id)}>Pay Now</button>
                      ) : bill.status === 'Pending Verification' || bill.status === 'Pending' ? (
                        <span className="awaiting">⏳ Awaiting admin</span>
                      ) : (
                        <span className="act-na">—</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6}>
                    <div className="empty"><div className="empty-icon">🧾</div>No billing history found.</div>
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

export default function BillingsPage() {
  return (
    <Suspense fallback={<div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh'}}>Loading...</div>}>
      <BillingsContent />
    </Suspense>
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
.page{max-width:1000px;margin:0 auto;padding:48px 24px}
.page-header{margin-bottom:36px}
.page-label{font-size:11px;font-weight:700;color:var(--green);text-transform:uppercase;letter-spacing:2px;margin-bottom:8px}
.page-title{font-size:28px;font-weight:900;letter-spacing:-1px;color:#0a0a0a;margin-bottom:4px}
.page-sub{font-size:13px;color:#888;font-weight:500}
.success-banner{background:#dcfce7;border:1.5px solid #86efac;border-radius:14px;padding:16px 20px;margin-bottom:24px;font-size:13px;font-weight:600;color:#166534;display:flex;align-items:center;justify-content:space-between}
.close-btn{background:none;border:none;cursor:pointer;font-size:14px;color:#166534;padding:0 4px}
.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-bottom:32px}
.card{background:#fff;border-radius:20px;padding:24px;border:1.5px solid #e0ede8;position:relative;overflow:hidden;transition:transform .3s,box-shadow .3s}
.card:hover{transform:translateY(-4px);box-shadow:0 16px 40px rgba(15,110,86,.10)}
.card::before{content:'';position:absolute;top:0;left:0;width:4px;height:100%;border-radius:4px 0 0 4px}
.c-blue::before{background:linear-gradient(180deg,var(--green),#1db87e)}
.c-green::before{background:linear-gradient(180deg,#22c55e,#16a34a)}
.c-gold::before{background:linear-gradient(180deg,var(--gold),#e8961c)}
.card-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#999;margin-bottom:10px}
.card-val{font-size:26px;font-weight:900;letter-spacing:-1px}
.c-blue .card-val{color:var(--green)}
.c-green .card-val{color:#16a34a}
.c-gold .card-val{color:var(--gold)}
.card-icon{position:absolute;right:18px;top:50%;transform:translateY(-50%);font-size:32px;opacity:.12}
.due-banner{background:linear-gradient(135deg,#063d2f 0%,var(--green-dark) 60%,#0f6e56 100%);border-radius:20px;padding:28px 32px;display:flex;align-items:center;justify-content:space-between;margin-bottom:32px;gap:16px;box-shadow:0 8px 32px rgba(15,110,86,.25)}
.due-tag{display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.2);color:#fff;font-size:10px;font-weight:700;padding:4px 12px;border-radius:20px;margin-bottom:10px;letter-spacing:.8px;text-transform:uppercase}
.due-pulse{width:6px;height:6px;border-radius:50%;background:#fbbf24;position:relative;flex-shrink:0}
.due-pulse::after{content:'';position:absolute;inset:-3px;border-radius:50%;border:2px solid #fbbf24;animation:ping 1.6s ease-out infinite;opacity:0}
@keyframes ping{0%{transform:scale(1);opacity:.7}100%{transform:scale(2.2);opacity:0}}
.due-title{font-size:15px;font-weight:800;color:#fff;margin-bottom:6px}
.due-desc{font-size:12px;color:rgba(255,255,255,.6)}
.due-amount{font-size:38px;font-weight:900;color:#4ade80;letter-spacing:-2px;white-space:nowrap}
.due-amount-sub{font-size:14px;color:rgba(255,255,255,.5);font-weight:400}
.due-btns{display:flex;flex-direction:column;gap:10px;flex-shrink:0}
.btn-pay{background:#22c55e;color:#fff;padding:12px 24px;border-radius:30px;font-size:13px;font-weight:700;border:none;cursor:pointer;font-family:'Sora',sans-serif;transition:all .25s;white-space:nowrap}
.btn-pay:hover{background:#16a34a;transform:translateY(-1px);box-shadow:0 6px 20px rgba(34,197,94,.35)}
.btn-manual{background:rgba(255,255,255,.1);color:#fff;padding:12px 24px;border-radius:30px;font-size:13px;font-weight:700;border:1.5px solid rgba(255,255,255,.2);cursor:pointer;font-family:'Sora',sans-serif;transition:all .25s;white-space:nowrap}
.btn-manual:hover{background:rgba(255,255,255,.2)}
.txn-box{background:var(--gold-light);border:1.5px solid #e8c97a;border-radius:16px;padding:20px 24px;margin-bottom:28px;display:flex;gap:12px;align-items:center}
.txn-input{flex:1;border:1.5px solid #e8c97a;border-radius:10px;padding:11px 16px;font-size:13px;font-family:'Sora',sans-serif;background:#fff;outline:none;color:#111;transition:border-color .2s}
.txn-input:focus{border-color:var(--gold)}
.btn-submit{background:var(--gold);color:#fff;padding:11px 22px;border-radius:10px;font-size:13px;font-weight:700;border:none;cursor:pointer;font-family:'Sora',sans-serif;white-space:nowrap;transition:all .25s}
.btn-submit:hover{background:#9a6010}
.btn-submit:disabled{opacity:0.5;cursor:not-allowed}
.btn-cancel{background:transparent;color:#888;font-size:13px;border:none;cursor:pointer;font-family:'Sora',sans-serif;padding:0 8px}
.btn-cancel:hover{color:#555}
.table-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}
.table-title{font-size:15px;font-weight:800;color:#0a0a0a}
.table-wrap{background:#fff;border-radius:20px;border:1.5px solid #e0ede8;overflow:hidden;box-shadow:0 2px 12px rgba(15,110,86,.05)}
table{width:100%;border-collapse:collapse}
thead{background:linear-gradient(90deg,#f4f8f6,#f0faf6)}
thead th{padding:14px 20px;text-align:left;font-size:10px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:1.2px}
tbody tr{border-top:1px solid #f0f4f2;transition:background .15s}
tbody tr:hover{background:#f9fcfb}
tbody td{padding:16px 20px;font-size:13px;font-weight:500}
.badge{display:inline-flex;align-items:center;gap:5px;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:700}
.badge-paid{background:#dcfce7;color:#16a34a}
.badge-unpaid{background:#fee2e2;color:#dc2626}
.badge-pending{background:var(--gold-light);color:var(--gold)}
.badge-pending-verification{background:var(--gold-light);color:var(--gold)}
.badge-dot{width:6px;height:6px;border-radius:50%;background:currentColor}
.act-btn{background:var(--green);color:#fff;padding:7px 16px;border-radius:20px;font-size:11px;font-weight:700;border:none;cursor:pointer;font-family:'Sora',sans-serif;transition:all .2s}
.act-btn:hover{background:var(--green-dark);transform:translateY(-1px)}
.act-na{color:#ccc;font-size:12px}
.awaiting{font-size:11px;color:var(--gold);font-weight:600}
.month-cell{font-weight:700;color:#111}
.empty{text-align:center;padding:48px;color:#bbb;font-size:13px}
.empty-icon{font-size:40px;margin-bottom:12px}
@media(max-width:768px){.cards{grid-template-columns:1fr}.due-banner{flex-direction:column;text-align:center}.nav-links{display:none}}
`;