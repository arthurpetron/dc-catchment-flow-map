const fs = require('fs');
const path = require('path');
const readline = require('readline');

const statusFilePath = path.resolve(__dirname, '../src/data/raw/raw_data_source_status.json');

// Input paths
const shapesPath = path.resolve(__dirname, '../src/data/raw/gtfs/gtfs_WMATA/shapes.txt');
const stopTimesPath = path.resolve(__dirname, '../src/data/raw/gtfs/gtfs_WMATA/stop_times.txt');

// Output paths (for full versions before splitting)
const shapesOut = path.resolve(__dirname, '../src/data/processed/shapes.geojson');
const stopTimesOut = path.resolve(__dirname, '../src/data/processed/stop_times_summary.json');

function loadStatus() {
  if (!fs.existsSync(statusFilePath)) return {};
  return JSON.parse(fs.readFileSync(statusFilePath, 'utf-8'));
}

function saveStatus(key, time) {
  const status = loadStatus();
  status[key] = time.toISOString();
  fs.writeFileSync(statusFilePath, JSON.stringify(status, null, 2));
}

function getMTime(filePath) {
  return fs.existsSync(filePath) ? fs.statSync(filePath).mtime : null;
}

function shouldProcess(filePath, key) {
  const status = loadStatus();
  const lastProcessed = status[key];
  const currentMTime = getMTime(filePath);
  return !lastProcessed || new Date(currentMTime) > new Date(lastProcessed);
}

async function parseShapes() {
  const rl = readline.createInterface({
    input: fs.createReadStream(shapesPath),
    crlfDelay: Infinity
  });

  const routes = new Map();
  let headers = [];

  for await (const line of rl) {
    if (!headers.length) {
      headers = line.split(',');
      continue;
    }

    const values = line.split(',');
    const entry = {};
    headers.forEach((h, i) => entry[h] = values[i]);

    const shapeId = entry['shape_id'];
    const lat = parseFloat(entry['shape_pt_lat']);
    const lon = parseFloat(entry['shape_pt_lon']);
    const seq = parseInt(entry['shape_pt_sequence'], 10);

    if (!routes.has(shapeId)) routes.set(shapeId, []);
    routes.get(shapeId).push({ lat, lon, seq });
  }

  const features = Array.from(routes.entries()).map(([id, points]) => {
    const sorted = points.sort((a, b) => a.seq - b.seq);
    return {
      type: 'Feature',
      properties: { shape_id: id },
      geometry: {
        type: 'LineString',
        coordinates: sorted.map(p => [p.lon, p.lat])
      }
    };
  });

  const geojson = {
    type: 'FeatureCollection',
    features
  };

  fs.writeFileSync(shapesOut, JSON.stringify(geojson, null, 2));
  saveStatus('gtfs_shapes.txt', getMTime(shapesPath));
  console.log('✅ shapes.txt processed to shapes.geojson');

  // Split into chunks
  const chunkSize = 1000;
  for (let i = 0; i < geojson.features.length; i += chunkSize) {
    const chunk = {
      type: "FeatureCollection",
      features: geojson.features.slice(i, i + chunkSize)
    };
    const chunkPath = `./src/data/processed/shapes_part_${i / chunkSize + 1}.geojson`;
    fs.writeFileSync(chunkPath, JSON.stringify(chunk));
    console.log(`✅ wrote ${chunkPath}`);
  }

  fs.unlinkSync(shapesOut);

  // Update .gitignore
  const gitignorePath = path.resolve(__dirname, '../.gitignore');
  const gitignoreContent = fs.existsSync(gitignorePath) ? fs.readFileSync(gitignorePath, 'utf-8') : '';
  if (!gitignoreContent.includes('src/data/processed/shapes.geojson')) {
    fs.appendFileSync(gitignorePath, '\nsrc/data/processed/shapes.geojson\n');
  }
}

async function summarizeStopTimes() {
  const rl = readline.createInterface({
    input: fs.createReadStream(stopTimesPath),
    crlfDelay: Infinity
  });

  const trips = new Map();
  let headers = [];

  for await (const line of rl) {
    if (!headers.length) {
      headers = line.split(',');
      continue;
    }

    const values = line.split(',');
    const entry = {};
    headers.forEach((h, i) => entry[h] = values[i]);

    const tripId = entry['trip_id'];
    const stopId = entry['stop_id'];
    const time = entry['arrival_time'];

    if (!trips.has(tripId)) trips.set(tripId, []);
    trips.get(tripId).push({ stop: stopId, arrival: time });
  }

  const result = {};
  for (const [tripId, stops] of trips.entries()) {
    result[tripId] = stops;
  }

  fs.writeFileSync(stopTimesOut, JSON.stringify(result, null, 2));
  saveStatus('gtfs_stop_times.txt', getMTime(stopTimesPath));
  console.log('✅ stop_times.txt summarized');

  // Split into chunks
  const tripIds = Object.keys(result);
  const chunkSize = 1000;
  for (let i = 0; i < tripIds.length; i += chunkSize) {
    const chunk = {};
    tripIds.slice(i, i + chunkSize).forEach(id => {
      chunk[id] = result[id];
    });
    const chunkPath = `./src/data/processed/stop_times_part_${i / chunkSize + 1}.json`;
    fs.writeFileSync(chunkPath, JSON.stringify(chunk, null, 2));
    console.log(`✅ wrote ${chunkPath}`);
  }

  fs.unlinkSync(stopTimesOut);

  const gitignorePath = path.resolve(__dirname, '../.gitignore');
  const gitignoreContent = fs.existsSync(gitignorePath) ? fs.readFileSync(gitignorePath, 'utf-8') : '';
  if (!gitignoreContent.includes('src/data/processed/stop_times_summary.json')) {
    fs.appendFileSync(gitignorePath, '\nsrc/data/processed/stop_times_summary.json\n');
  }
}

async function main() {
  const force = process.argv.includes('--force');

  if (force || shouldProcess(shapesPath, 'gtfs_shapes.txt')) {
    await parseShapes();
  } else {
    console.log('⏩ shapes.txt up to date');
  }

  if (force || shouldProcess(stopTimesPath, 'gtfs_stop_times.txt')) {
    await summarizeStopTimes();
  } else {
    console.log('⏩ stop_times.txt up to date');
  }
}

main();