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
    return { ...acc, balance: (acc.balance || 0) + delta };
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

        const amount = toNumber(input.amount);
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

        const delta = deltaFrom(amount, tx.type);

        // ✅ Atualiza saldo + transações (imutável)
        set((prev) => ({
          ...prev,
          accounts: applyDeltaToAccount(prev.accounts, tx.accountId, delta),
          transactions: [tx, ...prev.transactions],
        }));
      },

      deleteTransaction: (txId) => {
        const state = get();
        const tx = state.transactions.find((t) => t.id === txId);
        if (!tx) return;

        const amount = toNumber(tx.amount);
        if (!Number.isFinite(amount) || amount <= 0) {
          // remove mesmo assim
          set((prev) => ({
            ...prev,
            transactions: prev.transactions.filter((t) => t.id !== txId),
          }));
          return;
        }

        // delta original
        const originalDelta = deltaFrom(amount, tx.type);

        // ✅ Reverte o saldo ao excluir
        set((prev) => ({
          ...prev,
          accounts: applyDeltaToAccount(prev.accounts, tx.accountId, -originalDelta),
          transactions: prev.transactions.filter((t) => t.id !== txId),
        }));
      },

      resetAll: () => {
        // limpa o estado e também “força” reset do persist
        try {
          localStorage.removeItem(STORE_KEY);
        } catch {}
        set(() => ({ ...initialState }));
      },
    }),
    {
      name: STORE_KEY,
      version: 1,
    }
  )
);