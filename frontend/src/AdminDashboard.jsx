import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import './AdminDashboard.css'

function AdminDashboard() {
  const [stats, setStats] = useState({
    summary: { positions: 0, candidates: 0, voters: 0, votes_cast: 0 },
    tally: []
  })
  const [loading, setLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768)
  const navigate = useNavigate()

  useEffect(() => {
    // 1. Strict Token Check
    const token = localStorage.getItem('admin_token')
    if (!token) {
      navigate('/admin-login')
      return
    }

    const fetchStats = async () => {
      try {
        // 2. Authenticated Request
        const response = await axios.get('http://127.0.0.1:8000/api/admin/stats/', {
            headers: {
                'Authorization': `Token ${token}`
            }
        })
        setStats(response.data)
      } catch (err) {
        console.error("Failed to fetch stats", err)
        
        // 3. Handle Unauthorized
        if (err.response && err.response.status === 401) {
            localStorage.removeItem('admin_token')
            navigate('/admin-login')
            return;
        }

        // Fallback mock data for non-auth errors (e.g., backend offline)
        setStats({
          summary: { positions: 4, candidates: 12, voters: 22, votes_cast: 22 },
          tally: [
            {
              position: "Test Position One",
              candidates: [
                { id: 1, name: "Selma Hawkins", votes: 6 },
                { id: 2, name: "Beverly Cox", votes: 15 },
                { id: 3, name: "Gaston K. Maguire", votes: 5 }
              ]
            },
            {
              position: "Test Position Two",
              candidates: [
                { id: 4, name: "Ken F. Eggen", votes: 7 },
                { id: 5, name: "Andrea Fisk", votes: 3 },
                { id: 6, name: "Liliana B. Johnson", votes: 12 }
              ]
            },
             {
              position: "Test Position Three",
              candidates: [
                { id: 7, name: "Candidate A", votes: 10 },
                { id: 8, name: "Candidate B", votes: 8 }
              ]
            },
            {
              position: "Test Position Four",
              candidates: [
                { id: 9, name: "Candidate X", votes: 20 },
              ]
            }
          ]
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStats()

    const handleResize = () => {
        if (window.innerWidth > 768) {
            setIsSidebarOpen(true);
        } else {
            setIsSidebarOpen(false);
        }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    navigate('/admin-login')
  }

  const toggleSidebar = (e) => {
      e.preventDefault();
      setIsSidebarOpen(!isSidebarOpen);
  }

  const getMaxVotes = (candidates) => {
    const max = Math.max(...candidates.map(c => c.votes), 0);
    return max === 0 ? 1 : max;
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
            <li><a href="/admin-dashboard" className="active"><i className="fa fa-gauge-high"></i> <span>Dashboard</span></a></li>
            <li><a href="#"><i className="fa fa-lock"></i> <span>Votes</span></a></li>
            
            <li className="header">MANAGE</li>
            <li><a href="/voters"><i className="fa fa-users"></i> <span>Voters</span></a></li>
            <li><a href="/positions"><i className="fa fa-list-ul"></i> <span>Positions</span></a></li>
            <li><a href="/candidates"><i className="fa fa-user-tie"></i> <span>Candidates</span></a></li>
            
            <li className="header">SETTINGS</li>
            <li><a href="#"><i className="fa fa-file-lines"></i> <span>Ballot Position</span></a></li>
            <li><a href="/election-title"><i className="fa fa-font"></i> <span>Election Title</span></a></li>
            
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
                    Dashboard
                    <small>Control Panel</small>
                </h1>
                <ol className="breadcrumb">
                    <li><a href="#"><i className="fa fa-home"></i> Home</a></li>
                    <li className="active">Dashboard</li>
                </ol>
            </section>

            {loading ? <div className="loading-state"><i className="fa fa-spinner fa-spin"></i> Loading...</div> : (
            <section className="content">
                {/* Info Cards */}
                <div className="row">
                    <div className="col-lg-3 col-6">
                        <div className="small-box bg-primary-gradient">
                            <div className="inner">
                                <h3>{stats.summary.positions}</h3>
                                <p>No. of Positions</p>
                            </div>
                            <div className="icon">
                                <i className="fa fa-list-check"></i>
                            </div>
                            <a href="#" className="small-box-footer">More Info <i className="fa fa-arrow-circle-right"></i></a>
                        </div>
                    </div>
                    <div className="col-lg-3 col-6">
                        <div className="small-box bg-success-gradient">
                            <div className="inner">
                                <h3>{stats.summary.candidates}</h3>
                                <p>No. of Candidates</p>
                            </div>
                            <div className="icon">
                                <i className="fa fa-user-tie"></i>
                            </div>
                            <a href="#" className="small-box-footer">More Info <i className="fa fa-arrow-circle-right"></i></a>
                        </div>
                    </div>
                    <div className="col-lg-3 col-6">
                        <div className="small-box bg-warning-gradient">
                            <div className="inner">
                                <h3>{stats.summary.voters}</h3>
                                <p>Total Voters</p>
                            </div>
                            <div className="icon">
                                <i className="fa fa-users"></i>
                            </div>
                            <a href="#" className="small-box-footer">More Info <i className="fa fa-arrow-circle-right"></i></a>
                        </div>
                    </div>
                    <div className="col-lg-3 col-6">
                        <div className="small-box bg-danger-gradient">
                            <div className="inner">
                                <h3>{stats.summary.votes_cast}</h3>
                                <p>Voters Voted</p>
                            </div>
                            <div className="icon">
                                <i className="fa fa-check-to-slot"></i>
                            </div>
                            <a href="#" className="small-box-footer">More Info <i className="fa fa-arrow-circle-right"></i></a>
                        </div>
                    </div>
                </div>

                {/* Votes Tally */}
                <div className="row">
                    <div className="col-12">
                        <h3>Votes Tally <button className="btn btn-success btn-sm pull-right"><i className="fa fa-print"></i> Print</button></h3>
                    </div>
                </div>

                <div className="row">
                    {stats.tally.map((pos, index) => {
                         const maxVotes = getMaxVotes(pos.candidates);
                         return (
                            <div className="col-md-6" key={index}>
                                <div className="box box-solid">
                                    <div className="box-header with-border">
                                        <h4 className="box-title">{pos.position}</h4>
                                    </div>
                                    <div className="box-body">
                                        {pos.candidates.map((cand, idx) => {
                                            const percentage = (cand.votes / maxVotes) * 100;
                                            return (
                                                <div className="progress-group" key={cand.id}>
                                                    <div className="progress-label">
                                                        <span className="text">{cand.name}</span>
                                                        <span className="number badge bg-gray">{cand.votes} votes</span>
                                                    </div>
                                                    <div className="progress sm">
                                                        <div 
                                                            className={`progress-bar progress-bar-${['aqua', 'green', 'yellow', 'red'][idx % 4]}`} 
                                                            style={{width: `${percentage}%`}}
                                                        ></div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                         )
                    })}
                </div>
            </section>
            )}
        </div>
      </main>
    </div>
  )
}

export default AdminDashboard
