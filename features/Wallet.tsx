import React from 'react';
import { GlassCard, SectionTitle } from '../components/UI';
import { useFinanceStore } from '../store/financeStore';
import { Wallet as WalletIcon, TrendingUp } from 'lucide-react';

const Wallet: React.FC = () => {
    const { accounts, goals } = useFinanceStore();
    const totalBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0);

    return (
        <div className="space-y-6 pb-24 pt-8 animate-in fade-in slide-in-from-right-4">
            <div className="flex justify-between items-center px-1">
                <h1 className="text-2xl font-display font-extrabold">Minha Carteira</h1>
            </div>

            <GlassCard className="bg-gradient-to-br from-snappy-600/20 to-tanzine-600/10 border-snappy-400/30">
                <div className="flex flex-col items-center justify-center py-4 space-y-2">
                    <p className="text-xs uppercase tracking-widest text-white/40 font-bold">Saldo Total</p>
                    <h2 className="text-4xl font-display font-black text-white">
                        R$ {totalBalance.toFixed(2)}
                    </h2>
                </div>
            </GlassCard>

            <SectionTitle title="Contas" />
            <div className="space-y-3">
                {accounts.map(acc => (
                    <GlassCard key={acc.id} className="!p-4 flex items-center gap-4 border-transparent hover:border-white/10 transition-all">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-tanzine-300 shrink-0 shadow-inner">
                            <WalletIcon size={24} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-base font-bold text-white truncate">{acc.name}</p>
                            <p className="text-[10px] uppercase font-black tracking-tighter text-white/40">Conta Padrão</p>
                        </div>
                        <div className="text-right">
                            <p className="font-display font-bold text-white">
                                R$ {acc.balance.toFixed(2)}
                            </p>
                        </div>
                    </GlassCard>
                ))}
            </div>

            {goals.length > 0 && (
                <>
                    <SectionTitle title="Metas de Economia" />
                    <div className="space-y-4">
                        {goals.map((goal) => (
                            <GlassCard key={goal.id} className="!p-5 space-y-3">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                                            style={{ backgroundColor: `${goal.color}20`, color: goal.color }}
                                        >
                                            <TrendingUp size={20} />
                                        </div>
                                        <p className="font-bold text-sm tracking-wide">{goal.name}</p>
                                    </div>
                                    <p className="text-xs font-bold text-white/40">
                                        {Math.round((goal.currentAmount / goal.targetAmount) * 100)}%
                                    </p>
                                </div>

                                <div>
                                    <div className="w-full bg-white/10 h-2 rounded-full mt-2 overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-1000"
                                            style={{ width: `${(goal.currentAmount / goal.targetAmount) * 100}%`, backgroundColor: goal.color }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-[10px] font-bold text-white/40 uppercase tracking-wider mt-2">
                                        <span>R$ {goal.currentAmount.toFixed(2)}</span>
                                        <span>R$ {goal.targetAmount.toFixed(2)}</span>
                                    </div>
                                </div>
                            </GlassCard>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default Wallet;
