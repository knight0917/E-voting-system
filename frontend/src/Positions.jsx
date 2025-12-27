import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import './AdminDashboard.css'

function Positions() {
  const [positions, setPositions] = useState([])
  const [loading, setLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768)
  const [showModal, setShowModal] = useState(false)
  const [editMode, setEditMode] = useState(false)
  
  // Form State
  const [formData, setFormData] = useState({
    id: null,
    description: '',
    max_vote: 1,
    priority: 1
  })
  
  const [validationError, setValidationError] = useState('');

  const navigate = useNavigate()
  const token = localStorage.getItem('admin_token')

  useEffect(() => {
    if (!token) {
      navigate('/admin-login')
      return
    }
    fetchPositions()

    const handleResize = () => setIsSidebarOpen(window.innerWidth > 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [navigate, token])

  const fetchPositions = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/admin/positions/', {
        headers: { 'Authorization': `Token ${token}` }
      })
      setPositions(response.data)
    } catch (err) {
      console.error("Error fetching positions", err)
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

  const openAddModal = () => {
      setFormData({ 
          id: null, 
          description: '', 
          max_vote: 1, 
          priority: 1
        })
      setValidationError('');
      setEditMode(false)
      setShowModal(true)
  }

  const openEditModal = (pos) => {
      setFormData({
          id: pos.id,
          description: pos.description,
          max_vote: pos.max_vote,
          priority: pos.priority
      })
      setValidationError('');
      setEditMode(true)
      setShowModal(true)
  }

  const handleDelete = async (id) => {
      if(!window.confirm("Are you sure you want to delete this position?")) return;
      
      try {
          await axios.delete(`http://127.0.0.1:8000/api/admin/positions/${id}/`, {
            headers: { 'Authorization': `Token ${token}` }
          })
          fetchPositions()
      } catch (err) {
          alert("Failed to delete position")
          console.error(err)
      }
  }

  const handleSubmit = async (e) => {
      e.preventDefault()
      
      try {
          const config = {
              headers: { 
                  'Authorization': `Token ${token}`
              }
          };

          if (editMode) {
              await axios.put(`http://127.0.0.1:8000/api/admin/positions/${formData.id}/`, formData, config)
          } else {
              await axios.post('http://127.0.0.1:8000/api/admin/positions/', formData, config)
          }
          setShowModal(false)
          fetchPositions()
      } catch (err) {
          console.error("Error saving position", err)
          let msg = "Failed to save position.";
          if (err.response && err.response.data) {
              // Convert object error to string if possible or just use generic
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
            <li><a href="#" className="active"><i className="fa fa-list-ul"></i> <span>Positions</span></a></li>
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
                    Positions
                </h1>
                <ol className="breadcrumb">
                    <li><a href="/admin-dashboard"><i className="fa fa-home"></i> Home</a></li>
                    <li className="active">Positions</li>
                </ol>
            </section>

            <section className="content">
                <div className="row">
                    <div className="col-xs-12">
                        <div className="box">
                            <div className="box-header with-border" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                <a href="#addnew" onClick={(e) => {e.preventDefault(); openAddModal()}} className="btn btn-primary btn-sm btn-flat"><i className="fa fa-plus"></i> New</a>
                            </div>
                            <div className="box-body">
                                <table className="table table-bordered table-striped table-hover">
                                    <thead>
                                        <tr>
                                            <th>Description</th>
                                            <th>Max Vote</th>
                                            <th>Priority</th>
                                            <th>Tools</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {positions.map(pos => (
                                            <tr key={pos.id}>
                                                <td>{pos.description}</td>
                                                <td>{pos.max_vote}</td>
                                                <td>{pos.priority}</td>
                                                <td>
                                                    <button onClick={() => openEditModal(pos)} className="btn btn-success btn-sm btn-flat me-2"><i className="fa fa-edit"></i> Edit</button>
                                                    <button onClick={() => handleDelete(pos.id)} className="btn btn-danger btn-sm btn-flat"><i className="fa fa-trash"></i> Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                                        {positions.length === 0 && !loading && (
                                            <tr><td colSpan="4" className="text-center">No positions found.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="modal-backdrop-custom">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h4 className="modal-title"><b>{editMode ? 'Edit Position' : 'Add New Position'}</b></h4>
                        <button type="button" className="close" onClick={() => setShowModal(false)}>&times;</button>
                    </div>
                    <div className="modal-body">
                        <form className="form-horizontal" onSubmit={handleSubmit}>
                            {validationError && (
                                <div className="alert alert-danger" style={{padding:'10px', marginBottom:'15px', whiteSpace: 'pre-line'}}>
                                    <i className="fa fa-warning"></i> {validationError}
                                </div>
                            )}

                            <div className="form-group mb-3">
                                <label className="col-sm-3 control-label">Description</label>
                                <div className="col-sm-9">
                                    <input type="text" className="form-control" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required placeholder="e.g., President" />
                                </div>
                            </div>
                            <div className="form-group mb-3">
                                <label className="col-sm-3 control-label">Max Vote</label>
                                <div className="col-sm-9">
                                    <input type="number" className="form-control" value={formData.max_vote} onChange={e => setFormData({...formData, max_vote: e.target.value})} required min="1" />
                                </div>
                            </div>
                            <div className="form-group mb-3">
                                <label className="col-sm-3 control-label">Priority</label>
                                <div className="col-sm-9">
                                    <input type="number" className="form-control" value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})} required placeholder="Higher number shows first" />
                                </div>
                            </div>
                            
                            <div className="modal-footer">
                                <button type="button" className="btn btn-default btn-flat pull-left" onClick={() => setShowModal(false)}><i className="fa fa-close"></i> Close</button>
                                <button type="submit" className="btn btn-primary btn-flat" name="save"><i className="fa fa-save"></i> Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
      )}
      
      <style>{`
        .modal-backdrop-custom {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 1050;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .modal-dialog {
            background: #fff;
            width: 500px;
            max-width: 90%;
            border-radius: 5px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.5);
            overflow: hidden;
        }
        .modal-header {
            padding: 15px;
            border-bottom: 1px solid #f4f4f4;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .modal-body {
            padding: 20px;
        }
        .modal-footer {
            padding: 15px;
            text-align: right;
            border-top: 1px solid #f4f4f4;
        }
        .close {
            background: none;
            border: none;
            font-size: 21px;
            font-weight: 700;
            line-height: 1;
            color: #000;
            text-shadow: 0 1px 0 #fff;
            opacity: .2;
            cursor: pointer;
        }
        .close:hover { opacity: .5; }
        .alert-danger {
            color: #a94442;
            background-color: #f2dede;
            border-color: #ebccd1;
            border-radius: 4px;
        }
      `}</style>
    </div>
  )
}

export default Positions
