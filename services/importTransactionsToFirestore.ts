import { collection, doc, serverTimestamp, writeBatch } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { TransactionType } from "../types";

type ImportedRow = {
  date: Date;
  description: string;
  amount: number; // negativo = saída, positivo = entrada
};

type Options = {
  accountId: string;
  defaultExpenseCategoryId?: string;
  defaultIncomeCategoryId?: string;
};

export async function importTransactionsToFirestore(
  rows: ImportedRow[],
  opts: Options
) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Você precisa estar logado no Firebase (Cloud Sync) para importar.");
  }

  if (!opts.accountId) {
    throw new Error("accountId é obrigatório.");
  }

  if (!rows.length) return;

  const batch = writeBatch(db);

  // subcoleção: users/{uid}/transactions
  const txCol = collection(db, "users", user.uid, "transactions");

  for (const r of rows) {
    const isExpense = r.amount < 0;
    const amountAbs = Math.abs(r.amount);

    const txRef = doc(txCol); // gera id automático

    batch.set(txRef, {
      accountId: opts.accountId,
      amount: amountAbs,
      type: isExpense ? TransactionType.EXPENSE : TransactionType.INCOME,
      categoryId: isExpense
        ? (opts.defaultExpenseCategoryId || "cat_bill")
        : (opts.defaultIncomeCategoryId || "cat_work"),
      description: r.description,
      date: r.date.toISOString(),

      // metadata útil
      createdAt: serverTimestamp(),
      source: "import",
    });
  }

  await batch.commit();
}