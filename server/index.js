require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { classifyTask } = require('./ai');
const { saveTask, getTaskHistory, getStats } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Main classification endpoint
app.post('/api/classify', async (req, res) => {
  try {
    const { taskDescription } = req.body;

    if (!taskDescription) {
      return res.status(400).json({ error: 'Task description is required' });
    }

    // Classify the task using AI
    const classification = await classifyTask(taskDescription);

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

    res.json({
      success: true,
      task: savedTask,
      classification
    });
  } catch (error) {
    console.error('Classification error:', error);
    res.status(500).json({
      error: error.message || 'Failed to classify task',
      success: false
    });
  }
});

// Get task history endpoint
app.get('/api/history', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 50;
    const history = await getTaskHistory(limit);
    res.json({
      success: true,
      tasks: history,
      count: history.length
    });
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch history',
      success: false
    });
  }
});

// Get statistics endpoint
app.get('/api/stats', async (req, res) => {
  try {
    const stats = await getStats();
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch stats',
      success: false
    });
  }
});

// Export as CSV endpoint
app.get('/api/export', async (req, res) => {
  try {
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

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="tasks.csv"');
    res.send(csv);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({
      error: error.message || 'Failed to export tasks',
      success: false
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Essential EA Backend running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📍 API: http://localhost:${PORT}/api/classify`);
});
