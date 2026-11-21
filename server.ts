import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

const VALID_EXPERIENCE = ['Beginner', 'Intermediate', 'Advanced'] as const;
const VALID_STYLES = ['Video', 'Documentation', 'Practice', 'Mixed'] as const;

const careerAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    welcomeMessage: {
      type: Type.STRING,
      description:
        'A personalized, encouraging welcome message tailored to the student target career, education, and starting point without promising employment.',
    },
    careerPathSummary: {
      type: Type.STRING,
      description:
        'Concise executive summary of how the student transitions from their current skill set to job-readiness over 8 weeks.',
    },
    estimatedWorkload: {
      type: Type.OBJECT,
      properties: {
        hoursPerWeek: { type: Type.INTEGER },
        totalWeeks: { type: Type.INTEGER },
        totalStudyHours: { type: Type.INTEGER },
        weeklySplitNote: {
          type: Type.STRING,
          description:
            'Recommended split of weekly hours tailored to the user preferred learning style (e.g., theory vs hands-on labs vs mini-project).',
        },
      },
      required: ['hoursPerWeek', 'totalWeeks', 'totalStudyHours', 'weeklySplitNote'],
    },
    careerOverview: {
      type: Type.OBJECT,
      properties: {
        targetCareerTitle: { type: Type.STRING },
        shortExplanation: { type: Type.STRING },
        importantResponsibilities: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        industryDemandOverview: { type: Type.STRING },
        requiredSkillLevel: { type: Type.STRING },
      },
      required: [
        'targetCareerTitle',
        'shortExplanation',
        'importantResponsibilities',
        'industryDemandOverview',
        'requiredSkillLevel',
      ],
    },
    readinessScore: {
      type: Type.OBJECT,
      properties: {
        score: {
          type: Type.INTEGER,
          description:
            'Realistic career readiness score from 0 to 100 based strictly on the student stated skills and experience compared to entry/target role requirements.',
        },
        rationale: {
          type: Type.STRING,
          description:
            'Specific rationale explaining why this score was assigned based on matching skills and key missing requirements.',
        },
        breakdown: {
          type: Type.ARRAY,
          description: '4 to 5 competency dimensions comparing current readiness vs target readiness (0-100).',
          items: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING },
              currentScore: { type: Type.INTEGER },
              targetScore: { type: Type.INTEGER },
            },
            required: ['category', 'currentScore', 'targetScore'],
          },
        },
      },
      required: ['score', 'rationale', 'breakdown'],
    },
    currentSkillsAnalysis: {
      type: Type.ARRAY,
      description:
        'Evaluation ONLY of skills explicitly stated by the user or directly implied by their listed coursework. Do not invent skills the user did not list.',
      items: {
        type: Type.OBJECT,
        properties: {
          skillName: { type: Type.STRING },
          currentLevel: {
            type: Type.STRING,
            enum: ['Foundational', 'Intermediate', 'Proficient', 'Advanced'],
          },
          relevance: {
            type: Type.STRING,
            enum: ['High', 'Medium', 'Low'],
          },
          explanation: { type: Type.STRING },
        },
        required: ['skillName', 'currentLevel', 'relevance', 'explanation'],
      },
    },
    skillGapAnalysis: {
      type: Type.OBJECT,
      properties: {
        alreadyStrong: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              skillName: { type: Type.STRING },
              currentProficiency: { type: Type.STRING },
              note: { type: Type.STRING },
            },
            required: ['skillName', 'currentProficiency', 'note'],
          },
        },
        needsImprovement: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              skillName: { type: Type.STRING },
              whyImportant: { type: Type.STRING },
              priority: {
                type: Type.STRING,
                enum: ['High', 'Medium', 'Low'],
              },
              estimatedLearningTime: { type: Type.STRING },
              currentVsTarget: { type: Type.STRING },
            },
            required: [
              'skillName',
              'whyImportant',
              'priority',
              'estimatedLearningTime',
              'currentVsTarget',
            ],
          },
        },
        missingSkills: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              skillName: { type: Type.STRING },
              whyImportant: { type: Type.STRING },
              priority: {
                type: Type.STRING,
                enum: ['High', 'Medium', 'Low'],
              },
              estimatedLearningTime: { type: Type.STRING },
            },
            required: ['skillName', 'whyImportant', 'priority', 'estimatedLearningTime'],
          },
        },
      },
      required: ['alreadyStrong', 'needsImprovement', 'missingSkills'],
    },
    roadmapWeeks: {
      type: Type.ARRAY,
      description:
        'Exactly 8 sequential weeks (1 through 8). Progressive curriculum where fundamentals precede advanced concepts and tasks fit the user weekly study hours.',
      items: {
        type: Type.OBJECT,
        properties: {
          weekNumber: { type: Type.INTEGER },
          learningTopic: { type: Type.STRING },
          skillsToFocus: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          weeklyObjectives: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          practicalExercises: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          miniAssignment: { type: Type.STRING },
          expectedOutcome: { type: Type.STRING },
          estimatedHours: { type: Type.INTEGER },
        },
        required: [
          'weekNumber',
          'learningTopic',
          'skillsToFocus',
          'weeklyObjectives',
          'practicalExercises',
          'miniAssignment',
          'expectedOutcome',
          'estimatedHours',
        ],
      },
    },
    portfolioProjects: {
      type: Type.ARRAY,
      description: 'Exactly 3 portfolio projects progressing from Beginner to Intermediate to Advanced.',
      items: {
        type: Type.OBJECT,
        properties: {
          projectName: { type: Type.STRING },
          description: { type: Type.STRING },
          difficultyLevel: {
            type: Type.STRING,
            enum: ['Beginner', 'Intermediate', 'Advanced'],
          },
          technologies: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          skillsDemonstrated: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          mainFeatures: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          resumeValue: { type: Type.STRING },
        },
        required: [
          'projectName',
          'description',
          'difficultyLevel',
          'technologies',
          'skillsDemonstrated',
          'mainFeatures',
          'resumeValue',
        ],
      },
    },
    learningResources: {
      type: Type.ARRAY,
      description:
        'Curated learning resources grouped by critical target skills. Never fabricate URLs.',
      items: {
        type: Type.OBJECT,
        properties: {
          skillName: { type: Type.STRING },
          resources: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                type: {
                  type: Type.STRING,
                  enum: [
                    'Official Docs',
                    'Free Course',
                    'Tutorial',
                    'Practice Platform',
                    'GitHub Resource',
                  ],
                },
                provider: { type: Type.STRING },
                url: {
                  type: Type.STRING,
                  description:
                    'Optional canonical homepage or official documentation URL ONLY if 100% certain. Leave empty string if unsure.',
                },
                description: { type: Type.STRING },
              },
              required: ['title', 'type', 'provider', 'description'],
            },
          },
        },
        required: ['skillName', 'resources'],
      },
    },
  },
  required: [
    'welcomeMessage',
    'careerPathSummary',
    'estimatedWorkload',
    'careerOverview',
    'readinessScore',
    'currentSkillsAnalysis',
    'skillGapAnalysis',
    'roadmapWeeks',
    'portfolioProjects',
    'learningResources',
  ],
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const record = err as Record<string, unknown>;
  const status = typeof record.status === 'number' ? record.status : undefined;
  const message = typeof record.message === 'string' ? record.message : '';
  if (status && (status === 429 || status >= 500)) return true;
  return /ECONNRESET|ETIMEDOUT|UNAVAILABLE|RESOURCE_EXHAUSTED|503|502/i.test(message);
}

