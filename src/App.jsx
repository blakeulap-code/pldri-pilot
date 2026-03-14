import React, { useEffect, useState } from 'react';
import {
  BookOpenText,
  CalendarDays,
  ExternalLink,
  LayoutDashboard,
  MapPinned,
  Newspaper,
  Printer,
  Search,
  ShieldCheck,
  ShieldEllipsis,
  Users,
} from 'lucide-react';
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

import {
  DOMAIN_LABELS,
  INDICATOR_META,
  TYPOLOGY_ORDER,
  profileRadarData,
} from './lib/pilotDataTransform.js';

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'schedule', label: 'Field Plan', icon: CalendarDays },
  { id: 'profiles', label: 'LGU Profiles', icon: BookOpenText },
];

const TYPOLOGY_COLORS = {
  'A+B+C': 'bg-slate-900 text-white border-slate-900',
  'A+B': 'bg-teal-50 text-teal-800 border-teal-200',
  'A+C': 'bg-cyan-50 text-cyan-800 border-cyan-200',
  'B+C': 'bg-amber-50 text-amber-800 border-amber-200',
  A: 'bg-violet-50 text-violet-800 border-violet-200',
  B: 'bg-rose-50 text-rose-800 border-rose-200',
  C: 'bg-fuchsia-50 text-fuchsia-800 border-fuchsia-200',
  None: 'bg-slate-100 text-slate-700 border-slate-200',
};

const RADAR_COLORS = {
  A: '#0f766e',
  B: '#c2410c',
  C: '#be123c',
};

const DETAIL_FIELDS = [
  { key: 'population', label: 'Population' },
  { key: 'landAreaSqKm', label: 'Land area (sq km)' },
  { key: 'populationDensity', label: 'Population density (per km²)' },
  { key: 'gdpPerCapita', label: 'GDP per capita (Est. 2023)' },
  { key: 'urbanRuralClassification', label: 'Urban/rural classification' },
  { key: 'povertyIncidenceFamilies', label: 'Poverty incidence (Families)' },
  { key: 'coastalClassification', label: 'Coastal / non-coastal' },
  { key: 'touristDestinationStatus', label: 'Tourist destination status' },
  { key: 'portAirportPresence', label: 'Port / airport presence' },
  { key: 'ecozonePresence', label: 'Ecozone / freeport / industrial park' },
];

const EMPTY_DATA = {
  summary: {
    profileCount: 0,
    primaryTripCount: 0,
    reserveTripCount: 0,
    newsCount: 0,
  },
  profiles: [],
  schedules: {
    primary: [],
    reserve: [],
  },
  newsByLgu: {},
  allNews: [],
};

function sortProfiles(profiles) {
  return [...profiles].sort((left, right) => {
    const leftOrder = left.order ?? Number.MAX_SAFE_INTEGER;
    const rightOrder = right.order ?? Number.MAX_SAFE_INTEGER;
    if (leftOrder !== rightOrder) {
      return leftOrder - rightOrder;
    }
    return left.name.localeCompare(right.name);
  });
}

function formatScore(value) {
  return Number(value || 0).toFixed(3);
}

function typologyClasses(typology) {
  return TYPOLOGY_COLORS[typology] || TYPOLOGY_COLORS.None;
}

function percentLabel(value) {
  return `${Math.round((value || 0) * 100)}%`;
}

function topPrompts(profile) {
  return INDICATOR_META.map((item) => ({
    ...item,
    value: profile?.indicators?.[item.key] ?? 0,
  }))
    .sort((left, right) => right.value - left.value)
    .slice(0, 3);
}

function textOrDash(value) {
  return value && String(value).trim() ? value : '—';
}

function profileMapUrl(profile) {
  return `https://maps.google.com/maps?q=${encodeURIComponent(
    `${profile.name}, ${profile.province}, Philippines`,
  )}&t=&z=10&ie=UTF8&iwloc=&output=embed`;
}

