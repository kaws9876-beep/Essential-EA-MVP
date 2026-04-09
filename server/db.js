const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'tasks.db');
const db = new Database(dbPath);

console.log('Connected to SQLite database at', dbPath);

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    description TEXT NOT NULL,
    classification TEXT NOT NULL,
    emoji TEXT NOT NULL,
    urgency TEXT NOT NULL,
    reason TEXT NOT NULL,
    recommendedAction TEXT NOT NULL,
    confidence REAL NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

console.log('Tasks table ready');

// Helper function to save a task
function saveTask(taskData) {
  try {
    const stmt = db.prepare(`
      INSERT INTO tasks (description, classification, emoji, urgency, reason, recommendedAction, confidence)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      taskData.description,
      taskData.classification,
      taskData.emoji,
      taskData.urgency,
      taskData.reason,
      taskData.recommendedAction,
      taskData.confidence
    );
    
    return { id: result.lastInsertRowid, ...taskData };
  } catch (error) {
    throw error;
  }
}

// Helper function to get task history
function getTaskHistory(limit = 50) {
  try {
    const stmt = db.prepare(`
      SELECT * FROM tasks ORDER BY createdAt DESC LIMIT ?
    `);
    return stmt.all(limit) || [];
  } catch (error) {
    throw error;
  }
}

// Helper function to get statistics
function getStats() {
  try {
    const stmt = db.prepare(`
      SELECT 
        classification,
        COUNT(*) as count,
        AVG(confidence) as avgConfidence
      FROM tasks
      GROUP BY classification
    `);
    
    const rows = stmt.all();
    const stats = {
      crystal: 0,
      bouncy: 0,
      total: 0,
      avgAccuracy: 0
    };
    
    if (rows && rows.length > 0) {
      rows.forEach(row => {
        if (row.classification === 'crystal') {
          stats.crystal = row.count;
        } else if (row.classification === 'bouncy') {
          stats.bouncy = row.count;
        }
      });
      stats.total = stats.crystal + stats.bouncy;
      stats.avgAccuracy = (rows.reduce((sum, r) => sum + r.avgConfidence, 0) / rows.length * 100).toFixed(1);
    }
    
    return stats;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  db,
  saveTask,
  getTaskHistory,
  getStats
};
