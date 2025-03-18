import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/auth/PrivateRoute';
import Navbar from './components/layout/Navbar';
import LandingPage from './components/landing/LandingPage';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import { Suspense, lazy } from 'react';
import './App.css';

// Lazy load components
const Dashboard = lazy(() => import('./components/dashboard/Dashboard'));
const IssueList = lazy(() => import('./components/issues/IssueList'));
const IssueDetail = lazy(() => import('./components/issues/IssueDetail'));
const IssueForm = lazy(() => import('./components/issues/IssueForm'));
const Board = lazy(() => import('./components/board/Board'));

// Loading component
const LoadingSpinner = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: '#f8f9fa'
  }}>
    <div style={{
      width: '50px',
      height: '50px',
      border: '5px solid #f3f3f3',
      borderTop: '5px solid #6c5ce7',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }} />
  </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                
                <Route 
                  path="/dashboard" 
                  element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  } 
                />
                
                <Route 
                  path="/issues" 
                  element={
                    <PrivateRoute>
                      <IssueList />
                    </PrivateRoute>
                  } 
                />
                
                <Route 
                  path="/issues/new" 
                  element={
                    <PrivateRoute>
                      <IssueForm />
                    </PrivateRoute>
                  } 
                />
                
                <Route 
                  path="/issues/:issueId" 
                  element={
                    <PrivateRoute>
                      <IssueDetail />
                    </PrivateRoute>
                  } 
                />
                
                <Route 
                  path="/board" 
                  element={
                    <PrivateRoute>
                      <Board />
                    </PrivateRoute>
                  } 
                />
              </Routes>
            </Suspense>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
