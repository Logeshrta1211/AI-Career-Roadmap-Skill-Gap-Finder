import { useState } from 'react';
import { AlertTriangle, CheckCircle2, Clock, ShieldAlert } from 'lucide-react';
import { CareerAnalysisResult } from '../types/career';

interface SkillGapViewProps {
  result: CareerAnalysisResult;
}

type PriorityFilter = 'All' | 'High' | 'Medium' | 'Low';

function getPriorityStyle(priority: 'High' | 'Medium' | 'Low'): string {
  if (priority === 'High') return 'text-rose-400';
  if (priority === 'Medium') return 'text-amber-400';
  return 'text-blue-400';
}

export function SkillGapView({ result }: SkillGapViewProps) {
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('All');
  const { alreadyStrong, needsImprovement, missingSkills } = result.skillGapAnalysis;

  const filteredImprove =
    priorityFilter === 'All'
      ? needsImprovement
      : needsImprovement.filter((s) => s.priority === priorityFilter);

  const filteredMissing =
    priorityFilter === 'All'
      ? missingSkills
      : missingSkills.filter((s) => s.priority === priorityFilter);

  const totalCount = Math.max(
    1,
    alreadyStrong.length + needsImprovement.length + missingSkills.length
  );

  return (
    <div className="space-y-6">
      {/* Visual Gap Comparison Header */}
      <section className="rounded-xl border border-slate-800 bg-[#0F1623] p-6 sm:p-7 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-100 tracking-tight">
              Skill Gap Analysis
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Side-by-side comparison of your current profile against{' '}
              <span className="text-slate-200 font-medium">
                {result.careerOverview.targetCareerTitle}
              </span>{' '}
              requirements.
            </p>
          </div>

          <div className="flex items-center gap-1 p-1 rounded-lg bg-[#090D16] border border-slate-800 self-start">
            {(['All', 'High', 'Medium', 'Low'] as PriorityFilter[]).map((filter) => {
              const active = priorityFilter === filter;
              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setPriorityFilter(filter)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-slate-800 text-slate-100 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {filter === 'All' ? 'All Priorities' : `${filter} Priority`}
                </button>
              );
            })}
          </div>
        </div>

        {/* Comparison Bar */}
        <div className="space-y-3 pt-2">
          <div className="h-3.5 w-full rounded-full bg-slate-800 overflow-hidden flex">
            <div
              className="bg-emerald-400 h-full transition-all duration-500"
              style={{ width: `${(alreadyStrong.length / totalCount) * 100}%` }}
            />
            <div
              className="bg-amber-400 h-full transition-all duration-500"
              style={{ width: `${(needsImprovement.length / totalCount) * 100}%` }}
            />
            <div
              className="bg-rose-400 h-full transition-all duration-500"
              style={{ width: `${(missingSkills.length / totalCount) * 100}%` }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-1">
            <div className="flex items-center justify-between rounded-lg border border-slate-800/80 bg-[#090D16] px-4 py-3">
              <div className="flex items-center gap-2 text-emerald-400 font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Already Strong</span>
              </div>
              <span className="font-mono tabular-nums text-base font-semibold text-slate-100">
                {alreadyStrong.length}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-slate-800/80 bg-[#090D16] px-4 py-3">
              <div className="flex items-center gap-2 text-amber-400 font-medium">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Needs Improvement</span>
              </div>
              <span className="font-mono tabular-nums text-base font-semibold text-slate-100">
                {needsImprovement.length}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-slate-800/80 bg-[#090D16] px-4 py-3">
              <div className="flex items-center gap-2 text-rose-400 font-medium">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>Missing Skills</span>
              </div>
              <span className="font-mono tabular-nums text-base font-semibold text-slate-100">
                {missingSkills.length}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Missing Skills */}
      <section className="rounded-xl border border-slate-800 bg-[#0F1623] p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <h2 className="text-base font-semibold text-slate-100">Missing Skills</h2>
          </div>
          <span className="font-mono tabular-nums text-xs text-slate-400">
            {filteredMissing.length} shown
          </span>
        </div>

        {filteredMissing.length === 0 ? (
          <p className="text-sm text-slate-400 py-2">
            No missing skills match the selected priority filter.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMissing.map((skill) => (
              <div
                key={skill.skillName}
                className="rounded-lg border border-slate-800 bg-[#090D16] p-4 space-y-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-sm font-semibold text-slate-100">{skill.skillName}</h3>
                  <span
                    className={`text-xs font-medium shrink-0 ${getPriorityStyle(skill.priority)}`}
                  >
                    {skill.priority} Priority
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {skill.whyImportant}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 pt-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Estimated learning time:</span>
                  <span className="font-mono tabular-nums text-slate-200">
                    {skill.estimatedLearningTime}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Needs Improvement */}
      <section className="rounded-xl border border-slate-800 bg-[#0F1623] p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h2 className="text-base font-semibold text-slate-100">Needs Improvement</h2>
          </div>
          <span className="font-mono tabular-nums text-xs text-slate-400">
            {filteredImprove.length} shown
          </span>
        </div>

        {filteredImprove.length === 0 ? (
          <p className="text-sm text-slate-400 py-2">
            No skills needing improvement match the selected priority filter.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredImprove.map((skill) => (
              <div
                key={skill.skillName}
                className="rounded-lg border border-slate-800 bg-[#090D16] p-4 space-y-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-100">{skill.skillName}</h3>
                    <div className="text-xs text-slate-500 mt-0.5">{skill.currentVsTarget}</div>
                  </div>
                  <span
                    className={`text-xs font-medium shrink-0 ${getPriorityStyle(skill.priority)}`}
                  >
                    {skill.priority} Priority
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {skill.whyImportant}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 pt-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Estimated learning time:</span>
                  <span className="font-mono tabular-nums text-slate-200">
                    {skill.estimatedLearningTime}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Already Strong */}
      <section className="rounded-xl border border-slate-800 bg-[#0F1623] p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <h2 className="text-base font-semibold text-slate-100">Already Strong</h2>
          </div>
          <span className="font-mono tabular-nums text-xs text-slate-400">
            {alreadyStrong.length} skills
          </span>
        </div>

        {alreadyStrong.length === 0 ? (
          <p className="text-sm text-slate-400">
            You are starting fresh for this target role — Week 1 builds your baseline smoothly.
          </p>
        ) : (
          <div className="divide-y divide-slate-800/70">
            {alreadyStrong.map((skill) => (
              <div
                key={skill.skillName}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="space-y-0.5">
                  <div className="text-sm font-medium text-slate-100">{skill.skillName}</div>
                  <div className="text-xs text-slate-400">{skill.note}</div>
                </div>
                <span className="text-xs font-medium text-emerald-400 shrink-0">
                  {skill.currentProficiency}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
