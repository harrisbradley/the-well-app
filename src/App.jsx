import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Dashboard from './components/Dashboard';
import Reader from './components/Reader';
import Login from './components/Login';
import Signup from './components/Signup';
import Widget from './components/Widget';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Protected Routes */}
          <Route 
            path="/" 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/reader" 
            element={
              <PrivateRoute>
                <Reader />
              </PrivateRoute>
            } 
          />
          
          {/* Public Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Public Widget Route (No Auth required) */}
          <Route path="/widget" element={<Widget />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
