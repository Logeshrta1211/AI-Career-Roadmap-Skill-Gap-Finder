import { useState } from 'react';
import {
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Layers,
  Target,
} from 'lucide-react';
import {
  CareerAnalysisResult,
  CompletedTasksMap,
} from '../types/career';
import {
  calculateRoadmapProgress,
  getAssignmentTaskId,
  getExerciseTaskId,
  getObjectiveTaskId,
} from '../utils/roadmapHelpers';

interface RoadmapViewProps {
  result: CareerAnalysisResult;
  completedTasks: CompletedTasksMap;
  expandedWeeks: Record<number, boolean>;
  onToggleTask: (taskId: string) => void;
  onToggleWeek: (weekNumber: number) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
}

type WeekFilter = 'all' | 'pending' | 'completed';

export function RoadmapView({
  result,
  completedTasks,
  expandedWeeks,
  onToggleTask,
  onToggleWeek,
  onExpandAll,
  onCollapseAll,
}: RoadmapViewProps) {
  const [filter, setFilter] = useState<WeekFilter>('all');
  const progress = calculateRoadmapProgress(result.roadmapWeeks, completedTasks);

  const visibleWeeks = result.roadmapWeeks.filter((week) => {
    const wkProg = progress.perWeek[week.weekNumber];
    const isComplete = wkProg && wkProg.total > 0 && wkProg.completed === wkProg.total;
    if (filter === 'completed') return isComplete;
    if (filter === 'pending') return !isComplete;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Progress & Controls Header */}
      <section className="rounded-xl border border-slate-800 bg-[#0F1623] p-6 sm:p-7 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-100 tracking-tight">
              8-Week Personalized Learning Roadmap
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Progressive weekly milestones tailored to{' '}
              <span className="font-mono tabular-nums text-slate-200">
                {result.estimatedWorkload.hoursPerWeek} hrs/week
              </span>{' '}
              ({result.estimatedWorkload.weeklySplitNote}).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onExpandAll}
              className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-800 bg-[#090D16] text-slate-300 hover:text-slate-100 hover:border-slate-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Expand All
            </button>
            <button
              type="button"
              onClick={onCollapseAll}
              className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-800 bg-[#090D16] text-slate-300 hover:text-slate-100 hover:border-slate-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* Dynamic Overall Progress */}
        <div className="space-y-2 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <span className="text-slate-300 font-medium">
              Overall Roadmap Completion
            </span>
            <span className="font-mono tabular-nums text-slate-300">
              {progress.completedTasksCount} / {progress.totalTasks} tasks completed ({progress.percentage}%)
            </span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-emerald-400 transition-all duration-300"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </div>

        {/* Week Filter Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-[#090D16] border border-slate-800 w-fit">
          {(
            [
              { id: 'all', label: 'All Weeks' },
              { id: 'pending', label: 'In Progress' },
              { id: 'completed', label: 'Completed' },
            ] as const
          ).map((tab) => {
            const active = filter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-slate-800 text-slate-100 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Expandable Week Cards */}
      {visibleWeeks.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-[#0F1623] p-8 text-center text-sm text-slate-400">
          No weeks match this filter right now. Switch back to &ldquo;All Weeks&rdquo; to view
          your full plan.
        </div>
      ) : (
        <div className="space-y-3">
          {visibleWeeks.map((week) => {
            const isExpanded = Boolean(expandedWeeks[week.weekNumber]);
            const wkProg = progress.perWeek[week.weekNumber] ?? {
              completed: 0,
              total: 0,
              percentage: 0,
            };
            const isWeekDone = wkProg.total > 0 && wkProg.completed === wkProg.total;
            const assignId = getAssignmentTaskId(week.weekNumber);
            const assignDone = Boolean(completedTasks[assignId]);

            return (
              <article
                key={week.weekNumber}
                className="rounded-xl border border-slate-800 bg-[#0F1623] overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => onToggleWeek(week.weekNumber)}
                  aria-expanded={isExpanded}
                  className="w-full text-left px-5 sm:px-6 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-800/30 transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <span className="mt-0.5 text-slate-400 shrink-0">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </span>
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-mono tabular-nums font-semibold text-violet-400">
                          Week {week.weekNumber}
                        </span>
                        <span className="text-slate-600" aria-hidden="true">
                          ·
                        </span>
                        <span className="inline-flex items-center gap-1 font-mono tabular-nums text-slate-400">
                          <Clock className="w-3 h-3" />
                          {week.estimatedHours} hrs
                        </span>
                        <span className="text-slate-600" aria-hidden="true">
                          ·
                        </span>
                        <span className="text-slate-400 truncate">
                          {week.skillsToFocus.join(' · ')}
                        </span>
                      </div>
                      <h2 className="text-base sm:text-lg font-semibold text-slate-100">
                        {week.learningTopic}
                      </h2>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pl-7 sm:pl-0 shrink-0">
                    <div className="w-24 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isWeekDone ? 'bg-emerald-400' : 'bg-blue-500'
                        }`}
                        style={{ width: `${wkProg.percentage}%` }}
                      />
                    </div>
                    <span
                      className={`font-mono tabular-nums text-xs font-medium w-14 text-right ${
                        isWeekDone ? 'text-emerald-400' : 'text-slate-400'
                      }`}
                    >
                      {wkProg.completed}/{wkProg.total}
                    </span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-slate-800/80 space-y-6">
                    {/* Skills Focus Summary */}
                    <div className="pt-3 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                      <Layers className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span className="font-medium text-slate-300">Focus skills:</span>
                      <span>{week.skillsToFocus.join(' · ')}</span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Weekly Objectives */}
                      <div className="space-y-3">
                        <h3 className="text-xs font-semibold text-slate-300 tracking-wide">
                          Weekly Objectives
                        </h3>
                        <ul className="space-y-2.5">
                          {week.weeklyObjectives.map((obj, idx) => {
                            const taskId = getObjectiveTaskId(week.weekNumber, idx);
                            const checked = Boolean(completedTasks[taskId]);
                            return (
                              <li key={taskId}>
                                <label className="flex items-start gap-3 cursor-pointer group">
                                  <button
                                    type="button"
                                    role="checkbox"
                                    aria-checked={checked}
                                    onClick={() => onToggleTask(taskId)}
                                    className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                                      checked
                                        ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                                        : 'border-slate-600 bg-[#090D16] group-hover:border-slate-400'
                                    }`}
                                  >
                                    {checked && <Check className="w-3 h-3 stroke-[3]" />}
                                  </button>
                                  <span
                                    onClick={() => onToggleTask(taskId)}
                                    className={`text-sm leading-relaxed transition-colors ${
                                      checked
                                        ? 'line-through text-slate-500'
                                        : 'text-slate-200 group-hover:text-white'
                                    }`}
                                  >
                                    {obj}
                                  </span>
                                </label>
                              </li>
                            );
                          })}
                        </ul>
                      </div>

                      {/* Practical Exercises */}
                      <div className="space-y-3">
                        <h3 className="text-xs font-semibold text-slate-300 tracking-wide">
                          Practical Exercises
                        </h3>
                        <ul className="space-y-2.5">
                          {week.practicalExercises.map((ex, idx) => {
                            const taskId = getExerciseTaskId(week.weekNumber, idx);
                            const checked = Boolean(completedTasks[taskId]);
                            return (
                              <li key={taskId}>
                                <label className="flex items-start gap-3 cursor-pointer group">
                                  <button
                                    type="button"
                                    role="checkbox"
                                    aria-checked={checked}
                                    onClick={() => onToggleTask(taskId)}
                                    className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                                      checked
                                        ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                                        : 'border-slate-600 bg-[#090D16] group-hover:border-slate-400'
                                    }`}
                                  >
                                    {checked && <Check className="w-3 h-3 stroke-[3]" />}
                                  </button>
                                  <span
                                    onClick={() => onToggleTask(taskId)}
                                    className={`text-sm leading-relaxed transition-colors ${
                                      checked
                                        ? 'line-through text-slate-500'
                                        : 'text-slate-200 group-hover:text-white'
                                    }`}
                                  >
                                    {ex}
                                  </span>
                                </label>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </div>

                    {/* Mini Assignment & Expected Outcome */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2 border-t border-slate-800/70">
                      <div className="rounded-lg border border-slate-800 bg-[#090D16] p-4 space-y-2">
                        <div className="text-xs font-semibold text-violet-400">Mini Assignment</div>
                        <label className="flex items-start gap-3 cursor-pointer group">
                          <button
                            type="button"
                            role="checkbox"
                            aria-checked={assignDone}
                            onClick={() => onToggleTask(assignId)}
                            className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                              assignDone
                                ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                                : 'border-slate-600 bg-[#0F1623] group-hover:border-slate-400'
                            }`}
                          >
                            {assignDone && <Check className="w-3 h-3 stroke-[3]" />}
                          </button>
                          <span
                            onClick={() => onToggleTask(assignId)}
                            className={`text-sm leading-relaxed transition-colors ${
                              assignDone
                                ? 'line-through text-slate-500'
                                : 'text-slate-200 group-hover:text-white'
                            }`}
                          >
                            {week.miniAssignment}
                          </span>
                        </label>
                      </div>

                      <div className="rounded-lg border border-slate-800 bg-[#090D16] p-4 space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-400">
                          <Target className="w-3.5 h-3.5" />
                          <span>Expected Outcome</span>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed">
                          {week.expectedOutcome}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
