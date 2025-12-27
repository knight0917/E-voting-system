import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import './AdminDashboard.css'

function ElectionTitle() {
  const [title, setTitle] = useState("Voting System")
  const [loading, setLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768)
  const [validationError, setValidationError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const navigate = useNavigate()
  const token = localStorage.getItem('admin_token')

  useEffect(() => {
    if (!token) {
      navigate('/admin-login')
      return
    }
    fetchTitle()

    const handleResize = () => setIsSidebarOpen(window.innerWidth > 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [navigate, token])

  const fetchTitle = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/admin/title/', {
        headers: { 'Authorization': `Token ${token}` }
      })
      if (response.data && response.data.header) {
          setTitle(response.data.header)
      }
    } catch (err) {
      console.error("Error fetching title", err)
      if (err.response && err.response.status === 401) {
          localStorage.removeItem('admin_token')
          navigate('/admin-login')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    navigate('/admin-login')
  }

  const toggleSidebar = (e) => {
      e.preventDefault();
      setIsSidebarOpen(!isSidebarOpen);
  }

  const handleSubmit = async (e) => {
      e.preventDefault()
      setValidationError('')
      setSuccessMessage('')
      
      try {
          const config = {
              headers: { 
                  'Authorization': `Token ${token}`
              }
          };

          await axios.post('http://127.0.0.1:8000/api/admin/title/', { header: title }, config)
          setSuccessMessage('Election title updated successfully!')
      } catch (err) {
          console.error("Error saving title", err)
          let msg = "Failed to save title.";
          if (err.response && err.response.data) {
              msg = JSON.stringify(err.response.data);
          }
          setValidationError(msg);
      }
  }

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
            <span className="logo-lg"><b>Voting</b>System</span>
        </div>
        <div className="user-panel">
            <div className="user-image">
                <img src="https://ui-avatars.com/api/?name=Admin&background=fff&color=000" alt="User" />
            </div>
            <div className="user-info">
                <p>System Administrator</p>
                <span className="status"><i className="fa fa-circle text-success"></i> Online</span>
            </div>
        </div>
        <ul className="sidebar-menu">
            <li className="header">REPORTS</li>
            <li><a href="/admin-dashboard"><i className="fa fa-gauge-high"></i> <span>Dashboard</span></a></li>
            <li><a href="#"><i className="fa fa-lock"></i> <span>Votes</span></a></li>
            
            <li className="header">MANAGE</li>
            <li><a href="/voters"><i className="fa fa-users"></i> <span>Voters</span></a></li>
            <li><a href="/positions"><i className="fa fa-list-ul"></i> <span>Positions</span></a></li>
            <li><a href="/candidates"><i className="fa fa-user-tie"></i> <span>Candidates</span></a></li>
            
            <li className="header">SETTINGS</li>
            <li><a href="#"><i className="fa fa-file-lines"></i> <span>Ballot Position</span></a></li>
            <li><a href="#" className="active"><i className="fa fa-font"></i> <span>Election Title</span></a></li>
            
            <li className="header">EXIT</li>
            <li>
                <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }}>
                    <i className="fa fa-power-off text-danger"></i> <span>Logout</span>
                </a>
            </li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-bar">
            <a href="#" className="sidebar-toggle" onClick={toggleSidebar}>
                <i className="fa fa-bars"></i>
            </a>
            <div className="top-menu">
                <div className="user-menu">
                    <img src="https://ui-avatars.com/api/?name=Admin&background=fff&color=000" className="user-image-sm" alt="User"/>
                    <span className="hidden-xs">System Administrator</span>
                </div>
            </div>
        </header>

        <div className="content-wrapper">
            <section className="content-header">
                <h1>
                    Election Title
                </h1>
                <ol className="breadcrumb">
                    <li><a href="/admin-dashboard"><i className="fa fa-home"></i> Home</a></li>
                    <li className="active">Election Title</li>
                </ol>
            </section>

            <section className="content">
                <div className="row">
                    <div className="col-md-12">
                        <div className="box box-primary">
                            <div className="box-header with-border">
                                <h3 className="box-title">Configure Election Title</h3>
                            </div>
                            <form role="form" onSubmit={handleSubmit}>
                                <div className="box-body">
                                    {validationError && (
                                        <div className="alert alert-danger">
                                            <i className="fa fa-warning"></i> {validationError}
                                        </div>
                                    )}
                                    {successMessage && (
                                        <div className="alert alert-success">
                                            <i className="fa fa-check"></i> {successMessage}
                                        </div>
                                    )}

                                    <div className="form-group">
                                        <label htmlFor="electionTitle">Election Title</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            id="electionTitle" 
                                            placeholder="Enter election title" 
                                            value={title}
                                            onChange={e => setTitle(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="box-footer">
                                    <button type="submit" className="btn btn-primary btn-flat"><i className="fa fa-save"></i> Save</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </div>
      </main>
      
      <style>{`
          .box-primary {
              border-top-color: #3c8dbc;
          }
          .box-footer {
              border-top-left-radius: 0;
              border-top-right-radius: 0;
              border-bottom-right-radius: 3px;
              border-bottom-left-radius: 3px;
              border-top: 1px solid #f4f4f4;
              padding: 10px;
              background-color: #fff;
          }
          .alert {
              padding: 15px;
              margin-bottom: 20px;
              border: 1px solid transparent;
              border-radius: 4px;
          }
          .alert-success {
              color: #3c763d;
              background-color: #dff0d8;
              border-color: #d6e9c6;
          }
      `}</style>
    </div>
  )
}

export default ElectionTitle
