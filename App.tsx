import React, { useMemo, useState } from 'react';
import { useFinanceStore } from './store/financeStore';
import { NAV_ITEMS, CATEGORIES } from './constants';
import Dashboard from './features/Dashboard';
import { GlassCard, Button, Input } from './components/UI';
import {
  Search,
  Filter,
  Layers,
  FileUp,
  X,
} from 'lucide-react';
import { TransactionType } from './types';
import CloudSyncModal from './features/CloudSyncModal';
import ImportExtratoModal from './features/ImportExtratoModal';

const App: React.FC = () => {
  const { user, onboard, transactions, accounts, deleteTransaction, addTransaction } = useFinanceStore();

  const [activeTab, setActiveTab] = useState('Home');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCloudModal, setShowCloudModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // ⚠️ Eu mantive seu padrão original: você usa o mesmo formData pra onboard e pra transação.
  // Funciona, mas é estranho. Mantive pra não quebrar seu fluxo atual.
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: TransactionType.EXPENSE,
    categoryId: 'cat_food',
  });

  const accountDefault = accounts?.[0];

  const categoriesForSelect = useMemo(() => {
    return CATEGORIES.map((c) => ({
      id: c.id,
      name: c.name,
    }));
  }, []);

  if (!user.isOnboarded) {
    return (
      <div className="min-h-screen bg-tanzine-900 flex items-center justify-center p-6">
        <GlassCard className="w-full max-w-sm space-y-8 py-10">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-display font-black text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-tanzine-300">
              Tanzine.
            </h1>
            <p className="text-tanzine-100/60 text-sm">
              Desenhe seu futuro financeiro com elegância.
            </p>
          </div>

          <div className="space-y-4">
            <Input
              label="Como devemos te chamar?"
              placeholder="Ex: Alex Silva"
              value={formData.description}
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

  const resetTxForm = () => {
    setFormData({
      description: '',
      amount: '',
      type: TransactionType.EXPENSE,
      categoryId: 'cat_food',
    });
  };

  const handleAddTransaction = () => {
    if (!formData.description || !formData.amount || !accountDefault) return;

    const amountNumber = Number(String(formData.amount).replace(',', '.'));
    if (Number.isNaN(amountNumber) || amountNumber <= 0) return;

    addTransaction({
      accountId: accountDefault.id,
      amount: amountNumber,
      type: formData.type,
      categoryId: formData.categoryId,
      description: formData.description,
      date: new Date().toISOString(),
    });

    resetTxForm();
    setShowAddModal(false);
  };

  return (
    <div className="max-w-md mx-auto min-h-screen relative overflow-x-hidden font-sans bg-tanzine-900 selection:bg-snappy-400 selection:text-white">
      <main className="px-5">
        {activeTab === 'Home' && (
          <Dashboard
            onAction={(act) => {
              console.log('[App] action:', act);

              if (act === 'new_transaction') setShowAddModal(true);
              if (act === 'view_transactions') setActiveTab('Transactions');
              if (act === 'cloud') setShowCloudModal(true);
            }}
          />
        )}

        {activeTab === 'Transactions' && (
          <div className="pt-8 space-y-6 pb-24 animate-in fade-in slide-in-from-right-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-display font-extrabold">Transações</h1>

              <div className="flex gap-2">
                <button className="p-2 bg-white/5 rounded-xl active:bg-white/10" type="button">
                  <Search size={20} />
                </button>
                <button className="p-2 bg-white/5 rounded-xl active:bg-white/10" type="button">
                  <Filter size={20} />
                </button>

                {/* BOTÃO IMPORTAR */}
                <button
                  title="Importar extrato"
                  onClick={() => setShowImportModal(true)}
                  className="p-2 bg-white/5 rounded-xl active:bg-white/10"
                  type="button"
                >
                  <FileUp size={20} />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {transactions.length > 0 ? (
                transactions.map((tx) => {
                  const cat = CATEGORIES.find((c) => c.id === tx.categoryId) || CATEGORIES[0];

                  return (
                    <div key={tx.id} className="flex items-center gap-4 group animate-in fade-in slide-in-from-bottom-2">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0"
                        style={{ backgroundColor: cat.color }}
                      >
                        {cat.icon}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">{tx.description}</p>
                        <p className="text-[10px] uppercase font-black tracking-tighter text-white/30">
                          {cat.name} • {new Date(tx.date).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="text-right">
                        <p
                          className={`font-display font-bold ${
                            tx.type === TransactionType.INCOME ? 'text-emerald-400' : 'text-white'
                          }`}
                        >
                          {tx.type === TransactionType.EXPENSE ? '-' : '+'}R$ {tx.amount.toFixed(2)}
                        </p>

                        <button
                          onClick={() => deleteTransaction(tx.id)}
                          className="text-[10px] text-red-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                          type="button"
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-20 opacity-20">
                  <Layers size={48} className="mx-auto mb-4" />
                  <p className="font-bold">Sem registros</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto h-20 bg-tanzine-950/90 backdrop-blur-2xl border-t border-white/5 px-8 flex items-center justify-between safe-bottom z-50">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.label}
            onClick={() => setActiveTab(item.label)}
            className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${
              activeTab === item.label ? 'text-snappy-400 -translate-y-1' : 'text-white/30 hover:text-white/50'
            }`}
            type="button"
          >
            <div className={`p-1 rounded-lg transition-colors ${activeTab === item.label ? 'bg-snappy-400/10' : ''}`}>
              {item.icon}
            </div>
            <span className="text-[9px] font-black uppercase tracking-tighter">
              {item.label === 'Stats' ? 'IA Stats' : item.label}
            </span>
          </button>
        ))}
      </nav>

      {/* ✅ MODAL: Nova transação (CORRIGE O FLUXO MANUAL DO "+") */}
      {showAddModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center px-5">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setShowAddModal(false)}
            aria-hidden="true"
          />

          <GlassCard className="relative w-full max-w-md !p-5 space-y-4 border-white/10">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-display font-extrabold text-white">Nova transação</h2>
              <button
                className="p-2 rounded-xl bg-white/5 active:bg-white/10"
                onClick={() => setShowAddModal(false)}
                type="button"
                title="Fechar"
              >
                <X size={18} />
              </button>
            </div>

            {!accountDefault ? (
              <div className="text-sm text-white/60">
                Você precisa ter pelo menos uma conta criada para lançar transações.
              </div>
            ) : (
              <>
                <Input
                  label="Descrição"
                  placeholder="Ex: Mercado"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />

                <Input
                  label="Valor"
                  placeholder="Ex: 120,50"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />

                {/* Tipo */}
                <div className="space-y-1.5">
                  <p className="text-xs font-black uppercase tracking-widest text-white/40">Tipo</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, type: TransactionType.EXPENSE })}
                      className={`rounded-xl py-2 text-sm font-extrabold border transition ${
                        formData.type === TransactionType.EXPENSE
                          ? 'bg-white/10 border-white/20 text-white'
                          : 'bg-white/5 border-white/10 text-white/70'
                      }`}
                    >
                      Saída
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, type: TransactionType.INCOME })}
                      className={`rounded-xl py-2 text-sm font-extrabold border transition ${
                        formData.type === TransactionType.INCOME
                          ? 'bg-white/10 border-white/20 text-white'
                          : 'bg-white/5 border-white/10 text-white/70'
                      }`}
                    >
                      Entrada
                    </button>
                  </div>
                </div>

                {/* Categoria */}
                <div className="space-y-1.5">
                  <p className="text-xs font-black uppercase tracking-widest text-white/40">Categoria</p>
                  <select
                    className="w-full rounded-xl bg-white/5 px-3 py-2 text-sm font-bold text-white outline-none border border-white/10"
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  >
                    {categoriesForSelect.map((c) => (
                      <option key={c.id} value={c.id} className="bg-tanzine-900">
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-2 grid grid-cols-2 gap-2">
                  <Button
                    fullWidth
                    onClick={() => {
                      resetTxForm();
                      setShowAddModal(false);
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button fullWidth onClick={handleAddTransaction}>
                    Salvar
                  </Button>
                </div>
              </>
            )}
          </GlassCard>
        </div>
      )}

      {showCloudModal && <CloudSyncModal onClose={() => setShowCloudModal(false)} />}

      {showImportModal && (
        <ImportExtratoModal
          open={showImportModal}
          onClose={() => setShowImportModal(false)}
          accounts={accounts?.map((a: any) => ({ id: a.id, name: a.name }))}
        />
      )}
    </div>
  );
};

export default App;