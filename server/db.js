// In-memory task storage (for MVP testing)
// In production, replace with a real database like PostgreSQL or MongoDB

let tasks = [];
let taskIdCounter = 1;

console.log('✓ In-memory database initialized');

// Helper function to save a task
function saveTask(taskData) {
  try {
    const task = {
      id: taskIdCounter++,
      ...taskData,
      createdAt: new Date().toISOString()
    };
    
    tasks.push(task);
    console.log(`✓ Task saved (ID: ${task.id}, Total: ${tasks.length})`);
    
    return task;
  } catch (error) {
    console.error('❌ Error saving task:', error);
    throw error;
  }
}

// Helper function to get task history
function getTaskHistory(limit = 50) {
  try {
    // Return tasks in reverse order (newest first)
    const history = tasks.slice(-limit).reverse();
    console.log(`✓ Retrieved ${history.length} tasks from history`);
    return history;
  } catch (error) {
    console.error('❌ Error getting history:', error);
    throw error;
  }
}

// Helper function to get statistics
function getStats() {
  try {
    const crystalCount = tasks.filter(t => t.classification === 'crystal').length;
    const bouncyCount = tasks.filter(t => t.classification === 'bouncy').length;
    const avgConfidence = tasks.length > 0
      ? (tasks.reduce((sum, t) => sum + (t.confidence || 0), 0) / tasks.length).toFixed(2)
      : 0;

    const stats = {
      totalTasks: tasks.length,
      crystal: crystalCount,
      bouncy: bouncyCount,
      avgAccuracy: (parseFloat(avgConfidence) * 100).toFixed(1),
      byUrgency: {
        urgent: tasks.filter(t => t.urgency === 'urgent').length,
        today: tasks.filter(t => t.urgency === 'today').length,
        defer: tasks.filter(t => t.urgency === 'defer').length,
        ea_owned: tasks.filter(t => t.urgency === 'ea_owned').length
      }
    };
    
    console.log(`✓ Stats retrieved: ${stats.totalTasks} total, ${stats.crystal} crystal, ${stats.bouncy} bouncy`);
    return stats;
  } catch (error) {
    console.error('❌ Error getting stats:', error);
    throw error;
  }
}

module.exports = {
  saveTask,
  getTaskHistory,
  getStats
};
