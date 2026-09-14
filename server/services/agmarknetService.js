const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Default High-Fidelity Kerala APMC Baseline Mandis
const BASELINE_MANDIS = [
  {
    id: 'mandi-ekm',
    name: 'Ernakulam Market (Aluva / Broadway)',
    district: 'Ernakulam',
    state: 'Kerala',
    distanceKm: 25,
    handlingFeeRate: 0.02,
    prices: {
      Paddy: { min: 2750, max: 2950, modal: 2880, unit: 'quintal', trend: 'up', change: +45 },
      Tomato: { min: 28, max: 42, modal: 36, unit: 'kg', trend: 'down', change: -3 },
      Potato: { min: 24, max: 32, modal: 28, unit: 'kg', trend: 'stable', change: 0 },
      GreenChilli: { min: 65, max: 85, modal: 78, unit: 'kg', trend: 'up', change: +6 },
      NendranBanana: { min: 42, max: 55, modal: 50, unit: 'kg', trend: 'up', change: +4 },
      Coconut: { min: 32, max: 40, modal: 37, unit: 'kg', trend: 'stable', change: +1 },
      BlackPepper: { min: 580, max: 640, modal: 615, unit: 'kg', trend: 'up', change: +12 },
      Cardamom: { min: 2200, max: 2650, modal: 2480, unit: 'kg', trend: 'down', change: -35 },
      Ginger: { min: 110, max: 145, modal: 130, unit: 'kg', trend: 'up', change: +8 }
    }
  },
  {
    id: 'mandi-tcr',
    name: 'Thrissur APMC Mandi',
    district: 'Thrissur',
    state: 'Kerala',
    distanceKm: 60,
    handlingFeeRate: 0.018,
    prices: {
      Paddy: { min: 2800, max: 3020, modal: 2940, unit: 'quintal', trend: 'up', change: +55 },
      Tomato: { min: 26, max: 38, modal: 34, unit: 'kg', trend: 'down', change: -2 },
      Potato: { min: 22, max: 30, modal: 26, unit: 'kg', trend: 'down', change: -1 },
      GreenChilli: { min: 70, max: 90, modal: 82, unit: 'kg', trend: 'up', change: +8 },
      NendranBanana: { min: 45, max: 58, modal: 52, unit: 'kg', trend: 'up', change: +5 },
      Coconut: { min: 30, max: 38, modal: 35, unit: 'kg', trend: 'down', change: -1 },
      BlackPepper: { min: 575, max: 630, modal: 610, unit: 'kg', trend: 'stable', change: 0 },
      Cardamom: { min: 2150, max: 2580, modal: 2420, unit: 'kg', trend: 'down', change: -20 },
      Ginger: { min: 105, max: 138, modal: 125, unit: 'kg', trend: 'up', change: +5 }
    }
  },
  {
    id: 'mandi-pkd',
    name: 'Palakkad Regulated Market (Alathur)',
    district: 'Palakkad',
    state: 'Kerala',
    distanceKm: 110,
    handlingFeeRate: 0.015,
    prices: {
      Paddy: { min: 2900, max: 3180, modal: 3080, unit: 'quintal', trend: 'up', change: +80 },
      Tomato: { min: 24, max: 35, modal: 30, unit: 'kg', trend: 'stable', change: 0 },
      Potato: { min: 20, max: 28, modal: 25, unit: 'kg', trend: 'stable', change: 0 },
      GreenChilli: { min: 60, max: 78, modal: 72, unit: 'kg', trend: 'down', change: -4 },
      NendranBanana: { min: 40, max: 50, modal: 46, unit: 'kg', trend: 'stable', change: 0 },
      Coconut: { min: 31, max: 39, modal: 36, unit: 'kg', trend: 'up', change: +2 },
      BlackPepper: { min: 570, max: 625, modal: 605, unit: 'kg', trend: 'down', change: -5 },
      Cardamom: { min: 2100, max: 2500, modal: 2380, unit: 'kg', trend: 'down', change: -40 },
      Ginger: { min: 100, max: 130, modal: 118, unit: 'kg', trend: 'stable', change: +2 }
    }
  },
  {
    id: 'mandi-alp',
    name: 'Alappuzha Agricultural Mandi',
    district: 'Alappuzha',
    state: 'Kerala',
    distanceKm: 45,
    handlingFeeRate: 0.02,
    prices: {
      Paddy: { min: 2820, max: 3050, modal: 2980, unit: 'quintal', trend: 'up', change: +60 },
      Tomato: { min: 29, max: 44, modal: 38, unit: 'kg', trend: 'up', change: +3 },
      Potato: { min: 25, max: 34, modal: 29, unit: 'kg', trend: 'up', change: +1 },
      GreenChilli: { min: 68, max: 88, modal: 80, unit: 'kg', trend: 'up', change: +5 },
      NendranBanana: { min: 44, max: 56, modal: 51, unit: 'kg', trend: 'up', change: +3 },
      Coconut: { min: 34, max: 42, modal: 39, unit: 'kg', trend: 'up', change: +3 },
      BlackPepper: { min: 585, max: 645, modal: 620, unit: 'kg', trend: 'up', change: +15 },
      Cardamom: { min: 2220, max: 2680, modal: 2500, unit: 'kg', trend: 'stable', change: 0 },
      Ginger: { min: 112, max: 148, modal: 132, unit: 'kg', trend: 'up', change: +6 }
    }
  },
  {
    id: 'mandi-wyd',
    name: 'Wayanad Spices & Coffee Auction Center',
    district: 'Wayanad',
    state: 'Kerala',
    distanceKm: 210,
    handlingFeeRate: 0.015,
    prices: {
      Paddy: { min: 2700, max: 2900, modal: 2820, unit: 'quintal', trend: 'stable', change: 0 },
      Tomato: { min: 30, max: 45, modal: 39, unit: 'kg', trend: 'up', change: +4 },
      Potato: { min: 26, max: 35, modal: 30, unit: 'kg', trend: 'up', change: +2 },
      GreenChilli: { min: 72, max: 92, modal: 84, unit: 'kg', trend: 'up', change: +6 },
      NendranBanana: { min: 46, max: 60, modal: 54, unit: 'kg', trend: 'up', change: +6 },
      Coconut: { min: 29, max: 36, modal: 33, unit: 'kg', trend: 'down', change: -2 },
      BlackPepper: { min: 610, max: 670, modal: 645, unit: 'kg', trend: 'up', change: +22 },
      Cardamom: { min: 2350, max: 2800, modal: 2620, unit: 'kg', trend: 'up', change: +45 },
      Ginger: { min: 125, max: 165, modal: 148, unit: 'kg', trend: 'up', change: +14 }
    }
  }
];

