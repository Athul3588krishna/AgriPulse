const express = require('express');
const router = express.Router();
const telegramService = require('../services/telegramService');

// 1. GET /api/telegram/status - Get bot connectivity and info
router.get('/status', async (req, res) => {
  try {
    const info = await telegramService.getBotInfo();
    res.json({
      success: true,
      bot: info.result,
      defaultChatId: telegramService.TELEGRAM_DEFAULT_CHAT_ID,
      botUrl: `https://t.me/${info.result.username || 'Datasqdbot'}`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to connect to Telegram Bot API',
      error: error.message
    });
  }
});

// 2. GET /api/telegram/recent-chats - List recent chats who started the bot
router.get('/recent-chats', async (req, res) => {
  try {
    const chats = await telegramService.getRecentChats();
    res.json({
      success: true,
      chats,
      defaultChatId: telegramService.TELEGRAM_DEFAULT_CHAT_ID
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to load recent chats',
      error: error.message
    });
  }
});

// 3. POST /api/telegram/send-diagnosis - Dispatch diagnosis report
router.post('/send-diagnosis', async (req, res) => {
  try {
    const { chatId, crop, disease, confidence, severity, severityLevel, advisory, lang, location } = req.body;
    const targetChat = chatId || telegramService.TELEGRAM_DEFAULT_CHAT_ID;

    if (!targetChat) {
      return res.status(400).json({
        success: false,
        message: 'Telegram Chat ID is required. Please send /start to @Datasqdbot first.'
      });
    }

    const result = await telegramService.sendDiagnosisAlert(targetChat, {
      crop,
      disease,
      confidence,
      severity,
      severityLevel,
      advisory,
      location
    }, lang || 'ml');

    res.json({
      success: true,
      message: 'Diagnosis report dispatched to Telegram successfully!',
      result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to dispatch Telegram message'
    });
  }
});

// 4. POST /api/telegram/send-weather - Dispatch spray warning
router.post('/send-weather', async (req, res) => {
  try {
    const { chatId, district, temperature, humidity, windSpeed, rainProbability, spraySafety, lang } = req.body;
    const targetChat = chatId || telegramService.TELEGRAM_DEFAULT_CHAT_ID;

    const result = await telegramService.sendWeatherAlert(targetChat, {
      district,
      temperature,
      humidity,
      windSpeed,
      rainProbability,
      spraySafety
    }, lang || 'ml');

    res.json({
      success: true,
      message: 'Weather spray advisory dispatched to Telegram successfully!',
      result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to dispatch Weather advisory'
    });
  }
});

// 5. POST /api/telegram/send-test - Send test message
router.post('/send-test', async (req, res) => {
  try {
    const { chatId, name } = req.body;
    const targetChat = chatId || telegramService.TELEGRAM_DEFAULT_CHAT_ID;

    const result = await telegramService.sendTestMessage(targetChat, name || 'Farmer');
    res.json({
      success: true,
      message: 'Test message sent to Telegram successfully!',
      result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send test message'
    });
  }
});

module.exports = router;
