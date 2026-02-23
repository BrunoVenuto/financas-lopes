import { useFinanceStore } from './store/financeStore';

const store = useFinanceStore.getState();
const txs = store.transactions;
console.log("Total Txs:", txs.length);
console.log("Accounts:", store.accounts.map(a => ({ id: a.id, balance: a.balance })));
console.log("Transactions:");
txs.forEach(t => console.log(t.id, t.type, t.amount, t.description));
console.log("Recalculate check:");
store.recalculateBalances();
const newStore = useFinanceStore.getState();
console.log("New Accounts:", newStore.accounts.map(a => ({ id: a.id, balance: a.balance })));