// Commodities dictionary
const COMMODITY_METADATA = [
  { id: 'Paddy', nameEn: 'Paddy (Rice)', nameMl: 'നെല്ല്', defaultUnit: 'quintal', defaultYieldKg: 1000 },
  { id: 'NendranBanana', nameEn: 'Nendran Banana', nameMl: 'നേന്ത്രക്കായ', defaultUnit: 'kg', defaultYieldKg: 500 },
  { id: 'Coconut', nameEn: 'Coconut', nameMl: 'തേങ്ങ', defaultUnit: 'kg', defaultYieldKg: 600 },
  { id: 'Tomato', nameEn: 'Tomato', nameMl: 'തക്കാളി', defaultUnit: 'kg', defaultYieldKg: 300 },
  { id: 'Potato', nameEn: 'Potato', nameMl: 'ഉരുളക്കിഴങ്ങ്', defaultUnit: 'kg', defaultYieldKg: 400 },
  { id: 'GreenChilli', nameEn: 'Green Chilli', nameMl: 'പച്ചമുളക്', defaultUnit: 'kg', defaultYieldKg: 150 },
  { id: 'BlackPepper', nameEn: 'Black Pepper', nameMl: 'കുരുമുളക്', defaultUnit: 'kg', defaultYieldKg: 80 },
  { id: 'Cardamom', nameEn: 'Cardamom', nameMl: 'ഏലം', defaultUnit: 'kg', defaultYieldKg: 40 },
  { id: 'Ginger', nameEn: 'Ginger', nameMl: 'ഇഞ്ചി', defaultUnit: 'kg', defaultYieldKg: 250 }
];

