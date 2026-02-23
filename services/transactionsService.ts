import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  increment,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { TransactionType } from "../types";

export type FirestoreTransactionInput = {
  accountId: string;
  amount: number; // positivo
  type: TransactionType; // INCOME | EXPENSE
  categoryId: string;
  description: string;
  date: string; // ISO
};

export type FirestoreTransaction = FirestoreTransactionInput & {
  id: string;
};

function getDelta(amount: number, type: TransactionType) {
  return type === TransactionType.INCOME ? amount : -amount;
}

/**
 * Cria transação em users/{uid}/transactions e atualiza balance em users/{uid}/accounts/{accountId}
 */
export async function createTransactionAndUpdateBalance(uid: string, input: FirestoreTransactionInput) {
  const amount = Number(input.amount);
  if (!uid) throw new Error("Usuário não autenticado (uid vazio).");
  if (!input.accountId) throw new Error("accountId ausente.");
  if (!Number.isFinite(amount) || amount <= 0) throw new Error("amount inválido.");

  const txRef = await addDoc(collection(db, "users", uid, "transactions"), {
    ...input,
    amount,
    createdAt: serverTimestamp(),
  });

  const delta = getDelta(amount, input.type);
  const accountRef = doc(db, "users", uid, "accounts", input.accountId);

  // increment é atômico
  await updateDoc(accountRef, { balance: increment(delta) });

  return { id: txRef.id };
}

/**
 * Remove transação e reverte o balance da conta.
 * Você precisa passar a transação que está sendo deletada (pra saber amount/type/accountId).
 */
export async function deleteTransactionAndRevertBalance(uid: string, tx: FirestoreTransaction) {
  if (!uid) throw new Error("Usuário não autenticado (uid vazio).");

  const amount = Number(tx.amount);
  if (!Number.isFinite(amount) || amount <= 0) throw new Error("amount inválido.");

  const delta = getDelta(amount, tx.type);
  const accountRef = doc(db, "users", uid, "accounts", tx.accountId);

  // Reverte o efeito: subtrai se era INCOME; soma se era EXPENSE
  await updateDoc(accountRef, { balance: increment(-delta) });

  await deleteDoc(doc(db, "users", uid, "transactions", tx.id));
}