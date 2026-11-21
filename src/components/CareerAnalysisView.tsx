import { BookOpen, Briefcase, ExternalLink, TrendingUp } from 'lucide-react';
import { CareerAnalysisResult } from '../types/career';
import { ReadinessGauge } from './ReadinessGauge';

interface CareerAnalysisViewProps {
  result: CareerAnalysisResult;
}

export function CareerAnalysisView({ result }: CareerAnalysisViewProps) {
  const { careerOverview, currentSkillsAnalysis, readinessScore, learningResources } = result;

  return (
    <div className="space-y-6">
      {/* Career Overview */}
      <section className="rounded-xl border border-slate-800 bg-[#0F1623] p-6 sm:p-7 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-800/80">
          <div>
            <div className="text-xs font-medium text-violet-400 mb-1">Career Overview</div>
            <h1 className="text-2xl font-semibold text-slate-100 tracking-tight">
              {careerOverview.targetCareerTitle}
            </h1>
          </div>
          <div className="text-xs text-slate-300 font-medium">
            Required Level: <span className="text-blue-400">{careerOverview.requiredSkillLevel}</span>
          </div>
        </div>

        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          {careerOverview.shortExplanation}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
              <Briefcase className="w-4 h-4 text-violet-400" />
              <span>Important Responsibilities</span>
            </div>
            <ul className="space-y-2.5 text-sm text-slate-300">
              {careerOverview.importantResponsibilities.map((resp, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="font-mono tabular-nums text-xs text-slate-500 mt-0.5 shrink-0">
                    {String(idx + 1).padStart(2, '0')}.
                  </span>
                  <span>{resp}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3 rounded-lg border border-slate-800 bg-[#090D16] p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span>Industry Demand Overview</span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              {careerOverview.industryDemandOverview}
            </p>
          </div>
        </div>
      </section>

      {/* Readiness Score */}
      <section className="rounded-xl border border-slate-800 bg-[#0F1623] p-6 sm:p-7">
        <h2 className="text-lg font-semibold text-slate-100 mb-5">
          Career Readiness Breakdown
        </h2>
        <ReadinessGauge
          score={readinessScore.score}
          rationale={readinessScore.rationale}
          breakdown={readinessScore.breakdown}
        />
      </section>

      {/* Current Skills Analysis */}
      <section className="rounded-xl border border-slate-800 bg-[#0F1623] p-6 sm:p-7 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-slate-100">Current Skills Analysis</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Grounded strictly in the skills and coursework you provided.
            </p>
          </div>
          <span className="font-mono tabular-nums text-xs text-slate-400">
            {currentSkillsAnalysis.length} skills evaluated
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-xs font-medium text-slate-400">
                <th className="py-3 pr-4">Skill</th>
                <th className="py-3 px-4">Current Level</th>
                <th className="py-3 px-4">Role Relevance</th>
                <th className="py-3 pl-4">Assessment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 text-sm">
              {currentSkillsAnalysis.map((skill) => {
                const relevanceColor =
                  skill.relevance === 'High'
                    ? 'text-emerald-400'
                    : skill.relevance === 'Medium'
                      ? 'text-blue-400'
                      : 'text-slate-400';

                return (
                  <tr key={skill.skillName} className="hover:bg-slate-800/25 transition-colors">
                    <td className="py-3.5 pr-4 font-medium text-slate-100 whitespace-nowrap">
                      {skill.skillName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 whitespace-nowrap">
                      {skill.currentLevel}
                    </td>
                    <td className={`py-3.5 px-4 font-medium whitespace-nowrap ${relevanceColor}`}>
                      {skill.relevance}
                    </td>
                    <td className="py-3.5 pl-4 text-slate-400 min-w-[260px]">
                      {skill.explanation}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Curated Learning Resources */}
      <section className="rounded-xl border border-slate-800 bg-[#0F1623] p-6 sm:p-7 space-y-5">
        <div className="flex items-center gap-2.5">
          <BookOpen className="w-5 h-5 text-violet-400" />
          <div>
            <h2 className="text-lg font-semibold text-slate-100">Recommended Learning Resources</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Official documentation, free courses, practice platforms, and curated repositories.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {learningResources.map((group) => (
            <div
              key={group.skillName}
              className="rounded-lg border border-slate-800 bg-[#090D16] p-5 space-y-3"
            >
              <h3 className="text-sm font-semibold text-slate-100 pb-2 border-b border-slate-800/80">
                {group.skillName}
              </h3>
              <ul className="space-y-3">
                {group.resources.map((res, idx) => (
                  <li key={`${res.title}-${idx}`} className="space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      {res.url ? (
                        <a
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <span>{res.title}</span>
                          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                        </a>
                      ) : (
                        <span className="text-sm font-medium text-slate-200">{res.title}</span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500">
                      {res.type} · {res.provider}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{res.description}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