function Card({ title, subtitle, action, children, className = '' }) {
  return (
    <section
      className={`rounded-[28px] border border-[#d7e2ef] bg-white p-6 shadow-[0_22px_60px_rgba(16,37,68,0.08)] print-surface ${className}`}
    >
      {(title || subtitle || action) && (
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            {title ? <h3 className="text-lg font-semibold text-slate-900">{title}</h3> : null}
            {subtitle ? <p className="mt-1 text-sm leading-6 text-slate-500">{subtitle}</p> : null}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

function SummaryCard({ label, value, tone, icon: Icon }) {
  return (
    <div className="rounded-[24px] border border-[#d7e2ef] bg-white p-5 shadow-[0_18px_40px_rgba(16,37,68,0.08)] print-surface">
      <div className="flex items-start justify-between gap-4">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">{label}</p>
        {Icon ? (
          <div className="rounded-2xl bg-[#edf4ff] p-3 text-[#0f4b9a]">
            <Icon size={18} />
          </div>
        ) : null}
      </div>
      <p className={`mt-3 text-3xl font-semibold tracking-tight ${tone}`}>{value}</p>
    </div>
  );
}

function TabButton({ active, label, icon: Icon, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 rounded-full border px-4 py-2.5 text-sm font-medium transition ${
        active
          ? 'border-white bg-white text-[#0d2f59] shadow-[0_10px_24px_rgba(255,255,255,0.18)]'
          : 'border-white/20 bg-white/10 text-white hover:border-white/40 hover:bg-white/16'
      }`}
    >
      <Icon size={16} />
      <span>{label}</span>
    </button>
  );
}

function FilterButton({ active, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-2 text-xs font-medium transition ${
        active
          ? 'border-[#0f4b9a] bg-[#0f4b9a] text-white'
          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
      }`}
    >
      {label}
    </button>
  );
}

function RadarPanel({ title, domain, profile }) {
  const radarData = profileRadarData(profile, domain);

  return (
    <Card
      title={title}
      subtitle={`${DOMAIN_LABELS[domain]} • ${percentLabel(profile?.domainScores?.[domain])}`}
      className="h-full"
    >
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData} cx="50%" cy="52%" outerRadius="58%" margin={{ top: 24, right: 30, bottom: 18, left: 30 }}>
            <PolarGrid stroke="#cbd5e1" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: '#475569', fontSize: 10, fontWeight: 600 }}
            />
            <PolarRadiusAxis angle={30} domain={[0, 1]} tick={false} axisLine={false} />
            <Tooltip
              formatter={(value) => percentLabel(value)}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.label || ''}
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '14px',
                color: '#0f172a',
                fontSize: '12px',
              }}
            />
            <Radar
              dataKey="value"
              stroke={RADAR_COLORS[domain]}
              fill={RADAR_COLORS[domain]}
              fillOpacity={0.18}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

function ProfileListItem({ profile, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-[20px] border p-4 text-left transition ${
        selected
          ? 'border-[#0f4b9a] bg-gradient-to-br from-[#0f4b9a] to-[#0c376f] text-white shadow-[0_18px_40px_rgba(15,75,154,0.18)]'
          : 'border-slate-200 bg-white text-slate-900 hover:border-slate-300'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-base font-semibold">{profile.name}</p>
          <p className={`mt-1 text-sm ${selected ? 'text-slate-300' : 'text-slate-500'}`}>
            {profile.region}
          </p>
        </div>
        <span
          className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${typologyClasses(
            profile.typology,
          )}`}
        >
          {profile.typology}
        </span>
      </div>
      <div className={`mt-3 text-sm ${selected ? 'text-slate-300' : 'text-slate-500'}`}>
        {profile.lceName}
      </div>
    </button>
  );
}

function ScheduleCard({ item, reserve = false }) {
  return (
    <Card className="h-full">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
            {reserve ? item.status : item.dateLabel}
          </p>
          <h3 className="mt-2 text-xl font-semibold text-slate-900">{item.lgu}</h3>
          <p className="mt-1 text-sm text-slate-500">{item.province}</p>
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-xs font-medium ${typologyClasses(
            item.typology || 'None',
          )}`}
        >
          {item.typology || 'None'}
        </span>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Travel mode</p>
          <p className="mt-2 text-sm leading-6 text-slate-800">{textOrDash(item.mode)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Travel time</p>
          <p className="mt-2 text-sm leading-6 text-slate-800">{textOrDash(item.time)}</p>
        </div>
      </div>

      <div className="mt-4 rounded-[18px] bg-slate-50 p-4">
        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Notes</p>
        <p className="mt-2 text-sm leading-6 text-slate-700">{textOrDash(item.notes)}</p>
      </div>
    </Card>
  );
}

function SourceLinkCard({ item }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noreferrer"
      className="block rounded-[18px] border border-slate-200 bg-white p-4 transition hover:border-slate-300"
    >
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
        {textOrDash(item.dateLabel)}
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-800">{item.title}</p>
      <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
        <ExternalLink size={14} />
        <span>{item.sourceLabel || 'Open source'}</span>
      </div>
    </a>
  );
}

