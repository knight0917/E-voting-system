import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/admin/login/', {
        username: username,
        password: password
      })
      // Save admin token - maybe use a different key to avoid conflict or same key if handling generically?
      // Let's use 'admin_token' to be safe and separate from voter session
      localStorage.setItem('admin_token', response.data.token)
      // We don't necessarily update main 'user' state if that's for voters. 
      // But for simplicity, we can let the AdminDashboard manage its own auth check or use local state.
      navigate('/admin-dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    }
  }

  return (
    <div className="login-box" style={{margin: '50px auto', width: '360px'}}>
      <div className="login-logo text-center">
        <h1><b>Admin Login</b></h1>
      </div>
      <div className="login-box-body" style={{background: '#fff', padding: '20px', borderTop: '3px solid #d2d6de'}}>
        <p className="login-box-msg text-center">Sign in to start your session</p>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group has-feedback mb-3">
            <input 
              type="text" 
              className="form-control" 
              placeholder="Username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required 
            />
          </div>
          <div className="form-group has-feedback mb-3">
            <input 
              type="password" 
              className="form-control" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          <div className="row">
            <div className="col-xs-4">
              <button type="submit" className="btn btn-primary btn-block btn-flat">Sign In</button>
            </div>
          </div>
        </form>
        <div style={{marginTop: '10px', textAlign: 'center'}}>
            <a href="/" style={{cursor: 'pointer'}}>Back to Voter Login</a>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin
