import { text, type Locale } from "@/lib/i18n";
import type { PricePoint } from "@/lib/ase/types";

export function PriceChart({ points, locale }: { points: PricePoint[]; locale: Locale }) {
  const copy = text(locale);
  const series = downsample(points, 240);
  if (series.length < 2) {
    return <p className="text-sm text-muted">{copy.noPriceHistory}</p>;
  }

  const width = 720;
  const height = 250;
  const pad = { left: 48, right: 16, top: 16, bottom: 32 };
  const min = Math.min(...series.map((point) => point.close));
  const max = Math.max(...series.map((point) => point.close));
  const span = max - min || 1;
  const xAt = (index: number) =>
    pad.left + (index / (series.length - 1)) * (width - pad.left - pad.right);
  const yAt = (value: number) =>
    pad.top + (1 - (value - min) / span) * (height - pad.top - pad.bottom);
  const path = series
    .map((point, index) => `${index === 0 ? "M" : "L"}${xAt(index).toFixed(1)},${yAt(point.close).toFixed(1)}`)
    .join(" ");

  return (
    <div dir="ltr">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={copy.chartLabel} className="h-auto w-full">
        <line
          x1={pad.left}
          x2={width - pad.right}
          y1={yAt(min)}
          y2={yAt(min)}
          stroke="#e2d8c8"
        />
        <text x={4} y={yAt(max) + 4} fill="#6d6458" fontSize="12">
          {max.toFixed(2)}
        </text>
        <text x={4} y={yAt(min)} fill="#6d6458" fontSize="12">
          {min.toFixed(2)}
        </text>
        <path d={path} fill="none" stroke="#1c1914" strokeWidth="2" />
        <text x={pad.left} y={height - 8} fill="#6d6458" fontSize="12">
          {series[0].date}
        </text>
        <text x={width - pad.right} y={height - 8} fill="#6d6458" fontSize="12" textAnchor="end">
          {series[series.length - 1].date}
        </text>
      </svg>
    </div>
  );
}

function downsample(points: PricePoint[], maxPoints: number): PricePoint[] {
  if (points.length <= maxPoints) return points;
  const step = (points.length - 1) / (maxPoints - 1);
  return Array.from({ length: maxPoints }, (_, index) => points[Math.round(index * step)]);
}
