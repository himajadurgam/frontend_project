// src/App.js
import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { theme } from './theme';
import { AppProvider, useApp } from './context/AppContext';

// Import components
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import TeacherDashboard from './components/TeacherDashboard';
import StudentDashboard from './components/StudentDashboard';
import LoadingSpinner from './components/LoadingSpinner';

function AppContent() {
  const { user, userRole, loading } = useApp();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={!user ? <LandingPage /> : <Navigate to="/dashboard" />} 
        />
        <Route 
          path="/auth" 
          element={!user ? <AuthPage /> : <Navigate to="/dashboard" />} 
        />
        <Route 
          path="/teacher" 
          element={user ? <TeacherDashboard /> : <Navigate to="/auth" />} 
        />
        <Route 
          path="/student" 
          element={user ? <StudentDashboard /> : <Navigate to="/auth" />} 
        />
        <Route 
          path="/dashboard" 
          element={
            user ? (
              userRole === 'teacher' ? <Navigate to="/teacher" /> : <Navigate to="/student" />
            ) : (
              <Navigate to="/auth" />
            )
          } 
        />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </Box>
    </ThemeProvider>
  );
}

export default App;
