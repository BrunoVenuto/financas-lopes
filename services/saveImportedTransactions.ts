import {
  collection,
  doc,
  serverTimestamp,
  writeBatch,
  Timestamp
} from "firebase/firestore";
import { db } from "../lib/firebase";

type ImportedTx = {
  date: Date;
  description: string;
  amount: number;
};

export async function saveImportedTransactions(params: {
  uid: string;
  accountId: string;
  importId: string;
  txs: ImportedTx[];
}) {
  const { uid, accountId, importId, txs } = params;

  const batch = writeBatch(db);

  for (const t of txs) {
    const ref = doc(collection(db, "users", uid, "transactions"));

    batch.set(ref, {
      date: Timestamp.fromDate(t.date),
      description: t.description,
      amount: t.amount,
      accountId,
      source: "import",
      importId,
      createdAt: serverTimestamp(),
    });
  }

  await batch.commit();
}