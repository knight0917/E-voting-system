import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'


function Login({ setToken, setUser }) {
  const [voterId, setVoterId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      // Intentional delay for better UX feel (optional, but nice)
      // await new Promise(r => setTimeout(r, 800)); 
      
      const response = await axios.post('http://127.0.0.1:8000/api/login/', {
        voter_id: voterId,
        password: password
      })
      setToken(response.data.token)
      setUser(response.data.user)
      localStorage.setItem('token', response.data.token)
      navigate('/home')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 p-8 animate-fade-in relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>

        <div className="text-center mb-8">
            <div className="text-6xl text-blue-500 mb-4 inline-block drop-shadow-lg">
                <i className="fa fa-vote-yea"></i>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Secure Vote</h1>
            <p className="text-slate-400 mt-2">Enter your credentials to cast your vote</p>
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
              placeholder="Voter ID" 
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-mono tracking-wide uppercase"
              value={voterId}
              onChange={(e) => setVoterId(e.target.value.toUpperCase())}
              required 
            />
          </div>
          
          <div className="group">
            <input 
              type="password" 
              placeholder="Password (4 digits)" 
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all tracking-widest"
              value={password}
              onChange={(e) => {
                  const val = e.target.value;
                  if (/^\d{0,4}$/.test(val)) {
                      setPassword(val);
                  }
              }}
              required 
              maxLength="4"
              inputMode="numeric"
            />
          </div>

          <button type="submit" className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold tracking-wide shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 hover:-translate-y-0.5 hover:from-blue-500 hover:to-indigo-500 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed text-lg" disabled={loading}>
            {loading ? (
                <span><i className="fa fa-spinner fa-spin mr-2"></i> Authenticating...</span>
            ) : (
                "Sign In to Vote"
            )}
          </button>
          
          <button 
            type="button" 
            className="w-full py-3.5 bg-slate-800 text-slate-400 hover:text-white rounded-xl font-semibold hover:bg-slate-700 transition-all duration-200 flex items-center justify-center gap-2 group"
            onClick={() => navigate('/admin-login')}
          >
            <i className="fa fa-user-shield group-hover:scale-110 transition-transform"></i> Administrator Access
          </button>
        </form>
      </div>
    
      {/* Background circles animation or visual flair could go here */}
    </div>
  )
}

export default Login