function MainApp() {
  const [appData, setAppData] = useState(EMPTY_DATA);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [profileQuery, setProfileQuery] = useState('');
  const [typologyFilter, setTypologyFilter] = useState('All');
  const [scheduleBucket, setScheduleBucket] = useState('primary');

  useEffect(() => {
    let cancelled = false;

    async function loadSheetData() {
      try {
        const response = await fetch('/api/sheets-data');
        if (response.ok) {
          const liveData = await response.json();
          if (!cancelled && liveData?.profiles?.length) {
            setAppData(liveData);
            return;
          }
        }

        const fallbackResponse = await fetch('/data/pilotData.json');
        if (!fallbackResponse.ok) {
          return;
        }
        const snapshotData = await fallbackResponse.json();
        if (!cancelled && snapshotData?.profiles?.length) {
          setAppData(snapshotData);
        }
      } catch {
        // Leave the empty state in place if neither live nor fallback data is available.
      }
    }

    loadSheetData();

    return () => {
      cancelled = true;
    };
  }, []);

  const orderedProfiles = sortProfiles(appData.profiles || []);
  const filteredProfiles = orderedProfiles.filter((profile) => {
    const query = profileQuery.trim().toLowerCase();
    const matchesQuery =
      !query ||
      profile.name.toLowerCase().includes(query) ||
      profile.region.toLowerCase().includes(query) ||
      profile.province.toLowerCase().includes(query) ||
      profile.lceName.toLowerCase().includes(query);
    const matchesTypology = typologyFilter === 'All' || profile.typology === typologyFilter;
    return matchesQuery && matchesTypology;
  });

  useEffect(() => {
    if (!filteredProfiles.some((profile) => profile.id === selectedProfileId)) {
      setSelectedProfileId(filteredProfiles[0]?.id || orderedProfiles[0]?.id || '');
    }
  }, [filteredProfiles, orderedProfiles, selectedProfileId]);

  const selectedProfile =
    filteredProfiles.find((profile) => profile.id === selectedProfileId) ||
    orderedProfiles.find((profile) => profile.id === selectedProfileId) ||
    orderedProfiles[0];

  const selectedSources = selectedProfile ? appData.newsByLgu?.[selectedProfile.name] || [] : [];
  const selectedTrips = selectedProfile
    ? [...(appData.schedules?.primary || []), ...(appData.schedules?.reserve || [])].filter(
        (trip) => trip.lgu === selectedProfile.name,
      )
    : [];

  const currentSchedule = scheduleBucket === 'primary' ? appData.schedules?.primary || [] : appData.schedules?.reserve || [];
  const typologyCounts = TYPOLOGY_ORDER.map((typology) => ({
    typology,
    count: orderedProfiles.filter((profile) => profile.typology === typology).length,
  }));
  const typologyFilters = ['All', ...TYPOLOGY_ORDER.filter((typology) =>
    orderedProfiles.some((profile) => profile.typology === typology),
  )];
  const activeTabLabel = TABS.find((tab) => tab.id === activeTab)?.label || 'Dashboard';

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-900 print:bg-white">
      <div className="mx-auto max-w-[1600px] px-4 py-5 lg:px-8 lg:py-8">
        <section className="hero-panel relative overflow-hidden rounded-[34px] px-6 py-7 text-white print-hide lg:px-10 lg:py-10">
          <div className="relative z-10 grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="max-w-3xl">
              <p className="text-xs font-medium uppercase tracking-[0.32em] text-white/70">
                PILOT
              </p>
              <h1 className="mt-4 max-w-2xl text-4xl font-semibold leading-tight tracking-tight lg:text-5xl">
                Local research intelligence, field planning, and LGU context in one place.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-50/88 lg:text-base">
                A cleaner operational view for profiles, verified sources, schedules, and discussion briefs.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                {TABS.map((tab) => (
                  <TabButton
                    key={tab.id}
                    active={activeTab === tab.id}
                    label={tab.label}
                    icon={tab.icon}
                    onClick={() => setActiveTab(tab.id)}
                  />
                ))}
              </div>
            </div>

            <div className="hero-brief rounded-[28px] border border-white/14 bg-white/10 p-6 backdrop-blur-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-white/60">Current view</p>
                  <h2 className="mt-2 text-2xl font-semibold">{activeTabLabel}</h2>
                </div>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:border-white/35 hover:bg-white/16"
                >
                  <Printer size={16} />
                  <span>Print</span>
                </button>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[20px] border border-white/12 bg-white/10 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/60">Focused LGU</p>
                  <p className="mt-2 text-lg font-medium">{selectedProfile?.name || 'Loading'}</p>
                </div>
                <div className="rounded-[20px] border border-white/12 bg-white/10 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/60">Typology</p>
                  <p className="mt-2 text-lg font-medium">
                    {selectedProfile?.typology || '—'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="-mt-8 mb-6 grid gap-4 px-1 md:grid-cols-2 xl:grid-cols-4 print-hide">
          <SummaryCard
            label="Selected LGUs"
            value={appData.summary?.profileCount || 0}
            tone="text-slate-950"
            icon={Users}
          />
          <SummaryCard
            label="Primary schedule entries"
            value={appData.summary?.primaryTripCount || 0}
            tone="text-[#0f4b9a]"
            icon={CalendarDays}
          />
          <SummaryCard
            label="Reserve entries"
            value={appData.summary?.reserveTripCount || 0}
            tone="text-[#0f766e]"
            icon={MapPinned}
          />
          <SummaryCard
            label="Verified source links"
            value={appData.summary?.newsCount || 0}
            tone="text-[#8b1d3b]"
            icon={Newspaper}
          />
        </div>

        {!orderedProfiles.length ? (
          <Card
            title="Loading data"
            subtitle="If this takes too long, the live Google Sheet route may not be configured yet."
          >
            <p className="text-sm leading-7 text-slate-600">
              The dashboard is waiting for either the live Google Sheet feed or the local backup snapshot.
            </p>
          </Card>
        ) : null}

        {activeTab === 'dashboard' ? (
          <div className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
              <Card
                title="LGU order"
                subtitle="Profiles are arranged by the order column from the sheet."
                className="bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)]"
              >
                <div className="grid gap-3">
                  {orderedProfiles.map((profile) => (
                    <button
                      key={profile.id}
                      onClick={() => {
                        setSelectedProfileId(profile.id);
                        setActiveTab('profiles');
                      }}
                      className="flex items-center justify-between gap-4 rounded-[20px] border border-[#d7e2ef] bg-white px-4 py-3 text-left transition hover:border-[#b9cbdf] hover:bg-[#fbfdff]"
                    >
                      <div>
                        <p className="text-base font-medium text-slate-900">{profile.name}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {profile.region} • {profile.province}
                        </p>
                      </div>
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-medium ${typologyClasses(
                          profile.typology,
                        )}`}
                      >
                        {profile.typology}
                      </span>
                    </button>
                  ))}
                </div>
              </Card>

              <div className="grid gap-6">
                <Card
                  title="Typology distribution"
                  subtitle="Shown in the typology order from the sheet."
                  className="bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)]"
                >
                  <div className="grid gap-3">
                    {typologyCounts.map((item) => (
                      <div
                        key={item.typology}
                        className="flex items-center justify-between rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3"
                      >
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-medium ${typologyClasses(
                            item.typology,
                          )}`}
                        >
                          {item.typology}
                        </span>
                        <span className="text-sm font-medium text-slate-700">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card
                  title="Upcoming field plan"
                  subtitle="Current schedule rows from the sheet."
                  className="bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)]"
                >
                  <div className="space-y-3">
                    {(appData.schedules?.primary || []).slice(0, 6).map((item) => (
                      <div
                        key={item.id}
                        className="rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3"
                      >
                        <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                          {item.dateLabel}
                        </p>
                        <p className="mt-2 text-base font-medium text-slate-900">{item.lgu}</p>
                        <p className="mt-1 text-sm text-slate-500">{item.mode}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        ) : null}

        {activeTab === 'schedule' ? (
          <div className="space-y-6">
            <Card
              title="Field Plan"
              subtitle="Primary and reserve rows from the planning sheet."
              action={
                <div className="flex gap-2">
                  <FilterButton
                    active={scheduleBucket === 'primary'}
                    label={`Primary (${appData.schedules?.primary?.length || 0})`}
                    onClick={() => setScheduleBucket('primary')}
                  />
                  <FilterButton
                    active={scheduleBucket === 'reserve'}
                    label={`Reserve (${appData.schedules?.reserve?.length || 0})`}
                    onClick={() => setScheduleBucket('reserve')}
                  />
                </div>
              }
            />

            <div className="grid gap-4 xl:grid-cols-2">
              {currentSchedule.map((item) => (
                <ScheduleCard key={item.id} item={item} reserve={scheduleBucket === 'reserve'} />
              ))}
            </div>
          </div>
        ) : null}

        {activeTab === 'profiles' && selectedProfile ? (
          <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
            <aside className="space-y-5 print-hide">
              <Card
                title="Browse LGUs"
                subtitle="Search and filter the profile list."
                className="bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)]"
              >
                <label className="flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-3">
                  <Search size={16} className="text-slate-400" />
                  <input
                    value={profileQuery}
                    onChange={(event) => setProfileQuery(event.target.value)}
                    className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                    placeholder="Search LGU, region, province, or LCE"
                  />
                </label>

                <div className="mt-4 flex flex-wrap gap-2">
                  {typologyFilters.map((option) => (
                    <FilterButton
                      key={option}
                      active={typologyFilter === option}
                      label={option}
                      onClick={() => setTypologyFilter(option)}
                    />
                  ))}
                </div>
              </Card>

              <div className="space-y-3">
                {filteredProfiles.map((profile) => (
                  <ProfileListItem
                    key={profile.id}
                    profile={profile}
                    selected={profile.id === selectedProfile.id}
                    onClick={() => setSelectedProfileId(profile.id)}
                  />
                ))}
              </div>
            </aside>

            <div className="space-y-6">
              <Card className="overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)]">
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
                  <div className="space-y-5">
                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-medium ${typologyClasses(
                          selectedProfile.typology,
                        )}`}
                      >
                        {selectedProfile.typology}
                      </span>
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                        Score {formatScore(selectedProfile.totalScore)}
                      </span>
                    </div>

                    <div>
                      <h2 className="text-4xl font-semibold tracking-tight text-slate-950">
                        {selectedProfile.name}
                      </h2>
                      <p className="mt-2 text-base text-slate-500">
                        {selectedProfile.region} • {selectedProfile.province}
                      </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                      <div className="rounded-[18px] bg-slate-50 p-4">
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">LCE</p>
                        <p className="mt-2 text-sm font-medium text-slate-900">{textOrDash(selectedProfile.lceName)}</p>
                      </div>
                      <div className="rounded-[18px] bg-slate-50 p-4">
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">LGU type</p>
                        <p className="mt-2 text-sm font-medium text-slate-900">{textOrDash(selectedProfile.type)}</p>
                      </div>
                      <div className="rounded-[18px] bg-slate-50 p-4">
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Income class</p>
                        <p className="mt-2 text-sm font-medium text-slate-900">{textOrDash(selectedProfile.incomeClass)}</p>
                      </div>
                      <div className="rounded-[18px] bg-slate-50 p-4">
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Term / age</p>
                        <p className="mt-2 text-sm font-medium text-slate-900">
                          {textOrDash(selectedProfile.term)} • {textOrDash(selectedProfile.age)}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-[20px] bg-[#f4f8fc] p-5">
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Background</p>
                      <p className="mt-3 text-sm leading-7 text-slate-700">
                        {textOrDash(selectedProfile.background)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="overflow-hidden rounded-[22px] border border-slate-200 bg-slate-50">
                      {selectedProfile.imageUrl ? (
                        <img
                          src={selectedProfile.imageUrl}
                          alt={selectedProfile.lceName}
                          className="h-72 w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-72 items-center justify-center bg-slate-100 text-slate-400">
                          No image
                        </div>
                      )}
                    </div>

                    <div className="overflow-hidden rounded-[22px] border border-slate-200 print-hide">
                      <iframe
                        title={`${selectedProfile.name} map`}
                        src={profileMapUrl(selectedProfile)}
                        className="h-72 w-full"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </div>
                  </div>
                </div>
              </Card>

              <Card
                title="Context indicators"
                subtitle="Socio-economic and structural context from the sheet."
                className="bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)]"
              >
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {DETAIL_FIELDS.map((field) => (
                    <div key={field.key} className="rounded-[18px] bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{field.label}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-800">
                        {textOrDash(selectedProfile[field.key])}
                      </p>
                    </div>
                  ))}
                  <div className="rounded-[18px] bg-slate-50 p-4 md:col-span-2 xl:col-span-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                      Ecozone notes
                    </p>
                    <p className="mt-2 text-sm leading-7 text-slate-800">
                      {textOrDash(selectedProfile.ecozoneNotes)}
                    </p>
                  </div>
                  <div className="rounded-[18px] bg-slate-50 p-4 md:col-span-2 xl:col-span-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                      Major sectors of the economy
                    </p>
                    <p className="mt-2 text-sm leading-7 text-slate-800">
                      {textOrDash(selectedProfile.majorSectors)}
                    </p>
                  </div>
                </div>
              </Card>

              <div className="grid gap-6 xl:grid-cols-3">
                <RadarPanel title="Domain A Radar" domain="A" profile={selectedProfile} />
                <RadarPanel title="Domain B Radar" domain="B" profile={selectedProfile} />
                <RadarPanel title="Domain C Radar" domain="C" profile={selectedProfile} />
              </div>

              <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                <Card title="Vulnerability rationale">
                  <p className="whitespace-pre-line text-sm leading-7 text-slate-700">
                    {textOrDash(selectedProfile.vulnerabilityRationale)}
                  </p>
                </Card>

                <Card
                  title="Suggested interview questions"
                  subtitle="Politely framed prompts for conversations with mayors, governors, and senior LGU officials."
                  className="bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)]"
                >
                  <div className="space-y-3">
                    {topPrompts(selectedProfile).map((item) => (
                      <div key={item.key} className="rounded-[18px] bg-slate-50 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-medium text-slate-900">{item.label}</p>
                          <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                            {percentLabel(item.value)}
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-slate-700">{item.prompt}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <Card title="Foreign engagement analysis">
                  <p className="whitespace-pre-line text-sm leading-7 text-slate-700">
                    {textOrDash(selectedProfile.engagementAnalysis)}
                  </p>
                </Card>

                <Card title="Profile-linked field plan">
                  <div className="space-y-3">
                    {selectedTrips.length ? (
                      selectedTrips.map((trip) => (
                        <div key={trip.id} className="rounded-[18px] bg-slate-50 p-4">
                          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                            {trip.bucket === 'reserve' ? trip.status : trip.dateLabel}
                          </p>
                          <p className="mt-2 text-sm font-medium text-slate-900">{textOrDash(trip.mode)}</p>
                          <p className="mt-2 text-sm leading-6 text-slate-700">{textOrDash(trip.notes)}</p>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-[18px] bg-slate-50 p-4 text-sm text-slate-600">
                        No direct schedule rows currently linked to this LGU.
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              <Card title="Verified sources" subtitle="News sheet entries linked to this LGU.">
                {selectedSources.length ? (
                  <div className="grid gap-3 xl:grid-cols-2">
                    {selectedSources.map((item) => (
                      <SourceLinkCard key={item.id} item={item} />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-[18px] bg-slate-50 p-4 text-sm text-slate-600">
                    No source rows are currently attached to this LGU.
                  </div>
                )}
              </Card>
            </div>
          </div>
        ) : null}
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
        <div className="flex min-h-screen items-center justify-center bg-[#f3f5f8] px-6">
          <div className="max-w-2xl rounded-[24px] border border-rose-200 bg-white p-8 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
            <div className="flex items-center gap-3 text-rose-700">
              <ShieldCheck />
              <h2 className="text-2xl font-semibold">Something broke in the dashboard</h2>
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-700">
              Send this error back here and we can fix it together.
            </p>
            <pre className="mt-4 overflow-auto rounded-[18px] bg-slate-900 p-4 text-xs text-slate-100">
              {String(this.state.error)}
            </pre>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <MainApp />
    </ErrorBoundary>
  );
}
