import React, { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { useFinanceStore } from "../store/financeStore";
import { TransactionType } from "../types";
import { importTransactionsToFirestore } from "../services/importTransactionsToFirestore";

type AccountOption = { id: string; name: string };

type ImportedRow = {
  date: Date;
  description: string;
  amount: number; // negativo = saída, positivo = entrada
};

type Props = {
  open: boolean;
  onClose: () => void;
  accounts?: AccountOption[];
};

function parseBRDate(value: any): Date | null {
  if (value == null || value === "") return null;

  // Número excel (dias desde 1899-12-30)
  if (typeof value === "number") {
    const d = XLSX.SSF.parse_date_code(value);
    if (!d) return null;
    return new Date(d.y, (d.m || 1) - 1, d.d || 1);
  }

  const s = String(value).trim();

  // dd/mm/yyyy
  const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (m) {
    const dd = Number(m[1]);
    const mm = Number(m[2]);
    const yyyy = Number(m[3]);
    return new Date(yyyy, mm - 1, dd);
  }

  const asDate = new Date(s);
  if (!isNaN(asDate.getTime())) return asDate;

  return null;
}

function parseBRMoney(value: any): number | null {
  if (value == null || value === "") return null;

  // Se vier número do Excel já
  if (typeof value === "number") return value;

  let s = String(value).trim();

  // exemplos: "R$ 50,00" | "-R$ 50,00" | "-50,00" | "50,00" | "50.000,10"
  s = s.replace(/\s/g, "");
  s = s.replace("R$", "");

  const sign = s.startsWith("-") ? -1 : 1;
  s = s.replace("-", "");

  s = s.replace(/\./g, "").replace(",", ".");
  const n = Number(s);
  if (!Number.isFinite(n)) return null;

  return n * sign;
}

async function readXlsx(file: File): Promise<ImportedRow[]> {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const json: any[] = XLSX.utils.sheet_to_json(sheet);

  const rows: ImportedRow[] = [];

  for (const row of json) {
    // Banco do Brasil: Data | Lançamento | Valor
    const dateStr = row["Data"];
    const desc = row["Lançamento"];
    const valueStr = row["Valor"];

    const date = parseBRDate(dateStr);
    const amount = parseBRMoney(valueStr);

    if (!date) continue;
    if (!desc || String(desc).trim() === "") continue;
    if (amount == null) continue;

    // ignora linhas tipo "Saldo"
    if (String(desc).toLowerCase().includes("saldo")) continue;

    rows.push({
      date,
      description: String(desc).trim(),
      amount,
    });
  }

  rows.sort((a, b) => a.date.getTime() - b.date.getTime());
  return rows;
}

export default function ImportExtratoModal({ open, onClose, accounts = [] }: Props) {
  const { addTransaction } = useFinanceStore();

  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<ImportedRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [accountId, setAccountId] = useState<string>(accounts?.[0]?.id || "");

  const stats = useMemo(() => {
    const total = rows.length;
    const incomes = rows.filter(r => r.amount > 0).reduce((sum, r) => sum + r.amount, 0);
    const expensesAbs = rows.filter(r => r.amount < 0).reduce((sum, r) => sum + Math.abs(r.amount), 0);
    const balance = incomes - expensesAbs;
    return { total, incomes, expensesAbs, balance };
  }, [rows]);

  if (!open) return null;

  const handlePickFile = async (f: File | null) => {
    setFile(f);
    setRows([]);
    setError(null);

    if (!f) return;

    try {
      setLoading(true);
      const parsed = await readXlsx(f);
      setRows(parsed);

      if (parsed.length === 0) {
        setError("Não li nenhuma linha válida. Confere se as colunas são: Data, Lançamento, Valor.");
      }
    } catch (e: any) {
      setError(e?.message || "Erro ao ler o arquivo.");
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    setError(null);

    if (!accountId) {
      setError("Selecione uma conta.");
      return;
    }
    if (!rows.length) {
      setError("Nenhuma linha para importar.");
      return;
    }

    try {
      setImporting(true);

      // 1) Salva no app (store local)
      for (const r of rows) {
        const isExpense = r.amount < 0;
        const amountAbs = Math.abs(r.amount);

        addTransaction({
          accountId,
          amount: amountAbs,
          type: isExpense ? TransactionType.EXPENSE : TransactionType.INCOME,
          categoryId: isExpense ? "cat_bill" : "cat_work",
          description: r.description,
          date: r.date.toISOString(),
        });
      }

      // 2) Salva no Firebase (Firestore)
      await importTransactionsToFirestore(rows, { accountId });

      onClose();
    } catch (e: any) {
      setError(e?.message || "Erro ao importar.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div style={styles.backdrop}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={{ margin: 0 }}>Importar Extrato</h2>
          <button onClick={onClose} style={styles.closeBtn} aria-label="Fechar">×</button>
        </div>

        <div style={styles.body}>
          <div style={{ display: "grid", gap: 10 }}>
            <div>
              <div style={styles.label}>Arquivo</div>
              <input
                type="file"
                accept=".xlsx"
                onChange={(e) => handlePickFile(e.target.files?.[0] || null)}
              />
              {file && (
                <div style={{ fontSize: 12, opacity: 0.8, marginTop: 6 }}>
                  {file.name}
                </div>
              )}
            </div>

            <div>
              <div style={styles.label}>Conta</div>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                style={styles.select}
              >
                <option value="">Selecione...</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.summary}>
              <div><b>Lançamentos:</b> {stats.total}</div>
              <div><b>Entradas:</b> R$ {stats.incomes.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div>
              <div><b>Saídas:</b> -R$ {stats.expensesAbs.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div>
              <div><b>Saldo (soma):</b> R$ {stats.balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div>
            </div>

            {loading && <div style={styles.notice}>Lendo arquivo...</div>}
            {error && <div style={styles.error}>⚠ {error}</div>}

            <div style={styles.tableWrap}>
              <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 8 }}>
                Prévia (até 15 linhas):
              </div>

              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Data</th>
                    <th style={styles.th}>Descrição</th>
                    <th style={styles.thRight}>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 15).map((r, idx) => (
                    <tr key={idx}>
                      <td style={styles.td}>{r.date.toLocaleDateString("pt-BR")}</td>
                      <td style={styles.td}>{r.description}</td>
                      <td style={styles.tdRight}>
                        {r.amount < 0 ? "-" : ""}R$ {Math.abs(r.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}

                  {rows.length === 0 && (
                    <tr>
                      <td style={styles.td}>--</td>
                      <td style={styles.td}>Selecione um arquivo para ver a prévia</td>
                      <td style={styles.tdRight}>--</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {rows.length > 15 && (
              <div style={{ fontSize: 12, opacity: 0.7 }}>
                + {rows.length - 15} linhas não mostradas na prévia
              </div>
            )}
          </div>
        </div>

        <div style={styles.footer}>
          <button style={styles.cancelBtn} onClick={onClose} disabled={importing}>
            Cancelar
          </button>
          <button
            style={styles.importBtn}
            onClick={handleImport}
            disabled={importing || loading || !rows.length || !accountId}
            title={!rows.length ? "Carregue um arquivo primeiro" : !accountId ? "Selecione a conta" : "Importar"}
          >
            {importing ? "Importando..." : "Importar"}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    zIndex: 9999,
  },
  modal: {
    width: "min(900px, 100%)",
    maxHeight: "85vh",
    background: "#111",
    color: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    padding: 16,
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  closeBtn: {
    background: "transparent",
    border: "none",
    color: "#fff",
    fontSize: 22,
    cursor: "pointer",
    lineHeight: 1,
  },
  body: {
    padding: 16,
    overflowY: "auto",
    flex: 1,
  },
  label: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    opacity: 0.7,
    marginBottom: 6,
    fontWeight: 700,
  },
  select: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    color: "#fff",
    outline: "none",
  },
  summary: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    padding: 12,
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.04)",
    fontSize: 13,
  },
  notice: {
    fontSize: 13,
    opacity: 0.85,
  },
  error: {
    padding: 10,
    borderRadius: 10,
    border: "1px solid rgba(255,80,80,0.35)",
    background: "rgba(255,80,80,0.12)",
    color: "#ffd1d1",
    fontSize: 13,
  },
  tableWrap: {
    marginTop: 8,
    maxHeight: 320,
    overflow: "auto",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 12,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    padding: 10,
    textAlign: "left",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    fontSize: 12,
    opacity: 0.9,
  },
  thRight: {
    padding: 10,
    textAlign: "right",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    fontSize: 12,
    opacity: 0.9,
  },
  td: {
    padding: 10,
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    fontSize: 13,
  },
  tdRight: {
    padding: 10,
    textAlign: "right",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    fontSize: 13,
    fontVariantNumeric: "tabular-nums",
  },
  footer: {
    padding: 16,
    borderTop: "1px solid rgba(255,255,255,0.1)",
    display: "flex",
    justifyContent: "flex-end",
    gap: 12,
  },
  cancelBtn: {
    padding: "10px 16px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.2)",
    background: "transparent",
    color: "#fff",
    cursor: "pointer",
  },
  importBtn: {
    padding: "10px 16px",
    borderRadius: 10,
    border: "none",
    background: "#f59e0b",
    color: "#111",
    fontWeight: 800,
    cursor: "pointer",
  },
};