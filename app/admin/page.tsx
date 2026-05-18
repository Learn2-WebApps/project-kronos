'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ensureAuth, db } from '@/lib/firebase';
import { 
  doc, getDoc, setDoc, deleteDoc, getDocs, 
  collection, serverTimestamp, query, orderBy 
} from 'firebase/firestore';

export default function AdminPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // 세션 목록 로드
  const loadSessions = useCallback(async () => {
    try {
      await ensureAuth();
      const q = query(collection(db, 'sessions'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setSessions(list);
    } catch (err) {
      console.error('[load sessions]', err);
    }
  }, []);

  // 인증 체크
  useEffect(() => {
    const token = sessionStorage.getItem('admin-token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    loadSessions();
  }, [router, loadSessions]);
  
  // 세션 생성
  const handleCreate = async () => {
    if (!/^\d{4}$/.test(code)) {
      alert('입장코드는 4자리 숫자여야 합니다');
      return;
    }
    if (!title.trim()) {
      alert('강좌명을 입력하세요');
      return;
    }
    
    setLoading(true);
    try {
      const authRes = await fetch('/api/admin/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('admin-token')}`,
        },
        body: JSON.stringify({ code, title }),
      });
      
      if (!authRes.ok) {
        alert('관리자 인증에 실패했습니다.');
        return;
      }
      
      await ensureAuth();
      
      const ref = doc(db, 'sessions', code);
      const existing = await getDoc(ref);
      if (existing.exists()) {
        alert('이미 사용 중인 입장코드입니다');
        return;
      }
      
      await setDoc(ref, {
        code,
        title,
        createdAt: serverTimestamp(),
        status: 'open',
      });
      
      alert(`세션이 생성되었습니다: ${code} (${title})`);
      setCode('');
      setTitle('');
      await loadSessions();
    } catch (err: any) {
      console.error('[create session]', err);
      alert('세션 생성 실패: ' + (err.message ?? '알 수 없는 오류'));
    } finally {
      setLoading(false);
    }
  };
  
  // 세션 삭제
  const handleDelete = async (sessionCode: string, sessionTitle: string) => {
    const confirmed = confirm(
      `정말로 세션을 삭제하시겠습니까?\n\n` +
      `입장코드: ${sessionCode}\n` +
      `강좌명: ${sessionTitle}\n\n` +
      `⚠️ 이 작업은 되돌릴 수 없으며, 모든 학습자 제출 기록도 함께 삭제됩니다.`
    );
    if (!confirmed) return;
    
    try {
      const authRes = await fetch(`/api/admin/sessions/${sessionCode}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('admin-token')}`,
        },
      });
      
      if (!authRes.ok) {
        alert('관리자 인증에 실패했습니다.');
        return;
      }
      
      await ensureAuth();
      
      const submissionsSnap = await getDocs(
        collection(db, 'sessions', sessionCode, 'submissions')
      );
      await Promise.all(submissionsSnap.docs.map(d => deleteDoc(d.ref)));
      
      await deleteDoc(doc(db, 'sessions', sessionCode));
      
      alert(`세션 ${sessionCode}가 삭제되었습니다.`);
      await loadSessions();
    } catch (err: any) {
      console.error('[delete session]', err);
      alert('세션 삭제 실패: ' + (err.message ?? '알 수 없는 오류'));
    }
  };
  
  const handleLogout = () => {
    sessionStorage.removeItem('admin-token');
    router.push('/admin/login');
  };
  
  return (
    <div className="admin-container">
      {/* 헤더 */}
      <div className="admin-header">
        <h1>Project KRONOS 관리자</h1>
        <button onClick={handleLogout} className="logout-btn">로그아웃</button>
      </div>
      
      {/* ⭐ 세션 생성 폼 */}
      <section className="admin-section">
        <h2>새 세션 생성</h2>
        <div className="create-form">
          <div className="form-group">
            <label>입장코드 (4자리 숫자)</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
              maxLength={4}
              placeholder="예: 1234"
              className="admin-input"
            />
          </div>
          <div className="form-group">
            <label>강좌명</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 2026년 5월 신입사원 교육"
              className="admin-input"
            />
          </div>
          <button 
            onClick={handleCreate}
            disabled={loading}
            className="create-btn"
          >
            {loading ? '생성 중...' : '세션 생성'}
          </button>
        </div>
      </section>
      
      {/* 세션 목록 */}
      <section className="admin-section">
        <h2>진행 중인 세션 목록</h2>
        {sessions.length === 0 ? (
          <p className="empty-message">생성된 세션이 없습니다.</p>
        ) : (
          <div className="session-list">
            {sessions.map((s) => (
              <div key={s.id} className="session-card">
                <div className="session-info">
                  <div className="session-code">#{s.code}</div>
                  <div className="session-title">{s.title}</div>
                  <div className="session-status">
                    상태: {s.status === 'open' ? '진행 중' : 
                           s.status === 'revealed' ? '정답 공개됨' : '종료'}
                  </div>
                </div>
                <div className="session-actions">
                  <Link 
                    href={`/admin/session/${s.code}`} 
                    className="manage-btn"
                  >
                    관리
                  </Link>
                  <button 
                    onClick={() => handleDelete(s.code, s.title)}
                    className="session-delete-btn"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
