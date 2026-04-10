import { useState, useEffect } from 'react';

const API_URL = 'https://essential-ea-app-production.up.railway.app';

export default function TaskClassifier({ onBack }) {
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('classify');

  // Load history and stats on mount
  useEffect(() => {
    loadHistory();
    loadStats();
  }, []);

  const loadHistory = async () => {
    try {
      const res = await fetch(`${API_URL}/api/history?limit=20`);
      const data = await res.json();
      if (data.success) {
        setHistory(data.tasks || []);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  };

  const loadStats = async () => {
    try {
      const res = await fetch(`${API_URL}/api/stats`);
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const handleClassify = async (e) => {
    e.preventDefault();
    if (!input.trim()) {
      setError('Please enter a task description');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`${API_URL}/api/classify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskDescription: input }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to classify task');
      }

      setResult(data.classification);
      setInput('');
      await loadHistory();
      await loadStats();
      setActiveTab('result');
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const res = await fetch(`${API_URL}/api/export`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tasks-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to export tasks');
    }
  };

  return (
    <div className="min-h-screen py-6 px-4 md:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="text-slate-400 hover:text-white transition-colors text-2xl"
            >
              ←
            </button>
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              🔮 Crystal Ball Classifier
            </h1>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Left Column - Input & Form */}
          <div className="md:col-span-2">
            <div className="bg-slate-800 bg-opacity-50 backdrop-blur p-6 rounded-lg border border-slate-700 mb-6">
              <h2 className="text-xl font-bold text-white mb-4">Classify a Task</h2>
              <form onSubmit={handleClassify}>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Paste a task or describe what needs to be done..."
                  className="w-full h-32 md:h-40 bg-slate-700 text-white placeholder-slate-400 rounded-lg p-4 border border-slate-600 focus:border-blue-500 focus:outline-none resize-none"
                />
                <div className="flex gap-3 mt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                  >
                    {loading ? '⏳ Analyzing...' : '✨ Classify Task'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setInput('')}
                    className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </form>

              {error && (
                <div className="mt-4 p-4 bg-red-900 bg-opacity-50 border border-red-700 rounded-lg text-red-200">
                  {error}
                </div>
              )}
            </div>

            {/* Result Display */}
            {result && (
              <div className="bg-slate-800 bg-opacity-50 backdrop-blur p-6 rounded-lg border border-slate-700 mb-6">
                <h2 className="text-xl font-bold text-white mb-4">Classification Result</h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{result.emoji}</span>
                    <div>
                      <p className="text-slate-400 text-sm">Classification</p>
                      <p className="text-2xl font-bold text-white capitalize">
                        {result.classification === 'crystal' ? 'Crystal Ball' : 'Bouncy Ball'}
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-slate-700">
                    <div>
                      <p className="text-slate-400 text-sm mb-1">Urgency</p>
                      <p className="text-white font-semibold capitalize">
                        {result.urgency}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm mb-1">Confidence</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-700 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all"
                            style={{ width: `${result.confidence * 100}%` }}
                          />
                        </div>
                        <span className="text-white font-semibold">
                          {(result.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-700">
                    <p className="text-slate-400 text-sm mb-2">Reason</p>
                    <p className="text-white">{result.reason}</p>
                  </div>

                  <div className="pt-4 border-t border-slate-700">
                    <p className="text-slate-400 text-sm mb-2">Recommended Action</p>
                    <p className="text-white">{result.recommendedAction}</p>
                  </div>
                </div>
              </div>
            )}

            {/* History */}
            {history.length > 0 && (
              <div className="bg-slate-800 bg-opacity-50 backdrop-blur p-6 rounded-lg border border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">Recent Classifications</h2>
                  <button
                    onClick={handleExport}
                    className="text-sm bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded transition-colors"
                  >
                    📥 Export CSV
                  </button>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {history.map((task, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-700 bg-opacity-50 p-3 rounded-lg border border-slate-600 hover:border-slate-500 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl flex-shrink-0">{task.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm truncate">{task.description}</p>
                          <p className="text-slate-400 text-xs mt-1">
                            {task.urgency} • {(task.confidence * 100).toFixed(0)}% confident
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Stats & Info */}
          <div className="md:col-span-1">
            {/* Statistics */}
            {stats && (
              <div className="bg-slate-800 bg-opacity-50 backdrop-blur p-6 rounded-lg border border-slate-700 mb-6">
                <h2 className="text-lg font-bold text-white mb-4">Your Stats</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-slate-400 text-sm">Total Tasks</p>
                    <p className="text-3xl font-bold text-blue-400">{stats.total}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-slate-400 text-xs">🔮 Crystal</p>
                      <p className="text-2xl font-bold text-white">{stats.crystal}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs">🎾 Bouncy</p>
                      <p className="text-2xl font-bold text-white">{stats.bouncy}</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-700">
                    <p className="text-slate-400 text-sm">Avg Accuracy</p>
                    <p className="text-2xl font-bold text-green-400">{stats.avgAccuracy}%</p>
                  </div>
                </div>
              </div>
            )}

            {/* Info Box */}
            <div className="bg-slate-800 bg-opacity-50 backdrop-blur p-6 rounded-lg border border-slate-700">
              <h3 className="font-bold text-white mb-3">How it works</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>✓ Paste any task or describe what needs doing</li>
                <li>✓ AI analyzes and classifies instantly</li>
                <li>✓ Get reasoning and recommended actions</li>
                <li>✓ Export all tasks as CSV</li>
                <li>✓ No login required</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
