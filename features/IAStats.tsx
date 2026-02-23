import React, { useMemo } from 'react';
import { GlassCard, SectionTitle } from '../components/UI';
import { useFinanceStore } from '../store/financeStore';
import { CATEGORIES } from '../constants';
import { Sparkles, PieChart } from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const IAStats: React.FC = () => {
    const { transactions } = useFinanceStore();

    const categoryData = useMemo(() => {
        const expenses = transactions.filter(t => t.type === 'EXPENSE');
        const grouped: Record<string, number> = {};
        expenses.forEach(t => {
            grouped[t.categoryId] = (grouped[t.categoryId] || 0) + (typeof t.amount === 'number' ? t.amount : Number(t.amount));
        });

        return Object.keys(grouped).map(catId => {
            const cat = CATEGORIES.find(c => c.id === catId) || CATEGORIES[0];
            return {
                name: cat.name,
                value: grouped[catId],
                color: cat.color
            };
        }).sort((a, b) => b.value - a.value);
    }, [transactions]);

    const totalExpenses = categoryData.reduce((acc, curr) => acc + curr.value, 0);

    return (
        <div className="space-y-6 pb-24 pt-8 animate-in fade-in slide-in-from-right-4">
            <div className="flex justify-between items-center px-1">
                <h1 className="text-2xl font-display font-extrabold">Estatísticas IA</h1>
            </div>

            <GlassCard className="bg-gradient-to-br from-tanzine-600/20 to-snappy-600/10 border-tanzine-400/30">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-tanzine-500 rounded-xl shadow-lg shadow-tanzine-500/40">
                        <Sparkles size={18} className="text-white" />
                    </div>
                    <div className="flex-1">
                        <p className="text-[10px] uppercase font-black tracking-widest text-tanzine-200 mb-1">Análise da IA</p>
                        <p className="text-sm font-medium leading-relaxed italic">
                            "Baseado nos seus gastos recentes, a maior parte do seu orçamento está indo para {categoryData[0]?.name || 'despesas gerais'}. Considere revisar essas compras para economizar mais."
                        </p>
                    </div>
                </div>
            </GlassCard>

            <SectionTitle title="Despesas por Categoria" />
            {categoryData.length > 0 ? (
                <GlassCard className="!p-5">
                    <div className="h-48 w-full mb-6 relative">
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
                            <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Gasto Total</span>
                            <span className="text-xl font-display font-black text-white">R$ {totalExpenses.toFixed(2)}</span>
                        </div>
                        <ResponsiveContainer width="100%" height="100%">
                            <RechartsPieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value: number) => `R$ ${value.toFixed(2)}`}
                                    contentStyle={{ backgroundColor: '#111', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                    itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                                />
                            </RechartsPieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="space-y-3">
                        {categoryData.map(cat => (
                            <div key={cat.name} className="flex justify-between items-center group">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: cat.color }} />
                                    <span className="text-sm font-bold text-white/80 group-hover:text-white transition-colors">{cat.name}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-bold text-white/40">
                                        {Math.round((cat.value / totalExpenses) * 100)}%
                                    </span>
                                    <span className="text-sm font-bold text-white">R$ {cat.value.toFixed(2)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </GlassCard>
            ) : (
                <div className="text-center py-12 opacity-40">
                    <PieChart size={48} className="mx-auto mb-4" />
                    <p className="text-sm font-bold">Sem dados de despesas</p>
                </div>
            )}
        </div>
    );
};

export default IAStats;
