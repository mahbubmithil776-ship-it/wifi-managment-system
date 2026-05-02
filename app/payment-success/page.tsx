'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';

function PaymentSuccessContent() {
  const params = useSearchParams();
  const router = useRouter();
  const tranId = params.get('tran_id');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', 
                  justifyContent: 'center', background: '#f4f8f6', fontFamily: 'Sora, sans-serif' }}>
      <div style={{ background: '#fff', borderRadius: 24, padding: '48px 40px', 
                    textAlign: 'center', boxShadow: '0 8px 40px rgba(15,110,86,.12)', maxWidth: 420 }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: '#0F6E56', marginBottom: 8 }}>
          Payment Successful!
        </h1>
        <p style={{ color: '#666', fontSize: 13, marginBottom: 8 }}>
          Your bill payment was successful.
        </p>
        {tranId && (
          <p style={{ color: '#aaa', fontSize: 11, marginBottom: 28 }}>
            Transaction: {tranId}
          </p>
        )}
        <button
          onClick={() => router.push('/dashboard/billings')}
          style={{ background: '#0F6E56', color: '#fff', border: 'none', 
                   borderRadius: 30, padding: '12px 32px', fontSize: 13, 
                   fontWeight: 700, cursor: 'pointer' }}>
          Back to Billings
        </button>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', 
                    justifyContent: 'center', background: '#f4f8f6' }}>
        <div style={{ fontSize: 13, color: '#0F6E56', fontWeight: 700 }}>Loading...</div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}