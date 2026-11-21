import { ArrowRight, CheckCircle2, Clock, Layers, Target } from 'lucide-react';
import {
  ActiveSection,
  CareerAnalysisResult,
  CompletedTasksMap,
} from '../types/career';
import { calculateRoadmapProgress } from '../utils/roadmapHelpers';
import { ReadinessGauge } from './ReadinessGauge';

interface DashboardOverviewProps {
  result: CareerAnalysisResult;
  completedTasks: CompletedTasksMap;
  onNavigate: (section: ActiveSection, weekNumber?: number) => void;
}

export function DashboardOverview({
  result,
  completedTasks,
  onNavigate,
}: DashboardOverviewProps) {
  const progress = calculateRoadmapProgress(result.roadmapWeeks, completedTasks);
  const strongCount = result.skillGapAnalysis.alreadyStrong.length;
  const improveCount = result.skillGapAnalysis.needsImprovement.length;
  const missingCount = result.skillGapAnalysis.missingSkills.length;
  const totalSkillItems = Math.max(1, strongCount + improveCount + missingCount);

  return (
    <div className="space-y-6">
      {/* Welcome & Executive Path Summary */}
      <section className="rounded-xl border border-slate-800 bg-[#0F1623] p-6 sm:p-7">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-2.5 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span className="text-violet-400 font-medium">Target Role</span>
              <span aria-hidden="true">·</span>
              <span>{result.careerOverview.requiredSkillLevel}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">
                {result.estimatedWorkload.hoursPerWeek} hrs/week
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-slate-100 tracking-tight text-balance">
              {result.careerOverview.targetCareerTitle}
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              {result.welcomeMessage}
            </p>
            <p className="text-sm text-slate-400 leading-relaxed pt-1">
              {result.careerPathSummary}
            </p>
          </div>

          <div className="shrink-0 flex flex-row lg:flex-col items-center lg:items-end justify-between gap-4 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-800/80">
            <div className="text-left lg:text-right">
              <div className="text-xs text-slate-400">Estimated Workload</div>
              <div className="font-mono tabular-nums text-xl font-semibold text-slate-100 mt-0.5">
                {result.estimatedWorkload.totalStudyHours} hrs
              </div>
              <div className="text-xs text-slate-500 font-mono tabular-nums">
                {result.estimatedWorkload.totalWeeks} weeks ·{' '}
                {result.estimatedWorkload.hoursPerWeek}h/wk
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('roadmap')}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg bg-violet-600 hover:bg-violet-500 text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>Open 8-Week Roadmap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Top KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-800 bg-[#0F1623] p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Career Readiness</span>
            <Target className="w-4 h-4 text-violet-400" />
          </div>
          <div className="font-mono tabular-nums text-2xl font-semibold text-slate-100">
            {result.readinessScore.score}
            <span className="text-sm font-normal text-slate-500"> / 100</span>
          </div>
          <p className="text-xs text-slate-500 mt-1.5 truncate">
            Based on {result.currentSkillsAnalysis.length} evaluated skills
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#0F1623] p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Roadmap Progress</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-mono tabular-nums text-2xl font-semibold text-slate-100">
            {progress.percentage}%
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-400 transition-all duration-300"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
          <p className="font-mono tabular-nums text-xs text-slate-500 mt-1.5">
            {progress.completedTasksCount} of {progress.totalTasks} tasks completed
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#0F1623] p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Skill Gaps to Close</span>
            <Layers className="w-4 h-4 text-blue-400" />
          </div>
          <div className="font-mono tabular-nums text-2xl font-semibold text-slate-100">
            {improveCount + missingCount}
          </div>
          <p className="text-xs text-slate-500 mt-1.5 font-mono tabular-nums">
            {missingCount} missing · {improveCount} to strengthen
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#0F1623] p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Weekly Study Split</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="font-mono tabular-nums text-2xl font-semibold text-slate-100">
            {result.estimatedWorkload.hoursPerWeek}h
            <span className="text-sm font-normal text-slate-500"> / week</span>
          </div>
          <p className="text-xs text-slate-400 mt-1.5 line-clamp-2">
            {result.estimatedWorkload.weeklySplitNote}
          </p>
        </div>
      </div>

      {/* Main Split: Readiness Score & Skill Gap Visual Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <section className="lg:col-span-7 rounded-xl border border-slate-800 bg-[#0F1623] p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-slate-100">
              Career Readiness Assessment
            </h2>
            <button
              type="button"
              onClick={() => onNavigate('career-analysis')}
              className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors whitespace-nowrap cursor-pointer"
            >
              View full analysis
            </button>
          </div>
          <ReadinessGauge
            score={result.readinessScore.score}
            rationale={result.readinessScore.rationale}
            breakdown={result.readinessScore.breakdown}
          />
        </section>

        <section className="lg:col-span-5 rounded-xl border border-slate-800 bg-[#0F1623] p-6 flex flex-col justify-between gap-6">
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-100">Skill Gap Overview</h2>
              <button
                type="button"
                onClick={() => onNavigate('skill-gap')}
                className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors whitespace-nowrap cursor-pointer"
              >
                Explore gaps
              </button>
            </div>

            {/* Proportional Skill Distribution Bar */}
            <div className="space-y-2">
              <div className="h-3 w-full rounded-full bg-slate-800 overflow-hidden flex">
                <div
                  className="bg-emerald-400 h-full transition-all duration-500"
                  style={{ width: `${(strongCount / totalSkillItems) * 100}%` }}
                  title={`Already Strong: ${strongCount}`}
                />
                <div
                  className="bg-amber-400 h-full transition-all duration-500"
                  style={{ width: `${(improveCount / totalSkillItems) * 100}%` }}
                  title={`Needs Improvement: ${improveCount}`}
                />
                <div
                  className="bg-rose-400 h-full transition-all duration-500"
                  style={{ width: `${(missingCount / totalSkillItems) * 100}%` }}
                  title={`Missing Skills: ${missingCount}`}
                />
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1 text-xs">
                <div>
                  <div className="text-emerald-400 font-medium">Already Strong</div>
                  <div className="font-mono tabular-nums text-base font-semibold text-slate-100">
                    {strongCount}
                  </div>
                </div>
                <div>
                  <div className="text-amber-400 font-medium">Needs Work</div>
                  <div className="font-mono tabular-nums text-base font-semibold text-slate-100">
                    {improveCount}
                  </div>
                </div>
                <div>
                  <div className="text-rose-400 font-medium">Missing</div>
                  <div className="font-mono tabular-nums text-base font-semibold text-slate-100">
                    {missingCount}
                  </div>
                </div>
              </div>
            </div>

            {/* Top Priority Missing/Weak Skills List */}
            <div className="pt-4 border-t border-slate-800/80 space-y-2.5">
              <div className="text-xs font-medium text-slate-400">
                Top Priority Focus Areas
              </div>
              <div className="divide-y divide-slate-800/70">
                {[
                  ...result.skillGapAnalysis.missingSkills.slice(0, 3).map((s) => ({
                    name: s.skillName,
                    status: 'Missing',
                    priority: s.priority,
                    time: s.estimatedLearningTime,
                  })),
                  ...result.skillGapAnalysis.needsImprovement.slice(0, 2).map((s) => ({
                    name: s.skillName,
                    status: 'Improve',
                    priority: s.priority,
                    time: s.estimatedLearningTime,
                  })),
                ]
                  .slice(0, 4)
                  .map((item) => (
                    <div
                      key={`${item.status}-${item.name}`}
                      className="py-2.5 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-slate-200 truncate">
                          {item.name}
                        </div>
                        <div className="text-slate-500">
                          {item.status} · {item.priority} priority
                        </div>
                      </div>
                      <span className="font-mono tabular-nums text-slate-400 shrink-0">
                        {item.time}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('projects')}
            className="w-full py-2.5 px-4 text-xs font-medium rounded-lg border border-slate-800 bg-[#090D16] hover:bg-slate-800/70 text-slate-200 transition-colors flex items-center justify-between cursor-pointer"
          >
            <span>View {result.portfolioProjects.length} Recommended Portfolio Projects</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </section>
      </div>

      {/* Interactive 8-Week Timeline Preview */}
      <section className="rounded-xl border border-slate-800 bg-[#0F1623] p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
          <div>
            <h2 className="text-base font-semibold text-slate-100">8-Week Learning Timeline</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Select any week to jump into its objectives, practical exercises, and checklist.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('roadmap')}
            className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors whitespace-nowrap self-start sm:self-auto cursor-pointer"
          >
            Manage tasks
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {result.roadmapWeeks.map((week) => {
            const wk = progress.perWeek[week.weekNumber] ?? {
              completed: 0,
              total: 0,
              percentage: 0,
            };
            const isComplete = wk.total > 0 && wk.completed === wk.total;
            return (
              <button
                key={week.weekNumber}
                type="button"
                onClick={() => onNavigate('roadmap', week.weekNumber)}
                className="text-left rounded-lg border border-slate-800 bg-[#090D16] hover:border-slate-700 hover:bg-slate-900/80 p-4 transition-colors flex flex-col justify-between gap-3 cursor-pointer"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono tabular-nums text-violet-400 font-medium">
                      Week {week.weekNumber}
                    </span>
                    <span className="font-mono tabular-nums text-slate-500">
                      {week.estimatedHours}h
                    </span>
                  </div>
                  <div className="text-sm font-medium text-slate-100 line-clamp-2">
                    {week.learningTopic}
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isComplete ? 'bg-emerald-400' : 'bg-blue-500'
                      }`}
                      style={{ width: `${wk.percentage}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono tabular-nums text-slate-400">
                    <span>
                      {wk.completed}/{wk.total} tasks
                    </span>
                    <span className={isComplete ? 'text-emerald-400' : ''}>{wk.percentage}%</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
