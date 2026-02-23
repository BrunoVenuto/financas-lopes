import * as XLSX from "xlsx";
import { parseMoneyBR } from "../utils/parseMoney";
import { parseDateBR } from "../utils/parseDate";

export type ImportedTx = {
  date: Date;
  description: string;
  amount: number;
};

export async function parseBbExcel(file: File): Promise<ImportedTx[]> {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: "array" });

  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const json: any[] = XLSX.utils.sheet_to_json(sheet);

  const transactions: ImportedTx[] = [];

  for (const row of json) {
    const dateStr = row["Data"];
    const desc = row["Lançamento"];
    const valueStr = row["Valor"];

    if (!dateStr || dateStr === "00/00/0000") continue;
    if (!desc || desc.includes("Saldo")) continue;

    const date = parseDateBR(dateStr);
    const amount = parseMoneyBR(valueStr);

    if (!date || !Number.isFinite(amount)) continue;

    transactions.push({
      date,
      description: desc,
      amount,
    });
  }

  return transactions;
}