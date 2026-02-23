import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

// Guarda tudo em um único doc: users/{uid}
// (Para apps maiores, use subcoleções. Aqui mantém simples.)

export type CloudFinancePayload = {
  user: any;
  accounts: any[];
  transactions: any[];
  budgets: any[];
  goals: any[];
};

export async function pushFinanceData(uid: string, payload: CloudFinancePayload) {
  await setDoc(
    doc(db, 'users', uid),
    {
      data: payload,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function pullFinanceData(uid: string): Promise<CloudFinancePayload | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  const data = (snap.data() as any)?.data;
  if (!data) return null;
  return data as CloudFinancePayload;
}
