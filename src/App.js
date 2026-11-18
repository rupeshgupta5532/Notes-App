import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Notes from './components/Notes';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-indigo-50/50 py-10 px-4 text-slate-800">
        <Routes>
          <Route path="/" element={<Notes />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
