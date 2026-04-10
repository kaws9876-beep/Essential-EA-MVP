require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { classifyTask } = require('./ai');
const { saveTask, getTaskHistory, getStats } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

console.log('🚀 Starting Essential EA Backend...');
console.log('📍 PORT:', PORT);
console.log('📍 NODE_ENV:', process.env.NODE_ENV);
console.log('📍 OpenAI API Key:', process.env.OPENAI_API_KEY ? '✓ Set' : '✗ Missing');

// Middleware
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  console.log('✓ Health check passed');
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Main classification endpoint
app.post('/api/classify', async (req, res) => {
  try {
    console.log('📝 Classification request received');
    const { taskDescription } = req.body;

    if (!taskDescription) {
      console.warn('⚠️ Missing taskDescription');
      return res.status(400).json({ error: 'Task description is required' });
    }

    console.log('🤖 Classifying task:', taskDescription.substring(0, 50) + '...');
    
    // Classify the task using AI
    const classification = await classifyTask(taskDescription);
    console.log('✓ Classification complete:', classification.classification);

    // Save to database
    const savedTask = await saveTask({
      description: taskDescription,
      classification: classification.classification,
      emoji: classification.emoji,
      urgency: classification.urgency,
      reason: classification.reason,
      recommendedAction: classification.recommendedAction,
      confidence: classification.confidence
    });

    console.log('✓ Task saved to database');

    res.json({
      success: true,
      task: savedTask,
      classification
    });
  } catch (error) {
    console.error('❌ Classification error:', error.message);
    res.status(500).json({
      error: error.message || 'Failed to classify task',
      success: false
    });
  }
});

// Get task history endpoint
app.get('/api/history', async (req, res) => {
  try {
    console.log('📚 History request received');
    const limit = req.query.limit ? parseInt(req.query.limit) : 50;
    const history = await getTaskHistory(limit);
    console.log(`✓ Retrieved ${history.length} tasks from history`);
    res.json({
      success: true,
      tasks: history,
      count: history.length
    });
  } catch (error) {
    console.error('❌ History error:', error.message);
    res.status(500).json({
      error: error.message || 'Failed to fetch history',
      success: false
    });
  }
});

// Get statistics endpoint
app.get('/api/stats', async (req, res) => {
  try {
    console.log('📊 Stats request received');
    const stats = await getStats();
    console.log('✓ Stats retrieved');
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('❌ Stats error:', error.message);
    res.status(500).json({
      error: error.message || 'Failed to fetch stats',
      success: false
    });
  }
});

// Export as CSV endpoint
app.get('/api/export', async (req, res) => {
  try {
    console.log('📥 Export request received');
    const history = await getTaskHistory(1000);
    
    // Create CSV
    const headers = ['Description', 'Classification', 'Urgency', 'Reason', 'Recommended Action', 'Confidence', 'Created At'];
    const rows = history.map(task => [
      `"${task.description.replace(/"/g, '""')}"`,
      task.classification,
      task.urgency,
      `"${task.reason.replace(/"/g, '""')}"`,
      `"${task.recommendedAction.replace(/"/g, '""')}"`,
      task.confidence,
      task.createdAt
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    console.log(`✓ CSV exported with ${history.length} tasks`);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="tasks.csv"');
    res.send(csv);
  } catch (error) {
    console.error('❌ Export error:', error.message);
    res.status(500).json({
      error: error.message || 'Failed to export tasks',
      success: false
    });
  }
});

// 404 handler
app.use((req, res) => {
  console.warn(`⚠️ 404 Not Found: ${req.method} ${req.path}`);
  res.status(404).json({
    error: 'Not Found',
    path: req.path
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`\n✅ Essential EA Backend is running!`);
  console.log(`📍 Server: http://localhost:${PORT}`);
  console.log(`📍 Health: http://localhost:${PORT}/api/health`);
  console.log(`📍 API: http://localhost:${PORT}/api/classify\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📍 SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('📍 HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('📍 SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('📍 HTTP server closed');
    process.exit(0);
  });
});
