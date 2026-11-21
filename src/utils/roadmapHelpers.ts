import {
  CareerAnalysisResult,
  CareerFormInput,
  CompletedTasksMap,
  RoadmapWeek,
} from '../types/career';

export const CAREER_STORAGE_KEY = 'careerpath_ai_workspace_v1';

export const TARGET_CAREER_SUGGESTIONS = [
  'AI Engineer',
  'Data Scientist',
  'Full Stack Developer',
  'Data Analyst',
  'Cybersecurity Analyst',
  'Cloud Engineer',
  'UI/UX Designer',
] as const;

export const SAMPLE_PROFILES: CareerFormInput[] = [
  {
    currentSkills:
      'Python basics (loops, functions, file handling), basic SQL SELECT queries, introductory linear algebra, built two small CLI scripts in class, familiar with GitHub.',
    targetCareer: 'AI Engineer',
    education: 'B.Tech in Computer Science (3rd Year)',
    experienceLevel: 'Beginner',
    hoursPerWeek: 14,
    learningStyle: 'Mixed',
  },
  {
    currentSkills:
      'HTML5, CSS3, responsive layouts, JavaScript ES6, basic React components and hooks, built a personal portfolio site, basic REST API fetch calls.',
    targetCareer: 'Full Stack Developer',
    education: 'B.Sc. Software Engineering (Final Year)',
    experienceLevel: 'Intermediate',
    hoursPerWeek: 18,
    learningStyle: 'Practice',
  },
  {
    currentSkills:
      'Microsoft Excel (VLOOKUP, Pivot Tables), basic descriptive statistics, introductory SQL joins, created college survey charts in Google Sheets.',
    targetCareer: 'Data Analyst',
    education: 'B.Com / Business Analytics Minor',
    experienceLevel: 'Beginner',
    hoursPerWeek: 10,
    learningStyle: 'Video',
  },
];

export const DEFAULT_FORM_INPUT: CareerFormInput = {
  currentSkills: '',
  targetCareer: '',
  education: '',
  experienceLevel: 'Beginner',
  hoursPerWeek: 12,
  learningStyle: 'Mixed',
};

export function getObjectiveTaskId(weekNumber: number, index: number): string {
  return `week-${weekNumber}-obj-${index}`;
}

export function getExerciseTaskId(weekNumber: number, index: number): string {
  return `week-${weekNumber}-ex-${index}`;
}

export function getAssignmentTaskId(weekNumber: number): string {
  return `week-${weekNumber}-assignment`;
}

export function getWeekTaskIds(week: RoadmapWeek): string[] {
  const ids: string[] = [];
  week.weeklyObjectives.forEach((_, i) => ids.push(getObjectiveTaskId(week.weekNumber, i)));
  week.practicalExercises.forEach((_, i) => ids.push(getExerciseTaskId(week.weekNumber, i)));
  if (week.miniAssignment) {
    ids.push(getAssignmentTaskId(week.weekNumber));
  }
  return ids;
}

export interface WeekProgressSummary {
  weekNumber: number;
  total: number;
  completed: number;
  percentage: number;
}

export interface RoadmapProgressSummary {
  totalTasks: number;
  completedTasksCount: number;
  percentage: number;
  perWeek: Record<number, WeekProgressSummary>;
}