function normalizeUrl(url?: string): string | undefined {
  if (!url) return undefined;
  const trimmed = url.trim();
  if (!trimmed) return undefined;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return parsed.toString();
    }
    return undefined;
  } catch {
    return undefined;
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ ok: true });
  });

  app.post('/api/analyze-career', async (req: Request, res: Response) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
        res.status(500).json({
          error:
            'Gemini API key is not configured on the server. Add GEMINI_API_KEY in Settings > Secrets.',
        });
        return;
      }

      const {
        currentSkills,
        targetCareer,
        education,
        experienceLevel,
        hoursPerWeek,
        learningStyle,
      } = req.body ?? {};

      const cleanSkills = typeof currentSkills === 'string' ? currentSkills.trim() : '';
      const cleanTarget = typeof targetCareer === 'string' ? targetCareer.trim() : '';
      const cleanEducation = typeof education === 'string' ? education.trim() : '';
      const cleanHours = Number(hoursPerWeek);

      if (!cleanSkills || cleanSkills.length < 2) {
        res.status(400).json({ error: 'Please describe your current skills before generating a roadmap.' });
        return;
      }
      if (!cleanTarget || cleanTarget.length < 2) {
        res.status(400).json({ error: 'Please enter a target career or dream job.' });
        return;
      }
      if (!VALID_EXPERIENCE.includes(experienceLevel)) {
        res.status(400).json({ error: 'Invalid experience level selected.' });
        return;
      }
      if (!VALID_STYLES.includes(learningStyle)) {
        res.status(400).json({ error: 'Invalid preferred learning style selected.' });
        return;
      }
      if (!Number.isFinite(cleanHours) || cleanHours < 3 || cleanHours > 30) {
        res.status(400).json({ error: 'Available study hours per week must be between 3 and 30.' });
        return;
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const systemInstruction = `You are a senior technical career strategist and curriculum architect advising a student.
Your job is to evaluate the student's current profile against their target career and produce a deeply realistic, structured, personalized 8-week skill-building plan.

Strict Grounding & Quality Rules:
1. NEVER invent or assume skills the student did not mention in "Current Skills" (or directly fundamental to their stated education if relevant, clearly noted as foundational).
2. Calibrate the Readiness Score (0 to 100) honestly and realistically based on how well the stated skills and experience level match real industry expectations for the target career. A true beginner with unrelated skills should score lower (e.g., 15–35), someone with partial overlap should score moderately (e.g., 40–65), and an advanced candidate with strong overlap should score higher (e.g., 70–88).
3. Avoid generic fluff. Tie every recommendation, gap, weekly objective, exercise, mini-assignment, and project directly to the student's target role and existing foundation.
4. Respect the student's available weekly study hours (${cleanHours} hours/week) and preferred learning style (${learningStyle}). Each week's estimatedHours should align closely with ${cleanHours} hours, and tasks must be realistically completable within that time budget.
5. Make the 8-week roadmap strictly progressive: Week 1 builds prerequisites for Week 2, moving sequentially from core fundamentals -> applied tooling -> integration/testing -> capstone readiness. Never place advanced topics before prerequisites.
6. Generate exactly 3 portfolio projects ordered from Beginner to Intermediate to Advanced, each directly aligned with the target career and suitable for a student resume.
7. NEVER guarantee employment or make unrealistic promises.
8. NEVER fabricate or guess deep URLs. Only include a URL in learningResources if you are 100% certain of its exact canonical root domain or official documentation URL (e.g., "https://react.dev", "https://docs.python.org/3/", "https://roadmap.sh"). Otherwise leave "url" as an empty string "" and provide the exact resource name and provider so the student can search for it accurately.`;

      const userPrompt = `Analyze this student profile and generate the structured career roadmap JSON:

- Target Career / Dream Job: ${cleanTarget}
- Current Skills: ${cleanSkills}
- Current Education: ${cleanEducation || 'Not specified'}
- Experience Level: ${experienceLevel}
- Available Study Hours Per Week: ${cleanHours} hours/week
- Preferred Learning Style: ${learningStyle}

Return all required JSON fields accurately, with exactly 8 progressive weeks in roadmapWeeks and exactly 3 progressive projects (Beginner, Intermediate, Advanced) in portfolioProjects.`;

      let lastError: unknown;
      let rawText: string | undefined;

      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const response = await ai.models.generateContent({
            model: 'gemini-4-hydrogen',
            contents: userPrompt,
            config: {
              systemInstruction,
              responseMimeType: 'application/json',
              responseSchema: careerAnalysisSchema,
              thinkingConfig: { thinkingLevel: ThinkingLevel.MEDIUM },
            },
          });
          rawText = response.text;
          if (rawText) break;
        } catch (err) {
          lastError = err;
          if (attempt < 2 && isRetryableError(err)) {
            await sleep(750 * Math.pow(2, attempt));
            continue;
          }
          throw err;
        }
      }

      if (!rawText) {
        throw lastError ?? new Error('Gemini returned an empty response.');
      }

      let parsed: Record<string, unknown>;
      try {
        parsed = JSON.parse(rawText);
      } catch {
        res.status(502).json({
          error: 'The AI response could not be parsed cleanly. Please try regenerating your roadmap.',
        });
        return;
      }

      // Sanitize and normalize critical structures safely
      const rawScore = Number((parsed.readinessScore as Record<string, unknown>)?.score ?? 0);
      const clampedScore = Math.max(0, Math.min(100, Math.round(rawScore)));

      const rawWeeks = Array.isArray(parsed.roadmapWeeks) ? parsed.roadmapWeeks : [];
      const sortedWeeks = [...rawWeeks]
        .sort((a, b) => Number(a?.weekNumber ?? 0) - Number(b?.weekNumber ?? 0))
        .slice(0, 8)
        .map((w, idx) => ({
          ...w,
          weekNumber: idx + 1,
          estimatedHours: Number(w?.estimatedHours) || cleanHours,
          skillsToFocus: Array.isArray(w?.skillsToFocus) ? w.skillsToFocus : [],
          weeklyObjectives: Array.isArray(w?.weeklyObjectives) ? w.weeklyObjectives : [],
          practicalExercises: Array.isArray(w?.practicalExercises) ? w.practicalExercises : [],
        }));

      const rawResources = Array.isArray(parsed.learningResources) ? parsed.learningResources : [];
      const cleanedResources = rawResources.map((group) => ({
        skillName: String(group?.skillName ?? ''),
        resources: Array.isArray(group?.resources)
          ? group.resources.map((r: Record<string, unknown>) => ({
              title: String(r?.title ?? ''),
              type: String(r?.type ?? 'Tutorial'),
              provider: String(r?.provider ?? ''),
              url: normalizeUrl(typeof r?.url === 'string' ? r.url : undefined),
              description: String(r?.description ?? ''),
            }))
          : [],
      }));

      const result = {
        ...parsed,
        estimatedWorkload: {
          hoursPerWeek: cleanHours,
          totalWeeks: sortedWeeks.length || 8,
          totalStudyHours: cleanHours * (sortedWeeks.length || 8),
          weeklySplitNote: String(
            (parsed.estimatedWorkload as Record<string, unknown>)?.weeklySplitNote ??
              `${cleanHours} hrs/week tailored for ${learningStyle} learning.`
          ),
        },
        readinessScore: {
          ...(parsed.readinessScore as Record<string, unknown>),
          score: clampedScore,
        },
        roadmapWeeks: sortedWeeks,
        learningResources: cleanedResources,
        generatedAt: new Date().toISOString(),
      };

      res.json(result);
    } catch (err: unknown) {
      console.error('Error in /api/analyze-career:', err);
      const record = err as Record<string, unknown>;
      const status = typeof record?.status === 'number' ? record.status : 500;
      const message =
        err instanceof Error ? err.message : 'Unexpected server error during career analysis.';

      if (status === 400 && /API_KEY_INVALID/i.test(message)) {
        res.status(400).json({
          error: 'Invalid Gemini API key. Please verify your key in Settings > Secrets.',
        });
        return;
      }
      if (status === 403 || /PERMISSION_DENIED/i.test(message)) {
        res.status(403).json({
          error:
            'Permission denied by Gemini API. Check your API key in Settings > Secrets.',
        });
        return;
      }
      if (status === 429 || /RESOURCE_EXHAUSTED/i.test(message)) {
        res.status(429).json({
          error:
            'Gemini API rate limit or quota reached. Please wait a moment and try again, or check your quota in Settings > Secrets.',
        });
        return;
      }

      res.status(500).json({
        error: `Career analysis failed: ${message}`,
      });
    }
  });

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('/{*splat}', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CareerPath AI server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
