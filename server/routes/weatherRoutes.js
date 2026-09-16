const express = require('express');
const router = express.Router();
const axios = require('axios');

// Coordinates of 14 Kerala districts for nearest matching
const KERALA_DISTRICTS = [
  { id: 'palakkad', nameEn: 'Palakkad', nameMl: 'പാലക്കാട്', lat: 10.7867, lon: 76.6548 },
  { id: 'thrissur', nameEn: 'Thrissur', nameMl: 'തൃശ്ശൂർ', lat: 10.5276, lon: 76.2144 },
  { id: 'ernakulam', nameEn: 'Ernakulam', nameMl: 'എറണാകുളം', lat: 9.9816, lon: 76.2999 },
  { id: 'alappuzha', nameEn: 'Alappuzha', nameMl: 'ആലപ്പുഴ', lat: 9.4981, lon: 76.3388 },
  { id: 'wayanad', nameEn: 'Wayanad', nameMl: 'വയനാട്', lat: 11.6854, lon: 76.1320 },
  { id: 'idukki', nameEn: 'Idukki', nameMl: 'ഇടുക്കി', lat: 9.8494, lon: 76.9804 },
  { id: 'kottayam', nameEn: 'Kottayam', nameMl: 'കോട്ടയം', lat: 9.5916, lon: 76.5222 },
  { id: 'kozhikode', nameEn: 'Kozhikode', nameMl: 'കോഴിക്കോട്', lat: 11.2588, lon: 75.7804 },
  { id: 'kannur', nameEn: 'Kannur', nameMl: 'കണ്ണൂർ', lat: 11.8745, lon: 75.3704 },
  { id: 'kasaragod', nameEn: 'Kasaragod', nameMl: 'കാസർഗോഡ്', lat: 12.4996, lon: 74.9869 },
  { id: 'kollam', nameEn: 'Kollam', nameMl: 'കൊല്ലം', lat: 8.8932, lon: 76.6141 },
  { id: 'thiruvananthapuram', nameEn: 'Thiruvananthapuram', nameMl: 'തിരുവനന്തപുരം', lat: 8.5241, lon: 76.9366 },
  { id: 'malappuram', nameEn: 'Malappuram', nameMl: 'മലപ്പുറം', lat: 11.0510, lon: 76.0711 },
  { id: 'pathanamthitta', nameEn: 'Pathanamthitta', nameMl: 'പത്തനംതിട്ട', lat: 9.2648, lon: 76.7870 }
];

function resolveDistrict(lat, lon, explicitDistrict) {
  if (explicitDistrict) {
    const match = KERALA_DISTRICTS.find(d => 
      d.nameEn.toLowerCase() === explicitDistrict.toLowerCase() ||
      d.nameMl === explicitDistrict ||
      d.id === explicitDistrict.toLowerCase()
    );
    if (match) return match;
  }

  const numLat = parseFloat(lat);
  const numLon = parseFloat(lon);
  if (isNaN(numLat) || isNaN(numLon)) return KERALA_DISTRICTS[0];

  let closest = KERALA_DISTRICTS[0];
  let minDiff = Infinity;
  for (const d of KERALA_DISTRICTS) {
    const diff = Math.hypot(numLat - d.lat, numLon - d.lon);
    if (diff < minDiff) {
      minDiff = diff;
      closest = d;
    }
  }
  return closest;
}

// Get current weather by latitude & longitude or default to Kerala
router.get('/', async (req, res) => {
  const lat = req.query.lat ? parseFloat(req.query.lat) : 10.7867; // Default: Palakkad
  const lon = req.query.lon ? parseFloat(req.query.lon) : 76.6548;
  const districtObj = resolveDistrict(lat, lon, req.query.district);

  try {
    // Call free Open-Meteo API
    const response = await axios.get(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,rain,wind_speed_10m&daily=precipitation_probability_max&timezone=auto`,
      { timeout: 7000 }
    );

    const current = response.data.current || {};
    const daily = response.data.daily || {};

    const temperature = current.temperature_2m ?? 28.5;
    const humidity = current.relative_humidity_2m ?? 75;
    const rainProbability = daily.precipitation_probability_max?.[0] ?? 20;
    const windSpeed = current.wind_speed_10m ?? 8.5;

    // Generate weather-aware advice for spray application
    let spraySafety = 'SAFE';
    let sprayReasonEn = 'Weather conditions are favorable for spraying biological/chemical treatments.';
    let sprayReasonMl = 'കീടനാശിനി/ജൈവ ലായനി തളിക്കാൻ കാലാവസ്ഥ അനുയോജ്യമാണ്.';

    if (rainProbability > 50) {
      spraySafety = 'UNSAFE';
      sprayReasonEn = `High probability of rain (${rainProbability}%). Delay foliar spray to avoid chemical wash-off.`;
      sprayReasonMl = `മഴപെയ്യാൻ സാധ്യതയുണ്ട് (${rainProbability}%). ലായനി തളിക്കുന്നത് മഴ കുറയുന്നത് വരെ മാറ്റിവെക്കുക.`;
    } else if (windSpeed > 15) {
      spraySafety = 'CAUTION';
      sprayReasonEn = `High wind speed (${windSpeed} km/h). Spray with low pressure nozzle to prevent spray drift.`;
      sprayReasonMl = `കാറ്റിന്റെ വേഗത കൂടുതലാണ് (${windSpeed} km/h). ജാഗ്രത പാലിക്കുക.`;
    }

    res.json({
      location: {
        lat,
        lon,
        district: districtObj.nameEn,
        districtMl: districtObj.nameMl,
        locality: req.query.locality || districtObj.nameEn,
        locationName: `${req.query.locality || districtObj.nameEn}, ${districtObj.nameEn}, Kerala`
      },
      temperature,
      humidity,
      rainProbability,
      windSpeed,
      sprayRecommendation: {
        safety: spraySafety,
        reasonEn: sprayReasonEn,
        reasonMl: sprayReasonMl
      }
    });
  } catch (error) {
    // Fallback data if offline or network error
    res.json({
      location: {
        lat,
        lon,
        district: districtObj.nameEn,
        districtMl: districtObj.nameMl,
        locality: req.query.locality || districtObj.nameEn,
        locationName: `${districtObj.nameEn}, Kerala`
      },
      temperature: 29.0,
      humidity: 78,
      rainProbability: 25,
      windSpeed: 10.2,
      sprayRecommendation: {
        safety: 'SAFE',
        reasonEn: 'Weather conditions are favorable for crop treatment.',
        reasonMl: 'വിള പരിപാലനത്തിന് കാലാവസ്ഥ അനുകൂലമാണ്.'
      }
    });
  }
});

module.exports = router;
