import { useEffect, useState } from 'react';
import { MotionConfig, motion } from 'motion/react';
import {
  AlertCircle,
  Briefcase,
  CalendarDays,
  Compass,
  Download,
  FolderGit2,
  LayoutDashboard,
  Menu,
  Printer,
  RefreshCw,
  SlidersHorizontal,
  Target,
  X,
} from 'lucide-react';
import {
  ActiveSection,
  CareerAnalysisResult,
  CareerFormInput,
  CompletedTasksMap,
} from './types/career';
import {
  CAREER_STORAGE_KEY,
  DEFAULT_FORM_INPUT,
  calculateRoadmapProgress,
  downloadMarkdownFile,
  generateRoadmapMarkdown,
} from './utils/roadmapHelpers';
import { CareerPlannerForm } from './components/CareerPlannerForm';
import { LoadingAnalysis } from './components/LoadingAnalysis';
import { DashboardOverview } from './components/DashboardOverview';
import { CareerAnalysisView } from './components/CareerAnalysisView';
import { SkillGapView } from './components/SkillGapView';
import { RoadmapView } from './components/RoadmapView';
import { PortfolioProjectsView } from './components/PortfolioProjectsView';
import { PrintReport } from './components/PrintReport';

interface StoredWorkspace {
  input: CareerFormInput;
  result: CareerAnalysisResult | null;
  completedTasks: CompletedTasksMap;
}

const NAV_ITEMS: {
  id: ActiveSection;
  label: string;
  icon: typeof LayoutDashboard;
}[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'career-analysis', label: 'Career Analysis', icon: Compass },
  { id: 'skill-gap', label: 'Skill Gap', icon: Target },
  { id: 'roadmap', label: '8-Week Roadmap', icon: CalendarDays },
  { id: 'projects', label: 'Portfolio Projects', icon: FolderGit2 },
];

function loadInitialWorkspace(): StoredWorkspace {
  try {
    const raw = window.localStorage.getItem(CAREER_STORAGE_KEY);
    if (!raw) {
      return { input: DEFAULT_FORM_INPUT, result: null, completedTasks: {} };
    }
    const parsed = JSON.parse(raw) as Partial<StoredWorkspace>;
    return {
      input: parsed.input ? { ...DEFAULT_FORM_INPUT, ...parsed.input } : DEFAULT_FORM_INPUT,
      result: parsed.result ?? null,
      completedTasks: parsed.completedTasks ?? {},
    };
  } catch {
    return { input: DEFAULT_FORM_INPUT, result: null, completedTasks: {} };
  }
}

