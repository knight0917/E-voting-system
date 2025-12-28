import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'


function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/admin/login/', {
        username: username,
        password: password
      })
      localStorage.setItem('admin_token', response.data.token)
      navigate('/admin-dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    } finally {
        setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 p-8 animate-fade-in relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 via-red-500 to-orange-500"></div>
        
        <div className="text-center mb-8">
            <div className="text-6xl text-rose-500 mb-4 inline-block drop-shadow-lg">
                <i className="fa fa-user-shield"></i>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Admin Panel</h1>
            <p className="text-slate-400 mt-2">Secure Administrator Access</p>
        </div>
        
        {error && (
            <div className="bg-rose-500/10 border border-rose-500/50 text-rose-400 px-4 py-3 rounded-xl mb-6 flex items-center shadow-lg shadow-rose-900/10">
                <i className="fa fa-circle-exclamation mr-3 text-lg"></i>
                <span className="font-medium">{error}</span>
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="group">
            <input 
              type="text" 
              placeholder="Username" 
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition-all"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required 
            />
          </div>
          <div className="group">
            <input 
              type="password" 
              placeholder="Password" 
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          
          <button type="submit" className="w-full py-3.5 bg-gradient-to-r from-rose-500 to-red-600 text-white rounded-xl font-bold tracking-wide shadow-lg shadow-rose-600/20 hover:shadow-rose-600/40 hover:-translate-y-0.5 hover:from-rose-400 hover:to-red-500 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed text-lg" disabled={loading}>
            {loading ? (
                 <span><i className="fa fa-spinner fa-spin mr-2"></i> Verifying...</span>
            ) : (
                "Sign In"
            )}
          </button>
          
          <button 
            type="button" 
            className="w-full py-3.5 bg-slate-800 text-slate-400 hover:text-white rounded-xl font-semibold hover:bg-slate-700 transition-all duration-200 flex items-center justify-center gap-2 group"
            onClick={() => navigate('/')}
          >
            <i className="fa fa-arrow-left group-hover:-translate-x-1 transition-transform"></i> Back to Voter Login
          </button>
        </form>
      </div>
    </div>
  )
}

export default AdminLogin
