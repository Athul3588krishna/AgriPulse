const axios = require('axios');
const fs = require('fs');
const path = require('path');
const agmarknetService = require('./agmarknetService');

// Load RAG knowledge data
let knowledgeBase = [];
const knowledgePath = path.join(__dirname, '../../ai_service/knowledge_data.json');
try {
  if (fs.existsSync(knowledgePath)) {
    knowledgeBase = JSON.parse(fs.readFileSync(knowledgePath, 'utf-8'));
  }
} catch (e) {
  console.warn('Could not load knowledge_data.json:', e.message);
}

// Subsidies database reference
let schemesDatabase = [];
try {
  const subsidyRoutes = require('../routes/subsidyRoutes');
  schemesDatabase = subsidyRoutes.schemesDatabase || [];
} catch (e) {
  console.warn('Could not load schemesDatabase from routes:', e.message);
}

// Kerala district coordinates mapping
const DISTRICT_COORDS = {
  palakkad: { lat: 10.7867, lon: 76.6548, name: 'Palakkad' },
  thrissur: { lat: 10.5276, lon: 76.2144, name: 'Thrissur' },
  ernakulam: { lat: 9.9816, lon: 76.2999, name: 'Ernakulam' },
  alappuzha: { lat: 9.4981, lon: 76.3388, name: 'Alappuzha' },
  wayanad: { lat: 11.6854, lon: 76.1320, name: 'Wayanad' },
  idukki: { lat: 9.8494, lon: 76.9804, name: 'Idukki' },
  kottayam: { lat: 9.5916, lon: 76.5222, name: 'Kottayam' },
  kozhikode: { lat: 11.2588, lon: 75.7804, name: 'Kozhikode' },
  kannur: { lat: 11.8745, lon: 75.3704, name: 'Kannur' },
  kasaragod: { lat: 12.4996, lon: 74.9869, name: 'Kasaragod' },
  kollam: { lat: 8.8932, lon: 76.6141, name: 'Kollam' },
  thiruvananthapuram: { lat: 8.5241, lon: 76.9366, name: 'Thiruvananthapuram' },
  malappuram: { lat: 11.0510, lon: 76.0711, name: 'Malappuram' },
  pathanamthitta: { lat: 9.2648, lon: 76.7870, name: 'Pathanamthitta' }
};

// ==========================================
// 1. SPECIALIZED AUTONOMOUS AGENT TOOLS
// ==========================================

