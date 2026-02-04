
import React, { useState } from 'react';
import { useFinanceStore } from './store/financeStore';
import { NAV_ITEMS, CATEGORIES } from './constants';
import Dashboard from './features/Dashboard';
import { GlassCard, Button, Input } from './components/UI';
import { Search, Plus, Filter, MoreHorizontal, Wallet, CreditCard, PiggyBank, Briefcase, PieChart, Layers, Home } from 'lucide-react';
import { TransactionType } from './types';

const App: React.FC = () => {
  const { user, onboard, transactions, accounts, deleteTransaction, addTransaction } = useFinanceStore();
  const [activeTab, setActiveTab] = useState('Home');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ 
    description: '', 
    amount: '', 
    type: TransactionType.EXPENSE, 
    categoryId: 'cat_food' 
  });

  if (!user.isOnboarded) {
    return (
      <div className="min-h-screen bg-tanzine-900 flex items-center justify-center p-6">
        <GlassCard className="w-full max-w-sm space-y-8 py-10">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-display font-black text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-tanzine-300">Tanzine.</h1>
            <p className="text-tanzine-100/60 text-sm">Desenhe seu futuro financeiro com elegância.</p>
          </div>
          
          <div className="space-y-4">
            <Input 
              label="Como devemos te chamar?" 
              placeholder="Ex: Alex Silva"
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <Button 
              fullWidth 
              onClick={() => onboard(formData.description || 'Usuário', 'BRL')}
            >
              Começar Agora
            </Button>
          </div>
        </GlassCard>
      </div>
    );
  }

  const handleAddTransaction = () => {
    if (!formData.description || !formData.amount || !accounts[0]) return;
    
    addTransaction({
      accountId: accounts[0].id,
      amount: parseFloat(formData.amount),
      type: formData.type,
      categoryId: formData.categoryId,
      description: formData.description,
      date: new Date().toISOString()
    });
    
    setFormData({ description: '', amount: '', type: TransactionType.EXPENSE, categoryId: 'cat_food' });
    setShowAddModal(false);
  };

  return (
    <div className="max-w-md mx-auto min-h-screen relative overflow-x-hidden font-sans bg-tanzine-900 selection:bg-snappy-400 selection:text-white">
      <main className="px-5">
        {activeTab === 'Home' && <Dashboard onAction={(act) => {
          if (act === 'new_transaction') setShowAddModal(true);
          if (act === 'view_transactions') setActiveTab('Transactions');
        }} />}

        {activeTab === 'Transactions' && (
          <div className="pt-8 space-y-6 pb-24 animate-in fade-in slide-in-from-right-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-display font-extrabold">Transações</h1>
              <div className="flex gap-2">
                <button className="p-2 bg-white/5 rounded-xl active:bg-white/10"><Search size={20} /></button>
                <button className="p-2 bg-white/5 rounded-xl active:bg-white/10"><Filter size={20} /></button>
              </div>
            </div>
            
            <div className="space-y-4">
              {transactions.length > 0 ? transactions.map(tx => {
                const cat = CATEGORIES.find(c => c.id === tx.categoryId) || CATEGORIES[0];
                return (
                  <div key={tx.id} className="flex items-center gap-4 group animate-in fade-in slide-in-from-bottom-2">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0" style={{ backgroundColor: cat.color }}>
                      {cat.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">{tx.description}</p>
                      <p className="text-[10px] uppercase font-black tracking-tighter text-white/30">{cat.name} • {new Date(tx.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-display font-bold ${tx.type === TransactionType.INCOME ? 'text-emerald-400' : 'text-white'}`}>
                        {tx.type === TransactionType.EXPENSE ? '-' : '+'}${tx.amount.toFixed(2)}
                      </p>
                      <button onClick={() => deleteTransaction(tx.id)} className="text-[10px] text-red-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity">Excluir</button>
                    </div>
                  </div>
                );
              }) : (
                <div className="text-center py-20 opacity-20">
                   <Layers size={48} className="mx-auto mb-4" />
                   <p className="font-bold">Sem registros</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'Wallet' && (
          <div className="pt-8 space-y-6 pb-24 animate-in fade-in slide-in-from-left-4">
             <h1 className="text-2xl font-display font-extrabold">Suas Contas</h1>
             <div className="space-y-4">
               {accounts.map(acc => (
                 <GlassCard key={acc.id} className="!p-5 border-l-4" style={{ borderLeftColor: acc.color }}>
                   <div className="flex justify-between items-start mb-4">
                     <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-white/5">
                          {acc.type === 'CHECKING' && <CreditCard size={20} />}
                          {acc.type === 'SAVINGS' && <PiggyBank size={20} />}
                          {acc.type === 'CASH' && <Wallet size={20} />}
                          {acc.type === 'INVESTMENT' && <Briefcase size={20} />}
                        </div>
                        <span className="font-bold text-sm">{acc.name}</span>
                     </div>
                     <MoreHorizontal size={20} className="text-white/40" />
                   </div>
                   <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Saldo Atual</p>
                   <p className="text-3xl font-display font-bold tracking-tight">R$ {acc.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                 </GlassCard>
               ))}
               <Button fullWidth variant="ghost" className="border-2 border-dashed border-white/5 !bg-transparent text-white/30 hover:border-white/20 transition-all">
                 <Plus size={20} /> Adicionar Nova Conta
               </Button>
             </div>
          </div>
        )}

        {activeTab === 'Stats' && (
          <div className="pt-8 space-y-6 pb-24 text-center animate-in zoom-in-95 duration-300">
            <h1 className="text-2xl font-display font-extrabold mb-10">Insights</h1>
            <GlassCard className="py-12 border-tanzine-500/20">
               <PieChart size={48} className="mx-auto text-tanzine-400 mb-4 opacity-50" />
               <p className="font-bold">Analisando Padrões...</p>
               <p className="text-xs text-white/40 mt-2 px-8 leading-relaxed">Estamos processando seus dados para criar um panorama detalhado dos seus gastos por categoria.</p>
               <Button variant="ghost" className="mt-8 text-xs" onClick={() => setActiveTab('Home')}>Voltar ao Início</Button>
            </GlassCard>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto h-20 bg-tanzine-950/90 backdrop-blur-2xl border-t border-white/5 px-8 flex items-center justify-between safe-bottom z-50">
        {NAV_ITEMS.map(item => (
          <button 
            key={item.label}
            onClick={() => setActiveTab(item.label)}
            className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${activeTab === item.label ? 'text-snappy-400 -translate-y-1' : 'text-white/30 hover:text-white/50'}`}
          >
            <div className={`p-1 rounded-lg transition-colors ${activeTab === item.label ? 'bg-snappy-400/10' : ''}`}>
              {item.icon}
            </div>
            <span className="text-[9px] font-black uppercase tracking-tighter">{item.label === 'Stats' ? 'IA Stats' : item.label}</span>
          </button>
        ))}
      </nav>

      {/* Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
          <div 
            className="absolute inset-0" 
            onClick={() => setShowAddModal(false)}
          />
          <GlassCard className="w-full max-w-sm mb-4 relative z-10 animate-in slide-in-from-bottom-full duration-500 shadow-2xl shadow-black/50 border-tanzine-500/30">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-display font-bold">Nova Transação</h2>
              <button onClick={() => setShowAddModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-white/40 hover:text-white transition-colors">×</button>
            </div>
            
            <div className="space-y-4">
              <div className="flex gap-2 p-1 bg-white/5 rounded-2xl">
                <button 
                  className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${formData.type === TransactionType.EXPENSE ? 'bg-snappy-400 text-white shadow-lg shadow-snappy-500/30' : 'text-white/30'}`}
                  onClick={() => setFormData({ ...formData, type: TransactionType.EXPENSE })}
                >
                  Gasto
                </button>
                <button 
                  className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${formData.type === TransactionType.INCOME ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'text-white/30'}`}
                  onClick={() => setFormData({ ...formData, type: TransactionType.INCOME })}
                >
                  Renda
                </button>
              </div>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 font-bold">R$</span>
                <input 
                  type="number" 
                  placeholder="0,00"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-2xl font-display font-bold text-white focus:outline-none focus:ring-2 focus:ring-tanzine-400 transition-all placeholder:text-white/10"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  autoFocus
                />
              </div>

              <Input 
                placeholder="O que você comprou?" 
                label="Descrição" 
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />

              <div className="space-y-2">
                <label className="text-[10px] font-black text-tanzine-200 uppercase tracking-widest ml-1">Categoria</label>
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 px-1">
                  {CATEGORIES.map(cat => (
                    <button 
                      key={cat.id}
                      onClick={() => setFormData({ ...formData, categoryId: cat.id })}
                      className={`w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center transition-all ${formData.categoryId === cat.id ? 'scale-110 ring-4 ring-white/10 shadow-lg' : 'opacity-30 grayscale hover:opacity-60'}`}
                      style={{ backgroundColor: cat.color }}
                    >
                      <div className="text-white">
                        {cat.icon}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <Button fullWidth className="py-4 text-lg font-display" onClick={handleAddTransaction}>Confirmar Lançamento</Button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};

export default App;
