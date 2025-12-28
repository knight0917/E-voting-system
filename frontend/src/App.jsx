import { useState, useEffect, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'

// Lazy Load Components
const Login = lazy(() => import('./Login'))
const Home = lazy(() => import('./Home'))
const AdminLogin = lazy(() => import('./AdminLogin'))
const AdminDashboard = lazy(() => import('./AdminDashboard'))
const Voters = lazy(() => import('./Voters'))
const Candidates = lazy(() => import('./Candidates'))
const Positions = lazy(() => import('./Positions'))
const BallotPosition = lazy(() => import('./BallotPosition'))
const Votes = lazy(() => import('./Votes'))
const ElectionTitle = lazy(() => import('./ElectionTitle'))

// Loading Component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-950">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-slate-400 font-medium animate-pulse">Loading Application...</p>
    </div>
  </div>
);


const AppContent = () => {
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [user, setUser] = useState(null)
  
  // We need useLocation to conditionally style the footer for Home page
  // But we can't use it here if this component isn't inside BrowserRouter.
  // So we'll access it via a wrapper or hook inside the child.
  // Actually, let's just make AppContent the inner component.
  
  return (
     <InnerApp token={token} setToken={setToken} user={user} setUser={setUser} />
  )
}

const InnerApp = ({ token, setToken, user, setUser }) => {
  const location = useLocation(); // Now safe to use

  const handleLogout = () => {
      setToken('')
      setUser(null)
      localStorage.removeItem('token')
  }
  
  const isHome = location.pathname === '/home';
  
  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      <div className={`flex-grow ${isHome ? 'pb-32' : 'pb-12'}`}>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<Login setToken={setToken} setUser={setUser} />} />
            <Route path="/home" element={<Home token={token} user={user} handleLogout={handleLogout} />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/votes" element={<Votes />} />
            <Route path="/voters" element={<Voters />} />
            <Route path="/candidates" element={<Candidates />} />
            <Route path="/positions" element={<Positions />} />
            <Route path="/ballot-position" element={<BallotPosition />} />
            <Route path="/election-title" element={<ElectionTitle />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
      </div>
      <footer className={`fixed w-full text-center text-sm font-medium text-slate-500 bg-slate-950/80 backdrop-blur-sm border-t border-slate-900/50 py-3 transition-all duration-300 z-30 ${isHome ? 'bottom-24' : 'bottom-0'}`}>
         &copy; 2022 Last semester Project
      </footer>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App
