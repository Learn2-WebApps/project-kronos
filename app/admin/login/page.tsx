'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length !== 4) {
      setError('4자리 비밀번호를 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      if (!res.ok) throw new Error('비밀번호가 일치하지 않습니다.');

      const { token } = await res.json();
      sessionStorage.setItem('admin-token', token);
      router.push('/admin');
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] flex items-center justify-center p-8">
      <div className="w-full max-w-sm p-8 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-sm shadow-2xl">
        <h1 className="text-2xl font-bold mb-6 text-center text-[var(--accent-amber)] uppercase tracking-widest font-[var(--font-mono)]">Admin Login</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {error && <div className="p-3 bg-red-900/20 border border-red-500/30 text-red-200 text-sm text-center rounded-sm">{error}</div>}
          <input 
            type="password"
            maxLength={4}
            value={password}
            onChange={e => setPassword(e.target.value.replace(/[^0-9]/g, ''))}
            placeholder="비밀번호 4자리"
            className="w-full bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-sm p-3 text-center text-xl tracking-widest focus:outline-none focus:border-[var(--accent-amber)] transition-colors"
          />
          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[var(--accent-amber)] text-black font-bold uppercase tracking-widest rounded-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Login'}
          </button>
          
          <Link 
            href="/" 
            className="back-to-home-link"
          >
            ← 홈으로 돌아가기
          </Link>
        </form>
      </div>
    </div>
  );
}
