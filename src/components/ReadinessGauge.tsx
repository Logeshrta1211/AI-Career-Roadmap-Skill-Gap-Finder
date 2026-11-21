import { ReadinessBreakdownItem } from '../types/career';

interface ReadinessGaugeProps {
  score: number;
  rationale: string;
  breakdown?: ReadinessBreakdownItem[];
  compact?: boolean;
}

function getReadinessTier(score: number): { label: string; colorClass: string; stroke: string } {
  if (score >= 75) {
    return {
      label: 'Strong Readiness',
      colorClass: 'text-emerald-400',
      stroke: '#34D399',
    };
  }
  if (score >= 50) {
    return {
      label: 'Developing Readiness',
      colorClass: 'text-blue-400',
      stroke: '#60A5FA',
    };
  }
  if (score >= 30) {
    return {
      label: 'Foundational Stage',
      colorClass: 'text-violet-400',
      stroke: '#A78BFA',
    };
  }
  return {
    label: 'Early Exploration',
    colorClass: 'text-amber-400',
    stroke: '#FBBF24',
  };
}

export function ReadinessGauge({
  score,
  rationale,
  breakdown = [],
  compact = false,
}: ReadinessGaugeProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const radius = compact ? 48 : 62;
  const strokeWidth = compact ? 8 : 10;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (clamped / 100) * circumference;
  const tier = getReadinessTier(clamped);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
        <div className="relative shrink-0 flex items-center justify-center">
          <svg
            height={radius * 2}
            width={radius * 2}
            className="-rotate-90"
            role="img"
            aria-label={`Career readiness score ${clamped} out of 100`}
          >
            <circle
              stroke="rgba(148, 163, 184, 0.14)"
              fill="transparent"
              strokeWidth={strokeWidth}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
            <circle
              stroke={tier.stroke}
              fill="transparent"
              strokeWidth={strokeWidth}
              strokeDasharray={`${circumference} ${circumference}`}
              style={{ strokeDashoffset, transition: 'stroke-dashoffset 600ms cubic-bezier(0.16, 1, 0.3, 1)' }}
              strokeLinecap="round"
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="font-mono tabular-nums text-2xl sm:text-3xl font-semibold text-slate-100">
              {clamped}
            </span>
            <span className="font-mono tabular-nums text-[11px] text-slate-400">/ 100</span>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-xs font-medium mb-1.5">
            <span className={tier.colorClass}>{tier.label}</span>
            <span className="text-slate-600" aria-hidden="true">
              ·
            </span>
            <span className="text-slate-400 font-mono tabular-nums">{clamped}% role alignment</span>
          </div>
          <p className="text-sm leading-relaxed text-slate-300">{rationale}</p>
        </div>
      </div>

      {breakdown.length > 0 && (
        <div className="pt-4 border-t border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium text-slate-300">Competency Alignment Breakdown</span>
            <span>Current vs. Entry Target</span>
          </div>
          <div className="space-y-2.5">
            {breakdown.map((item) => {
              const current = Math.max(0, Math.min(100, item.currentScore));
              const target = Math.max(0, Math.min(100, item.targetScore));
              return (
                <div key={item.category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 truncate pr-3">{item.category}</span>
                    <span className="font-mono tabular-nums text-slate-400 shrink-0">
                      <span className="text-slate-200">{current}%</span>
                      <span className="text-slate-600 mx-1">/</span>
                      <span>{target}% target</span>
                    </span>
                  </div>
                  <div className="relative h-2 w-full rounded-full bg-slate-800/90 overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-slate-600/45"
                      style={{ width: `${target}%` }}
                    />
                    <div
                      className="relative h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500 transition-all duration-500"
                      style={{ width: `${current}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
