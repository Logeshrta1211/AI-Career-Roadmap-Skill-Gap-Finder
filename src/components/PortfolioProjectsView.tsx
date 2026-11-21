import { useState } from 'react';
import { Award, Check, Copy, Code2, ListChecks } from 'lucide-react';
import { CareerAnalysisResult, PortfolioProject } from '../types/career';

interface PortfolioProjectsViewProps {
  result: CareerAnalysisResult;
}

function getDifficultyColor(level: PortfolioProject['difficultyLevel']): string {
  if (level === 'Beginner') return 'text-emerald-400';
  if (level === 'Intermediate') return 'text-blue-400';
  return 'text-violet-400';
}

export function PortfolioProjectsView({ result }: PortfolioProjectsViewProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyProject = async (project: PortfolioProject, index: number) => {
    const text = [
      `Project: ${project.projectName} (${project.difficultyLevel})`,
      `Description: ${project.description}`,
      `Technologies: ${project.technologies.join(', ')}`,
      `Skills Demonstrated: ${project.skillsDemonstrated.join(', ')}`,
      `Main Features:`,
      ...project.mainFeatures.map((f) => `- ${f}`),
      `Resume Value: ${project.resumeValue}`,
    ].join('\n');

    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      window.setTimeout(() => {
        setCopiedIndex((prev) => (prev === index ? null : prev));
      }, 2200);
    } catch {
      // Fallback copy if clipboard permission is restricted
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedIndex(index);
      window.setTimeout(() => {
        setCopiedIndex((prev) => (prev === index ? null : prev));
      }, 2200);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-800 bg-[#0F1623] p-6 sm:p-7">
        <h1 className="text-2xl font-semibold text-slate-100 tracking-tight">
          Portfolio Project Recommendations
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Three progressive projects engineered for{' '}
          <span className="text-slate-200 font-medium">
            {result.careerOverview.targetCareerTitle}
          </span>{' '}
          — moving from foundational implementation to production-grade portfolio showcase.
        </p>
      </section>

      <div className="space-y-5">
        {result.portfolioProjects.map((project, index) => {
          const isCopied = copiedIndex === index;
          return (
            <article
              key={`${project.projectName}-${index}`}
              className="rounded-xl border border-slate-800 bg-[#0F1623] p-6 sm:p-7 space-y-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-slate-800/80">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono tabular-nums text-slate-400">
                      Project 0{index + 1}
                    </span>
                    <span className="text-slate-600" aria-hidden="true">
                      ·
                    </span>
                    <span className={`font-medium ${getDifficultyColor(project.difficultyLevel)}`}>
                      {project.difficultyLevel} Level
                    </span>
                  </div>
                  <h2 className="text-xl font-semibold text-slate-100">{project.projectName}</h2>
                  <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
                    {project.description}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopyProject(project, index)}
                  className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-700 bg-[#090D16] text-slate-200 hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer self-start"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied Brief</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copy Project Idea</span>
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                    <ListChecks className="w-4 h-4 text-violet-400" />
                    <span>Core Features to Build</span>
                  </div>
                  <ul className="space-y-2 text-sm text-slate-300">
                    {project.mainFeatures.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span className="font-mono tabular-nums text-xs text-slate-500 mt-0.5 shrink-0">
                          {idx + 1}.
                        </span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="lg:col-span-5 space-y-4">
                  <div className="rounded-lg border border-slate-800 bg-[#090D16] p-4 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                      <Code2 className="w-3.5 h-3.5 text-blue-400" />
                      <span>Technologies & Stack</span>
                    </div>
                    <p className="text-sm text-slate-200 leading-relaxed">
                      {project.technologies.join(' · ')}
                    </p>
                  </div>

                  <div className="rounded-lg border border-slate-800 bg-[#090D16] p-4 space-y-2">
                    <div className="text-xs font-semibold text-slate-300">Skills Demonstrated</div>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {project.skillsDemonstrated.join(' · ')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-slate-800 bg-[#090D16] p-4 flex items-start gap-3">
                <Award className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-emerald-400">
                    Why This Matters for Your Resume
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">{project.resumeValue}</p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
