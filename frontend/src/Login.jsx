import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function Login({ setToken, setUser }) {
  const [voterId, setVoterId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/login/', {
        voter_id: voterId,
        password: password
      })
      setToken(response.data.token)
      setUser(response.data.user)
      localStorage.setItem('token', response.data.token)
      navigate('/home')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    }
  }

  return (
    <div className="login-box" style={{margin: '50px auto', width: '360px'}}>
      <div className="login-logo text-center">
        <h1><b>Voting System</b></h1>
      </div>
      <div className="login-box-body" style={{background: '#fff', padding: '20px', borderTop: '3px solid #d2d6de'}}>
        <p className="login-box-msg text-center">Sign in to start your session</p>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group has-feedback mb-3">
            <input 
              type="text" 
              className="form-control" 
              placeholder="Voter's ID" 
              value={voterId}
              onChange={(e) => setVoterId(e.target.value)}
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
            <div className="col-xs-8 text-end">
               <button type="button" onClick={() => navigate('/admin-login')} className="btn btn-outline-secondary btn-flat" style={{marginLeft: '10px'}}>Admin Login</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
