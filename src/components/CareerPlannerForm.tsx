import { FormEvent, useState } from 'react';
import { ArrowRight, RotateCcw, Sparkles, AlertCircle, X } from 'lucide-react';
import {
  CareerFormInput,
  ExperienceLevel,
  LearningStyle,
} from '../types/career';
import {
  DEFAULT_FORM_INPUT,
  SAMPLE_PROFILES,
  TARGET_CAREER_SUGGESTIONS,
} from '../utils/roadmapHelpers';

interface CareerPlannerFormProps {
  initialValues: CareerFormInput;
  isLoading: boolean;
  hasExistingPlan: boolean;
  onSubmit: (values: CareerFormInput) => void;
  onCancelEdit?: () => void;
  onResetAll?: () => void;
}

const EXPERIENCE_LEVELS: ExperienceLevel[] = ['Beginner', 'Intermediate', 'Advanced'];
const LEARNING_STYLES: LearningStyle[] = ['Video', 'Documentation', 'Practice', 'Mixed'];
const HOUR_PRESETS = [5, 10, 15, 20, 25, 30];

export function CareerPlannerForm({
  initialValues,
  isLoading,
  hasExistingPlan,
  onSubmit,
  onCancelEdit,
  onResetAll,
}: CareerPlannerFormProps) {
  const [form, setForm] = useState<CareerFormInput>(initialValues);
  const [sampleIndex, setSampleIndex] = useState(0);
  const [errors, setErrors] = useState<{ currentSkills?: string; targetCareer?: string }>({});

  const handleSampleFill = () => {
    const sample = SAMPLE_PROFILES[sampleIndex % SAMPLE_PROFILES.length];
    setForm(sample);
    setSampleIndex((prev) => prev + 1);
    setErrors({});
  };

  const handleResetInputs = () => {
    setForm(DEFAULT_FORM_INPUT);
    setErrors({});
    if (onResetAll) {
      onResetAll();
    }
  };

  const validateAndSubmit = (e: FormEvent) => {
    e.preventDefault();
    const nextErrors: { currentSkills?: string; targetCareer?: string } = {};

    if (!form.currentSkills.trim() || form.currentSkills.trim().length < 5) {
      nextErrors.currentSkills =
        'Please list your current skills, tools, or relevant coursework (at least a few words).';
    }
    if (!form.targetCareer.trim() || form.targetCareer.trim().length < 2) {
      nextErrors.targetCareer = 'Please enter or select your target career / dream job.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    onSubmit({
      ...form,
      currentSkills: form.currentSkills.trim(),
      targetCareer: form.targetCareer.trim(),
      education: form.education.trim(),
    });
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-[#0F1623] p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-100 tracking-tight text-balance">
            {hasExistingPlan ? 'Refine Your Career Assessment' : 'Map Your 8-Week Career Roadmap'}
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Share your current background and weekly study capacity. Gemini AI will calculate your
            readiness score, pinpoint skill gaps, and build a week-by-week plan.
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleSampleFill}
            disabled={isLoading}
            className="px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-700 bg-slate-800/60 text-slate-200 hover:bg-slate-800 hover:border-slate-600 transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
          >
            Load Sample Input
          </button>
          {hasExistingPlan && onCancelEdit && (
            <button
              type="button"
              onClick={onCancelEdit}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </button>
          )}
        </div>
      </div>

      <form onSubmit={validateAndSubmit} className="pt-6 space-y-6" noValidate>
        {/* 1. Target Career */}
        <div className="space-y-2.5">
          <label htmlFor="targetCareer" className="block text-sm font-medium text-slate-200">
            Target Career / Dream Job <span className="text-violet-400">*</span>
          </label>
          <input
            id="targetCareer"
            type="text"
            value={form.targetCareer}
            onChange={(e) => {
              setForm((prev) => ({ ...prev, targetCareer: e.target.value }));
              if (errors.targetCareer) setErrors((prev) => ({ ...prev, targetCareer: undefined }));
            }}
            placeholder="e.g., AI Engineer, Full Stack Developer, Data Analyst"
            className={`w-full rounded-lg border bg-[#090D16] px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 transition-colors ${
              errors.targetCareer
                ? 'border-rose-500/70 focus:ring-rose-500/30'
                : 'border-slate-800 focus:border-violet-500/70 focus:ring-violet-500/20'
            }`}
          />
          {errors.targetCareer && (
            <p className="flex items-center gap-1.5 text-xs text-rose-400">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.targetCareer}</span>
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-slate-500 mr-1">Popular roles:</span>
            {TARGET_CAREER_SUGGESTIONS.map((role) => {
              const isSelected = form.targetCareer.toLowerCase() === role.toLowerCase();
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => {
                    setForm((prev) => ({ ...prev, targetCareer: role }));
                    setErrors((prev) => ({ ...prev, targetCareer: undefined }));
                  }}
                  className={`px-2.5 py-1.5 text-xs font-medium rounded-md border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-violet-500/15 border-violet-500/50 text-violet-300'
                      : 'bg-[#090D16] border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {role}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Current Skills */}
        <div className="space-y-2">
          <label htmlFor="currentSkills" className="block text-sm font-medium text-slate-200">
            Current Skills & Coursework <span className="text-violet-400">*</span>
          </label>
          <textarea
            id="currentSkills"
            rows={4}
            value={form.currentSkills}
            onChange={(e) => {
              setForm((prev) => ({ ...prev, currentSkills: e.target.value }));
              if (errors.currentSkills) setErrors((prev) => ({ ...prev, currentSkills: undefined }));
            }}
            placeholder="Describe programming languages, tools, frameworks, math/domain foundations, or projects you have completed so far..."
            className={`w-full rounded-lg border bg-[#090D16] px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 transition-colors resize-y min-h-[110px] ${
              errors.currentSkills
                ? 'border-rose-500/70 focus:ring-rose-500/30'
                : 'border-slate-800 focus:border-violet-500/70 focus:ring-violet-500/20'
            }`}
          />
          {errors.currentSkills ? (
            <p className="flex items-center gap-1.5 text-xs text-rose-400">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.currentSkills}</span>
            </p>
          ) : (
            <p className="text-xs text-slate-500">
              Be honest about your real starting point — the AI uses this to avoid repeating what
              you know or skipping prerequisites you still need.
            </p>
          )}
        </div>

        {/* 3. Education & Experience Level */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="education" className="block text-sm font-medium text-slate-200">
              Current Education <span className="text-xs text-slate-500 font-normal">(Optional)</span>
            </label>
            <input
              id="education"
              type="text"
              value={form.education}
              onChange={(e) => setForm((prev) => ({ ...prev, education: e.target.value }))}
              placeholder="e.g., B.Tech Computer Science, 2nd Year"
              className="w-full rounded-lg border border-slate-800 bg-[#090D16] px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-violet-500/70 focus:ring-2 focus:ring-violet-500/20 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <span className="block text-sm font-medium text-slate-200">Experience Level</span>
            <div className="grid grid-cols-3 gap-1 p-1 rounded-lg bg-[#090D16] border border-slate-800">
              {EXPERIENCE_LEVELS.map((level) => {
                const active = form.experienceLevel === level;
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, experienceLevel: level }))}
                    className={`py-2 px-3 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      active
                        ? 'bg-slate-800 text-slate-100 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {level}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 4. Study Hours & Learning Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="hoursPerWeek" className="text-sm font-medium text-slate-200">
                Available Study Hours / Week
              </label>
              <span className="font-mono tabular-nums text-sm font-semibold text-blue-400">
                {form.hoursPerWeek} hrs/week
              </span>
            </div>
            <input
              id="hoursPerWeek"
              type="range"
              min={3}
              max={30}
              step={1}
              value={form.hoursPerWeek}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, hoursPerWeek: Number(e.target.value) }))
              }
              className="w-full accent-violet-500 cursor-pointer"
            />
            <div className="flex items-center justify-between gap-1.5">
              {HOUR_PRESETS.map((hrs) => {
                const active = form.hoursPerWeek === hrs;
                return (
                  <button
                    key={hrs}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, hoursPerWeek: hrs }))}
                    className={`flex-1 py-1.5 text-xs font-mono tabular-nums rounded-md border transition-colors cursor-pointer ${
                      active
                        ? 'border-blue-500/50 bg-blue-500/15 text-blue-300'
                        : 'border-slate-800 bg-[#090D16] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {hrs}h
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <span className="block text-sm font-medium text-slate-200">
              Preferred Learning Style
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 p-1 rounded-lg bg-[#090D16] border border-slate-800">
              {LEARNING_STYLES.map((style) => {
                const active = form.learningStyle === style;
                return (
                  <button
                    key={style}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, learningStyle: style }))}
                    className={`py-2 px-2.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      active
                        ? 'bg-slate-800 text-slate-100 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {style}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-slate-500 pt-1">
              Shapes how weekly hours are split between tutorials, official docs, and hands-on
              coding labs.
            </p>
          </div>
        </div>

        {/* Submit & Reset */}
        <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleResetInputs}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium rounded-lg border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Inputs</span>
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2.5 px-6 py-3 text-sm font-semibold rounded-lg bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white shadow-sm transition-all whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-60"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isLoading ? 'Generating Roadmap...' : 'Generate My Career Roadmap'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
