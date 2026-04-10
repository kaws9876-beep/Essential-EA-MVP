#!/usr/bin/env node

require('dotenv').config();
const express = require('express');
const { OpenAI } = require('openai');

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory storage
let tasks = [];
let taskIdCounter = 1;

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

console.log('\n🚀 Starting Essential EA Backend...');
console.log('📍 PORT:', PORT);
console.log('📍 OpenAI Key:', process.env.OPENAI_API_KEY ? '✓ Set' : '✗ Missing');

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Classify task
app.post('/api/classify', async (req, res) => {
  try {
    const { taskDescription } = req.body;
    
    if (!taskDescription) {
      return res.status(400).json({ error: 'Task description required' });
    }

    const prompt = `You are a task classification AI for executives.
Classify this task as "crystal" (only the executive can do) or "bouncy" (can delegate).

Task: "${taskDescription}"

Respond ONLY with valid JSON:
{
  "classification": "crystal" or "bouncy",
  "emoji": "🔮" or "🎾",
  "urgency": "urgent", "today", "defer", or "ea_owned",
  "reason": "Why (1-2 sentences)",
  "recommendedAction": "What to do (1 sentence)",
  "confidence": 0.95
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a task classification AI. Always respond with valid JSON only.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 300
    });

    let content = response.choices[0].message.content.trim();
    
    // Remove markdown if present
    if (content.includes('```')) {
      content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    }

    const result = JSON.parse(content);

    // Save task
    const task = {
      id: taskIdCounter++,
      description: taskDescription,
      ...result,
      createdAt: new Date().toISOString()
    };

    tasks.push(task);

    res.json({
      success: true,
      task,
      classification: result
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({
      error: error.message || 'Failed to classify',
      success: false
    });
  }
});

// Get history
app.get('/api/history', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const history = tasks.slice(-limit).reverse();
    
    res.json({
      success: true,
      tasks: history,
      count: history.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message, success: false });
  }
});

// Get stats
app.get('/api/stats', (req, res) => {
  try {
    const crystalCount = tasks.filter(t => t.classification === 'crystal').length;
    const bouncyCount = tasks.filter(t => t.classification === 'bouncy').length;
    const avgConfidence = tasks.length > 0
      ? (tasks.reduce((sum, t) => sum + (t.confidence || 0), 0) / tasks.length).toFixed(2)
      : 0;

    res.json({
      success: true,
      stats: {
        totalTasks: tasks.length,
        crystal: crystalCount,
        bouncy: bouncyCount,
        avgAccuracy: (parseFloat(avgConfidence) * 100).toFixed(1)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message, success: false });
  }
});

// Export CSV
app.get('/api/export', (req, res) => {
  try {
    const headers = ['Description', 'Classification', 'Urgency', 'Reason', 'Recommended Action', 'Confidence', 'Created At'];
    const rows = tasks.map(task => [
      `"${task.description.replace(/"/g, '""')}"`,
      task.classification,
      task.urgency,
      `"${task.reason.replace(/"/g, '""')}"`,
      `"${task.recommendedAction.replace(/"/g, '""')}"`,
      task.confidence,
      task.createdAt
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="tasks.csv"');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: error.message, success: false });
  }
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n✅ Backend running on port ${PORT}`);
  console.log(`📍 Health: http://localhost:${PORT}/api/health`);
  console.log(`📍 API: http://localhost:${PORT}/api/classify\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down...');
  server.close(() => process.exit(0));
});
