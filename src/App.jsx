import React, { useEffect, useState } from 'react';
import {
  Activity,
  ArrowUpRight,
  BadgeCheck,
  BookOpenText,
  CalendarDays,
  ChevronRight,
  Database,
  ExternalLink,
  FileSpreadsheet,
  Filter,
  LayoutDashboard,
  MapPinned,
  Newspaper,
  Printer,
  Search,
  ShieldAlert,
  Sparkles,
  Target,
  Users,
} from 'lucide-react';

import pilotData from './data/pilotData.json';

const INDICATOR_META = [
  {
    key: 'paradiplomacyIntensity',
    label: 'Paradiplomacy intensity',
    domain: 'A',
    prompt:
      'Which sister-city deals, foreign MOUs, or embassy links are most active, and who approves them locally?',
  },
  {
    key: 'economicDependenceOnForeignLinkedReceipts',
    label: 'Foreign-linked receipts',
    domain: 'A',
    prompt:
      'How much of the LGU revenue base depends on foreign-linked zones, grants, or receipts that could create leverage?',
  },
  {
    key: 'lsrDependenceInverse',
    label: 'Low self-reliance',
    domain: 'A',
    prompt:
      'Where are the fiscal gaps that make external funding, donations, or national transfers especially important?',
  },
  {
    key: 'foreignAidConcentration',
    label: 'Aid concentration',
    domain: 'A',
    prompt:
      'Is one donor or country disproportionately shaping projects, equipment, or technical assistance?',
  },
  {
    key: 'strategicProximity',
    label: 'Strategic proximity',
    domain: 'A',
    prompt:
      'How do ports, bases, logistics corridors, or maritime positioning affect foreign engagement in this LGU?',
  },
  {
    key: 'economicEnclaves',
    label: 'Economic enclaves',
    domain: 'A',
    prompt:
      'Which ecozones, freeports, or industrial clusters create the main foreign-facing entry points?',
  },
  {
    key: 'directForeignDonations',
    label: 'Direct foreign donations',
    domain: 'A',
    prompt:
      'How are direct foreign donations recorded, screened, and disclosed to the public or council?',
  },
  {
    key: 'institutionalOpacity',
    label: 'Institutional opacity',
    domain: 'B',
    prompt:
      'Which audit findings, procurement gaps, or documentation issues should be checked first during interviews?',
  },
  {
    key: 'civicSpaceClosure',
    label: 'Civic space pressure',
    domain: 'B',
    prompt:
      'Which media, civil society, or community actors can speak independently, and where are the pressure points?',
  },
  {
    key: 'politicalConcentrationDynasticShare',
    label: 'Dynastic concentration',
    domain: 'B',
    prompt:
      'Which family networks dominate local decision-making, appointments, or access to government information?',
  },
  {
    key: 'partyAlignment',
    label: 'Party alignment',
    domain: 'B',
    prompt:
      'How closely does the LGU track the national coalition line on foreign-facing issues, and where does it diverge?',
  },
  {
    key: 'foiOrdinance',
    label: 'FOI ordinance',
    domain: 'B',
    prompt:
      'What access mechanism exists when researchers request local agreements, donor records, or project documentation?',
  },
  {
    key: 'narrativeAlignment',
    label: 'Narrative alignment',
    domain: 'C',
    prompt:
      'Have local leaders framed foreign powers or national foreign policy differently from the national line?',
  },
  {
    key: 'currentForeignPresence',
    label: 'Current foreign presence',
    domain: 'C',
    prompt:
      'Which foreign actors are physically present now, through which sectors, and with what visibility?',
  },
  {
    key: 'reports',
    label: 'Foreign-linked reporting',
    domain: 'C',
    prompt:
      'Which historical reports or incidents should shape interview sequencing and verification?',
  },
];

const DOMAIN_LABELS = {
  A: 'Structural exposure',
  B: 'Enabling environment',
  C: 'Signals and narratives',
};

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'schedule', label: 'Field Plan', icon: CalendarDays },
  { id: 'profiles', label: 'Profiles', icon: BookOpenText },
];

const allProfiles = [...pilotData.profiles].sort(
  (left, right) => (right.totalScore || 0) - (left.totalScore || 0),
);
const typologyOptions = ['All', ...new Set(allProfiles.map((profile) => profile.typology))];
const islandOptions = ['All', ...new Set(allProfiles.map((profile) => profile.islandGroup))];
const primaryTrips = pilotData.schedules.primary;
const reserveTrips = pilotData.schedules.reserve;

function formatScore(value) {
  return Number(value || 0).toFixed(4);
}

function formatPercent(value) {
  return `${Math.round((value || 0) * 100)}%`;
}

function workbookLabel(path) {
  return path.split('/').pop();
}

function shadeClasses(shade) {
  if (shade === 'Red') {
    return 'border-rose-400/40 bg-rose-500/10 text-rose-200';
  }
  if (shade === 'Blue') {
    return 'border-sky-400/40 bg-sky-500/10 text-sky-200';
  }
  return 'border-slate-500/40 bg-slate-500/10 text-slate-200';
}

function domainAccent(domain) {
  if (domain === 'A') {
    return 'from-sky-500 to-cyan-300';
  }
  if (domain === 'B') {
    return 'from-amber-500 to-yellow-300';
  }
  return 'from-rose-500 to-orange-300';
}

function highestIndicators(profile, limit = 5) {
  return INDICATOR_META.map((meta) => ({
    ...meta,
    value: profile.indicators?.[meta.key] ?? 0,
  }))
    .filter((item) => typeof item.value === 'number')
    .sort((left, right) => right.value - left.value)
    .slice(0, limit);
}

function researchPrompts(profile) {
  return highestIndicators(profile, 3).map((item) => item.prompt);
}

function dominantDomain(profile) {
  const entries = Object.entries(profile.domainScores || {});
  const [winner] = entries.sort((left, right) => right[1] - left[1]);
  return winner ? winner[0] : 'A';
}

function statBreakdown(items, key) {
  return items.reduce((accumulator, item) => {
    const current = item[key] || 'Unknown';
    accumulator[current] = (accumulator[current] || 0) + 1;
    return accumulator;
  }, {});
}

function trimmedText(value, expanded, size = 900) {
  if (expanded || !value || value.length <= size) {
    return value;
  }
  return `${value.slice(0, size).trim()}...`;
}

function TabButton({ active, icon: Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
        active
          ? 'border-sky-400/40 bg-sky-500/15 text-white shadow-[0_14px_40px_rgba(14,165,233,0.18)]'
          : 'border-slate-800/80 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-100'
      }`}
    >
      <Icon size={17} />
      <span>{label}</span>
    </button>
  );
}

function StatCard({ label, value, detail, icon: Icon, accent }) {
  return (
    <div className="rounded-[28px] border border-slate-800/80 bg-slate-950/70 p-5 shadow-[0_24px_60px_rgba(2,6,23,0.35)]">
      <div className="mb-4 flex items-start justify-between">
        <div className={`rounded-2xl border px-3 py-3 ${accent}`}>
          <Icon size={20} />
        </div>
        <span className="text-[10px] uppercase tracking-[0.26em] text-slate-500">Live brief</span>
      </div>
      <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-black tracking-tight text-white">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-400">{detail}</p>
    </div>
  );
}

function Panel({ title, subtitle, icon: Icon, action, children, className = '' }) {
  return (
    <section
      className={`rounded-[30px] border border-slate-800/80 bg-slate-950/75 p-6 shadow-[0_24px_60px_rgba(2,6,23,0.35)] ${className}`}
    >
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-500">
            {Icon ? <Icon size={14} className="text-sky-300" /> : null}
            <span>{title}</span>
          </div>
          {subtitle ? <p className="max-w-2xl text-sm leading-6 text-slate-400">{subtitle}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function FilterPill({ active, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${
        active
          ? 'border-sky-400/40 bg-sky-500/15 text-white'
          : 'border-slate-800 bg-slate-950/70 text-slate-400 hover:text-slate-100'
      }`}
    >
      {label}
    </button>
  );
}

function IndicatorBar({ label, domain, value }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-white">{label}</p>
          <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">
            Domain {domain}
          </p>
        </div>
        <span className="text-sm font-semibold text-slate-200">{formatPercent(value)}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-900">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${domainAccent(domain)}`}
          style={{ width: `${Math.max(0, Math.min(100, (value || 0) * 100))}%` }}
        />
      </div>
    </div>
  );
}

function DomainCard({ domain, value }) {
  return (
    <div className="rounded-3xl border border-slate-800/80 bg-[#0a1522] p-5">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-[0.26em] text-slate-500">Domain {domain}</span>
        <span className="rounded-full border border-slate-700 px-2 py-1 text-[11px] text-slate-300">
          {formatPercent(value)}
        </span>
      </div>
      <p className="text-lg font-bold text-white">{DOMAIN_LABELS[domain]}</p>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-900">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${domainAccent(domain)}`}
          style={{ width: `${Math.max(4, (value || 0) * 100)}%` }}
        />
      </div>
    </div>
  );
}

