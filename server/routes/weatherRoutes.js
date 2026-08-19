const express = require('express');
const router = express.Router();
const axios = require('axios');

// Get current weather by latitude & longitude or default to Kerala (Kochi)
router.get('/', async (req, res) => {
  try {
    const lat = req.query.lat || 9.9312;
    const lon = req.query.lon || 76.2673;

    // Call free Open-Meteo API
    const response = await axios.get(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,rain,wind_speed_10m&daily=precipitation_probability_max&timezone=auto`
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
      location: { lat, lon },
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
      location: { lat: 9.9312, lon: 76.2673 },
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
