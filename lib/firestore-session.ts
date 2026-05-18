import { db } from './firebase';
import { 
  collection, doc, getDoc, setDoc, updateDoc, 
  onSnapshot, getDocs 
} from 'firebase/firestore';
import type { Session, Submission } from '@/types/game';

// Note: Admin operations should ideally be verified server-side, 
// but since Firebase rules will protect writes, we provide client helpers here.
// For operations like createSession or revealAnswers, we'll use API routes for better security in a real app,
// but the prompt tasks us to implement these helpers.

export async function createSession(code: string, title: string) {
  const sessionRef = doc(db, 'sessions', code);
  const snap = await getDoc(sessionRef);
  if (snap.exists()) {
    throw new Error('이미 존재하는 세션 코드입니다.');
  }
  const session: Session = {
    code,
    title,
    createdAt: Date.now(),
    status: 'open',
  };
  await setDoc(sessionRef, session);
  return session;
}

export async function getSession(code: string): Promise<Session | null> {
  const snap = await getDoc(doc(db, 'sessions', code));
  return snap.exists() ? (snap.data() as Session) : null;
}

export async function validateSession(code: string): Promise<boolean> {
  const session = await getSession(code);
  return session !== null && session.status === 'open';
}

export async function submitAnswer(sessionCode: string, userUid: string, submission: Submission) {
  const subRef = doc(db, `sessions/${sessionCode}/submissions`, userUid);
  await setDoc(subRef, submission);
}

export async function revealAnswers(sessionCode: string) {
  const sessionRef = doc(db, 'sessions', sessionCode);
  await updateDoc(sessionRef, {
    status: 'revealed',
    revealedAt: Date.now(),
  });
}

export function watchSession(sessionCode: string, callback: (session: Session | null) => void) {
  return onSnapshot(doc(db, 'sessions', sessionCode), (doc) => {
    callback(doc.exists() ? (doc.data() as Session) : null);
  });
}

export function watchSubmissions(sessionCode: string, callback: (submissions: Submission[]) => void) {
  return onSnapshot(collection(db, `sessions/${sessionCode}/submissions`), (snap) => {
    const submissions = snap.docs.map(doc => doc.data() as Submission);
    callback(submissions);
  });
}

export async function getSubmission(sessionCode: string, userUid: string): Promise<Submission | null> {
  const snap = await getDoc(doc(db, `sessions/${sessionCode}/submissions`, userUid));
  return snap.exists() ? (snap.data() as Submission) : null;
}