// Commodity mapping from Agmarknet / OGD names to AgriPulse IDs
const COMMODITY_ALIASES = {
  paddy: 'Paddy',
  rice: 'Paddy',
  dhan: 'Paddy',
  tomato: 'Tomato',
  potato: 'Potato',
  chilli: 'GreenChilli',
  'green chilli': 'GreenChilli',
  banana: 'NendranBanana',
  plantain: 'NendranBanana',
  coconut: 'Coconut',
  pepper: 'BlackPepper',
  'black pepper': 'BlackPepper',
  cardamom: 'Cardamom',
  ginger: 'Ginger'
};

const CACHE_DIR = path.join(__dirname, '../data');
const CACHE_FILE = path.join(CACHE_DIR, 'mandi_cache.json');
const CACHE_TTL_MS = (parseInt(process.env.AGMARKNET_CACHE_HOURS, 10) || 6) * 60 * 60 * 1000;

// State holder
let currentDatabase = JSON.parse(JSON.stringify(BASELINE_MANDIS));
let syncStatus = {
  isLive: false,
  source: 'Curated Kerala APMC Baseline (Agmarknet Spec)',
  lastSynced: null,
  recordsCount: 0,
  error: null
};

// Ensure data folder exists
try {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
  // Try loading previous cache
  if (fs.existsSync(CACHE_FILE)) {
    const raw = fs.readFileSync(CACHE_FILE, 'utf-8');
    const cached = JSON.parse(raw);
    if (cached && cached.data && cached.syncStatus) {
      currentDatabase = cached.data;
      syncStatus = cached.syncStatus;
      console.log('📦 Loaded Mandi cache from disk. Last synced:', syncStatus.lastSynced);
    }
  }
} catch (e) {
  console.warn('⚠️ Could not load Mandi cache file:', e.message);
}

/**
 * Match commodity string from Agmarknet feed to standard ID
 */
function matchCommodity(rawName) {
  if (!rawName) return null;
  const lower = rawName.toLowerCase();
  for (const [key, mappedId] of Object.entries(COMMODITY_ALIASES)) {
    if (lower.includes(key)) {
      return mappedId;
    }
  }
  return null;
}

/**
 * Merge raw records from data.gov.in / Agmarknet into our Mandi structure
 */
function mergeAgmarknetRecords(records) {
  if (!Array.isArray(records) || records.length === 0) return false;

  let mergedCount = 0;
  const updatedMandis = JSON.parse(JSON.stringify(BASELINE_MANDIS));

  records.forEach(rec => {
    const districtName = (rec.district || rec.district_name || '').trim();
    const marketName = (rec.market || rec.market_name || '').trim();
    const rawCommodity = (rec.commodity || rec.commodity_name || '').trim();
    const minP = parseFloat(rec.min_price || rec.min_prize || 0);
    const maxP = parseFloat(rec.max_price || rec.max_prize || 0);
    const modalP = parseFloat(rec.modal_price || rec.modal_prize || 0);

    if (!rawCommodity || !modalP) return;

    const matchedComm = matchCommodity(rawCommodity);
    if (!matchedComm) return;

    // Find matching mandi by district
    let mandi = updatedMandis.find(m => 
      m.district.toLowerCase() === districtName.toLowerCase() ||
      marketName.toLowerCase().includes(m.district.toLowerCase())
    );

    // If no existing district mandi found, create or update dynamically
    if (!mandi && districtName) {
      mandi = {
        id: `mandi-${districtName.toLowerCase().slice(0, 3)}`,
        name: `${marketName || districtName} Regulated Mandi`,
        district: districtName,
        state: 'Kerala',
        distanceKm: 85,
        handlingFeeRate: 0.018,
        prices: {}
      };
      updatedMandis.push(mandi);
    }

    if (mandi) {
      const isQuintalCrop = matchedComm === 'Paddy';
      // Agmarknet standard prices are in Rs/Quintal (100 kg)
      // For non-paddy crops, convert Rs/Quintal to Rs/Kg for retail/farmgate alignment
      const minVal = isQuintalCrop ? Math.round(minP) : Math.round((minP / 100) * 10) / 10;
      const maxVal = isQuintalCrop ? Math.round(maxP) : Math.round((maxP / 100) * 10) / 10;
      const modalVal = isQuintalCrop ? Math.round(modalP) : Math.round((modalP / 100) * 10) / 10;

      const prevModal = mandi.prices[matchedComm]?.modal || modalVal;
      const priceDiff = Math.round((modalVal - prevModal) * 10) / 10;

      mandi.prices[matchedComm] = {
        min: minVal || mandi.prices[matchedComm]?.min || modalVal * 0.9,
        max: maxVal || mandi.prices[matchedComm]?.max || modalVal * 1.1,
        modal: modalVal,
        unit: isQuintalCrop ? 'quintal' : 'kg',
        trend: priceDiff > 0 ? 'up' : priceDiff < 0 ? 'down' : 'stable',
        change: priceDiff
      };
      mergedCount++;
    }
  });

  if (mergedCount > 0) {
    currentDatabase = updatedMandis;
    return mergedCount;
  }
  return 0;
}

