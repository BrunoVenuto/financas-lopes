
import React, { useState, useEffect } from 'react';
import { GlassCard, SectionTitle } from '../components/UI';
import { useFinanceStore } from '../store/financeStore';
import { CATEGORIES } from '../constants';
import { 
  TrendingUp, 
  Plus, 
  Sparkles,
  Loader2
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import { GoogleGenAI } from "@google/genai";

const Dashboard: React.FC<{ onAction: (action: string) => void }> = ({ onAction }) => {
  const { user, accounts, transactions, goals } = useFinanceStore();
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  
  const totalBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0);
  const recentTransactions = transactions.slice(0, 5);

  const fetchAiInsight = async () => {
    if (transactions.length === 0) return;
    setLoadingAi(true);
    try {
      // Inicialização segura para produção usando a variável de ambiente injetada
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const prompt = `Analise estas transações financeiras e dê um conselho curto (máximo 15 palavras) e motivador: ${transactions.slice(0, 5).map(t => `${t.description}: ${t.amount}`).join(', ')}. Saldo atual: ${totalBalance}`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      
      setAiInsight(response.text || "Continue focado nos seus objetivos!");
    } catch (error) {
      console.error("AI Insight Error", error);
      setAiInsight("Analise seus gastos para economizar mais hoje.");
    } finally {
      setLoadingAi(false);
    }
  };

  useEffect(() => {
    fetchAiInsight();
  }, [transactions.length]);

  const chartData = [
    { name: '4d ago', value: totalBalance * 0.9 },
    { name: '3d ago', value: totalBalance * 0.95 },
    { name: '2d ago', value: totalBalance * 0.92 },
    { name: 'Yesterday', value: totalBalance * 0.98 },
    { name: 'Today', value: totalBalance },
  ];

  return (
    <div className="space-y-6 pb-24 animate-fade-up">
      <header className="pt-8 px-2 flex flex-col gap-1">
        <p className="text-tanzine-200 font-medium">Olá, {user.name} 👋</p>
        <div className="flex justify-between items-end">
          <h1 className="text-4xl font-display font-extrabold tracking-tight">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: user.currency }).format(totalBalance)}
          </h1>
          <button 
            onClick={() => onAction('new_transaction')}
            className="w-12 h-12 rounded-2xl bg-snappy-400 flex items-center justify-center shadow-lg shadow-snappy-500/30 active:scale-90 transition-transform"
          >
            <Plus color="white" strokeWidth={3} />
          </button>
        </div>
      </header>

      <GlassCard className="bg-gradient-to-br from-tanzine-600/20 to-snappy-600/10 border-tanzine-400/30">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-tanzine-500 rounded-xl shadow-lg shadow-tanzine-500/40">
            <Sparkles size={18} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] uppercase font-black tracking-widest text-tanzine-200 mb-1">IA Assistant</p>
            {loadingAi ? (
              <div className="flex items-center gap-2 text-white/40 text-sm">
                <Loader2 size={14} className="animate-spin" /> Analisando suas finanças...
              </div>
            ) : (
              <p className="text-sm font-medium leading-relaxed italic">
                "{aiInsight || "Adicione transações para receber conselhos da IA."}"
              </p>
            )}
          </div>
        </div>
      </GlassCard>

      <GlassCard className="!p-0 relative h-44 flex flex-col">
        <div className="p-5 absolute top-0 left-0 z-10 pointer-events-none">
          <p className="text-xs uppercase tracking-widest text-white/40 font-bold">Patrimônio</p>
          <div className="flex items-center gap-1 text-emerald-400">
            <TrendingUp size={14} />
            <span className="text-sm font-bold">Estável</span>
          </div>
        </div>
        <div className="mt-auto h-28 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7F7BD8" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#7F7BD8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#7F7BD8" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorVal)" 
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="glass px-3 py-1.5 rounded-xl border-white/20 text-xs font-bold">
                        R$ {Number(payload[0].value).toFixed(2)}
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      <SectionTitle title="Metas de Economia" />
      <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 no-scrollbar">
        {goals.map(goal => (
          <GlassCard key={goal.id} className="min-w-[200px] flex-shrink-0 !p-5 space-y-3">
            <div className="flex justify-between items-start">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${goal.color}20`, color: goal.color }}
              >
                <TrendingUp size={20} />
              </div>
              <p className="text-xs font-bold text-white/40">{Math.round((goal.currentAmount / goal.targetAmount) * 100)}%</p>
            </div>
            <div>
              <p className="text-sm font-bold truncate">{goal.name}</p>
              <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${(goal.currentAmount / goal.targetAmount) * 100}%`, backgroundColor: goal.color }}
                />
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      <SectionTitle 
        title="Atividade Recente" 
        action={<button className="text-xs font-bold text-tanzine-300" onClick={() => onAction('view_transactions')}>Ver Tudo</button>} 
      />
      <div className="space-y-3">
        {recentTransactions.length > 0 ? recentTransactions.map(tx => {
          const cat = CATEGORIES.find(c => c.id === tx.categoryId) || CATEGORIES[0];
          return (
            <GlassCard key={tx.id} className="!p-3 flex items-center gap-4 border-transparent hover:border-white/10 transition-all">
              <div 
                className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-inner"
                style={{ backgroundColor: cat.color }}
              >
                {cat.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{tx.description}</p>
                <p className="text-[10px] text-white/40 uppercase font-black tracking-tighter">{cat.name} • {new Date(tx.date).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-display font-bold ${tx.type === 'INCOME' ? 'text-emerald-400' : 'text-white'}`}>
                  {tx.type === 'EXPENSE' ? '-' : '+'}${tx.amount.toFixed(2)}
                </p>
              </div>
            </GlassCard>
          )
        }) : (
          <div className="text-center py-8 text-white/20 text-sm font-medium">Nenhuma transação ainda</div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;