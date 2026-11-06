import React, { useState, useMemo } from 'react';
import {
  ExternalLink,
  CheckCircle2,
  Calendar,
  FileCheck,
  Award,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getTranslation } from '../i18n/translations';
import { SEED_SCHEMES, matchSchemesForProfile } from '../data/seedSchemes';

export const SchemesScreen: React.FC = () => {
  const { profile, language } = useApp();
  const t = getTranslation(language);

  const [filterMatch, setFilterMatch] = useState<'All' | 'Strong' | 'Likely' | 'Possible'>('All');
  const [selectedSchemeId, setSelectedSchemeId] = useState<string | null>(null);

  const matchedSchemes = useMemo(() => {
    const list = matchSchemesForProfile(SEED_SCHEMES, profile);
    if (filterMatch === 'All') return list;
    return list.filter((s) => s.matchScore === filterMatch);
  }, [profile, filterMatch]);

  return (
    <div className="space-y-4 pb-24">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
            Student Aid & Grants
          </span>
        </div>
        <h2 className="font-heading font-extrabold text-2xl text-slate-800 dark:text-white">
          {t.schemes.title}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Matched against: {profile.course} • {profile.state} • {profile.category} • {profile.incomeBracket}
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {(['All', 'Strong', 'Likely', 'Possible'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setFilterMatch(filter)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
              filterMatch === filter
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            {filter === 'All'
              ? t.schemes.all
              : filter === 'Strong'
              ? t.schemes.strong
              : filter === 'Likely'
              ? t.schemes.likely
              : t.schemes.possible}
          </button>
        ))}
      </div>

      {/* Schemes List */}
      {matchedSchemes.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-sm font-semibold text-slate-400">
            {t.schemes.noMatches}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {matchedSchemes.map((scheme) => {
            const isExpanded = selectedSchemeId === scheme.id;
            return (
              <div
                key={scheme.id}
                className="glass-card p-4 transition-all hover:border-teal-500"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          scheme.matchScore === 'Strong'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : scheme.matchScore === 'Likely'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {scheme.matchScore} Match
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400">
                        {scheme.provider}
                      </span>
                    </div>

                    <h3 className="font-heading font-bold text-base text-slate-800 dark:text-white leading-tight">
                      {scheme.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      {scheme.description}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
                      <div className="flex items-center gap-1 font-bold text-teal-700 dark:text-teal-400">
                        <Award className="w-3.5 h-3.5" />
                        <span>{scheme.benefitAmount}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-500">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Deadline: {scheme.deadline}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedSchemeId(isExpanded ? null : scheme.id)}
                    className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-teal-600 transition-colors shrink-0"
                    title="View details & documents"
                  >
                    <ChevronRight
                      className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                    />
                  </button>
                </div>

                {/* Expanded Details: Document Checklist & Portal Link */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3 animate-fadeIn">
                    <div>
                      <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-2 flex items-center gap-1.5">
                        <FileCheck className="w-3.5 h-3.5 text-teal-600" />
                        <span>{t.schemes.documentsNeeded}:</span>
                      </h4>
                      <ul className="space-y-1.5">
                        {scheme.requiredDocuments.map((doc, idx) => (
                          <li
                            key={idx}
                            className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300"
                          >
                            <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                            <span>{doc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-2">
                      <a
                        href={scheme.applyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 transition-all shadow-md shadow-teal-700/20"
                      >
                        <span>{t.schemes.applyNow}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