function ScheduleCard({ item, reserve = false }) {
  return (
    <div className="rounded-[28px] border border-slate-800/80 bg-slate-950/70 p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">
            {reserve ? item.status || 'Reserve' : item.dateLabel}
          </p>
          <h3 className="mt-2 text-xl font-black tracking-tight text-white">{item.lgu}</h3>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${shadeClasses(reserve ? 'Gray' : item.typology === '—' ? 'Gray' : 'Blue')}`}>
          {item.typology}
        </span>
      </div>
      <div className="grid gap-4 text-sm text-slate-300 md:grid-cols-2">
        <div>
          <p className="text-[10px] uppercase tracking-[0.26em] text-slate-500">Location</p>
          <p className="mt-1">{item.province || '—'}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.26em] text-slate-500">Transit</p>
          <p className="mt-1">{item.mode || '—'}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.26em] text-slate-500">Travel time</p>
          <p className="mt-1">{item.time || '—'}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.26em] text-slate-500">
            {reserve ? 'Team' : 'Personnel'}
          </p>
          <p className="mt-1">{reserve ? item.team || 'TBD' : item.personnel || 'Unassigned'}</p>
        </div>
      </div>
      <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
        <p className="text-[10px] uppercase tracking-[0.26em] text-slate-500">Notes</p>
        <p className="mt-2 text-sm leading-6 text-slate-300">{item.notes || 'No notes added.'}</p>
      </div>
    </div>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#08111a] px-6 text-slate-100">
          <div className="max-w-2xl rounded-[28px] border border-rose-500/30 bg-slate-950/90 p-8 shadow-[0_24px_80px_rgba(2,6,23,0.5)]">
            <div className="mb-4 flex items-center gap-3 text-rose-300">
              <ShieldAlert />
              <h2 className="text-2xl font-black">Dashboard crash detected</h2>
            </div>
            <p className="text-sm leading-6 text-slate-300">
              Copy the error below back into this thread and I can fix it directly.
            </p>
            <pre className="mt-5 overflow-auto rounded-2xl border border-slate-800 bg-black/40 p-4 text-xs text-rose-200">
              {String(this.state.error)}
            </pre>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function MainApp() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedProfileId, setSelectedProfileId] = useState(allProfiles[0]?.id || '');
  const [profileQuery, setProfileQuery] = useState('');
  const [typologyFilter, setTypologyFilter] = useState('All');
  const [islandFilter, setIslandFilter] = useState('All');
  const [scheduleBucket, setScheduleBucket] = useState('primary');
  const [scheduleQuery, setScheduleQuery] = useState('');
  const [expandedRationale, setExpandedRationale] = useState(false);
  const [expandedEngagements, setExpandedEngagements] = useState(false);

  const filteredProfiles = allProfiles.filter((profile) => {
    const query = profileQuery.trim().toLowerCase();
    const matchesQuery =
      !query ||
      profile.name.toLowerCase().includes(query) ||
      profile.region.toLowerCase().includes(query) ||
      profile.province.toLowerCase().includes(query) ||
      profile.lceName.toLowerCase().includes(query);
    const matchesTypology = typologyFilter === 'All' || profile.typology === typologyFilter;
    const matchesIsland = islandFilter === 'All' || profile.islandGroup === islandFilter;
    return matchesQuery && matchesTypology && matchesIsland;
  });

  useEffect(() => {
    if (!filteredProfiles.some((profile) => profile.id === selectedProfileId)) {
      setSelectedProfileId(filteredProfiles[0]?.id || allProfiles[0]?.id || '');
    }
  }, [filteredProfiles, selectedProfileId]);

  useEffect(() => {
    setExpandedRationale(false);
    setExpandedEngagements(false);
  }, [selectedProfileId]);

  const selectedProfile =
    filteredProfiles.find((profile) => profile.id === selectedProfileId) ||
    allProfiles.find((profile) => profile.id === selectedProfileId) ||
    allProfiles[0];

  const selectedSources = selectedProfile ? pilotData.newsByLgu[selectedProfile.name] || [] : [];
  const selectedTrips = selectedProfile
    ? [...primaryTrips, ...reserveTrips].filter((item) => item.lgu === selectedProfile.name)
    : [];
  const scheduleItems = (scheduleBucket === 'primary' ? primaryTrips : reserveTrips).filter((item) => {
    const query = scheduleQuery.trim().toLowerCase();
    if (!query) {
      return true;
    }
    return [item.lgu, item.province, item.typology, item.notes, item.mode]
      .join(' ')
      .toLowerCase()
      .includes(query);
  });

  const typologyCounts = statBreakdown(allProfiles, 'typology');
  const islandCounts = statBreakdown(allProfiles, 'islandGroup');
  const shadeCounts = statBreakdown(allProfiles, 'shade');
  const domainCounts = allProfiles.reduce((accumulator, profile) => {
    const winner = dominantDomain(profile);
    accumulator[winner] = (accumulator[winner] || 0) + 1;
    return accumulator;
  }, {});

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.16),_transparent_28%),radial-gradient(circle_at_80%_20%,_rgba(251,191,36,0.12),_transparent_22%),linear-gradient(180deg,#08111a_0%,#0d1723_46%,#111b27_100%)] text-slate-100 print:bg-white print:text-slate-900">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="w-full border-b border-slate-800/80 bg-slate-950/65 backdrop-blur lg:w-72 lg:border-b-0 lg:border-r print:hidden">
          <div className="border-b border-slate-800/70 px-5 py-5 lg:px-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-sky-400/30 bg-sky-500/10 p-3 text-sky-200">
                <Target size={20} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.34em] text-slate-500">PILOT</p>
                <h1 className="text-2xl font-black tracking-tight text-white">Research Board</h1>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-400">
              Workbook-driven profiles, sources, and field plan for PLDRI KII.
            </p>
          </div>

          <nav className="flex gap-2 overflow-x-auto px-4 py-4 lg:flex-col lg:px-6">
            {TABS.map((tab) => (
              <TabButton
                key={tab.id}
                active={activeTab === tab.id}
                icon={tab.icon}
                label={tab.label}
                onClick={() => setActiveTab(tab.id)}
              />
            ))}
          </nav>

          <div className="grid gap-3 px-4 pb-5 lg:px-6">
            <div className="rounded-[26px] border border-slate-800/80 bg-slate-950/80 p-4">
              <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Workbook source</p>
              <p className="mt-2 text-sm font-semibold text-white">{workbookLabel(pilotData.sourceWorkbook)}</p>
              <p className="mt-2 text-xs leading-5 text-slate-400">
                Synced {pilotData.generatedAt.replace('T', ' ').replace('Z', ' UTC')}
              </p>
            </div>
            <div className="rounded-[26px] border border-slate-800/80 bg-slate-950/80 p-4">
              <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Selection mix</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {Object.entries(shadeCounts).map(([shade, count]) => (
                  <span
                    key={shade}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${shadeClasses(shade)}`}
                  >
                    {shade}: {count}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-slate-800/70 bg-[#09111bcc] px-5 py-5 backdrop-blur lg:px-8 print:hidden">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-slate-500">
                  Workbook-synced research workspace
                </p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-white">
                  {activeTab === 'overview' && 'National overview'}
                  {activeTab === 'schedule' && 'Field deployment plan'}
                  {activeTab === 'profiles' && 'LGU intelligence profiles'}
                </h2>
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200">
                  <Database size={16} />
                  <span>{pilotData.summary.profileCount} profiles loaded</span>
                </div>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/80 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-600 hover:text-white"
                >
                  <Printer size={16} />
                  <span>Print brief</span>
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 p-5 lg:p-8 print:p-0">
            {activeTab === 'overview' ? (
              <div className="space-y-6">
                <div className="grid gap-4 xl:grid-cols-4">
                  <StatCard
                    label="Selected LGUs"
                    value={pilotData.summary.profileCount}
                    detail="Profiles are generated directly from the latest workbook export."
                    icon={Users}
                    accent="border-sky-400/30 bg-sky-500/10 text-sky-200"
                  />
                  <StatCard
                    label="Primary Trips"
                    value={pilotData.summary.primaryTripCount}
                    detail="Scheduled field movements, including returns and buffer days."
                    icon={CalendarDays}
                    accent="border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
                  />
                  <StatCard
                    label="Reserve Queue"
                    value={pilotData.summary.reserveTripCount}
                    detail="Optional LGUs available for expansion or rescheduling."
                    icon={MapPinned}
                    accent="border-amber-400/30 bg-amber-500/10 text-amber-200"
                  />
                  <StatCard
                    label="Verified Sources"
                    value={pilotData.summary.newsCount}
                    detail="Linked source references grouped by LGU for fast verification."
                    icon={Newspaper}
                    accent="border-rose-400/30 bg-rose-500/10 text-rose-200"
                  />
                </div>

                <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                  <Panel
                    title="Research priorities"
                    subtitle="Highest composite scores from the workbook. Select an LGU to jump into the profile workspace."
                    icon={Activity}
                  >
                    <div className="grid gap-3">
                      {allProfiles.slice(0, 6).map((profile) => (
                        <button
                          key={profile.id}
                          onClick={() => {
                            setSelectedProfileId(profile.id);
                            setActiveTab('profiles');
                          }}
                          className="flex items-center justify-between gap-4 rounded-3xl border border-slate-800/70 bg-[#0a1522] px-5 py-4 text-left transition hover:border-slate-700 hover:bg-slate-900"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-3">
                              <h3 className="truncate text-lg font-bold text-white">{profile.name}</h3>
                              <span className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${shadeClasses(profile.shade)}`}>
                                {profile.typology}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-slate-400">
                              Rank #{profile.overallRank} • {profile.region} • {profile.lceName}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="text-[11px] uppercase tracking-[0.26em] text-slate-500">Score</p>
                              <p className="text-xl font-black text-white">{formatScore(profile.totalScore)}</p>
                            </div>
                            <ChevronRight size={18} className="text-slate-500" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </Panel>

                  <div className="grid gap-6">
                    <Panel
                      title="Coverage mix"
                      subtitle="Selection balance across typologies, island groups, and dominant domain pressures."
                      icon={Filter}
                    >
                      <div className="grid gap-5 md:grid-cols-3">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.26em] text-slate-500">Typology</p>
                          <div className="mt-3 space-y-2">
                            {Object.entries(typologyCounts).map(([label, count]) => (
                              <div key={label} className="flex items-center justify-between rounded-2xl bg-[#0a1522] px-3 py-2 text-sm">
                                <span className="text-slate-300">{label}</span>
                                <span className="font-semibold text-white">{count}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.26em] text-slate-500">Island group</p>
                          <div className="mt-3 space-y-2">
                            {Object.entries(islandCounts).map(([label, count]) => (
                              <div key={label} className="flex items-center justify-between rounded-2xl bg-[#0a1522] px-3 py-2 text-sm">
                                <span className="text-slate-300">{label}</span>
                                <span className="font-semibold text-white">{count}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.26em] text-slate-500">Dominant domain</p>
                          <div className="mt-3 space-y-2">
                            {Object.entries(domainCounts).map(([label, count]) => (
                              <div key={label} className="flex items-center justify-between rounded-2xl bg-[#0a1522] px-3 py-2 text-sm">
                                <span className="text-slate-300">Domain {label}</span>
                                <span className="font-semibold text-white">{count}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Panel>

                    <Panel
                      title="Workbook update flow"
                      subtitle="The app now treats your spreadsheet export as the source of truth."
                      icon={FileSpreadsheet}
                    >
                      <div className="grid gap-3 md:grid-cols-2">
                        {[
                          'Update the Google Sheet.',
                          'Export the latest version as .xlsx.',
                          'Run npm run sync:workbook -- "/path/to/file.xlsx".',
                          'Deploy the refreshed app to Vercel.',
                        ].map((step) => (
                          <div key={step} className="rounded-3xl border border-slate-800/80 bg-[#0a1522] p-4 text-sm leading-6 text-slate-300">
                            {step}
                          </div>
                        ))}
                      </div>
                    </Panel>
                  </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                  <Panel
                    title="Upcoming field plan"
                    subtitle="Primary deployment entries from the workbook. Reserve LGUs remain in the separate queue."
                    icon={CalendarDays}
                  >
                    <div className="space-y-3">
                      {primaryTrips.slice(0, 6).map((trip) => (
                        <div
                          key={trip.id}
                          className="flex flex-col gap-3 rounded-3xl border border-slate-800/70 bg-[#0a1522] px-5 py-4 md:flex-row md:items-center md:justify-between"
                        >
                          <div>
                            <p className="text-[11px] uppercase tracking-[0.26em] text-slate-500">{trip.dateLabel}</p>
                            <p className="mt-1 text-lg font-bold text-white">{trip.lgu}</p>
                            <p className="text-sm text-slate-400">{trip.mode}</p>
                          </div>
                          <div className="rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-300">
                            {trip.typology}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Panel>

                  <Panel
                    title="Source library"
                    subtitle="Latest linked items from the workbook's News sheet."
                    icon={Newspaper}
                  >
                    <div className="space-y-3">
                      {pilotData.allNews.slice(0, 8).map((item) => (
                        <a
                          key={item.id}
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="block rounded-3xl border border-slate-800/70 bg-[#0a1522] px-5 py-4 transition hover:border-slate-700 hover:bg-slate-900"
                        >
                          <div className="flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.26em] text-slate-500">
                            <span>{item.lgu}</span>
                            <span>•</span>
                            <span>{item.dateLabel}</span>
                          </div>
                          <p className="mt-2 text-sm leading-6 text-slate-200">{item.title}</p>
                          <div className="mt-3 flex items-center gap-2 text-sm text-sky-300">
                            <span>{item.sourceLabel}</span>
                            <ArrowUpRight size={15} />
                          </div>
                        </a>
                      ))}
                    </div>
                  </Panel>
                </div>
              </div>
            ) : null}

            {activeTab === 'schedule' ? (
              <div className="space-y-6">
                <Panel
                  title="Deployment schedule"
                  subtitle="This schedule is pulled from the workbook export. Update the sheet first if you want the live app to change."
                  icon={CalendarDays}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-wrap gap-2">
                      <FilterPill
                        active={scheduleBucket === 'primary'}
                        label={`Primary (${primaryTrips.length})`}
                        onClick={() => setScheduleBucket('primary')}
                      />
                      <FilterPill
                        active={scheduleBucket === 'reserve'}
                        label={`Reserve (${reserveTrips.length})`}
                        onClick={() => setScheduleBucket('reserve')}
                      />
                    </div>
                    <label className="flex w-full items-center gap-3 rounded-full border border-slate-800 bg-[#0a1522] px-4 py-3 text-sm text-slate-300 lg:max-w-md">
                      <Search size={16} className="text-slate-500" />
                      <input
                        value={scheduleQuery}
                        onChange={(event) => setScheduleQuery(event.target.value)}
                        className="w-full bg-transparent outline-none placeholder:text-slate-500"
                        placeholder="Search LGU, province, typology, or note"
                      />
                    </label>
                  </div>
                </Panel>

                <div className="grid gap-4 xl:grid-cols-2">
                  {scheduleItems.map((item) => (
                    <ScheduleCard key={item.id} item={item} reserve={scheduleBucket === 'reserve'} />
                  ))}
                </div>
              </div>
            ) : null}

            {activeTab === 'profiles' && selectedProfile ? (
              <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
                <div className="space-y-5">
                  <Panel
                    title="Find an LGU"
                    subtitle="Search by LGU, region, province, or local chief executive."
                    icon={Search}
                  >
                    <label className="flex items-center gap-3 rounded-full border border-slate-800 bg-[#0a1522] px-4 py-3 text-sm text-slate-300">
                      <Search size={16} className="text-slate-500" />
                      <input
                        value={profileQuery}
                        onChange={(event) => setProfileQuery(event.target.value)}
                        className="w-full bg-transparent outline-none placeholder:text-slate-500"
                        placeholder="Search profiles"
                      />
                    </label>
                    <div className="mt-4 space-y-4">
                      <div>
                        <p className="mb-2 text-[11px] uppercase tracking-[0.26em] text-slate-500">Typology</p>
                        <div className="flex flex-wrap gap-2">
                          {typologyOptions.map((option) => (
                            <FilterPill
                              key={option}
                              active={option === typologyFilter}
                              label={option}
                              onClick={() => setTypologyFilter(option)}
                            />
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="mb-2 text-[11px] uppercase tracking-[0.26em] text-slate-500">Island group</p>
                        <div className="flex flex-wrap gap-2">
                          {islandOptions.map((option) => (
                            <FilterPill
                              key={option}
                              active={option === islandFilter}
                              label={option}
                              onClick={() => setIslandFilter(option)}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </Panel>

                  <div className="space-y-3">
                    {filteredProfiles.map((profile) => (
                      <button
                        key={profile.id}
                        onClick={() => setSelectedProfileId(profile.id)}
                        className={`w-full rounded-[26px] border p-4 text-left transition ${
                          selectedProfile.id === profile.id
                            ? 'border-sky-400/35 bg-sky-500/12 shadow-[0_18px_48px_rgba(14,165,233,0.16)]'
                            : 'border-slate-800/80 bg-slate-950/75 hover:border-slate-700 hover:bg-slate-900'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-base font-bold text-white">{profile.name}</p>
                            <p className="mt-1 text-sm text-slate-400">
                              Rank #{profile.overallRank} • {profile.region}
                            </p>
                          </div>
                          <span className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${shadeClasses(profile.shade)}`}>
                            {profile.typology}
                          </span>
                        </div>
                        <div className="mt-4 flex items-center justify-between text-sm">
                          <span className="text-slate-400">{profile.lceName}</span>
                          <span className="font-semibold text-white">{formatScore(profile.totalScore)}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <Panel
                    title="Target intelligence profile"
                    subtitle="Pulled from the Selected LGUs worksheet and linked News worksheet."
                    icon={BadgeCheck}
                    action={
                      <div className="rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-300">
                        Rank #{selectedProfile.overallRank}
                      </div>
                    }
                  >
                    <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
                      <div className="rounded-[28px] border border-slate-800/80 bg-[#0a1522] p-4">
                        <div className="overflow-hidden rounded-[24px] border border-slate-800 bg-slate-900">
                          <img
                            src={selectedProfile.imageUrl}
                            alt={selectedProfile.lceName}
                            className="h-64 w-full object-cover"
                          />
                        </div>
                        <div className="mt-4">
                          <p className="text-[11px] uppercase tracking-[0.26em] text-slate-500">Local chief executive</p>
                          <h3 className="mt-2 text-xl font-bold text-white">{selectedProfile.lceName}</h3>
                          <p className="mt-2 text-sm leading-6 text-slate-400">{selectedProfile.background}</p>
                        </div>
                      </div>

                      <div className="space-y-5">
                        <div>
                          <div className="flex flex-wrap items-center gap-3">
                            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${shadeClasses(selectedProfile.shade)}`}>
                              {selectedProfile.typology}
                            </span>
                            <span className="rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-300">
                              Score {formatScore(selectedProfile.totalScore)}
                            </span>
                            <span className="rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-300">
                              Dominant Domain {dominantDomain(selectedProfile)}
                            </span>
                          </div>
                          <h2 className="mt-4 text-4xl font-black tracking-tight text-white">
                            {selectedProfile.name}
                          </h2>
                          <p className="mt-2 text-base text-slate-300">
                            {selectedProfile.region} • {selectedProfile.province}
                          </p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                          <div className="rounded-3xl border border-slate-800/80 bg-[#0a1522] p-4">
                            <p className="text-[10px] uppercase tracking-[0.26em] text-slate-500">Island group</p>
                            <p className="mt-2 text-lg font-bold text-white">{selectedProfile.islandGroup}</p>
                          </div>
                          <div className="rounded-3xl border border-slate-800/80 bg-[#0a1522] p-4">
                            <p className="text-[10px] uppercase tracking-[0.26em] text-slate-500">LGU type</p>
                            <p className="mt-2 text-lg font-bold text-white">{selectedProfile.type}</p>
                          </div>
                          <div className="rounded-3xl border border-slate-800/80 bg-[#0a1522] p-4">
                            <p className="text-[10px] uppercase tracking-[0.26em] text-slate-500">Income class</p>
                            <p className="mt-2 text-lg font-bold text-white">{selectedProfile.incomeClass}</p>
                          </div>
                          <div className="rounded-3xl border border-slate-800/80 bg-[#0a1522] p-4">
                            <p className="text-[10px] uppercase tracking-[0.26em] text-slate-500">Term / age</p>
                            <p className="mt-2 text-lg font-bold text-white">
                              {selectedProfile.term} • {selectedProfile.age}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {Object.entries(selectedProfile.flags).map(([flag, isOn]) => (
                            <span
                              key={flag}
                              className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                                isOn
                                  ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200'
                                  : 'border-slate-700 bg-slate-900/70 text-slate-500'
                              }`}
                            >
                              Flag {flag}: {isOn ? 'On' : 'Off'}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Panel>

                  <div className="grid gap-4 lg:grid-cols-3">
                    {Object.entries(selectedProfile.domainScores).map(([domain, value]) => (
                      <DomainCard key={domain} domain={domain} value={value} />
                    ))}
                  </div>

                  <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                    <Panel
                      title="Priority indicators"
                      subtitle="Highest-scoring indicators for this LGU."
                      icon={Sparkles}
                    >
                      <div className="space-y-5">
                        {highestIndicators(selectedProfile).map((indicator) => (
                          <IndicatorBar
                            key={indicator.key}
                            label={indicator.label}
                            domain={indicator.domain}
                            value={indicator.value}
                          />
                        ))}
                      </div>
                    </Panel>

                    <Panel
                      title="Interview angles"
                      subtitle="Question prompts generated from the strongest indicators."
                      icon={Target}
                    >
                      <div className="space-y-3">
                        {researchPrompts(selectedProfile).map((prompt) => (
                          <div
                            key={prompt}
                            className="rounded-3xl border border-slate-800/80 bg-[#0a1522] p-4 text-sm leading-6 text-slate-300"
                          >
                            {prompt}
                          </div>
                        ))}
                      </div>
                    </Panel>
                  </div>

                  <Panel
                    title="Vulnerability rationale"
                    subtitle="Directly from the workbook's rationale field."
                    icon={ShieldAlert}
                    action={
                      selectedProfile.vulnerabilityRationale.length > 900 ? (
                        <button
                          onClick={() => setExpandedRationale((value) => !value)}
                          className="rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-300"
                        >
                          {expandedRationale ? 'Show less' : 'Show more'}
                        </button>
                      ) : null
                    }
                  >
                    <p className="whitespace-pre-line text-sm leading-7 text-slate-300">
                      {trimmedText(selectedProfile.vulnerabilityRationale, expandedRationale)}
                    </p>
                  </Panel>

                  <Panel
                    title="Foreign engagement analysis"
                    subtitle="Narrative briefing from the workbook plus direct source references below."
                    icon={BookOpenText}
                    action={
                      selectedProfile.engagementAnalysis.length > 1200 ? (
                        <button
                          onClick={() => setExpandedEngagements((value) => !value)}
                          className="rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-300"
                        >
                          {expandedEngagements ? 'Show less' : 'Show more'}
                        </button>
                      ) : null
                    }
                  >
                    <p className="whitespace-pre-line text-sm leading-7 text-slate-300">
                      {trimmedText(selectedProfile.engagementAnalysis, expandedEngagements, 1200)}
                    </p>
                  </Panel>

                  <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                    <Panel
                      title="Verified source links"
                      subtitle="Rows from the workbook News sheet that match this LGU."
                      icon={Newspaper}
                    >
                      <div className="space-y-3">
                        {selectedSources.length ? (
                          selectedSources.map((item) => (
                            <a
                              key={item.id}
                              href={item.url}
                              target="_blank"
                              rel="noreferrer"
                              className="block rounded-3xl border border-slate-800/80 bg-[#0a1522] p-4 transition hover:border-slate-700 hover:bg-slate-900"
                            >
                              <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.26em] text-slate-500">
                                <span>{item.dateLabel}</span>
                                <span>•</span>
                                <span>{item.sourceLabel}</span>
                              </div>
                              <p className="mt-2 text-sm leading-6 text-slate-200">{item.title}</p>
                              <div className="mt-3 flex items-center gap-2 text-sm text-sky-300">
                                <ExternalLink size={15} />
                                <span>Open source</span>
                              </div>
                            </a>
                          ))
                        ) : (
                          <div className="rounded-3xl border border-dashed border-slate-700 bg-[#0a1522] p-5 text-sm text-slate-400">
                            No verified source rows were attached to this LGU in the workbook export.
                          </div>
                        )}
                      </div>
                    </Panel>

                    <Panel
                      title="Deployment context"
                      subtitle="Schedule entries that directly touch this LGU."
                      icon={CalendarDays}
                    >
                      <div className="space-y-3">
                        {selectedTrips.length ? (
                          selectedTrips.map((trip) => (
                            <div
                              key={trip.id}
                              className="rounded-3xl border border-slate-800/80 bg-[#0a1522] p-4"
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <p className="text-[11px] uppercase tracking-[0.26em] text-slate-500">
                                    {trip.bucket === 'reserve' ? trip.status : trip.dateLabel}
                                  </p>
                                  <p className="mt-1 text-base font-bold text-white">{trip.mode}</p>
                                </div>
                                <span className="rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-300">
                                  {trip.bucket}
                                </span>
                              </div>
                              <p className="mt-3 text-sm leading-6 text-slate-300">{trip.notes || 'No notes.'}</p>
                            </div>
                          ))
                        ) : (
                          <div className="rounded-3xl border border-dashed border-slate-700 bg-[#0a1522] p-5 text-sm text-slate-400">
                            This LGU is not currently listed in the synced field schedule.
                          </div>
                        )}
                      </div>
                    </Panel>
                  </div>
                </div>
              </div>
            ) : null}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <MainApp />
    </ErrorBoundary>
  );
}
