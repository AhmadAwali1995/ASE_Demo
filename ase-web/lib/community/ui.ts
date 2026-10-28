export function chipClass(active: boolean): string {
  return `rounded-full px-3 py-2 text-xs focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${
    active ? "bg-ink text-paper-2" : "border border-line text-ink hover:bg-gold-soft"
  }`;
}

export function outcomeClass(status: "open" | "success" | "failed"): string {
  if (status === "success") return "bg-forest-soft text-forest";
  if (status === "failed") return "bg-clay-soft text-clay";
  return "bg-gold-soft text-gold";
}

export function deltaPct(from: number | null, to: number | null): number | null {
  if (from == null || to == null || from === 0) return to == null || from == null ? null : to - from;
  return (to - from) / Math.abs(from);
}
