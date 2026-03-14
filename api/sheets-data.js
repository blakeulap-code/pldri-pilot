import { buildPilotDataFromSheets } from '../src/lib/pilotDataTransform.js';

const DEFAULT_SHEETS = {
  schedule: 'Field Deployment Schedule',
  profiles: 'Selected LGUs',
  news: 'News',
};

function parseCsv(text) {
  const rows = [];
  let current = '';
  let row = [];
  let insideQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const nextChar = text[index + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        current += '"';
        index += 1;
      } else {
        insideQuotes = !insideQuotes;
      }
      continue;
    }

    if (char === ',' && !insideQuotes) {
      row.push(current);
      current = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') {
        index += 1;
      }
      row.push(current);
      rows.push(row);
      row = [];
      current = '';
      continue;
    }

    current += char;
  }

  if (current || row.length) {
    row.push(current);
    rows.push(row);
  }

  return rows.filter((rowCells) => rowCells.some((cell) => String(cell || '').trim() !== ''));
}

function sheetCsvUrl(sheetId, sheetName) {
  const url = new URL(`https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq`);
  url.searchParams.set('tqx', 'out:csv');
  url.searchParams.set('sheet', sheetName);
  return url.toString();
}

async function fetchSheetCsv(sheetId, sheetName) {
  const response = await fetch(sheetCsvUrl(sheetId, sheetName), {
    headers: {
      Accept: 'text/csv',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch sheet "${sheetName}" (${response.status})`);
  }

  return parseCsv(await response.text());
}

export default async function handler(request, response) {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  const sheetNames = {
    schedule: process.env.GOOGLE_SHEET_SCHEDULE_TAB || DEFAULT_SHEETS.schedule,
    profiles: process.env.GOOGLE_SHEET_PROFILE_TAB || DEFAULT_SHEETS.profiles,
    news: process.env.GOOGLE_SHEET_NEWS_TAB || DEFAULT_SHEETS.news,
  };

  if (!sheetId) {
    response.status(500).json({
      error: 'GOOGLE_SHEET_ID is not configured.',
    });
    return;
  }

  try {
    const [scheduleRows, profileRows, newsRows] = await Promise.all([
      fetchSheetCsv(sheetId, sheetNames.schedule),
      fetchSheetCsv(sheetId, sheetNames.profiles),
      fetchSheetCsv(sheetId, sheetNames.news),
    ]);

    const data = buildPilotDataFromSheets({ scheduleRows, profileRows, newsRows });
    response.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=1800');
    response.status(200).json(data);
  } catch (error) {
    response.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown Google Sheets error',
    });
  }
}
