'use client';
import { useRouter } from 'next/navigation';

export default function PaymentFailedPage() {
  const router = useRouter();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', 
                  justifyContent: 'center', background: '#f4f8f6', fontFamily: 'Sora, sans-serif' }}>
      <div style={{ background: '#fff', borderRadius: 24, padding: '48px 40px', 
                    textAlign: 'center', boxShadow: '0 8px 40px rgba(220,38,38,.08)', maxWidth: 420 }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>❌</div>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: '#dc2626', marginBottom: 8 }}>
          Payment Failed
        </h1>
        <p style={{ color: '#666', fontSize: 13, marginBottom: 28 }}>
          Payment failed. Please try again.
        </p>
        <button
          onClick={() => router.push('/dashboard/billings')}
          style={{ background: '#dc2626', color: '#fff', border: 'none', 
                   borderRadius: 30, padding: '12px 32px', fontSize: 13, 
                   fontWeight: 700, cursor: 'pointer' }}>
          Try Again
        </button>
      </div>
    </div>
  );
}