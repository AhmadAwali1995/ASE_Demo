import type { Locale } from "@/lib/i18n";

const units = {
  en: { bn: "bn JD", m: "m JD", jd: "JD" },
  ar: { bn: "مليار د.أ", m: "مليون د.أ", jd: "د.أ" },
} as const;

export function money(value: number | null, locale: Locale = "en"): string {
  if (value == null || Number.isNaN(value)) return "—";
  const abs = Math.abs(value);
  const sign = value < 0 ? "−" : "";
  const unit = units[locale];
  if (abs >= 1_000_000_000) return `${sign}${(abs / 1_000_000_000).toFixed(2)} ${unit.bn}`;
  if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(1)} ${unit.m}`;
  if (abs >= 1_000) return `${sign}${abs.toLocaleString("en-US", { maximumFractionDigits: 0 })} ${unit.jd}`;
  return `${sign}${abs.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${unit.jd}`;
}

export function price(value: number | null): string {
  if (value == null || Number.isNaN(value)) return "—";
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function signedPercent(value: number | null, digits = 1): string {
  if (value == null || Number.isNaN(value)) return "—";
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  return `${sign}${Math.abs(value).toFixed(digits)}%`;
}

export function plainPercent(value: number | null, digits = 1): string {
  if (value == null || Number.isNaN(value)) return "—";
  return `${value.toFixed(digits)}%`;
}

export function toneOf(value: number | null): "up" | "down" | "flat" {
  if (value == null || Math.abs(value) < 0.05) return "flat";
  return value > 0 ? "up" : "down";
}
