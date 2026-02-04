
export enum AccountType {
  CHECKING = 'CHECKING',
  SAVINGS = 'SAVINGS',
  CREDIT = 'CREDIT',
  CASH = 'CASH',
  INVESTMENT = 'INVESTMENT'
}

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  TRANSFER = 'TRANSFER'
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  lastUpdated: string;
  color?: string;
  limit?: number; // For credit cards
  closingDay?: number;
  dueDay?: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  toAccountId?: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  description: string;
  date: string;
  tags?: string[];
  isRecurring?: boolean;
  installments?: {
    current: number;
    total: number;
  };
}

export interface Budget {
  id: string;
  categoryId: string;
  limit: number;
  spent: number;
  month: string; // YYYY-MM
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  color: string;
}

export interface UserState {
  isOnboarded: boolean;
  currency: string;
  name: string;
}
