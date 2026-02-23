export function parseDateBR(value: string): Date | null {
  if (!value) return null;

  const s = value.toString().trim();

  // formato DD/MM/YYYY
  const match = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (match) {
    const day = Number(match[1]);
    const month = Number(match[2]) - 1;
    const year = Number(match[3]);
    return new Date(year, month, day);
  }

  return null;
}