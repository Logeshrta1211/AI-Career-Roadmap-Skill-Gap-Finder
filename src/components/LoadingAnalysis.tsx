import { useEffect, useState } from 'react';
import { Check, Loader2 } from 'lucide-react';

interface LoadingAnalysisProps {
  targetCareer: string;
  hoursPerWeek: number;
}

const ANALYSIS_STEPS = [
  'Evaluating stated skills and education baseline',
  'Benchmarking against target career requirements',
  'Calculating readiness score and skill gaps',
  'Structuring progressive 8-week learning plan',
  'Curating resume portfolio projects and resources',
];

export function LoadingAnalysis({ targetCareer, hoursPerWeek }: LoadingAnalysisProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const stepTimer = window.setInterval(() => {
      setActiveStepIndex((prev) => (prev < ANALYSIS_STEPS.length - 1 ? prev + 1 : prev));
    }, 2200);
    return () => window.clearInterval(stepTimer);
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-800 bg-[#0F1623] p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 text-sm font-medium text-violet-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing career path with Gemini AI</span>
            </div>
            <h2 className="text-xl font-semibold text-slate-100">
              Building roadmap for {targetCareer}
            </h2>
            <p className="text-sm text-slate-400">
              Tailoring 8 progressive weeks around {hoursPerWeek} study hours/week.
            </p>
          </div>
          <div className="text-left sm:text-right shrink-0">
            <div className="text-xs text-slate-500">Elapsed time</div>
            <div className="font-mono tabular-nums text-lg font-medium text-slate-200">
              {elapsedSeconds}s
            </div>
          </div>
        </div>

        <div className="pt-6 space-y-3">
          {ANALYSIS_STEPS.map((step, index) => {
            const isComplete = index < activeStepIndex;
            const isActive = index === activeStepIndex;
            return (
              <div
                key={step}
                className={`flex items-center gap-3 text-sm transition-opacity duration-200 ${
                  index > activeStepIndex ? 'opacity-40' : 'opacity-100'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
                    isComplete
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                      : isActive
                        ? 'bg-violet-500/15 border-violet-500/40 text-violet-400'
                        : 'border-slate-700 text-slate-600'
                  }`}
                >
                  {isComplete ? (
                    <Check className="w-3 h-3" />
                  ) : isActive ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <span className="font-mono text-[10px]">{index + 1}</span>
                  )}
                </div>
                <span className={isActive ? 'text-slate-100 font-medium' : 'text-slate-400'}>
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Geometry-matched dashboard skeleton placeholders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-pulse">
        <div className="h-44 rounded-xl border border-slate-800/70 bg-[#0F1623]/70 p-5 space-y-3">
          <div className="h-3 w-28 rounded bg-slate-800" />
          <div className="h-20 w-20 rounded-full bg-slate-800/80" />
          <div className="h-3 w-40 rounded bg-slate-800" />
        </div>
        <div className="lg:col-span-2 h-44 rounded-xl border border-slate-800/70 bg-[#0F1623]/70 p-5 space-y-3">
          <div className="h-3 w-36 rounded bg-slate-800" />
          <div className="h-4 w-full rounded bg-slate-800/80" />
          <div className="h-4 w-5/6 rounded bg-slate-800/80" />
          <div className="h-4 w-2/3 rounded bg-slate-800/80" />
        </div>
      </div>
    </div>
  );
}
