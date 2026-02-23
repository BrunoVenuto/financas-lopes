import React, { useEffect, useMemo, useState } from 'react';
import { GlassCard, Button, Input } from '../components/UI';
import { auth } from '../lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { pullFinanceData, pushFinanceData } from '../services/cloudSync';
import { useFinanceStore } from '../store/financeStore';
import { CloudDownload, CloudUpload, LogIn, LogOut, UserPlus } from 'lucide-react';

type Props = { onClose: () => void };

const CloudSyncModal: React.FC<Props> = ({ onClose }) => {
  const store = useFinanceStore();
  const hydrateAll = useFinanceStore((s) => s.hydrateAll);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const payload = useMemo(() => {
    const snap = useFinanceStore.getState();
    return {
      user: snap.user,
      accounts: snap.accounts,
      transactions: snap.transactions,
      budgets: snap.budgets,
      goals: snap.goals,
    };
  }, [store.user, store.accounts, store.transactions, store.budgets, store.goals]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  const safeRun = async (fn: () => Promise<void>) => {
    setBusy(true);
    setMsg(null);
    try {
      await fn();
    } catch (e: any) {
      setMsg(e?.message || 'Algo deu errado.');
    } finally {
      setBusy(false);
    }
  };

  const handleSignUp = () =>
    safeRun(async () => {
      if (!email || !password) throw new Error('Informe email e senha.');
      await createUserWithEmailAndPassword(auth, email, password);
      setMsg('Conta criada com sucesso.');
    });

  const handleSignIn = () =>
    safeRun(async () => {
      if (!email || !password) throw new Error('Informe email e senha.');
      await signInWithEmailAndPassword(auth, email, password);
      setMsg('Login efetuado.');
    });

  const handleSignOut = () =>
    safeRun(async () => {
      await signOut(auth);
      setMsg('Você saiu da conta.');
    });

  const handlePush = () =>
    safeRun(async () => {
      if (!user) throw new Error('Faça login primeiro.');
      await pushFinanceData(user.uid, payload);
      setMsg('Backup enviado para a nuvem.');
    });

  const handlePull = () =>
    safeRun(async () => {
      if (!user) throw new Error('Faça login primeiro.');
      const remote = await pullFinanceData(user.uid);
      if (!remote) {
        setMsg('Nenhum backup encontrado para este usuário.');
        return;
      }
      hydrateAll(remote);
      setMsg('Dados restaurados da nuvem.');
    });

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="absolute inset-0" onClick={onClose} />

      <GlassCard className="w-full max-w-sm mb-4 relative z-10 animate-in slide-in-from-bottom-full duration-500 shadow-2xl shadow-black/50 border-tanzine-500/30">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h2 className="text-xl font-display font-bold">Cloud Sync</h2>
            <p className="text-xs text-white/40 font-bold">
              {user ? `Logado: ${user.email}` : 'Faça login para salvar/restaurar.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-white/40 hover:text-white transition-colors"
            aria-label="Fechar"
          >
            ×
          </button>
        </div>

        {!user && (
          <div className="space-y-3 mb-4">
            <Input
              label="Email"
              type="email"
              placeholder="voce@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            <Input
              label="Senha"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={handleSignIn} disabled={busy} variant="secondary">
                <LogIn size={16} /> Entrar
              </Button>
              <Button onClick={handleSignUp} disabled={busy} variant="ghost">
                <UserPlus size={16} /> Criar
              </Button>
            </div>
          </div>
        )}

        {user && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={handlePull} disabled={busy} variant="ghost">
                <CloudDownload size={16} /> Restaurar
              </Button>
              <Button onClick={handlePush} disabled={busy}>
                <CloudUpload size={16} /> Backup
              </Button>
            </div>
            <Button onClick={handleSignOut} disabled={busy} variant="danger" fullWidth>
              <LogOut size={16} /> Sair
            </Button>
            <p className="text-[10px] text-white/40 leading-relaxed">
              Dica: para evitar sobrescrever dados, faça <b>Restaurar</b> antes do primeiro backup.
            </p>
          </div>
        )}

        {msg && (
          <div className="mt-4 text-xs font-bold text-tanzine-200 bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
            {msg}
          </div>
        )}
      </GlassCard>
    </div>
  );
};

export default CloudSyncModal;
