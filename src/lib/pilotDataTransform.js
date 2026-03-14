const TYPOLOGY_SEQUENCE = ['A+B+C', 'A+B', 'A+C', 'B+C', 'A', 'C', 'B', 'None'];

export const TYPOLOGY_ORDER = TYPOLOGY_SEQUENCE;

export const DOMAIN_LABELS = {
  A: 'Structural exposure',
  B: 'Enabling environment',
  C: 'Signals and narratives',
};

export const INDICATOR_META = [
  {
    key: 'paradiplomacyIntensity',
    label: 'Paradiplomacy intensity',
    shortLabel: 'Paradiplomacy',
    domain: 'A',
    prompt:
      'Which sister-city deals, foreign MOUs, or embassy links are most active, and who approves them locally?',
  },
  {
    key: 'economicDependenceOnForeignLinkedReceipts',
    label: 'Foreign-linked receipts',
    shortLabel: 'Foreign receipts',
    domain: 'A',
    prompt:
      'How much of the LGU revenue base depends on foreign-linked zones, grants, or receipts that could create leverage?',
  },
  {
    key: 'lsrDependenceInverse',
    label: 'Low self-reliance',
    shortLabel: 'Low self-reliance',
    domain: 'A',
    prompt:
      'Where are the fiscal gaps that make external funding, donations, or national transfers especially important?',
  },
  {
    key: 'foreignAidConcentration',
    label: 'Aid concentration',
    shortLabel: 'Aid concentration',
    domain: 'A',
    prompt:
      'Is one donor or country disproportionately shaping projects, equipment, or technical assistance?',
  },
  {
    key: 'strategicProximity',
    label: 'Strategic proximity',
    shortLabel: 'Strategic proximity',
    domain: 'A',
    prompt:
      'How do ports, bases, logistics corridors, or maritime positioning affect foreign engagement in this LGU?',
  },
  {
    key: 'economicEnclaves',
    label: 'Economic enclaves',
    shortLabel: 'Economic enclaves',
    domain: 'A',
    prompt:
      'Which ecozones, freeports, or industrial clusters create the main foreign-facing entry points?',
  },
  {
    key: 'directForeignDonations',
    label: 'Direct foreign donations',
    shortLabel: 'Foreign donations',
    domain: 'A',
    prompt:
      'How are direct foreign donations recorded, screened, and disclosed to the public or council?',
  },
  {
    key: 'institutionalOpacity',
    label: 'Institutional opacity',
    shortLabel: 'Opacity',
    domain: 'B',
    prompt:
      'Which audit findings, procurement gaps, or documentation issues should be checked first during interviews?',
  },
  {
    key: 'civicSpaceClosure',
    label: 'Civic space pressure',
    shortLabel: 'Civic space',
    domain: 'B',
    prompt:
      'Which media, civil society, or community actors can speak independently, and where are the pressure points?',
  },
  {
    key: 'politicalConcentrationDynasticShare',
    label: 'Dynastic concentration',
    shortLabel: 'Dynastic concentration',
    domain: 'B',
    prompt:
      'Which family networks dominate local decision-making, appointments, or access to government information?',
  },
  {
    key: 'partyAlignment',
    label: 'Party alignment',
    shortLabel: 'Party alignment',
    domain: 'B',
    prompt:
      'How closely does the LGU track the national coalition line on foreign-facing issues, and where does it diverge?',
  },
  {
    key: 'foiOrdinance',
    label: 'FOI ordinance',
    shortLabel: 'FOI',
    domain: 'B',
    prompt:
      'What access mechanism exists when researchers request local agreements, donor records, or project documentation?',
  },
  {
    key: 'narrativeAlignment',
    label: 'Narrative alignment',
    shortLabel: 'Narrative alignment',
    domain: 'C',
    prompt:
      'Have local leaders framed foreign powers or national foreign policy differently from the national line?',
  },
  {
    key: 'currentForeignPresence',
    label: 'Current foreign presence',
    shortLabel: 'Foreign presence',
    domain: 'C',
    prompt:
      'Which foreign actors are physically present now, through which sectors, and with what visibility?',
  },
  {
    key: 'reports',
    label: 'Foreign-linked reporting',
    shortLabel: 'Reports',
    domain: 'C',
    prompt:
      'Which historical reports or incidents should shape interview sequencing and verification?',
  },
];

