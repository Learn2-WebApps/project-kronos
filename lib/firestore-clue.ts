import { db } from './firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Firestore에 단서 수집 기록을 동기화합니다.
 * 경로: /sessions/{sessionCode}/learners/{learnerId}/clues/{clueId}
 */
export async function syncClueToFirestore(
  sessionCode: string,
  learnerId: string,
  clueId: string,
  source: string
) {
  if (!sessionCode || !learnerId || !clueId) return;
  
  try {
    const ref = doc(db, 'sessions', sessionCode, 'learners', learnerId, 'clues', clueId);
    await setDoc(ref, { 
      source, 
      collectedAt: serverTimestamp() 
    }, { merge: true });
  } catch (e) {
    console.error('[clue sync] failed:', e);
  }
}
