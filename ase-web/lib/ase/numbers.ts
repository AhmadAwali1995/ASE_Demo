export function num(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string") return null;
  const cleaned = value.replace(/,/g, "").replace(/%/g, "").trim();
  if (!cleaned || cleaned === "-" || cleaned === "C" || cleaned === "N/A") return null;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

export function asCode(value: unknown): string | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    const code = String(Math.trunc(value));
    return code.length >= 5 && code.length <= 7 ? code : null;
  }
  if (typeof value === "string" && /^\d{5,7}$/.test(value.trim())) return value.trim();
  return null;
}

export function changePct(current: number | null, previous: number | null): number | null {
  if (current == null || previous == null || previous === 0) return null;
  return ((current - previous) / Math.abs(previous)) * 100;
}

export function normLabel(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9%]+/g, " ")
    .trim();
}