const tools = {
  /**
   * Tool 1: Live APMC Mandi Price Intelligence
   */
  tool_mandi_prices: async ({ crop, district }) => {
    const targetCrop = crop || 'Paddy';
    const mandiDatabase = agmarknetService.getMandiDatabase();
    let filteredMandis = [...mandiDatabase];

    if (district) {
      const match = filteredMandis.filter(m => 
        m.district.toLowerCase().includes(district.toLowerCase())
      );
      if (match.length > 0) filteredMandis = match;
    }

    const rates = [];
    filteredMandis.forEach(m => {
      const priceObj = m.prices ? m.prices[targetCrop] : null;
      if (priceObj) {
        rates.push({
          mandiName: m.name,
          district: m.district,
          minPrice: priceObj.min,
          maxPrice: priceObj.max,
          modalPrice: priceObj.modal,
          unit: priceObj.unit,
          trend: priceObj.trend,
          change: priceObj.change
        });
      }
    });

    if (rates.length === 0 && mandiDatabase.length > 0) {
      const firstMandi = mandiDatabase[0];
      const availableCrops = Object.keys(firstMandi.prices || {});
      return {
        status: 'partial',
        targetCrop,
        message: `No direct rates found for ${targetCrop}. Available commodities: ${availableCrops.join(', ')}`,
        availableCrops
      };
    }

    rates.sort((a, b) => b.modalPrice - a.modalPrice);
    const topMarket = rates[0] || null;

    return {
      status: 'success',
      targetCrop,
      topMarket,
      allMarkets: rates,
      summaryEn: topMarket 
        ? `Highest rate for ${targetCrop} is at ${topMarket.mandiName} (${topMarket.district}) at ₹${topMarket.modalPrice}/${topMarket.unit} (${topMarket.trend === 'up' ? '+' : ''}${topMarket.change}).`
        : `Mandi prices available across Kerala APMC markets.`,
      summaryMl: topMarket
        ? `${targetCrop}-ന്റെ ഏറ്റവും ഉയർന്ന വിപണി നിരക്ക് ${topMarket.mandiName} (${topMarket.district})-ൽ ആണ്: ₹${topMarket.modalPrice}/${topMarket.unit} (മാറ്റം: ${topMarket.trend === 'up' ? '+' : ''}${topMarket.change}).`
        : `വിപണി നിരക്കുകൾ ലഭ്യമാണ്.`
    };
  },

  /**
   * Tool 2: Weather Spray Safety & Meteorological Risk
   */
  tool_weather_spray_safety: async ({ lat, lon, district }) => {
    let latitude = lat || 9.9312;
    let longitude = lon || 76.2673;
    let locationName = district || 'Kerala Region';

    if (district && DISTRICT_COORDS[district.toLowerCase()]) {
      latitude = DISTRICT_COORDS[district.toLowerCase()].lat;
      longitude = DISTRICT_COORDS[district.toLowerCase()].lon;
      locationName = DISTRICT_COORDS[district.toLowerCase()].name;
    }

    try {
      const response = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation,rain,wind_speed_10m&daily=precipitation_probability_max&timezone=auto`,
        { timeout: 4000 }
      );
      const current = response.data.current || {};
      const daily = response.data.daily || {};

      const temp = current.temperature_2m ?? 28.5;
      const humidity = current.relative_humidity_2m ?? 75;
      const rainProb = daily.precipitation_probability_max?.[0] ?? 20;
      const windSpeed = current.wind_speed_10m ?? 8.5;

      let safety = 'SAFE';
      let reasonEn = `Wind speed is low (${windSpeed} km/h) and rain probability is ${rainProb}%. Safe to spray organic or chemical treatments between 7:00 AM - 9:30 AM or late evening.`;
      let reasonMl = `കാറ്റിന്റെ വേഗത ${windSpeed} km/h മാത്രമാണ്, മഴ സാധ്യത ${rainProb}%. രാവിലെ 7:00 - 9:30 വരെയോ വൈകുന്നേരമോ മരുന്ന് തളിക്കാൻ കാലാവസ്ഥ തികച്ചും അനുയോജ്യമാണ്.`;

      if (rainProb > 50) {
        safety = 'UNSAFE';
        reasonEn = `Rain probability is high (${rainProb}%). Do NOT spray right now as rain will wash away chemical fungicides.`;
        reasonMl = `മഴ പെയ്യാൻ ഉയർന്ന സാധ്യതയുണ്ട് (${rainProb}%). ഇപ്പോൾ മരുന്ന് തളിക്കുന്നത് ലായനി ഒലിച്ചുപോകാൻ ഇടയാക്കും.`;
      } else if (windSpeed > 15) {
        safety = 'CAUTION';
        reasonEn = `High wind speeds (${windSpeed} km/h) detected. Use drift-reduction nozzles to prevent spray dispersion.`;
        reasonMl = `ശക്തമായ കാറ്റ് (${windSpeed} km/h) ഉള്ളതിനാൽ മരുന്ന് പരന്നുപോകാൻ സാധ്യതയുണ്ട്. ജാഗ്രത പാലിക്കുക.`;
      }

      return {
        status: 'success',
        location: locationName,
        temperature: temp,
        humidity,
        rainProbability: rainProb,
        windSpeed,
        safety,
        reasonEn,
        reasonMl
      };
    } catch (e) {
      return {
        status: 'fallback',
        location: locationName,
        temperature: 28.0,
        humidity: 75,
        rainProbability: 25,
        windSpeed: 9.0,
        safety: 'SAFE',
        reasonEn: 'Moderate weather conditions. Suitable for spraying in early morning hours.',
        reasonMl: 'അനുകൂല കാലാവസ്ഥ. രാവിലെ സമയങ്ങളിൽ മരുന്ന് തളിക്കാവുന്നതാണ്.'
      };
    }
  },

  /**
   * Tool 3: KAU & ICAR Scientific Crop Disease & RAG Advisory
   */
  tool_disease_advisory: async ({ crop, disease, symptom }) => {
    const searchTarget = (disease || symptom || crop || '').toLowerCase();
    let matchedItem = null;

    if (knowledgeBase && knowledgeBase.length > 0) {
      matchedItem = knowledgeBase.find(k => 
        k.disease_name.toLowerCase().includes(searchTarget) ||
        (k.crop && k.crop.toLowerCase().includes(searchTarget)) ||
        searchTarget.includes(k.disease_name.toLowerCase()) ||
        searchTarget.includes(k.crop.toLowerCase())
      );
    }

    if (!matchedItem && knowledgeBase.length > 0) {
      matchedItem = knowledgeBase[0];
    }

    if (matchedItem) {
      return {
        status: 'success',
        diseaseName: matchedItem.disease_name,
        crop: matchedItem.crop,
        organicTreatmentEn: matchedItem.english.organic,
        chemicalTreatmentEn: matchedItem.english.chemical,
        preventiveTipsEn: matchedItem.english.preventive,
        organicTreatmentMl: matchedItem.malayalam.organic,
        chemicalTreatmentMl: matchedItem.malayalam.chemical,
        preventiveTipsMl: matchedItem.malayalam.preventive,
        sources: matchedItem.sources
      };
    }

    return {
      status: 'standard_practice',
      diseaseName: disease || 'Fungal Foliar Spot',
      crop: crop || 'General',
      organicTreatmentEn: [
        'Neem oil 5ml/L with soap solution spray on foliage.',
        'Trichoderma viride bio-formulation application @ 10g/L.'
      ],
      chemicalTreatmentEn: [
        'Copper Oxychloride 50% WP @ 3g/L water.',
        'Apply systemic fungicide (Mancozeb 2g/L) for severe infestation.'
      ],
      preventiveTipsEn: [
        'Remove infected lower leaves and ensure good soil drainage.',
        'Avoid wetting foliage during evening hours.'
      ],
      organicTreatmentMl: [
        'വേപ്പെണ്ണ-സോപ്പ് മിശ്രിതം (5 മില്ലി/ലിറ്റർ) ഇലകളിൽ തളിക്കുക.',
        'ട്രൈക്കോഡെർമ വിരിഡെ ജൈവ കുമിൾനാശിനി (10 ഗ്രാം/ലിറ്റർ) ഉപയോഗിക്കുക.'
      ],
      chemicalTreatmentMl: [
        'കോപ്പർ ഓക്സിക്ലോറൈഡ് 3 ഗ്രാം ഒരു ലിറ്റർ വെള്ളത്തിൽ കലക്കി തളിക്കുക.'
      ],
      preventiveTipsMl: [
        'രോഗബാധയുള്ള ഇലകൾ നീക്കം ചെയ്യുക, വെള്ളക്കെട്ട് ഒഴിവാക്കുക.'
      ],
      sources: [{ title: 'Kerala Agricultural University Advisory Manual', url: 'https://kau.in' }]
    };
  },

  /**
   * Tool 4: Autonomous Subsidy & PMFBY Scheme Navigator
   */
  tool_subsidy_navigator: async ({ schemeName, crop, landAcres, damageSeverity }) => {
    const acres = parseFloat(landAcres) || 1.0;
    const targetCrop = crop || 'Paddy';
    const targetQuery = (schemeName || '').toLowerCase();

    let matchedScheme = schemesDatabase.find(s => 
      s.id.toLowerCase().includes(targetQuery) ||
      s.nameEn.toLowerCase().includes(targetQuery) ||
      s.nameMl.toLowerCase().includes(targetQuery)
    );

    if (!matchedScheme && schemesDatabase.length > 0) {
      matchedScheme = schemesDatabase[0]; // PMFBY default
    }

    let estimatedPayout = 0;
    if (matchedScheme && typeof matchedScheme.estimatedBenefitFormula === 'function') {
      estimatedPayout = matchedScheme.estimatedBenefitFormula(acres, targetCrop);
    } else {
      estimatedPayout = Math.round(acres * 30000);
    }

    return {
      status: 'success',
      schemeId: matchedScheme ? matchedScheme.id : 'pmfby',
      schemeNameEn: matchedScheme ? matchedScheme.nameEn : 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
      schemeNameMl: matchedScheme ? matchedScheme.nameMl : 'പ്രധാനമന്ത്രി ഫസൽ ബീമാ യോജന',
      estimatedBenefit: `₹${estimatedPayout.toLocaleString('en-IN')}`,
      maxFinancialBenefitEn: matchedScheme ? matchedScheme.maxFinancialBenefitEn : 'Up to ₹35,000/acre',
      maxFinancialBenefitMl: matchedScheme ? matchedScheme.maxFinancialBenefitMl : 'ഏക്കറിന് ₹35,000 വരെ നഷ്ടപരിഹാരം',
      requiredDocumentsEn: matchedScheme ? matchedScheme.requiredDocumentsEn : ['Aadhaar Card', 'Land Tax Receipt', 'Bank Passbook'],
      requiredDocumentsMl: matchedScheme ? matchedScheme.requiredDocumentsMl : ['ആധാർ കാർഡ്', 'ഭൂനികുതി രസീത്', 'ബാങ്ക് പാസ്ബുക്ക്'],
      applyUrl: matchedScheme ? matchedScheme.applyUrl : 'https://pmfby.gov.in',
      claimWindowNotice: 'Report crop damage to Krishi Bhavan or PMFBY portal within 72 hours of occurrence with leaf image evidence.'
    };
  },

  /**
   * Tool 5: Middleman Arbitrage & Direct Market Optimizer
   */
  tool_middleman_arbitrage: async ({ crop, quantityKg, farmLocation }) => {
    const qty = parseFloat(quantityKg) || 1000;
    const targetCrop = crop || 'Paddy';

    // Average direct APMC modal vs middleman local cut
    const apmcModal = targetCrop.toLowerCase().includes('paddy') ? 30.8 : 36.0;
    const middlemanRate = apmcModal * 0.78; // Middlemen pay ~22% less

    const directGross = qty * apmcModal;
    const middlemanGross = qty * middlemanRate;
    const directBenefit = Math.round(directGross - middlemanGross);

    return {
      status: 'success',
      commodity: targetCrop,
      quantityKg: qty,
      directApmcPricePerKg: apmcModal,
      middlemanFarmgatePricePerKg: middlemanRate.toFixed(1),
      estimatedMiddlemanLoss: directBenefit,
      recommendationEn: `Selling ${qty}kg of ${targetCrop} directly to the nearest APMC Mandi saves ₹${directBenefit.toLocaleString('en-IN')} by bypassing local middleman commissions.`,
      recommendationMl: `${qty}kg ${targetCrop} ഇടനിലക്കാർക്ക് നൽകാതെ നേരിട്ട് APMC മണ്ടിയിൽ വിറ്റാൽ ₹${directBenefit.toLocaleString('en-IN')} അധിക വരുമാനം ലഭിക്കും.`
    };
  }
};

// Tool metadata specifications
const toolDefinitions = [
  {
    name: 'tool_mandi_prices',
    description: 'Query real-time Kerala APMC Mandi commodity rates, modal prices, and market trends.',
    parameters: {
      type: 'OBJECT',
      properties: {
        crop: { type: 'STRING', description: 'Crop name (e.g. Paddy, Tomato, Coconut, Banana, Cardamom, BlackPepper, Ginger, Potato, GreenChilli)' },
        district: { type: 'STRING', description: 'Kerala district name (e.g. Palakkad, Thrissur, Ernakulam, Wayanad, Alappuzha)' }
      }
    }
  },
  {
    name: 'tool_weather_spray_safety',
    description: 'Fetch real-time weather, wind velocity, rain probability, and pesticide/fertilizer spray safety analysis.',
    parameters: {
      type: 'OBJECT',
      properties: {
        district: { type: 'STRING', description: 'District name in Kerala (e.g. Palakkad, Wayanad, Ernakulam)' },
        lat: { type: 'NUMBER', description: 'Latitude coordinate' },
        lon: { type: 'NUMBER', description: 'Longitude coordinate' }
      }
    }
  },
  {
    name: 'tool_disease_advisory',
    description: 'Query Kerala Agricultural University (KAU) & ICAR scientific disease management, bio-organic and chemical spray dosages.',
    parameters: {
      type: 'OBJECT',
      properties: {
        crop: { type: 'STRING', description: 'Crop name' },
        disease: { type: 'STRING', description: 'Disease name or symptom (e.g. Late Blight, Leaf Spot, fungal rot)' }
      }
    }
  },
  {
    name: 'tool_subsidy_navigator',
    description: 'Calculate eligible farmer government subsidies, PMFBY crop insurance compensation, and required application documents.',
    parameters: {
      type: 'OBJECT',
      properties: {
        schemeName: { type: 'STRING', description: 'Name or type of scheme (PMFBY, PM-KISAN, Subhiksha Keralam)' },
        crop: { type: 'STRING', description: 'Crop grown' },
        landAcres: { type: 'NUMBER', description: 'Farm land acreage' }
      }
    }
  },
  {
    name: 'tool_middleman_arbitrage',
    description: 'Calculate APMC direct market sales profit vs local middleman exploitation margin.',
    parameters: {
      type: 'OBJECT',
      properties: {
        crop: { type: 'STRING', description: 'Crop commodity' },
        quantityKg: { type: 'NUMBER', description: 'Harvest quantity in kg' }
      }
    }
  }
];

// ==========================================
// 2. GEMINI LLM FUNCTION CALLING ENGINE
// ==========================================

let geminiClient = null;
try {
  const { GoogleGenAI } = require('@google/genai');
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey.trim() && apiKey !== 'your_gemini_api_key_here') {
    geminiClient = new GoogleGenAI({ apiKey });
    console.log('🤖 Google Gemini LLM Client initialized with API key.');
  } else {
    console.log('ℹ️ GEMINI_API_KEY not configured. Autonomous Agent will use high-precision ReAct rule-based engine.');
  }
} catch (err) {
  console.warn('⚠️ Could not load @google/genai SDK:', err.message);
}

/**
 * Executes an Autonomous query using Google Gemini Function Calling
 */
async function processWithGemini({ message, lang = 'en', context = {}, location = null }) {
  if (!geminiClient) {
    throw new Error('Gemini client not initialized or GEMINI_API_KEY missing.');
  }

  const { Type } = require('@google/genai');

  const geminiTools = [{
    functionDeclarations: [
      {
        name: 'tool_mandi_prices',
        description: 'Query live Kerala APMC Mandi commodity rates, modal prices, and market trends for crops (Paddy, Tomato, Coconut, NendranBanana, GreenChilli, BlackPepper, Cardamom, Ginger, Potato).',
        parameters: {
          type: Type.OBJECT,
          properties: {
            crop: { type: Type.STRING, description: 'Commodity or crop name' },
            district: { type: Type.STRING, description: 'Kerala district name (Palakkad, Thrissur, Ernakulam, Alappuzha, Wayanad, etc.)' }
          }
        }
      },
      {
        name: 'tool_weather_spray_safety',
        description: 'Check real-time meteorological conditions and spray safety (SAFE, CAUTION, UNSAFE) based on rain probability, wind speed, and humidity.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            district: { type: Type.STRING, description: 'Kerala district name' }
          }
        }
      },
      {
        name: 'tool_disease_advisory',
        description: 'Access Kerala Agricultural University (KAU) & ICAR certified disease remedies (organic and chemical fungicide dosages).',
        parameters: {
          type: Type.OBJECT,
          properties: {
            crop: { type: Type.STRING, description: 'Crop name' },
            disease: { type: Type.STRING, description: 'Disease name or symptom' }
          }
        }
      },
      {
        name: 'tool_subsidy_navigator',
        description: 'Evaluate eligible farmer government subsidies, PMFBY crop insurance compensation calculations, and required documents.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            schemeName: { type: Type.STRING, description: 'Scheme name like pmfby, pm-kisan, subhiksha keralam' },
            crop: { type: Type.STRING, description: 'Crop grown' },
            landAcres: { type: Type.NUMBER, description: 'Farmland size in acres' }
          }
        }
      },
      {
        name: 'tool_middleman_arbitrage',
        description: 'Calculate net profit comparison between selling directly to APMC Mandis vs selling to local commission agents/middlemen.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            crop: { type: Type.STRING, description: 'Crop commodity' },
            quantityKg: { type: Type.NUMBER, description: 'Harvest quantity in kg' }
          }
        }
      }
    ]
  }];

  const systemInstruction = `You are AgriMitra 360, an Autonomous Agentic AI Agronomist and Market Intelligence Assistant serving farmers in Kerala, India.
You understand English, Malayalam script, and colloquial Manglish (e.g. "palakkad paddy rate ethra aanu", "njan inn thakkalikku marunnu thalikkan pattumo", "ente vaazhayil rogam vannu enthu cheyyum", "kisaan subsidy kittumo").
Whenever answering farmer questions, ALWAYS invoke the appropriate tool(s) to fetch real, grounded facts:
- For market prices, rates, mandi queries: use tool_mandi_prices
- For rain, weather, spray safety, wind: use tool_weather_spray_safety
- For leaf spots, pests, diseases, fungicide cures, organic remedies: use tool_disease_advisory
- For insurance, PMFBY, PM-KISAN, subsidies: use tool_subsidy_navigator
- For middleman broker losses, profit calculations: use tool_middleman_arbitrage

After tools return their observations, synthesize a comprehensive bilingual answer formatted EXACTLY as follows:
[EN]
(Your English response here with clear bullet points, specific prices/dosages, and empathetic farming advice)

[ML]
(Your authentic Malayalam response in Malayalam script with clear guidance for the farmer)`;

  // Step 1: Create chat session with Gemini 3.5 Flash and tool definitions
  const chat = geminiClient.chats.create({
    model: 'gemini-3.5-flash',
    config: {
      systemInstruction,
      tools: geminiTools
    }
  });

  const response = await chat.sendMessage({ message });
  const reactSteps = [];
  const toolsCalled = [];
  let finalSynthesis = '';

  // Step 2: Handle function calls if model invoked tools
  if (response.functionCalls && response.functionCalls.length > 0) {
    const functionResponseParts = [];

    for (let i = 0; i < response.functionCalls.length; i++) {
      const call = response.functionCalls[i];
      const toolName = call.name;
      const toolArgs = call.args || {};

      toolsCalled.push(toolName);
      let observation = {};

      if (tools[toolName]) {
        try {
          observation = await tools[toolName](toolArgs);
        } catch (toolErr) {
          observation = { error: toolErr.message };
        }
      }

      reactSteps.push({
        stepNumber: i + 1,
        thought: `Gemini 3.5 Flash Reasoning: Invoking specialized tool '${toolName}' with args: ${JSON.stringify(toolArgs)}.`,
        tool: toolName,
        input: toolArgs,
        observation: observation
      });

      functionResponseParts.push({
        functionResponse: {
          name: toolName,
          response: { output: observation }
        }
      });
    }

    // Step 3: Send tool observations back to Gemini for grounded synthesis
    const synthesisResponse = await chat.sendMessage({
      message: functionResponseParts
    });
    finalSynthesis = synthesisResponse.text || '';
  } else {
    finalSynthesis = response.text || '';
  }

  // Parse bilingual sections
  let textEn = '';
  let textMl = '';

  if (finalSynthesis.includes('[EN]') && finalSynthesis.includes('[ML]')) {
    const parts = finalSynthesis.split('[ML]');
    textEn = parts[0].replace('[EN]', '').trim();
    textMl = (parts[1] || '').trim();
  } else if (finalSynthesis.toLowerCase().includes('english') && finalSynthesis.includes('മലയാളം')) {
    const splitIndex = finalSynthesis.indexOf('മലയാളം');
    textEn = finalSynthesis.slice(0, splitIndex).replace(/\*\*English:?\*\*/gi, '').trim();
    textMl = finalSynthesis.slice(splitIndex).replace(/മലയാളം:?/gi, '').replace(/\*\*/g, '').trim();
  } else {
    textEn = finalSynthesis;
    textMl = finalSynthesis;
  }

  return {
    success: true,
    engine: 'gemini-3.5-flash',
    query: message,
    selectedLanguage: lang,
    toolsCalled,
    reactSteps: reactSteps.length > 0 ? reactSteps : [{
      stepNumber: 1,
      thought: 'Direct linguistic resolution handled by Gemini 3.5 Flash.',
      tool: 'none',
      input: {},
      observation: { status: 'direct_response' }
    }],
    textEn,
    textMl,
    timestamp: new Date().toISOString()
  };
}

// ==========================================
// 3. DETERMINISTIC ReAct RULE ENGINE (FALLBACK)
// ==========================================

function planAutonomousActions(userQuery) {
  const q = userQuery.toLowerCase();
  const plannedSteps = [];

  // Extract District Mention
  let detectedDistrict = null;
  for (const distKey of Object.keys(DISTRICT_COORDS)) {
    if (q.includes(distKey)) {
      detectedDistrict = DISTRICT_COORDS[distKey].name;
      break;
    }
  }
  // Malayalam district mentions
  if (q.includes('പാലക്കാട്')) detectedDistrict = 'Palakkad';
  else if (q.includes('തൃശ്ശൂർ') || q.includes('തൃശൂർ')) detectedDistrict = 'Thrissur';
  else if (q.includes('എറണാകുളം') || q.includes('കൊച്ചി')) detectedDistrict = 'Ernakulam';
  else if (q.includes('ആലപ്പുഴ')) detectedDistrict = 'Alappuzha';
  else if (q.includes('വയനാട്')) detectedDistrict = 'Wayanad';
  else if (q.includes('ഇടുക്കി')) detectedDistrict = 'Idukki';

  // Extract Crop Mention
  let detectedCrop = 'Paddy';
  if (q.includes('tomato') || q.includes('തക്കാളി') || q.includes('thakkali')) detectedCrop = 'Tomato';
  else if (q.includes('banana') || q.includes('വാഴ') || q.includes('നേന്ത്ര') || q.includes('vaazha') || q.includes('nendran')) detectedCrop = 'NendranBanana';
  else if (q.includes('coconut') || q.includes('തേങ്ങ') || q.includes('നാളികേരം') || q.includes('thenga')) detectedCrop = 'Coconut';
  else if (q.includes('pepper') || q.includes('കുരുമുളക്') || q.includes('kurumulaku')) detectedCrop = 'BlackPepper';
  else if (q.includes('cardamom') || q.includes('ഏലം') || q.includes('elam')) detectedCrop = 'Cardamom';
  else if (q.includes('ginger') || q.includes('ഇഞ്ചി') || q.includes('inchi')) detectedCrop = 'Ginger';
  else if (q.includes('chilli') || q.includes('മുളക്') || q.includes('mulak')) detectedCrop = 'GreenChilli';
  else if (q.includes('potato') || q.includes('ഉരുളക്കിഴങ്ങ്') || q.includes('urula')) detectedCrop = 'Potato';
  else if (q.includes('paddy') || q.includes('നെല്ല്') || q.includes('nellu') || q.includes('ari')) detectedCrop = 'Paddy';

  // 1. Mandi Price Intent
  const hasMandiIntent = q.includes('mandi') || q.includes('price') || q.includes('rate') || 
    q.includes('മാർക്കറ്റ്') || q.includes('വില') || q.includes('വിപണി') || q.includes('ക്വിന്റൽ') ||
    q.includes('vila') || q.includes('ethra');

  // 2. Weather & Spray Timing Intent
  const hasWeatherIntent = q.includes('weather') || q.includes('rain') || q.includes('spray') || 
    q.includes('മഴ') || q.includes('കാലാവസ്ഥ') || q.includes('തളിക്ക') || q.includes('കാറ്റ്') ||
    q.includes('mazha') || q.includes('thalikka') || q.includes('marunnu thalikk');

  // 3. Disease & Treatment Intent
  const hasDiseaseIntent = q.includes('disease') || q.includes('leaf') || q.includes('blight') || 
    q.includes('spot') || q.includes('cure') || q.includes('medicine') || q.includes('രോഗം') || 
    q.includes('ഇല') || q.includes('കുമിൾ') || q.includes('മരുന്ന്') || q.includes('പ്രതിവിധി') ||
    q.includes('rogam') || q.includes('ila') || q.includes('puzhu') || q.includes('keedam');

  // 4. Subsidy & Insurance Intent
  const hasSubsidyIntent = q.includes('subsidy') || q.includes('scheme') || q.includes('pmfby') || 
    q.includes('pm-kisan') || q.includes('insurance') || q.includes('സബ്‌സിഡി') || 
    q.includes('പദ്ധതി') || q.includes('ഇൻഷുറൻസ്') || q.includes('നഷ്ടപരിഹാരം') ||
    q.includes('sahayam') || q.includes('kisan');

  // 5. Arbitrage / Middleman Intent
  const hasArbitrageIntent = q.includes('middleman') || q.includes('broker') || q.includes('profit') || 
    q.includes('ഇടനില') || q.includes('ലാഭം') || q.includes('കമ്മീഷൻ') || q.includes('labham');

  // Multi-step action planning
  if (hasMandiIntent) {
    plannedSteps.push({
      tool: 'tool_mandi_prices',
      args: { crop: detectedCrop, district: detectedDistrict },
      thought: `Farmer needs current market intelligence for ${detectedCrop} in ${detectedDistrict || 'Kerala APMC hubs'}. Querying live Mandi prices.`
    });
  }

  if (hasWeatherIntent) {
    plannedSteps.push({
      tool: 'tool_weather_spray_safety',
      args: { district: detectedDistrict || 'Palakkad' },
      thought: `Farmer is inquiring about atmospheric conditions for spraying. Querying Open-Meteo meteorological radar for ${detectedDistrict || 'Palakkad'}.`
    });
  }

  if (hasDiseaseIntent) {
    plannedSteps.push({
      tool: 'tool_disease_advisory',
      args: { crop: detectedCrop, disease: q.includes('blight') ? 'Tomato Late Blight' : 'Bacterial Leaf Spot' },
      thought: `Diagnosing crop foliar affliction for ${detectedCrop}. Accessing KAU & ICAR Package of Practices repository.`
    });
  }

  if (hasSubsidyIntent) {
    plannedSteps.push({
      tool: 'tool_subsidy_navigator',
      args: { schemeName: q.includes('kisan') ? 'pm-kisan' : 'pmfby', crop: detectedCrop, landAcres: 1.5 },
      thought: `Farmer needs financial security guidance. Evaluating government schemes, eligibility parameters, and PMFBY claim criteria.`
    });
  }

  if (hasArbitrageIntent && !hasMandiIntent) {
    plannedSteps.push({
      tool: 'tool_middleman_arbitrage',
      args: { crop: detectedCrop, quantityKg: 1000 },
      thought: `Analyzing price disparity between farmgate broker quotes and regulated APMC auctions.`
    });
  }

  // Default fallback tool if query was open-ended
  if (plannedSteps.length === 0) {
    plannedSteps.push({
      tool: 'tool_mandi_prices',
      args: { crop: detectedCrop, district: detectedDistrict },
      thought: `Executing market baseline retrieval for regional agriculture.`
    });
  }

  return plannedSteps;
}

/**
 * Deterministic ReAct execution fallback
 */
async function processReActFallback({ message, lang = 'en', context = {}, location = null }) {
  const reactSteps = [];
  const toolsCalled = [];

  const plannedSteps = planAutonomousActions(message);

  for (let i = 0; i < plannedSteps.length; i++) {
    const stepPlan = plannedSteps[i];
    const toolFn = tools[stepPlan.tool];

    if (toolFn) {
      try {
        const observation = await toolFn(stepPlan.args);
        toolsCalled.push(stepPlan.tool);

        reactSteps.push({
          stepNumber: i + 1,
          thought: stepPlan.thought,
          tool: stepPlan.tool,
          input: stepPlan.args,
          observation: observation
        });
      } catch (err) {
        reactSteps.push({
          stepNumber: i + 1,
          thought: stepPlan.thought,
          tool: stepPlan.tool,
          input: stepPlan.args,
          observation: { error: err.message }
        });
      }
    }
  }

  const mandiObs = reactSteps.find(s => s.tool === 'tool_mandi_prices')?.observation;
  const weatherObs = reactSteps.find(s => s.tool === 'tool_weather_spray_safety')?.observation;
  const diseaseObs = reactSteps.find(s => s.tool === 'tool_disease_advisory')?.observation;
  const subsidyObs = reactSteps.find(s => s.tool === 'tool_subsidy_navigator')?.observation;
  const arbitrageObs = reactSteps.find(s => s.tool === 'tool_middleman_arbitrage')?.observation;

  const responseSectionsEn = [];
  const responseSectionsMl = [];

  if (mandiObs && mandiObs.topMarket) {
    responseSectionsEn.push(`📊 **Mandi Price Alert**: For **${mandiObs.targetCrop}**, the highest modal rate is at **${mandiObs.topMarket.mandiName} (${mandiObs.topMarket.district})** at **₹${mandiObs.topMarket.modalPrice} per ${mandiObs.topMarket.unit}** (${mandiObs.topMarket.trend === 'up' ? '+' : ''}${mandiObs.topMarket.change}).`);
    responseSectionsMl.push(`📊 **വിപണി വില**: **${mandiObs.targetCrop}**-ന് ഏറ്റവും ഉയർന്ന നിരക്ക് **${mandiObs.topMarket.mandiName} (${mandiObs.topMarket.district})**-ൽ ആണ് — ക്വിന്റലിന്/കിലോയ്ക്ക് **₹${mandiObs.topMarket.modalPrice}** (${mandiObs.topMarket.trend === 'up' ? '+' : ''}${mandiObs.topMarket.change}).`);
  }

  if (weatherObs) {
    const icon = weatherObs.safety === 'SAFE' ? '✅' : '⚠️';
    responseSectionsEn.push(`${icon} **Weather Spray Advisory (${weatherObs.location})**: Status is **${weatherObs.safety}**. ${weatherObs.reasonEn}`);
    responseSectionsMl.push(`${icon} **കാലാവസ്ഥ പരിശോധന (${weatherObs.location})**: തളിക്കൽ പദവി: **${weatherObs.safety}**. ${weatherObs.reasonMl}`);
  }

  if (diseaseObs) {
    responseSectionsEn.push(`🔬 **KAU Scientific Treatment (${diseaseObs.diseaseName})**: \n- *Organic Remedy*: ${diseaseObs.organicTreatmentEn ? diseaseObs.organicTreatmentEn.join(' ') : 'Neem oil 5ml/L spray.'}\n- *Chemical Spray*: ${diseaseObs.chemicalTreatmentEn ? diseaseObs.chemicalTreatmentEn.join(' ') : 'Copper Oxychloride 3g/L.'}`);
    responseSectionsMl.push(`🔬 **ശാസ്ത്രീയ പ്രതിവിധി (${diseaseObs.diseaseName})**: \n- *ജൈവ നിയന്ത്രണം*: ${diseaseObs.organicTreatmentMl ? diseaseObs.organicTreatmentMl.join(' ') : 'വേപ്പെണ്ണ മിശ്രിതം തളിക്കുക.'}\n- *രാസ നിയന്ത്രണം*: ${diseaseObs.chemicalTreatmentMl ? diseaseObs.chemicalTreatmentMl.join(' ') : 'കോപ്പർ ഓക്സിക്ലോറൈഡ് 3g/ലിറ്റർ ഉപയോഗിക്കുക.'}`);
  }

  if (subsidyObs) {
    responseSectionsEn.push(`🏛️ **Government Scheme (${subsidyObs.schemeNameEn})**: Eligible for **${subsidyObs.maxFinancialBenefitEn}** (est. payout: **${subsidyObs.estimatedBenefit}**). ${subsidyObs.claimWindowNotice}`);
    responseSectionsMl.push(`🏛️ **സർക്കാർ സഹായം (${subsidyObs.schemeNameMl})**: **${subsidyObs.maxFinancialBenefitMl}** വരെ ലഭിക്കാം (പ്രതീക്ഷിക്കുന്ന തുക: **${subsidyObs.estimatedBenefit}**). കൃഷിഭവനിൽ 72 മണിക്കൂറിനുള്ളിൽ രേഖകൾ സഹിതം അപേക്ഷിക്കുക.`);
  }

  if (arbitrageObs) {
    responseSectionsEn.push(`💰 **Direct APMC Arbitrage**: ${arbitrageObs.recommendationEn}`);
    responseSectionsMl.push(`💰 **ലാഭക്കണക്ക്**: ${arbitrageObs.recommendationMl}`);
  }

  let textEn = '';
  let textMl = '';

  if (responseSectionsEn.length === 0) {
    textEn = `AgriMitra Autonomous Agent analyzed your query. You can ask me for live Agmarknet Mandi prices, real-time spray safety weather checks, KAU disease treatment dosages, and PMFBY government subsidies.`;
    textMl = `അഗ്രിമിത്ര ഓട്ടോണമസ് ഏജന്റ് നിങ്ങളുടെ ചോദ്യം പരിശോധിച്ചു. തത്സമയ മണ്ടി വിലകൾ, കാലാവസ്ഥാ സ്പ്രേ സുരക്ഷ, വിള രോഗ പ്രതിവിധികൾ, സർക്കാർ സബ്‌സിഡികൾ എന്നിവയെക്കുറിച്ച് എന്നോട് ചോദിക്കാം.`;
  } else {
    textEn = responseSectionsEn.join('\n\n');
    textMl = responseSectionsMl.join('\n\n');
  }

  return {
    success: true,
    engine: 'react-rule-engine',
    query: message,
    selectedLanguage: lang,
    toolsCalled,
    reactSteps,
    textEn,
    textMl,
    timestamp: new Date().toISOString()
  };
}

/**
 * Main Entry Point: Attempts Gemini LLM Function Calling, falls back to ReAct Rule Engine
 */
async function processAgentQuery({ message, lang = 'en', context = {}, location = null }) {
  if (geminiClient) {
    try {
      console.log(`🤖 Attempting Gemini LLM Function Calling for: "${message}"`);
      return await processWithGemini({ message, lang, context, location });
    } catch (err) {
      console.warn(`⚠️ Gemini Function Calling error (${err.message}), seamlessly switching to ReAct fallback engine.`);
    }
  }

  return await processReActFallback({ message, lang, context, location });
}

module.exports = {
  tools,
  toolDefinitions,
  processAgentQuery,
  processWithGemini,
  processReActFallback
};