const LEGACY_PHOTO_NAMES = [
  'Baguio City',
  'Cagayan',
  'Cebu',
  'Cotabato City',
  'Iloilo City',
  'Lapu-Lapu City',
  'Manila City',
  'Marawi City',
  'Nueva Ecija',
  'Palawan',
  'Pampanga',
  'Puerto Princesa City',
  'Subic',
  'Tuguegarao City',
  'Zamboanga City',
];

const LEGACY_PHOTO_MAP = Object.fromEntries(
  LEGACY_PHOTO_NAMES.map((name) => [name, `/workbook-photos/${slugify(name)}.png`]),
);

const INDICATOR_PREFIXES = {
  paradiplomacyIntensity: ['a1_paradiplomacy_intensity', 'international_linkages'],
  economicDependenceOnForeignLinkedReceipts: [
    'a2_economic_dependence_on_foreign_linked_receipts',
    'high_external_funding',
  ],
  lsrDependenceInverse: [
    'a2_1_lsr_dependence_inverse',
    'a2.1_lsr_dependence_inverse',
    'limited_lsr',
  ],
  foreignAidConcentration: ['a3_foreign_aid_concentration', 'external_support_concentration'],
  strategicProximity: ['a4_strategic_proximity', 'strategic_asset_proximity'],
  economicEnclaves: ['a5_economic_enclaves', 'economic_zone_presence'],
  directForeignDonations: ['a6_direct_foreign_donations', 'direct_external_assistance'],
  institutionalOpacity: ['b1_institutional_opacity', 'accountability_conditions_flags'],
  civicSpaceClosure: ['b2_civic_space_closure', 'civic_environment_flags'],
  politicalConcentrationDynasticShare: [
    'b3_political_concentration_dynastic_share',
    'political_concentration',
  ],
  partyAlignment: ['b4_party_alignment', 'national_local_political_divergence'],
  foiOrdinance: ['b5_foi_ordinance', 'pending_disclosure_policy_adoption'],
  narrativeAlignment: ['c1_narrative_alignment', 'policy_position_divergence'],
  currentForeignPresence: ['c3_current_foreign_presence', 'external_presence_profile'],
  reports: ['c3_reports', 'external_linked_incident_record'],
};

const FIELD_ALIASES = {
  order: ['order'],
  abcCode: ['abc_code', 'abccode'],
  typology: ['typology'],
  islandGroup: ['island_group', 'island_grouping', 'island group'],
  region: ['region'],
  name: ['lgu_name', 'local_government_unit_lgu', 'lgu', 'local_government_unit'],
  province: ['province', 'province_region'],
  type: ['lgu_type', 'type'],
  incomeClass: ['income_class', 'income class'],
  totalScore: ['total_score', 'total'],
  overallRank: ['overall_rank'],
  lceName: ['lce', 'local_chief_executive'],
  photoUrl: ['photos', 'photo_url', 'photo', 'image_url', 'lce_photo'],
  age: ['age_approx_2026', 'age'],
  term: ['term'],
  background: ['background'],
  shade: ['shade'],
  domainAScore: ['domain_a_exposure', 'domain_a', 'domain_a_score'],
  domainBScore: ['domain_b_enabling_environment', 'domain_b', 'domain_b_score'],
  domainCScore: ['domain_3_signals', 'domain_c', 'domain_c_score'],
  sheetTotal: ['total', 'sheet_total'],
  vulnerabilityRationale: ['vulnerability_rationale'],
  engagementAnalysis: ['local_government_foreign_engagements_analysis'],
  population: ['population'],
  landAreaSqKm: ['land_area_sq_km', 'land_area_sq_kms', 'land_area_sq_km_'],
  populationDensity: [
    'population_density_per_km2',
    'population_density_per_km',
    'population_density',
  ],
  gdpPerCapita: ['gdp_per_capita_est_2023', 'gdp_per_capita', 'gdp_per_capita_est'],
  urbanRuralClassification: ['urban_rural_classification'],
  povertyIncidenceFamilies: ['poverty_incidence_families'],
  coastalClassification: ['coastal_non_coastal', 'coastal_noncoastal'],
  touristDestinationStatus: ['tourist_destination_status'],
  portAirportPresence: ['port_airport_presence'],
  ecozonePresence: [
    'ecozone_freeport_industrial_park',
    'ecozone_freeport_industrialpark',
    'ecozone_freeport',
    'ecozone_type',
  ],
  ecozoneNotes: ['ecozone_notes'],
  majorSectors: ['major_sectors_of_the_economy', 'major_sectors'],
  flagA: ['a_flag'],
  flagB: ['b_flag'],
  flagC: ['c_flag'],
};

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '');
}

