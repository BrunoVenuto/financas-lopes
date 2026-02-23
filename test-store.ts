import { useFinanceStore } from './store/financeStore';
import { TransactionType } from './types';

const store = useFinanceStore.getState();
console.log("Initial:", store.accounts);
store.addTransaction({
  accountId: store.accounts[0].id,
  amount: 50,
  type: TransactionType.EXPENSE,
  categoryId: 'cat_food',
  description: 'Test',
  date: new Date().toISOString()
});
console.log("After:", useFinanceStore.getState().accounts);
