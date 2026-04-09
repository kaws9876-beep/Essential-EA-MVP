import { useState } from 'react';
import TaskClassifier from './pages/TaskClassifier';
import Landing from './pages/Landing';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('landing');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {currentPage === 'landing' ? (
        <Landing onStart={() => setCurrentPage('classifier')} />
      ) : (
        <TaskClassifier onBack={() => setCurrentPage('landing')} />
      )}
    </div>
  );
}

export default App;
