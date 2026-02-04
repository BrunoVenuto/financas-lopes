
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  Account, 
  Transaction, 
  Budget, 
  Goal, 
  UserState, 
  AccountType, 
  TransactionType 
} from '../types';

interface FinanceStore {
  user: UserState;
  accounts: Account[];
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  
  // Actions
  onboard: (name: string, currency: string) => void;
  addAccount: (account: Omit<Account, 'id' | 'lastUpdated'>) => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  addBudget: (budget: Omit<Budget, 'id' | 'spent'>) => void;
  addGoal: (goal: Omit<Goal, 'id' | 'currentAmount'>) => void;
  deleteTransaction: (id: string) => void;
}

export const useFinanceStore = create<FinanceStore>()(
  persist(
    (set) => ({
      user: {
        isOnboarded: false,
        currency: 'USD',
        name: '',
      },
      accounts: [
        { id: '1', name: 'Main Bank', type: AccountType.CHECKING, balance: 2540.50, currency: 'USD', lastUpdated: new Date().toISOString(), color: '#7F7BD8' },
        { id: '2', name: 'Wallet', type: AccountType.CASH, balance: 120.00, currency: 'USD', lastUpdated: new Date().toISOString(), color: '#F4A86B' },
      ],
      transactions: [
        { id: 't1', accountId: '1', amount: 15.50, type: TransactionType.EXPENSE, categoryId: 'cat_food', description: 'Starbucks', date: new Date().toISOString() },
        { id: 't2', accountId: '1', amount: 2400.00, type: TransactionType.INCOME, categoryId: 'cat_work', description: 'Monthly Salary', date: new Date().toISOString() },
      ],
      budgets: [],
      goals: [
        { id: 'g1', name: 'New iPhone', targetAmount: 1200, currentAmount: 450, deadline: '2024-12-31', color: '#ED803C' }
      ],

      onboard: (name, currency) => set((state) => ({ 
        user: { ...state.user, name, currency, isOnboarded: true } 
      })),

      addAccount: (account) => set((state) => ({
        accounts: [...state.accounts, { ...account, id: Math.random().toString(36).substr(2, 9), lastUpdated: new Date().toISOString() }]
      })),

      addTransaction: (transaction) => set((state) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newTransactions = [{ ...transaction, id }, ...state.transactions];
        
        // Update account balances
        const newAccounts = state.accounts.map(acc => {
          if (acc.id === transaction.accountId) {
            const multiplier = transaction.type === TransactionType.INCOME ? 1 : -1;
            return { ...acc, balance: acc.balance + (transaction.amount * multiplier) };
          }
          if (transaction.type === TransactionType.TRANSFER && acc.id === transaction.toAccountId) {
            return { ...acc, balance: acc.balance + transaction.amount };
          }
          return acc;
        });

        return { transactions: newTransactions, accounts: newAccounts };
      }),

      addBudget: (budget) => set((state) => ({
        budgets: [...state.budgets, { ...budget, id: Math.random().toString(36).substr(2, 9), spent: 0 }]
      })),

      addGoal: (goal) => set((state) => ({
        goals: [...state.goals, { ...goal, id: Math.random().toString(36).substr(2, 9), currentAmount: 0 }]
      })),

      deleteTransaction: (id) => set((state) => {
        const tx = state.transactions.find(t => t.id === id);
        if (!tx) return state;

        const newAccounts = state.accounts.map(acc => {
          if (acc.id === tx.accountId) {
            const multiplier = tx.type === TransactionType.INCOME ? -1 : 1;
            return { ...acc, balance: acc.balance + (tx.amount * multiplier) };
          }
          return acc;
        });

        return {
          transactions: state.transactions.filter(t => t.id !== id),
          accounts: newAccounts
        };
      })
    }),
    {
      name: 'tanzine-finance-storage',
    }
  )
);
