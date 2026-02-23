import { create } from "zustand";
import { persist } from "zustand/middleware";
import { TransactionType } from "../types";

type Currency = "BRL" | "USD" | "EUR";

export type UserState = {
  name: string;
  currency: Currency;
  isOnboarded: boolean;
};

export type Account = {
  id: string;
  name: string;
  balance: number;
};

export type Transaction = {
  id: string;
  accountId: string;
  amount: number; // sempre positivo
  type: TransactionType; // INCOME | EXPENSE
  categoryId: string;
  description: string;
  date: string; // ISO
};

export type Goal = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  color: string;
};

type FinanceStore = {
  user: UserState;
  accounts: Account[];
  transactions: Transaction[];
  goals: Goal[];

  onboard: (name: string, currency: Currency) => void;

  addTransaction: (tx: Omit<Transaction, "id">) => void;
  deleteTransaction: (txId: string) => void;

  // (opcional)
  resetAll: () => void;
  recalculateBalances: () => void;
};

const STORE_KEY = "financas-lopes-store";

const genId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `id_${Math.random().toString(16).slice(2)}_${Date.now()}`;
};

const toNumber = (v: unknown) => {
  // aceita "120,50" e "120.50"
  const n = Number(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : NaN;
};

const deltaFrom = (amount: number, type: TransactionType) =>
  type === TransactionType.INCOME ? amount : -amount;

const applyDeltaToAccount = (accounts: Account[], accountId: string, delta: number) => {
  return accounts.map((acc) => {
    if (acc.id !== accountId) return acc;
    const oldBalance = typeof acc.balance === 'number' && !isNaN(acc.balance) ? acc.balance : Number(acc.balance) || 0;
    const numDelta = typeof delta === 'number' && !isNaN(delta) ? delta : Number(delta) || 0;
    return { ...acc, balance: oldBalance + numDelta };
  });
};

const recalculateAccounts = (accounts: Account[], transactions: Transaction[]) => {
  return accounts.map((acc) => {
    const accTxs = transactions.filter((t) => t.accountId === acc.id);
    const balance = accTxs.reduce((sum, tx) => {
      const amt = typeof tx.amount === "number" && !isNaN(tx.amount) ? tx.amount : Number(tx.amount) || 0;
      return sum + (tx.type === "INCOME" ? amt : -amt);
    }, 0);
    return { ...acc, balance };
  });
};

const initialState: Pick<FinanceStore, "user" | "accounts" | "transactions" | "goals"> = {
  user: { name: "Usuário", currency: "BRL", isOnboarded: false },
  accounts: [
    {
      id: "acc_default",
      name: "Carteira",
      balance: 0,
    },
  ],
  transactions: [],
  goals: [],
};

export const useFinanceStore = create<FinanceStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      onboard: (name, currency) => {
        set((prev) => ({
          ...prev,
          user: {
            ...prev.user,
            name: (name || "Usuário").trim(),
            currency,
            isOnboarded: true,
          },
          // garante que exista pelo menos uma conta
          accounts: prev.accounts?.length ? prev.accounts : initialState.accounts,
        }));
      },

      addTransaction: (input) => {
        const state = get();

        const amountStr = typeof input.amount === 'string' ? (input.amount as string).replace(/\./g, '').replace(',', '.') : input.amount;
        const amount = toNumber(amountStr);
        if (!input.description?.trim()) return;
        if (!input.accountId) return;
        if (!Number.isFinite(amount) || amount <= 0) return;

        // garante que a conta existe (pra não “somar em nada”)
        const accountExists = state.accounts.some((a) => a.id === input.accountId);
        if (!accountExists) return;

        const tx: Transaction = {
          id: genId(),
          ...input,
          description: input.description.trim(),
          amount, // sempre positivo
          date: input.date || new Date().toISOString(),
        };

        // ✅ Atualiza saldo recalculando baseado no histórico de transações
        set((prev) => {
          const newTransactions = [tx, ...prev.transactions];
          return {
            ...prev,
            accounts: recalculateAccounts(prev.accounts, newTransactions),
            transactions: newTransactions,
          };
        });
      },

      deleteTransaction: (txId) => {
        set((prev) => {
          const newTransactions = prev.transactions.filter((t) => t.id !== txId);
          return {
            ...prev,
            accounts: recalculateAccounts(prev.accounts, newTransactions),
            transactions: newTransactions,
          };
        });
      },

      recalculateBalances: () => {
        set((prev) => ({
          ...prev,
          accounts: recalculateAccounts(prev.accounts, prev.transactions),
        }));
      },

      resetAll: () => {
        // limpa o estado e também “força” reset do persist
        try {
          localStorage.removeItem(STORE_KEY);
        } catch { }
        set(() => ({ ...initialState }));
      },
    }),
    {
      name: STORE_KEY,
      version: 1,
    }
  )
);