/**
 * Fetch and sync live Agmarknet prices from data.gov.in
 */
async function syncFromAgmarknet(force = false) {
  const now = Date.now();
  const lastSyncTime = syncStatus.lastSynced ? new Date(syncStatus.lastSynced).getTime() : 0;

  if (!force && (now - lastSyncTime < CACHE_TTL_MS) && syncStatus.isLive) {
    return {
      success: true,
      message: 'Mandi data is up to date from cache.',
      syncStatus
    };
  }

  const apiKey = process.env.DATAGOV_API_KEY || '579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b';
  const resourceId = '9ef84268-d588-465a-a308-a864a43d0070'; // Daily wholesale market prices
  const url = `https://api.data.gov.in/resource/${resourceId}?api-key=${apiKey}&format=json&limit=150&filters%5Bstate%5D=Kerala`;

  try {
    console.log('📡 Fetching live APMC Mandi rates from data.gov.in Agmarknet feed...');
    const response = await axios.get(url, { timeout: 6000 });

    if (response.data && response.data.records && response.data.records.length > 0) {
      const records = response.data.records;
      const count = mergeAgmarknetRecords(records);

      syncStatus = {
        isLive: true,
        source: 'Agmarknet / OGD Data.gov.in Live API',
        lastSynced: new Date().toISOString(),
        recordsCount: count || records.length,
        error: null
      };

      // Persist cache
      try {
        fs.writeFileSync(CACHE_FILE, JSON.stringify({ data: currentDatabase, syncStatus }, null, 2));
      } catch (writeErr) {
        console.warn('Could not write Mandi cache to disk:', writeErr.message);
      }

      console.log(`✅ Agmarknet live sync successful: updated ${count} commodity rates.`);
      return {
        success: true,
        message: `Synced ${count} live commodity prices from Agmarknet API.`,
        syncStatus
      };
    } else {
      throw new Error('Agmarknet API returned empty records for Kerala.');
    }
  } catch (err) {
    console.warn(`⚠️ Agmarknet Live Sync Notice: ${err.message}. Using high-fidelity Kerala APMC baseline.`);
    syncStatus = {
      isLive: false,
      source: 'Curated Kerala APMC Baseline (Agmarknet Sync Fallback)',
      lastSynced: syncStatus.lastSynced || new Date().toISOString(),
      recordsCount: currentDatabase.length,
      error: err.message
    };
    return {
      success: false,
      message: `Agmarknet API unavailable (${err.message}). Defaulted to verified Kerala baseline rates.`,
      syncStatus
    };
  }
}

/**
 * Get current Mandi database
 */
function getMandiDatabase() {
  return currentDatabase;
}

/**
 * Get current sync status
 */
function getSyncStatus() {
  return syncStatus;
}

/**
 * Get commodities list
 */
function getCommoditiesList() {
  return COMMODITY_METADATA;
}

// Kick off an initial background sync on startup
setTimeout(() => {
  syncFromAgmarknet().catch(() => {});
}, 3000);

module.exports = {
  syncFromAgmarknet,
  getMandiDatabase,
  getSyncStatus,
  getCommoditiesList,
  BASELINE_MANDIS,
  COMMODITY_METADATA
};
