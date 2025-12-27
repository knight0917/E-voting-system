import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './Login'
import Home from './Home'
import AdminLogin from './AdminLogin'
import AdminDashboard from './AdminDashboard'
import Voters from './Voters'
import Candidates from './Candidates'
import Positions from './Positions'
import ElectionTitle from './ElectionTitle'
import 'bootstrap/dist/css/bootstrap.min.css'

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [user, setUser] = useState(null)

  const handleLogout = () => {
      setToken('')
      setUser(null)
      localStorage.removeItem('token')
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login setToken={setToken} setUser={setUser} />} />
        <Route path="/home" element={<Home token={token} user={user} handleLogout={handleLogout} />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/voters" element={<Voters />} />
        <Route path="/candidates" element={<Candidates />} />
        <Route path="/positions" element={<Positions />} />
        <Route path="/election-title" element={<ElectionTitle />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