function normalizeName(value) {
  if (!value) {
    return '';
  }

  return String(value)
    .replace('(Province)', '')
    .replace('(Province/City)', '')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeHeader(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[^\w\s./%-]+/g, ' ')
    .replace(/\./g, '_')
    .replace(/\//g, ' ')
    .replace(/%/g, ' percent ')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_')
    .replace(/_{2,}/g, '_');
}

function rowHasContent(row) {
  return row.some((cell) => String(cell || '').trim() !== '');
}

function trimText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function cleanParagraphText(value) {
  return String(value || '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function parseNumber(value) {
  if (value === null || value === undefined) {
    return null;
  }

  const cleaned = String(value).replace(/,/g, '').trim();
  if (!cleaned || cleaned === '#REF!') {
    return null;
  }

  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseInteger(value) {
  const parsed = parseNumber(value);
  return parsed === null ? null : Math.round(parsed);
}

function parseFlag(value) {
  const numeric = parseNumber(value);
  if (numeric !== null) {
    return numeric > 0;
  }

  const cleaned = String(value || '').trim().toLowerCase();
  return ['yes', 'true', '1', 'y'].includes(cleaned);
}

function excelDate(value) {
  const parsed = parseNumber(value);
  if (parsed === null) {
    return null;
  }

  const epoch = new Date(Date.UTC(1899, 11, 30));
  epoch.setUTCDate(epoch.getUTCDate() + parsed);
  return epoch;
}

function formatDate(value, options) {
  const parsed = excelDate(value);
  if (!parsed) {
    return trimText(value);
  }
  return new Intl.DateTimeFormat('en-PH', options).format(parsed);
}

function formatScheduleDate(value) {
  const parsed = excelDate(value);
  if (!parsed) {
    return trimText(value);
  }
  const weekday = new Intl.DateTimeFormat('en-PH', { weekday: 'short', timeZone: 'UTC' }).format(
    parsed,
  );
  const date = new Intl.DateTimeFormat('en-PH', {
    day: '2-digit',
    month: 'short',
    timeZone: 'UTC',
  }).format(parsed);
  return `${date} (${weekday})`;
}

function isoDate(value) {
  const parsed = excelDate(value);
  if (!parsed) {
    return null;
  }
  return parsed.toISOString().slice(0, 10);
}

function hostLabel(url) {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

function tableToObjects(rows) {
  if (!rows.length) {
    return [];
  }

  const headerRow = rows[0].map((cell) => normalizeHeader(cell));
  return rows.slice(1).map((row, index) => {
    const record = { __row: index + 2 };
    headerRow.forEach((header, headerIndex) => {
      if (header) {
        record[header] = row[headerIndex] ?? '';
      }
    });
    return record;
  });
}

function readField(record, aliases) {
  for (const alias of aliases) {
    for (const [key, value] of Object.entries(record)) {
      if (key === alias || key.startsWith(alias)) {
        return value;
      }
    }
  }
  return '';
}

function imageUrlForProfile(name, explicitValue) {
  const cleaned = trimText(explicitValue);
  if (cleaned.startsWith('http://') || cleaned.startsWith('https://') || cleaned.startsWith('/')) {
    return cleaned;
  }
  return LEGACY_PHOTO_MAP[name] || '';
}

function buildProfiles(profileRows) {
  const records = tableToObjects(profileRows)
    .map((record) => {
      const name = normalizeName(readField(record, FIELD_ALIASES.name));
      if (!name) {
        return null;
      }

      const indicators = Object.fromEntries(
        INDICATOR_META.map((indicator) => [
          indicator.key,
          parseNumber(readField(record, INDICATOR_PREFIXES[indicator.key] || [])) ?? 0,
        ]),
      );

      return {
        id: slugify(name),
        name,
        order: parseInteger(readField(record, FIELD_ALIASES.order)),
        abcCode: parseInteger(readField(record, FIELD_ALIASES.abcCode)),
        typology: trimText(readField(record, FIELD_ALIASES.typology)) || 'None',
        islandGroup: trimText(readField(record, FIELD_ALIASES.islandGroup)),
        region: trimText(readField(record, FIELD_ALIASES.region)),
        province: trimText(readField(record, FIELD_ALIASES.province)),
        type: trimText(readField(record, FIELD_ALIASES.type)),
        incomeClass: trimText(readField(record, FIELD_ALIASES.incomeClass)),
        totalScore: parseNumber(readField(record, FIELD_ALIASES.totalScore)) ?? 0,
        overallRank: parseInteger(readField(record, FIELD_ALIASES.overallRank)),
        lceName: trimText(readField(record, FIELD_ALIASES.lceName)),
        imageUrl: imageUrlForProfile(name, readField(record, FIELD_ALIASES.photoUrl)),
        age: trimText(readField(record, FIELD_ALIASES.age)),
        term: trimText(readField(record, FIELD_ALIASES.term)),
        background: cleanParagraphText(readField(record, FIELD_ALIASES.background)),
        shade: trimText(readField(record, FIELD_ALIASES.shade)) || 'Gray',
        domainScores: {
          A: parseNumber(readField(record, FIELD_ALIASES.domainAScore)) ?? 0,
          B: parseNumber(readField(record, FIELD_ALIASES.domainBScore)) ?? 0,
          C: parseNumber(readField(record, FIELD_ALIASES.domainCScore)) ?? 0,
        },
        sheetTotal: parseNumber(readField(record, FIELD_ALIASES.sheetTotal)) ?? 0,
        vulnerabilityRationale: cleanParagraphText(
          readField(record, FIELD_ALIASES.vulnerabilityRationale),
        ),
        engagementAnalysis: cleanParagraphText(readField(record, FIELD_ALIASES.engagementAnalysis)),
        population: trimText(readField(record, FIELD_ALIASES.population)),
        landAreaSqKm: trimText(readField(record, FIELD_ALIASES.landAreaSqKm)),
        populationDensity: trimText(readField(record, FIELD_ALIASES.populationDensity)),
        gdpPerCapita: trimText(readField(record, FIELD_ALIASES.gdpPerCapita)),
        urbanRuralClassification: trimText(
          readField(record, FIELD_ALIASES.urbanRuralClassification),
        ),
        povertyIncidenceFamilies: trimText(
          readField(record, FIELD_ALIASES.povertyIncidenceFamilies),
        ),
        coastalClassification: trimText(readField(record, FIELD_ALIASES.coastalClassification)),
        touristDestinationStatus: trimText(
          readField(record, FIELD_ALIASES.touristDestinationStatus),
        ),
        portAirportPresence: trimText(readField(record, FIELD_ALIASES.portAirportPresence)),
        ecozonePresence: trimText(readField(record, FIELD_ALIASES.ecozonePresence)),
        ecozoneNotes: trimText(readField(record, FIELD_ALIASES.ecozoneNotes)),
        majorSectors: cleanParagraphText(readField(record, FIELD_ALIASES.majorSectors)),
        flags: {
          A: parseFlag(readField(record, FIELD_ALIASES.flagA)),
          B: parseFlag(readField(record, FIELD_ALIASES.flagB)),
          C: parseFlag(readField(record, FIELD_ALIASES.flagC)),
        },
        indicators,
      };
    })
    .filter(Boolean);

  return records.sort((left, right) => {
    const leftOrder = left.order ?? Number.MAX_SAFE_INTEGER;
    const rightOrder = right.order ?? Number.MAX_SAFE_INTEGER;
    if (leftOrder !== rightOrder) {
      return leftOrder - rightOrder;
    }

    const leftType = TYPOLOGY_SEQUENCE.indexOf(left.typology);
    const rightType = TYPOLOGY_SEQUENCE.indexOf(right.typology);
    if (leftType !== rightType) {
      return leftType - rightType;
    }

    return left.name.localeCompare(right.name);
  });
}

function buildSchedules(scheduleRows) {
  const primary = [];
  const reserve = [];
  let section = 'primary';

  for (let index = 1; index < scheduleRows.length; index += 1) {
    const row = scheduleRows[index];
    if (!rowHasContent(row)) {
      continue;
    }

    const firstCell = trimText(row[0]);
    if (firstCell === 'Optional LGUs (if included later)') {
      section = 'reserve-header';
      continue;
    }

    if (section === 'reserve-header') {
      section = 'reserve';
      continue;
    }

    if (section === 'primary') {
      primary.push({
        id: `primary-${primary.length + 1}`,
        bucket: 'primary',
        dateLabel: formatScheduleDate(row[0]),
        dateIso: isoDate(row[0]),
        lgu: normalizeName(row[1]),
        province: trimText(row[2]),
        typology: trimText(row[3]),
        mode: trimText(row[4]),
        time: trimText(row[5]),
        personnel: trimText(row[6]),
        notes: cleanParagraphText(row[7]),
      });
      continue;
    }

    reserve.push({
      id: `reserve-${reserve.length + 1}`,
      bucket: 'reserve',
      status: trimText(row[0]) || 'Reserve',
      team: trimText(row[1]),
      lgu: normalizeName(row[2]),
      province: trimText(row[3]),
      typology: trimText(row[4]),
      mode: trimText(row[5]),
      time: trimText(row[6]),
      notes: cleanParagraphText(row[7]),
    });
  }

  return { primary, reserve };
}

function buildNews(newsRows) {
  const records = tableToObjects(newsRows)
    .map((record) => {
      const name = normalizeName(
        readField(record, ['local_government_unit_lgu', 'local_government_unit', 'lgu']),
      );
      const title = cleanParagraphText(
        readField(record, ['validated_foreign_engagement_or_operation']),
      );
      if (!name || !title) {
        return null;
      }

      const url = trimText(readField(record, ['verified_source_url']));
      return {
        id: `news-${record.__row}`,
        lgu: name,
        title,
        dateLabel: formatDate(readField(record, ['date_status']), {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          timeZone: 'UTC',
        }),
        dateIso: isoDate(readField(record, ['date_status'])),
        url,
        sourceLabel: hostLabel(url),
      };
    })
    .filter(Boolean);

  const newsByLgu = records.reduce((accumulator, item) => {
    if (!accumulator[item.lgu]) {
      accumulator[item.lgu] = [];
    }
    accumulator[item.lgu].push(item);
    return accumulator;
  }, {});

  return { records, newsByLgu };
}

export function buildPilotDataFromSheets({ scheduleRows, profileRows, newsRows }) {
  const profiles = buildProfiles(profileRows);
  const schedules = buildSchedules(scheduleRows);
  const news = buildNews(newsRows);

  return {
    generatedAt: new Date().toISOString(),
    dataSource: 'google-sheets',
    summary: {
      profileCount: profiles.length,
      primaryTripCount: schedules.primary.length,
      reserveTripCount: schedules.reserve.length,
      newsCount: news.records.length,
    },
    profiles,
    schedules,
    allNews: news.records,
    newsByLgu: news.newsByLgu,
  };
}

export function profileRadarData(profile, domain) {
  return INDICATOR_META.filter((indicator) => indicator.domain === domain).map((indicator) => ({
    subject: indicator.shortLabel,
    value: profile?.indicators?.[indicator.key] ?? 0,
  }));
}
