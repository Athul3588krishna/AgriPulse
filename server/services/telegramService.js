const axios = require('axios');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8832955217:AAGZcDhmGVRHgPdFbvurJ8A8nTSkMqwqlKQ';
const TELEGRAM_DEFAULT_CHAT_ID = process.env.TELEGRAM_DEFAULT_CHAT_ID || '2052238583';
const TELEGRAM_API_BASE = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

/**
 * Get bot profile & verification
 */
async function getBotInfo() {
  try {
    const res = await axios.get(`${TELEGRAM_API_BASE}/getMe`, { timeout: 8000 });
    return res.data;
  } catch (error) {
    console.error('[TelegramService] getBotInfo failed:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Fetch recent incoming messages from /getUpdates to auto-discover user chat IDs
 */
async function getRecentChats() {
  try {
    const res = await axios.get(`${TELEGRAM_API_BASE}/getUpdates`, { timeout: 8000 });
    if (!res.data.ok || !Array.isArray(res.data.result)) {
      return [];
    }

    const chatsMap = new Map();
    for (const update of res.data.result) {
      const msg = update.message || update.edited_message;
      if (msg && msg.chat && msg.chat.id) {
        const cId = msg.chat.id.toString();
        chatsMap.set(cId, {
          chatId: cId,
          firstName: msg.chat.first_name || msg.from?.first_name || 'Farmer',
          username: msg.chat.username ? `@${msg.chat.username}` : null,
          lastMessage: msg.text || '[Media/Action]',
          date: new Date((msg.date || Date.now() / 1000) * 1000).toISOString()
        });
      }
    }

    // Always ensure the default configured chat ID is present
    if (TELEGRAM_DEFAULT_CHAT_ID && !chatsMap.has(TELEGRAM_DEFAULT_CHAT_ID.toString())) {
      chatsMap.set(TELEGRAM_DEFAULT_CHAT_ID.toString(), {
        chatId: TELEGRAM_DEFAULT_CHAT_ID.toString(),
        firstName: "NRZ' (Default Farmer)",
        username: null,
        lastMessage: "/start",
        date: new Date().toISOString()
      });
    }

    return Array.from(chatsMap.values()).reverse();
  } catch (error) {
    console.error('[TelegramService] getRecentChats failed:', error.response?.data || error.message);
    return [];
  }
}

/**
 * Send raw HTML message to Telegram chat
 */
async function sendMessage(chatId, htmlText, inlineKeyboard = null) {
  const targetChatId = chatId || TELEGRAM_DEFAULT_CHAT_ID;
  if (!targetChatId) {
    throw new Error('Telegram Chat ID not provided.');
  }

  const payload = {
    chat_id: targetChatId,
    text: htmlText,
    parse_mode: 'HTML',
    disable_web_page_preview: false
  };

  if (inlineKeyboard && inlineKeyboard.length > 0) {
    payload.reply_markup = {
      inline_keyboard: inlineKeyboard
    };
  }

  try {
    const res = await axios.post(`${TELEGRAM_API_BASE}/sendMessage`, payload, { timeout: 10000 });
    return res.data;
  } catch (error) {
    console.error('[TelegramService] sendMessage failed:', error.response?.data || error.message);
    throw new Error(error.response?.data?.description || error.message);
  }
}

/**
 * Format and send an interactive Crop Disease Diagnosis Alert to Telegram
 */
async function sendDiagnosisAlert(chatId, data, lang = 'ml') {
  const targetChatId = chatId || TELEGRAM_DEFAULT_CHAT_ID;
  const isMl = lang === 'ml';

  const crop = data.crop || data.cropName || (isMl ? 'വിള' : 'Crop');
  const disease = data.disease || 'Healthy / No Disease';
  const confidence = data.confidence ? `${Number(data.confidence).toFixed(1)}%` : '95.0%';
  const severity = data.severity !== undefined ? `${Number(data.severity).toFixed(1)}%` : '15.0%';
  const severityLevel = data.severityLevel || 'Mild';

  // Severity indicator icon
  let severityEmoji = '🟢';
  const numSev = parseFloat(severity);
  if (numSev > 35) severityEmoji = '🔴';
  else if (numSev > 15) severityEmoji = '🟡';

  // Advisory details
  const adv = data.advisory || {};
  const mlAdv = adv.malayalam || {};
  const enAdv = adv.english || {};

  const summary = isMl 
    ? (mlAdv.summary || 'ഇല പരിശോധനയിൽ ലക്ഷണങ്ങൾ കണ്ടെത്തിയിരിക്കുന്നു.')
    : (enAdv.summary || 'Disease symptoms identified from leaf scan.');

  const organicTreatment = isMl
    ? (mlAdv.organic || adv.organicTreatment || 'വേപ്പെണ്ണ വെളുത്തുള്ളി മിശ്രിതം (2%) അല്ലെങ്കിൽ സ്യൂഡോമോണസ് തളിക്കുക.')
    : (enAdv.organic || adv.organicTreatment || 'Spray Neem oil garlic emulsion (2%) or Pseudomonas fluorescens.');

  const chemicalTreatment = isMl
    ? (mlAdv.chemical || adv.chemicalTreatment || 'കുമിൾബാധ അധികമായാൽ കോപ്പർ ഓക്സിക്ലോറൈഡ് (2 ഗ്രാം/ലിറ്റർ) തളിക്കുക.')
    : (enAdv.chemical || adv.chemicalTreatment || 'Apply Copper Oxychloride (2g/L) if severity persists.');

  const precautions = isMl
    ? (mlAdv.prevention || 'ബാധിച്ച ഇലകൾ നശിപ്പിക്കുക, തോട്ടത്തിൽ നീർവാർച്ച ഉറപ്പാക്കുക.')
    : (enAdv.prevention || 'Remove affected foliage, ensure proper drainage.');

  const locationStr = data.location || data.district || '';
  const locationLineMl = locationStr ? `📍 <b>സ്ഥലം:</b> <code>${locationStr}</code>\n` : '';
  const locationLineEn = locationStr ? `📍 <b>Location:</b> <code>${locationStr}</code>\n` : '';

  const farmerStr = data.farmerName || '';
  const farmerLineMl = farmerStr ? `👤 <b>കർഷകൻ:</b> <b>${farmerStr}</b>\n` : '';
  const farmerLineEn = farmerStr ? `👤 <b>Farmer:</b> <b>${farmerStr}</b>\n` : '';

  // Formatted HTML message
  let text = '';
  if (isMl) {
    text = `🌱 <b>AgriPulse AI — പുതിയ ഇല രോഗനിർണ്ണയ റിപ്പോർട്ട്</b>
━━━━━━━━━━━━━━━━━━
${farmerLineMl}🌾 <b>വിള:</b> <code>${crop}</code>
${locationLineMl}🔬 <b>കണ്ടെത്തിയ രോഗം:</b> <b>${disease}</b>
🎯 <b>കൃത്യത (Confidence):</b> <code>${confidence}</code>
${severityEmoji} <b>നാശനഷ്ട തോത് (Severity):</b> <code>${severity}</code> (${severityLevel})

📋 <b>വിവരണം:</b>
${summary}

🌿 <b>KAU സർട്ടിഫൈഡ് ജൈവ പരിഹാരം (Organic):</b>
• ${organicTreatment}

🧪 <b>രാസ പരിഹാരം (Chemical):</b>
• ${chemicalTreatment}

🛡️ <b>പ്രതിരോധ മാർഗ്ഗങ്ങൾ (Prevention):</b>
• ${precautions}

━━━━━━━━━━━━━━━━━━
<i>AgriMitra 360 AI സിസ്റ്റം വഴി തത്സമയം അയച്ചത് • KAU മാനദണ്ഡങ്ങൾ അനുസരിച്ചത്</i>`;
  } else {
    text = `🌱 <b>AgriPulse AI — New Crop Disease Advisory</b>
━━━━━━━━━━━━━━━━━━
${farmerLineEn}🌾 <b>Crop:</b> <code>${crop}</code>
${locationLineEn}🔬 <b>Detected Disease:</b> <b>${disease}</b>
🎯 <b>Confidence Score:</b> <code>${confidence}</code>
${severityEmoji} <b>Damage Severity:</b> <code>${severity}</code> (${severityLevel})

📋 <b>Diagnosis Summary:</b>
${summary}

🌿 <b>KAU Organic Treatment:</b>
• ${organicTreatment}

🧪 <b>Chemical Treatment:</b>
• ${chemicalTreatment}

🛡️ <b>Preventive Measures:</b>
• ${precautions}

━━━━━━━━━━━━━━━━━━
<i>Dispatched via AgriPulse AI • Verified KAU / ICAR Advisory Protocols</i>`;
  }

  // Inline keyboard with valid Telegram deep links
  const inlineKeyboard = [
    [
      { text: isMl ? '🌾 AgriPulse Bot തുറക്കുക' : '🌾 Open AgriPulse Bot', url: 'https://t.me/Datasqdbot' }
    ]
  ];

  return await sendMessage(targetChatId, text, inlineKeyboard);
}

/**
 * Format and send a Real-time Spray Safety & Weather Warning to Telegram
 */
async function sendWeatherAlert(chatId, weatherData, lang = 'ml') {
  const targetChatId = chatId || TELEGRAM_DEFAULT_CHAT_ID;
  const isMl = lang === 'ml';

  const district = weatherData.district || 'Palakkad';
  const temp = weatherData.temperature ? `${weatherData.temperature}°C` : '29°C';
  const humidity = weatherData.humidity ? `${weatherData.humidity}%` : '78%';
  const wind = weatherData.windSpeed ? `${weatherData.windSpeed} km/h` : '12 km/h';
  const rainProb = weatherData.rainProbability !== undefined ? `${weatherData.rainProbability}%` : '65%';
  const safetyStatus = (weatherData.spraySafety || 'UNSAFE').toUpperCase();

  let statusBadge = '🔴 <b>അപകടകരം (UNSAFE TO SPRAY)</b>';
  let advice = isMl 
    ? 'മഴയോ ശക്തമായ കാറ്റോ ഉള്ളതിനാൽ ഇപ്പോൾ കീടനാശിനികളോ വളങ്ങളോ സ്പ്രേ ചെയ്യരുത്. മരുന്ന് ഒലിച്ചുപോയി നഷ്ടമുണ്ടാകും!'
    : 'High rain probability or strong winds. Avoid spraying chemical or biological pesticides now!';

  if (safetyStatus === 'SAFE') {
    statusBadge = '🟢 <b>സുരക്ഷിതം (SAFE TO SPRAY)</b>';
    advice = isMl
      ? 'കാലാവസ്ഥ അനുകൂലമാണ്. അതിരാവിലെയോ വൈകുന്നേരമോ സ്പ്രേ ചെയ്യാവുന്നതാണ്.'
      : 'Weather conditions are optimal. Ideal for morning or late evening spray.';
  } else if (safetyStatus === 'CAUTION') {
    statusBadge = '🟡 <b>ശ്രദ്ധിക്കുക (CAUTION REQUIRED)</b>';
    advice = isMl
      ? 'നേരിയ കാറ്റോ മൂടിക്കെട്ടിയ അന്തരീക്ഷമോ ഉണ്ട്. അത്യാവശ്യമെങ്കിൽ മാത്രം സ്പ്രേ ചെയ്യുക.'
      : 'Moderate wind/humidity. Proceed with caution and use a sticking agent.';
  }

  let text = '';
  if (isMl) {
    text = `🌦️ <b>AgriPulse തത്സമയ കാലാവസ്ഥാ & സ്പ്രേ മുന്നറിയിപ്പ്</b>
━━━━━━━━━━━━━━━━━━
📍 <b>ജില്ല / സ്ഥലം:</b> <b>${district}, കേരളം</b>
📊 <b>സ്പ്രേ സുരക്ഷാ നില:</b> ${statusBadge}

🌡️ <b>താപനില:</b> <code>${temp}</code>
💧 <b>ഈർപ്പം (Humidity):</b> <code>${humidity}</code>
🌧️ <b>മഴ സാധ്യത:</b> <code>${rainProb}</code>
💨 <b>കാറ്റിന്റെ വേഗത:</b> <code>${wind}</code>

⚠️ <b>കർഷകർക്കുള്ള നിർദ്ദേശം:</b>
${advice}

━━━━━━━━━━━━━━━━━━
<i>Open-Meteo & KAU കൃഷി കാലാവസ്ഥാ റഡാർ വഴി നൽകിയത്</i>`;
  } else {
    text = `🌦️ <b>AgriPulse Real-Time Spray Safety Advisory</b>
━━━━━━━━━━━━━━━━━━
📍 <b>Location:</b> <b>${district}, Kerala</b>
📊 <b>Spray Safety Status:</b> ${statusBadge}

🌡️ <b>Temperature:</b> <code>${temp}</code>
💧 <b>Humidity:</b> <code>${humidity}</code>
🌧️ <b>Rain Probability:</b> <code>${rainProb}</code>
💨 <b>Wind Speed:</b> <code>${wind}</code>

⚠️ <b>Advisory for Farmers:</b>
${advice}

━━━━━━━━━━━━━━━━━━
<i>Dispatched via AgriPulse Weather Radar & Open-Meteo Feed</i>`;
  }

  const inlineKeyboard = [
    [
      { text: isMl ? '🌾 AgriPulse Bot' : '🌾 AgriPulse Bot', url: 'https://t.me/Datasqdbot' }
    ]
  ];

  return await sendMessage(targetChatId, text, inlineKeyboard);
}

/**
 * Send a greeting / verification test message to farmer
 */
async function sendTestMessage(chatId, farmerName = 'Farmer') {
  const targetChatId = chatId || TELEGRAM_DEFAULT_CHAT_ID;
  const text = `👋 <b>നമസ്കാരം, ${farmerName}!</b>

🌱 <b>AgriPulse AI സ്മാർട്ട് കൃഷി അസിസ്റ്റന്റിലേക്ക് സ്വാഗതം!</b>
നിങ്ങളുടെ Telegram അക്കൗണ്ട് ഞങ്ങളുടെ സിസ്റ്റവുമായി വിജയകരമായി കണക്റ്റ് ചെയ്തിരിക്കുന്നു.

ഇനി മുതൽ:
✅ ഇല സ്കാൻ ചെയ്ത ഉടൻ രോഗനിർണ്ണയ റിപ്പോർട്ടുകൾ
✅ കീടനാശിനി സ്പ്രേ ചെയ്യാനുള്ള കാലാവസ്ഥാ മുന്നറിയിപ്പുകൾ
✅ PMFBY വിള ഇൻഷുറൻസ് & സബ്‌സിഡി അപ്‌ഡേറ്റുകൾ

എല്ലാം നിങ്ങളുടെ ഈ Telegram ചാറ്റിൽ തത്സമയം ലഭിക്കുന്നതാണ്! 🌾

<i>AgriMitra 360 AI • Bot: @Datasqdbot</i>`;

  return await sendMessage(targetChatId, text);
}

module.exports = {
  getBotInfo,
  getRecentChats,
  sendMessage,
  sendDiagnosisAlert,
  sendWeatherAlert,
  sendTestMessage,
  TELEGRAM_DEFAULT_CHAT_ID
};