export function calculateRoadmapProgress(
  weeks: RoadmapWeek[],
  completedMap: CompletedTasksMap
): RoadmapProgressSummary {
  let totalTasks = 0;
  let completedTasksCount = 0;
  const perWeek: Record<number, WeekProgressSummary> = {};

  for (const week of weeks) {
    const taskIds = getWeekTaskIds(week);
    const total = taskIds.length;
    const completed = taskIds.filter((id) => Boolean(completedMap[id])).length;
    totalTasks += total;
    completedTasksCount += completed;
    perWeek[week.weekNumber] = {
      weekNumber: week.weekNumber,
      total,
      completed,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }

  return {
    totalTasks,
    completedTasksCount,
    percentage: totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0,
    perWeek,
  };
}

export function generateRoadmapMarkdown(
  input: CareerFormInput,
  result: CareerAnalysisResult,
  completedMap: CompletedTasksMap
): string {
  const progress = calculateRoadmapProgress(result.roadmapWeeks, completedMap);
  const lines: string[] = [];

  lines.push(`# CareerPath AI Report: ${result.careerOverview.targetCareerTitle}`);
  lines.push(`Generated: ${new Date(result.generatedAt).toLocaleDateString()}`);
  lines.push('');
  lines.push(`## Profile Summary`);
  lines.push(`- **Target Career:** ${input.targetCareer}`);
  lines.push(`- **Education:** ${input.education || 'Not specified'}`);
  lines.push(`- **Experience Level:** ${input.experienceLevel}`);
  lines.push(`- **Study Budget:** ${input.hoursPerWeek} hours/week (${result.estimatedWorkload.totalStudyHours} total hours over 8 weeks)`);
  lines.push(`- **Preferred Learning Style:** ${input.learningStyle}`);
  lines.push(`- **Career Readiness Score:** ${result.readinessScore.score}/100`);
  lines.push(`- **Roadmap Completion:** ${progress.completedTasksCount}/${progress.totalTasks} tasks (${progress.percentage}%)`);
  lines.push('');
  lines.push(`## Welcome & Executive Path`);
  lines.push(result.welcomeMessage);
  lines.push('');
  lines.push(result.careerPathSummary);
  lines.push('');
  lines.push(`## Career Overview: ${result.careerOverview.targetCareerTitle}`);
  lines.push(result.careerOverview.shortExplanation);
  lines.push(`- **Required Skill Level:** ${result.careerOverview.requiredSkillLevel}`);
  lines.push(`- **Industry Demand:** ${result.careerOverview.industryDemandOverview}`);
  lines.push('### Key Responsibilities');
  result.careerOverview.importantResponsibilities.forEach((item) => lines.push(`- ${item}`));
  lines.push('');
  lines.push(`## Readiness Assessment (${result.readinessScore.score}/100)`);
  lines.push(result.readinessScore.rationale);
  lines.push('');
  lines.push(`## Skill Gap Analysis`);
  lines.push('### Already Strong');
  result.skillGapAnalysis.alreadyStrong.forEach((s) =>
    lines.push(`- **${s.skillName}** (${s.currentProficiency}): ${s.note}`)
  );
  lines.push('');
  lines.push('### Needs Improvement');
  result.skillGapAnalysis.needsImprovement.forEach((s) =>
    lines.push(
      `- **${s.skillName}** [Priority: ${s.priority} · Est: ${s.estimatedLearningTime}] (${s.currentVsTarget}): ${s.whyImportant}`
    )
  );
  lines.push('');
  lines.push('### Missing Skills');
  result.skillGapAnalysis.missingSkills.forEach((s) =>
    lines.push(
      `- **${s.skillName}** [Priority: ${s.priority} · Est: ${s.estimatedLearningTime}]: ${s.whyImportant}`
    )
  );
  lines.push('');
  lines.push(`## 8-Week Personalized Roadmap`);
  result.roadmapWeeks.forEach((week) => {
    lines.push(`### Week ${week.weekNumber}: ${week.learningTopic} (~${week.estimatedHours} hrs)`);
    lines.push(`**Focus Skills:** ${week.skillsToFocus.join(', ')}`);
    lines.push('**Weekly Objectives:**');
    week.weeklyObjectives.forEach((obj, idx) => {
      const done = completedMap[getObjectiveTaskId(week.weekNumber, idx)] ? 'x' : ' ';
      lines.push(`- [${done}] ${obj}`);
    });
    lines.push('**Practical Exercises:**');
    week.practicalExercises.forEach((ex, idx) => {
      const done = completedMap[getExerciseTaskId(week.weekNumber, idx)] ? 'x' : ' ';
      lines.push(`- [${done}] ${ex}`);
    });
    const assignDone = completedMap[getAssignmentTaskId(week.weekNumber)] ? 'x' : ' ';
    lines.push(`- [${assignDone}] **Mini Assignment:** ${week.miniAssignment}`);
    lines.push(`**Expected Outcome:** ${week.expectedOutcome}`);
    lines.push('');
  });
  lines.push(`## Portfolio Projects`);
  result.portfolioProjects.forEach((proj, idx) => {
    lines.push(`### ${idx + 1}. ${proj.projectName} (${proj.difficultyLevel})`);
    lines.push(proj.description);
    lines.push(`- **Technologies:** ${proj.technologies.join(', ')}`);
    lines.push(`- **Skills Demonstrated:** ${proj.skillsDemonstrated.join(', ')}`);
    lines.push(`- **Main Features:** ${proj.mainFeatures.join('; ')}`);
    lines.push(`- **Resume Value:** ${proj.resumeValue}`);
    lines.push('');
  });
  lines.push(`## Learning Resources`);
  result.learningResources.forEach((group) => {
    lines.push(`### ${group.skillName}`);
    group.resources.forEach((res) => {
      const urlPart = res.url ? ` — ${res.url}` : '';
      lines.push(`- **${res.title}** (${res.type} · ${res.provider})${urlPart}: ${res.description}`);
    });
    lines.push('');
  });

  return lines.join('\n');
}

export function downloadMarkdownFile(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
