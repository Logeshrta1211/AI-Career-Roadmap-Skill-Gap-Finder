export type ExperienceLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type LearningStyle = 'Video' | 'Documentation' | 'Practice' | 'Mixed';
export type ActiveSection =
  | 'dashboard'
  | 'career-analysis'
  | 'skill-gap'
  | 'roadmap'
  | 'projects';

export interface CareerFormInput {
  currentSkills: string;
  targetCareer: string;
  education: string;
  experienceLevel: ExperienceLevel;
  hoursPerWeek: number;
  learningStyle: LearningStyle;
}

export interface CareerOverview {
  targetCareerTitle: string;
  shortExplanation: string;
  importantResponsibilities: string[];
  industryDemandOverview: string;
  requiredSkillLevel: string;
}

export interface ReadinessBreakdownItem {
  category: string;
  currentScore: number;
  targetScore: number;
}

export interface ReadinessScore {
  score: number;
  rationale: string;
  breakdown: ReadinessBreakdownItem[];
}

export interface CurrentSkillItem {
  skillName: string;
  currentLevel: 'Foundational' | 'Intermediate' | 'Proficient' | 'Advanced';
  relevance: 'High' | 'Medium' | 'Low';
  explanation: string;
}

export interface StrongSkillGapItem {
  skillName: string;
  currentProficiency: string;
  note: string;
}

export interface ImprovementSkillGapItem {
  skillName: string;
  whyImportant: string;
  priority: 'High' | 'Medium' | 'Low';
  estimatedLearningTime: string;
  currentVsTarget: string;
}

export interface MissingSkillGapItem {
  skillName: string;
  whyImportant: string;
  priority: 'High' | 'Medium' | 'Low';
  estimatedLearningTime: string;
}

export interface SkillGapAnalysis {
  alreadyStrong: StrongSkillGapItem[];
  needsImprovement: ImprovementSkillGapItem[];
  missingSkills: MissingSkillGapItem[];
}

export interface RoadmapWeek {
  weekNumber: number;
  learningTopic: string;
  skillsToFocus: string[];
  weeklyObjectives: string[];
  practicalExercises: string[];
  miniAssignment: string;
  expectedOutcome: string;
  estimatedHours: number;
}

export interface PortfolioProject {
  projectName: string;
  description: string;
  difficultyLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  technologies: string[];
  skillsDemonstrated: string[];
  mainFeatures: string[];
  resumeValue: string;
}

export interface ResourceItem {
  title: string;
  type:
    | 'Official Docs'
    | 'Free Course'
    | 'Tutorial'
    | 'Practice Platform'
    | 'GitHub Resource';
  provider: string;
  url?: string;
  description: string;
}

export interface SkillResourceGroup {
  skillName: string;
  resources: ResourceItem[];
}

export interface EstimatedWorkload {
  hoursPerWeek: number;
  totalWeeks: number;
  totalStudyHours: number;
  weeklySplitNote: string;
}

export interface CareerAnalysisResult {
  welcomeMessage: string;
  careerPathSummary: string;
  estimatedWorkload: EstimatedWorkload;
  careerOverview: CareerOverview;
  readinessScore: ReadinessScore;
  currentSkillsAnalysis: CurrentSkillItem[];
  skillGapAnalysis: SkillGapAnalysis;
  roadmapWeeks: RoadmapWeek[];
  portfolioProjects: PortfolioProject[];
  learningResources: SkillResourceGroup[];
  generatedAt: string;
}

export type CompletedTasksMap = Record<string, boolean>;
