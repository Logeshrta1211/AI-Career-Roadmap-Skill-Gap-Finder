import {
  CareerAnalysisResult,
  CareerFormInput,
  CompletedTasksMap,
} from '../types/career';
import {
  calculateRoadmapProgress,
  getAssignmentTaskId,
  getExerciseTaskId,
  getObjectiveTaskId,
} from '../utils/roadmapHelpers';

interface PrintReportProps {
  input: CareerFormInput;
  result: CareerAnalysisResult;
  completedTasks: CompletedTasksMap;
}

export function PrintReport({ input, result, completedTasks }: PrintReportProps) {
  const progress = calculateRoadmapProgress(result.roadmapWeeks, completedTasks);

  return (
    <div className="hidden print:block bg-white text-slate-900 p-4 space-y-6">
      <header className="border-b border-slate-300 pb-4">
        <div className="text-xs font-medium text-slate-500">
          CareerPath AI — Career Roadmap & Skill Gap Report
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mt-1">
          {result.careerOverview.targetCareerTitle}
        </h1>
        <div className="text-xs text-slate-600 mt-2 flex flex-wrap gap-4">
          <span>Readiness Score: {result.readinessScore.score}/100</span>
          <span>
            Roadmap Progress: {progress.completedTasksCount}/{progress.totalTasks} (
            {progress.percentage}%)
          </span>
          <span>
            Study Plan: {input.hoursPerWeek} hrs/week ({input.learningStyle})
          </span>
          <span>Generated: {new Date(result.generatedAt).toLocaleDateString()}</span>
        </div>
      </header>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-slate-900">Executive Summary</h2>
        <p className="text-sm text-slate-800">{result.welcomeMessage}</p>
        <p className="text-sm text-slate-700">{result.careerPathSummary}</p>
      </section>

      <section className="space-y-2 print-break-inside-avoid">
        <h2 className="text-base font-bold text-slate-900">Career Overview</h2>
        <p className="text-sm text-slate-800">{result.careerOverview.shortExplanation}</p>
        <p className="text-xs text-slate-700">
          <strong>Required Level:</strong> {result.careerOverview.requiredSkillLevel} ·{' '}
          <strong>Industry Demand:</strong> {result.careerOverview.industryDemandOverview}
        </p>
      </section>

      <section className="space-y-2 print-break-inside-avoid">
        <h2 className="text-base font-bold text-slate-900">
          Readiness Rationale ({result.readinessScore.score}/100)
        </h2>
        <p className="text-sm text-slate-800">{result.readinessScore.rationale}</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-slate-900">Skill Gap Breakdown</h2>
        <div className="space-y-2 text-xs">
          <div>
            <strong>Already Strong:</strong>{' '}
            {result.skillGapAnalysis.alreadyStrong.map((s) => s.skillName).join(', ') || 'None'}
          </div>
          <div>
            <strong>Needs Improvement:</strong>{' '}
            {result.skillGapAnalysis.needsImprovement
              .map((s) => `${s.skillName} (${s.priority}, ${s.estimatedLearningTime})`)
              .join('; ') || 'None'}
          </div>
          <div>
            <strong>Missing Skills:</strong>{' '}
            {result.skillGapAnalysis.missingSkills
              .map((s) => `${s.skillName} (${s.priority}, ${s.estimatedLearningTime})`)
              .join('; ') || 'None'}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-bold text-slate-900">8-Week Learning Roadmap</h2>
        {result.roadmapWeeks.map((week) => (
          <div
            key={week.weekNumber}
            className="border border-slate-300 rounded p-3 space-y-1.5 print-break-inside-avoid"
          >
            <div className="flex items-center justify-between text-sm font-bold text-slate-900">
              <span>
                Week {week.weekNumber}: {week.learningTopic}
              </span>
              <span>{week.estimatedHours} hrs</span>
            </div>
            <div className="text-xs text-slate-600">
              Focus: {week.skillsToFocus.join(', ')}
            </div>
            <ul className="text-xs text-slate-800 space-y-0.5 pl-4 list-disc">
              {week.weeklyObjectives.map((obj, idx) => {
                const done = Boolean(completedTasks[getObjectiveTaskId(week.weekNumber, idx)]);
                return (
                  <li key={idx}>
                    [{done ? 'x' : ' '}] {obj}
                  </li>
                );
              })}
              {week.practicalExercises.map((ex, idx) => {
                const done = Boolean(completedTasks[getExerciseTaskId(week.weekNumber, idx)]);
                return (
                  <li key={`ex-${idx}`}>
                    [{done ? 'x' : ' '}] Exercise: {ex}
                  </li>
                );
              })}
              <li>
                [{completedTasks[getAssignmentTaskId(week.weekNumber)] ? 'x' : ' '}] Mini
                Assignment: {week.miniAssignment}
              </li>
            </ul>
            <div className="text-xs text-slate-700">
              <strong>Expected Outcome:</strong> {week.expectedOutcome}
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-slate-900">Portfolio Projects</h2>
        {result.portfolioProjects.map((proj, idx) => (
          <div
            key={idx}
            className="border border-slate-300 rounded p-3 space-y-1 print-break-inside-avoid"
          >
            <div className="text-sm font-bold text-slate-900">
              {idx + 1}. {proj.projectName} ({proj.difficultyLevel})
            </div>
            <p className="text-xs text-slate-800">{proj.description}</p>
            <div className="text-xs text-slate-700">
              <strong>Tech:</strong> {proj.technologies.join(', ')}
            </div>
            <div className="text-xs text-slate-700">
              <strong>Resume Value:</strong> {proj.resumeValue}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
