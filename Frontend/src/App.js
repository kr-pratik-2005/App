import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import DailyReport from './pages/DailyReport';
import ThemeManagement from './pages/ThemeManagement';
import Report from './pages/Report';
import Login from './pages/Login';
import { auth } from './firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useState, useEffect } from 'react';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return <p>Loading...</p>; // Show loading screen while checking auth
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={user ? <Home /> : <Navigate to="/login" />} />
        <Route path="/daily-report" element={user ? <DailyReport /> : <Navigate to="/login" />} />
        <Route path="/theme-management" element={user ? <ThemeManagement /> : <Navigate to="/login" />} />
        <Route path="/report" element={user ? <Report /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
