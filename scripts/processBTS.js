const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const rawCsvPath = path.resolve(__dirname, '../src/data/raw/T_T100D_SEGMENT_ALL_CARRIER.csv');
const jsonOutputPath = path.resolve(__dirname, '../src/data/airline_flows.json');
const statusPath = path.resolve(__dirname, '../src/data/raw/raw_data_source_status.json');

const relevantAirports = new Set(['DCA', 'IAD', 'BWI']);

function loadStatus() {
  if (!fs.existsSync(statusPath)) return {};
  return JSON.parse(fs.readFileSync(statusPath, 'utf-8'));
}

function saveStatus(newTime) {
  const status = loadStatus();
  status['T_T100D_SEGMENT_ALL_CARRIER.csv'] = newTime.toISOString();
  fs.writeFileSync(statusPath, JSON.stringify(status, null, 2));
}

function getMTime(filePath) {
  return fs.existsSync(filePath) ? fs.statSync(filePath).mtime : null;
}

function shouldProcess(csvTime, lastProcessedTime) {
  return !lastProcessedTime || new Date(csvTime) > new Date(lastProcessedTime);
}

function processCSV() {
  const routeMap = new Map();

  fs.createReadStream(rawCsvPath)
    .pipe(csv())
    .on('data', (row) => {
      const origin = row['ORIGIN'];
      const dest = row['DEST'];
      const passengers = parseFloat(row['PASSENGERS'] || 0);
      if (relevantAirports.has(origin) && dest) {
        const key = origin + '-' + dest;
        routeMap.set(key, (routeMap.get(key) || 0) + passengers);
      }
    })
    .on('end', () => {
      const result = Array.from(routeMap.entries()).map(([key, passengers]) => {
        const [origin, destination] = key.split('-');
        return { origin, destination, passengers: Math.round(passengers) };
      });
      fs.writeFileSync(jsonOutputPath, JSON.stringify(result, null, 2));
      saveStatus(getMTime(rawCsvPath));
      console.log('✅ BTS data processed.');
    });
}

function main() {
  const status = loadStatus();
  const lastProcessed = status['T_T100D_SEGMENT_ALL_CARRIER.csv'];
  const currentMTime = getMTime(rawCsvPath);

  if (!currentMTime) {
    console.error('❌ Raw CSV file not found.');
    return;
  }

  if (shouldProcess(currentMTime, lastProcessed)) {
    console.log('🛠️ Processing updated BTS CSV...');
    processCSV();
  } else {
    console.log('⏩ BTS CSV unchanged, skipping processing.');
  }
}

main();
