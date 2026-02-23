export function parseMoneyBR(value: string): number {
  const v = value
    ?.toString()
    .trim()
    .replace(/\./g, "")
    .replace(",", ".")
    .replace(/[^\d.-]/g, "");

  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
}