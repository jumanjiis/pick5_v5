import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PlayMatch from './pages/PlayMatch';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoutes from './pages/admin';
import AdminRoute from './components/AdminRoute';
import Leaderboard from './pages/Leaderboard';
import HowToPlay from './pages/HowToPlay';
import Contact from './pages/Contact';

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/how-to-play" element={<HowToPlay />} />
            <Route path="/contact" element={<Contact />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/*"
              element={
                <AdminRoute>
                  <AdminRoutes />
                </AdminRoute>
              }
            />
            <Route
              path="/play/:matchId"
              element={
                <ProtectedRoute>
                  <PlayMatch />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;