export default function App() {
  const [initialState] = useState<StoredWorkspace>(() => loadInitialWorkspace());
  const [formInput, setFormInput] = useState<CareerFormInput>(initialState.input);
  const [analysisResult, setAnalysisResult] = useState<CareerAnalysisResult | null>(
    initialState.result
  );
  const [completedTasks, setCompletedTasks] = useState<CompletedTasksMap>(
    initialState.completedTasks
  );

  const [activeSection, setActiveSection] = useState<ActiveSection>('dashboard');
  const [isEditingInputs, setIsEditingInputs] = useState<boolean>(!initialState.result);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);

  const [expandedWeeks, setExpandedWeeks] = useState<Record<number, boolean>>({
    1: true,
    2: false,
    3: false,
    4: false,
    5: false,
    6: false,
    7: false,
    8: false,
  });

  // Persist workspace to localStorage whenever input, result, or completed tasks change
  useEffect(() => {
    try {
      const payload: StoredWorkspace = {
        input: formInput,
        result: analysisResult,
        completedTasks,
      };
      window.localStorage.setItem(CAREER_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage quota errors safely
    }
  }, [formInput, analysisResult, completedTasks]);

  const runAnalysis = async (inputValues: CareerFormInput) => {
    setFormInput(inputValues);
    setIsLoading(true);
    setErrorMessage(null);
    setIsEditingInputs(false);

    try {
      const response = await fetch('/api/analyze-career', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputValues),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || `Request failed with status ${response.status}`);
      }

      setAnalysisResult(data as CareerAnalysisResult);
      setCompletedTasks({});
      setExpandedWeeks({
        1: true,
        2: false,
        3: false,
        4: false,
        5: false,
        6: false,
        7: false,
        8: false,
      });
      setActiveSection('dashboard');
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Unable to complete career analysis. Please try again.';
      setErrorMessage(message);
      if (!analysisResult) {
        setIsEditingInputs(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = () => {
    if (isLoading) return;
    runAnalysis(formInput);
  };

  const handleResetAll = () => {
    setFormInput(DEFAULT_FORM_INPUT);
    setAnalysisResult(null);
    setCompletedTasks({});
    setErrorMessage(null);
    setIsEditingInputs(true);
    try {
      window.localStorage.removeItem(CAREER_STORAGE_KEY);
    } catch {
      // Ignore
    }
  };

  const handleToggleTask = (taskId: string) => {
    setCompletedTasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  const handleToggleWeek = (weekNumber: number) => {
    setExpandedWeeks((prev) => ({
      ...prev,
      [weekNumber]: !prev[weekNumber],
    }));
  };

  const handleExpandAll = () => {
    const next: Record<number, boolean> = {};
    for (let i = 1; i <= 8; i++) next[i] = true;
    setExpandedWeeks(next);
  };

  const handleCollapseAll = () => {
    const next: Record<number, boolean> = {};
    for (let i = 1; i <= 8; i++) next[i] = false;
    setExpandedWeeks(next);
  };

  const handleNavigate = (section: ActiveSection, weekNumber?: number) => {
    setActiveSection(section);
    setIsEditingInputs(false);
    setMobileNavOpen(false);
    if (section === 'roadmap' && weekNumber) {
      setExpandedWeeks((prev) => ({
        ...prev,
        [weekNumber]: true,
      }));
    }
  };

  const handleDownloadRoadmap = () => {
    if (!analysisResult) return;
    const markdown = generateRoadmapMarkdown(formInput, analysisResult, completedTasks);
    const slug = analysisResult.careerOverview.targetCareerTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    downloadMarkdownFile(`careerpath-${slug || 'roadmap'}.md`, markdown);
  };

  const handlePrintReport = () => {
    window.print();
  };

  const progress = analysisResult
    ? calculateRoadmapProgress(analysisResult.roadmapWeeks, completedTasks)
    : null;

  const activeNavLabel =
    isEditingInputs || !analysisResult
      ? 'Career Planner'
      : NAV_ITEMS.find((item) => item.id === activeSection)?.label ?? 'Dashboard';

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col lg:flex-row no-print">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-30 h-14 px-4 border-b border-slate-800/90 bg-[#090D16]/95 backdrop-blur-sm flex items-center justify-between">
          <button
            type="button"
            onClick={() => handleNavigate('dashboard')}
            className="font-display text-base font-bold tracking-tight text-slate-100 whitespace-nowrap shrink-0 cursor-pointer"
          >
            CareerPath AI
          </button>

          <div className="flex items-center gap-2">
            {analysisResult && !isLoading && (
              <button
                type="button"
                onClick={() => setIsEditingInputs((prev) => !prev)}
                className="px-2.5 py-1.5 text-xs font-medium rounded-md border border-slate-800 bg-[#0F1623] text-slate-300 whitespace-nowrap shrink-0 cursor-pointer"
              >
                {isEditingInputs ? 'View Plan' : 'Edit Inputs'}
              </button>
            )}
            <button
              type="button"
              onClick={() => setMobileNavOpen((prev) => !prev)}
              aria-label={mobileNavOpen ? 'Close navigation' : 'Open navigation'}
              className="p-2 rounded-lg border border-slate-800 bg-[#0F1623] text-slate-300 hover:text-white cursor-pointer"
            >
              {mobileNavOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Mobile Drawer */}
        {mobileNavOpen && (
          <div className="lg:hidden fixed inset-x-0 top-14 bottom-0 z-20 bg-[#090D16]/98 border-t border-slate-800 p-4 flex flex-col justify-between overflow-y-auto">
            <nav className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = !isEditingInputs && analysisResult && activeSection === item.id;
                const disabled = !analysisResult;
                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => handleNavigate(item.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                      active
                        ? 'bg-violet-500/15 text-violet-300 border border-violet-500/30'
                        : 'text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {analysisResult && (
              <div className="pt-4 border-t border-slate-800 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    handleDownloadRoadmap();
                    setMobileNavOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium rounded-lg border border-slate-800 bg-[#0F1623] text-slate-200 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Roadmap</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileNavOpen(false);
                    handlePrintReport();
                  }}
                  className="w-full flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium rounded-lg border border-slate-800 bg-[#0F1623] text-slate-200 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Report</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex lg:w-64 lg:shrink-0 lg:flex-col lg:sticky lg:top-0 lg:h-screen border-r border-slate-800/90 bg-[#0C111D] p-5 justify-between">
          <div className="space-y-7">
            <div className="px-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  if (analysisResult) {
                    handleNavigate('dashboard');
                  } else {
                    setIsEditingInputs(true);
                  }
                }}
                className="font-display text-lg font-bold tracking-tight text-slate-100 whitespace-nowrap shrink-0 cursor-pointer"
              >
                CareerPath AI
              </button>
            </div>

            <nav className="space-y-1" aria-label="Primary Navigation">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = !isEditingInputs && Boolean(analysisResult) && activeSection === item.id;
                const disabled = !analysisResult;
                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => handleNavigate(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed ${
                      active
                        ? 'bg-violet-500/15 text-violet-300 border border-violet-500/25'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 border border-transparent'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-800/80">
            {analysisResult && progress ? (
              <div className="rounded-lg border border-slate-800 bg-[#090D16] p-3.5 space-y-2.5">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Briefcase className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                  <span className="truncate text-slate-200 font-medium">
                    {analysisResult.careerOverview.targetCareerTitle}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono tabular-nums">
                  <span className="text-slate-400">Readiness</span>
                  <span className="text-slate-200 font-medium">
                    {analysisResult.readinessScore.score}/100
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono tabular-nums">
                    <span className="text-slate-400">Roadmap</span>
                    <span className="text-emerald-400">{progress.percentage}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-400 transition-all duration-300"
                      style={{ width: `${progress.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="px-2 text-xs text-slate-500 leading-relaxed">
                Complete the career assessment form to unlock your skill gap analysis and 8-week
                roadmap.
              </div>
            )}

            <button
              type="button"
              disabled={isLoading}
              onClick={() => setIsEditingInputs(true)}
              className={`w-full flex items-center justify-center gap-2 px-3.5 py-2.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50 ${
                isEditingInputs
                  ? 'border-violet-500/40 bg-violet-500/15 text-violet-300'
                  : 'border-slate-800 bg-[#090D16] text-slate-300 hover:text-white hover:border-slate-700'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" />
              <span>{analysisResult ? 'Edit Inputs / New Plan' : 'Assessment Form'}</span>
            </button>
          </div>
        </aside>

        {/* Main Workspace */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Desktop Contextual Top Bar */}
          <div className="hidden lg:flex items-center justify-between gap-8 px-8 h-16 border-b border-slate-800/80 bg-[#090D16]/90 sticky top-0 z-20 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-xs text-slate-400 min-w-0">
              <span className="whitespace-nowrap">Workspace</span>
              <span aria-hidden="true">/</span>
              <span className="text-slate-200 font-medium truncate">{activeNavLabel}</span>
              {analysisResult && !isEditingInputs && (
                <>
                  <span aria-hidden="true">/</span>
                  <span className="text-slate-400 truncate">
                    {analysisResult.careerOverview.targetCareerTitle}
                  </span>
                </>
              )}
            </div>

            {analysisResult && !isLoading && (
              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsEditingInputs((prev) => !prev)}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-800 bg-[#0F1623] text-slate-300 hover:text-white hover:border-slate-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {isEditingInputs ? 'Back to Dashboard' : 'Edit Inputs'}
                </button>
                <button
                  type="button"
                  onClick={handlePrintReport}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-800 bg-[#0F1623] text-slate-300 hover:text-white hover:border-slate-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Report</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadRoadmap}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-800 bg-[#0F1623] text-slate-300 hover:text-white hover:border-slate-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
                <button
                  type="button"
                  onClick={handleRegenerate}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg bg-violet-600 hover:bg-violet-500 text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Regenerate</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Quick Export Bar when plan exists */}
          {analysisResult && !isLoading && !isEditingInputs && (
            <div className="lg:hidden px-4 py-2.5 border-b border-slate-800/80 bg-[#0C111D] flex items-center justify-between gap-2 overflow-x-auto">
              <button
                type="button"
                onClick={handleRegenerate}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-violet-600 text-white whitespace-nowrap shrink-0 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Regenerate</span>
              </button>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleDownloadRoadmap}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border border-slate-800 bg-[#0F1623] text-slate-300 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Download className="w-3 h-3" />
                  <span>Download</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrintReport}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border border-slate-800 bg-[#0F1623] text-slate-300 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Printer className="w-3 h-3" />
                  <span>Print</span>
                </button>
              </div>
            </div>
          )}

          {/* Main Content Viewport */}
          <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {errorMessage && (
              <div
                role="alert"
                className="mb-6 rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium text-rose-200">
                      Career Analysis Error
                    </div>
                    <p className="text-xs sm:text-sm text-rose-300/90">{errorMessage}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => runAnalysis(formInput)}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-100 hover:bg-rose-500/30 transition-colors whitespace-nowrap cursor-pointer"
                  >
                    Try Again
                  </button>
                  <button
                    type="button"
                    onClick={() => setErrorMessage(null)}
                    className="p-1.5 text-rose-300 hover:text-white cursor-pointer"
                    aria-label="Dismiss error"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {isLoading ? (
              <LoadingAnalysis
                targetCareer={formInput.targetCareer}
                hoursPerWeek={formInput.hoursPerWeek}
              />
            ) : isEditingInputs || !analysisResult ? (
              <div className="space-y-6">
                {/* Modern Empty-State Intro Banner before first analysis */}
                {!analysisResult && (
                  <section className="rounded-xl border border-slate-800 bg-[#0F1623] p-6 sm:p-8">
                    <div className="max-w-3xl space-y-3">
                      <div className="text-xs font-medium text-blue-400">
                        AI-Powered Student Career Strategist
                      </div>
                      <h1 className="text-2xl sm:text-4xl font-semibold text-slate-100 tracking-tight text-balance">
                        Turn your current skills into an actionable 8-week career roadmap
                      </h1>
                      <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
                        Enter what you know today and your dream job below. Gemini AI evaluates
                        your real readiness score, pinpoints missing skills, sequences an 8-week
                        study plan around your weekly schedule, and recommends resume-ready
                        portfolio projects.
                      </p>
                      <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300">
                        <div className="rounded-lg border border-slate-800/80 bg-[#090D16] p-3.5">
                          <div className="font-medium text-slate-100">Readiness & Skill Gap</div>
                          <div className="text-slate-400 mt-1">
                            Honest 0–100 benchmark comparing your skills against role expectations.
                          </div>
                        </div>
                        <div className="rounded-lg border border-slate-800/80 bg-[#090D16] p-3.5">
                          <div className="font-medium text-slate-100">Interactive 8-Week Plan</div>
                          <div className="text-slate-400 mt-1">
                            Progressive weekly objectives, exercises, and saved progress tracking.
                          </div>
                        </div>
                        <div className="rounded-lg border border-slate-800/80 bg-[#090D16] p-3.5">
                          <div className="font-medium text-slate-100">3 Portfolio Projects</div>
                          <div className="text-slate-400 mt-1">
                            Beginner-to-advanced build ideas with tech stacks and resume impact.
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>
                )}

                <CareerPlannerForm
                  initialValues={formInput}
                  isLoading={isLoading}
                  hasExistingPlan={Boolean(analysisResult)}
                  onSubmit={runAnalysis}
                  onCancelEdit={
                    analysisResult ? () => setIsEditingInputs(false) : undefined
                  }
                  onResetAll={handleResetAll}
                />
              </div>
            ) : (
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              >
                {activeSection === 'dashboard' && (
                  <DashboardOverview
                    result={analysisResult}
                    completedTasks={completedTasks}
                    onNavigate={handleNavigate}
                  />
                )}
                {activeSection === 'career-analysis' && (
                  <CareerAnalysisView result={analysisResult} />
                )}
                {activeSection === 'skill-gap' && <SkillGapView result={analysisResult} />}
                {activeSection === 'roadmap' && (
                  <RoadmapView
                    result={analysisResult}
                    completedTasks={completedTasks}
                    expandedWeeks={expandedWeeks}
                    onToggleTask={handleToggleTask}
                    onToggleWeek={handleToggleWeek}
                    onExpandAll={handleExpandAll}
                    onCollapseAll={handleCollapseAll}
                  />
                )}
                {activeSection === 'projects' && (
                  <PortfolioProjectsView result={analysisResult} />
                )}
              </motion.div>
            )}
          </main>
        </div>
      </div>

      {/* Print-Friendly Report Container */}
      {analysisResult && (
        <PrintReport
          input={formInput}
          result={analysisResult}
          completedTasks={completedTasks}
        />
      )}
    </MotionConfig>
  );
}
