const express = require('express');
const router = express.Router();
const { processAgentQuery, toolDefinitions, tools } = require('../services/agentService');

/**
 * GET /api/agent/tools
 * Lists all active autonomous tools available to the Agentic AI
 */
router.get('/tools', (req, res) => {
  res.json({
    status: 'success',
    agentName: 'AgriMitra 360 Autonomous Agent',
    activeToolCount: toolDefinitions.length,
    tools: toolDefinitions
  });
});

/**
 * POST /api/agent/chat
 * Primary entry point for Agentic AI queries (Voice / Text)
 */
router.post('/chat', async (req, res) => {
  try {
    const { message, lang = 'en', context = {}, location = null } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty.' });
    }

    const agentResult = await processAgentQuery({
      message: message.trim(),
      lang,
      context,
      location
    });

    res.json(agentResult);
  } catch (error) {
    console.error('Agent Execution Error:', error);
    res.status(500).json({
      success: false,
      error: 'Agentic reasoning encountered an issue.',
      details: error.message
    });
  }
});

/**
 * POST /api/agent/tool-execute
 * Allows direct execution of an agent tool by name
 */
router.post('/tool-execute', async (req, res) => {
  try {
    const { toolName, args } = req.body;
    if (!tools[toolName]) {
      return res.status(404).json({ error: `Tool ${toolName} not found.` });
    }

    const result = await tools[toolName](args || {});
    res.json({
      status: 'success',
      tool: toolName,
      output: result
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
