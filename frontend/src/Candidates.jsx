import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import './AdminDashboard.css'

function Candidates() {
  const [candidates, setCandidates] = useState([])
  const [positions, setPositions] = useState([])
  const [loading, setLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768)
  const [showModal, setShowModal] = useState(false)
  const [editMode, setEditMode] = useState(false)
  
  // Form State
  const [formData, setFormData] = useState({
    id: null,
    position: '',
    firstname: '',
    lastname: '',
    identity_type: 'aadhaar',
    identity_number: '',
    gender: 'Male',
    address: '',
    party_type: 'independent',
    party_name: '',
    photo: null,
    symbol: null
  })
  
  const [validationError, setValidationError] = useState('');

  const navigate = useNavigate()
  const token = localStorage.getItem('admin_token')

  useEffect(() => {
    if (!token) {
      navigate('/admin-login')
      return
    }
    fetchCandidates()
    fetchPositions()

    const handleResize = () => setIsSidebarOpen(window.innerWidth > 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [navigate, token])

  const fetchCandidates = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/admin/candidates/', {
        headers: { 'Authorization': `Token ${token}` }
      })
      setCandidates(response.data)
    } catch (err) {
        console.error("Error fetching candidates", err)
        if (err.response && err.response.status === 401) {
            localStorage.removeItem('admin_token')
            navigate('/admin-login')
        }
    } finally {
      setLoading(false)
    }
  }

  const fetchPositions = async () => {
      try {
          const response = await axios.get('http://127.0.0.1:8000/api/admin/positions/', {
            headers: { 'Authorization': `Token ${token}` }
          })
          setPositions(response.data)
      } catch (err) {
          console.error("Error fetching positions", err)
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
          position: positions.length > 0 ? positions[0].id : '',
          firstname: '',
          lastname: '',
          identity_type: 'aadhaar',
          identity_number: '',
          gender: 'Male',
          address: '',
          party_type: 'independent',
          party_name: '',
          photo: null,
          symbol: null
        })
      setValidationError('');
      setEditMode(false)
      setShowModal(true)
  }

  const openEditModal = (cand) => {
      setFormData({
          id: cand.id,
          position: cand.position,
          firstname: cand.firstname,
          lastname: cand.lastname,
          identity_type: cand.identity_type || 'aadhaar',
          identity_number: cand.identity_number || '',
          gender: cand.gender || 'Male',
          address: cand.address || '',
          party_type: cand.party_type || 'independent',
          party_name: cand.party_name || '',
          photo: null, 
          symbol: null
      })
      setValidationError('');
      setEditMode(true)
      setShowModal(true)
  }

  const handleDelete = async (id) => {
      if(!window.confirm("Are you sure you want to delete this candidate?")) return;
      
      try {
          await axios.delete(`http://127.0.0.1:8000/api/admin/candidates/${id}/`, {
            headers: { 'Authorization': `Token ${token}` }
          })
          fetchCandidates()
      } catch (err) {
          alert("Failed to delete candidate")
          console.error(err)
      }
  }

  const handleSubmit = async (e) => {
      e.preventDefault()
      
      const data = new FormData();
      data.append('position', formData.position);
      data.append('firstname', formData.firstname);
      data.append('lastname', formData.lastname);
      data.append('identity_type', formData.identity_type);
      data.append('identity_number', formData.identity_number);
      data.append('gender', formData.gender);
      data.append('address', formData.address);
      data.append('party_type', formData.party_type);
      if(formData.party_type === 'party') {
          data.append('party_name', formData.party_name);
      } else {
          data.append('party_name', ''); // Clear if independent
      }

      if (formData.photo) data.append('photo', formData.photo);
      if (formData.symbol) data.append('symbol', formData.symbol);
      
      try {
          const config = {
              headers: { 
                  'Authorization': `Token ${token}`,
                  'Content-Type': 'multipart/form-data'
              }
          };

          if (editMode) {
              await axios.put(`http://127.0.0.1:8000/api/admin/candidates/${formData.id}/`, data, config)
          } else {
              await axios.post('http://127.0.0.1:8000/api/admin/candidates/', data, config)
          }
          setShowModal(false)
          fetchCandidates()
      } catch (err) {
          console.error("Error saving candidate", err)
          let msg = "Failed to save candidate.";
          if (err.response && err.response.data) {
             const errors = err.response.data;
             if (typeof errors === 'object') {
                  msg = "";
                  for (const key in errors) {
                      const errorContent = Array.isArray(errors[key]) ? errors[key].join(' ') : errors[key];
                      msg += `${key.replace('_', ' ')}: ${errorContent}\n`;
                  }
             } else {
                 msg = String(errors);
             }
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
            <li><a href="/candidates" className="active"><i className="fa fa-user-tie"></i> <span>Candidates</span></a></li>
            
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
                    Candidates List
                </h1>
                <ol className="breadcrumb">
                    <li><a href="/admin-dashboard"><i className="fa fa-home"></i> Home</a></li>
                    <li className="active">Candidates</li>
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
                                            <th>ID</th>
                                            <th>Position</th>
                                            <th>Name</th>
                                            <th>Party</th>
                                            <th>Identity</th>
                                            <th>Gender</th>
                                            <th>Photo</th>
                                            <th>Symbol</th>
                                            <th>Tools</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {candidates.map(cand => (
                                            <tr key={cand.id}>
                                                <td>{cand.candidate_id}</td>
                                                <td>{cand.position_name}</td>
                                                <td>{cand.firstname} {cand.lastname}</td>
                                                <td>
                                                    {cand.party_type === 'party' ? (
                                                        <span className="label label-primary">{cand.party_name}</span>
                                                    ) : (
                                                        <span className="label label-default">Independent</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <small className="text-muted" style={{display:'block'}}>{cand.identity_type || 'N/A'}</small>
                                                    {cand.identity_number}
                                                </td>
                                                <td>{cand.gender}</td>
                                                <td>
                                                    <img 
                                                        src={cand.photo ? `http://127.0.0.1:8000${cand.photo}` : `https://ui-avatars.com/api/?name=${cand.firstname}+${cand.lastname}`} 
                                                        width="30" height="30" 
                                                        style={{borderRadius:'50%'}} 
                                                        alt="Candidate"
                                                    />
                                                </td>
                                                <td>
                                                    {cand.symbol && <img src={`http://127.0.0.1:8000${cand.symbol}`} width="30" height="30" alt="Symbol" />}
                                                </td>
                                                <td>
                                                    <button onClick={() => openEditModal(cand)} className="btn btn-success btn-sm btn-flat me-2"><i className="fa fa-edit"></i> Edit</button>
                                                    <button onClick={() => handleDelete(cand.id)} className="btn btn-danger btn-sm btn-flat"><i className="fa fa-trash"></i> Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                                        {candidates.length === 0 && !loading && (
                                            <tr><td colSpan="9" className="text-center">No candidates found.</td></tr>
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
                        <h4 className="modal-title"><b>{editMode ? 'Edit Candidate' : 'Add New Candidate'}</b></h4>
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
                                <label className="col-sm-3 control-label">Position</label>
                                <div className="col-sm-9">
                                    <select className="form-control" value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} required>
                                        <option value="">Select Position</option>
                                        {positions.map(pos => (
                                            <option key={pos.id} value={pos.id}>{pos.description}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-group mb-3">
                                <label className="col-sm-3 control-label">Firstname</label>
                                <div className="col-sm-9">
                                    <input type="text" className="form-control" value={formData.firstname} onChange={e => setFormData({...formData, firstname: e.target.value})} required />
                                </div>
                            </div>
                            <div className="form-group mb-3">
                                <label className="col-sm-3 control-label">Lastname</label>
                                <div className="col-sm-9">
                                    <input type="text" className="form-control" value={formData.lastname} onChange={e => setFormData({...formData, lastname: e.target.value})} required />
                                </div>
                            </div>

                            <div className="form-group mb-3">
                                <label className="col-sm-3 control-label">Gender</label>
                                <div className="col-sm-9">
                                    <select className="form-control" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                            
                            {/* Party Info */}
                            <div className="form-group mb-3">
                                <label className="col-sm-3 control-label">Affiliation</label>
                                <div className="col-sm-9">
                                    <select className="form-control" value={formData.party_type} onChange={e => setFormData({...formData, party_type: e.target.value})}>
                                        <option value="independent">Independent</option>
                                        <option value="party">Political Party</option>
                                    </select>
                                </div>
                            </div>
                            
                            {formData.party_type === 'party' && (
                                <div className="form-group mb-3">
                                    <label className="col-sm-3 control-label">Party Name</label>
                                    <div className="col-sm-9">
                                        <input type="text" className="form-control" value={formData.party_name} onChange={e => setFormData({...formData, party_name: e.target.value})} required />
                                    </div>
                                </div>
                            )}

                            {/* Identity */}
                             <div className="form-group mb-3">
                                <label className="col-sm-3 control-label">Identity Type</label>
                                <div className="col-sm-9">
                                    <select className="form-control" value={formData.identity_type} onChange={e => setFormData({...formData, identity_type: e.target.value})}>
                                        <option value="aadhaar">Aadhaar Card</option>
                                        <option value="voter_id">Voter ID Card</option>
                                        <option value="passport">Passport</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group mb-3">
                                <label className="col-sm-3 control-label">Identity No.</label>
                                <div className="col-sm-9">
                                    <input type="text" className="form-control" value={formData.identity_number} onChange={e => setFormData({...formData, identity_number: e.target.value})} required />
                                </div>
                            </div>

                            <div className="form-group mb-3">
                                <label className="col-sm-3 control-label">Address</label>
                                <div className="col-sm-9">
                                    <textarea className="form-control" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} required></textarea>
                                </div>
                            </div>
                            
                            {/* Images */}
                            <div className="form-group mb-3">
                                <label className="col-sm-3 control-label">Photo</label>
                                <div className="col-sm-9">
                                    <input type="file" className="form-control" onChange={e => setFormData({...formData, photo: e.target.files[0]})} />
                                </div>
                            </div>
                            
                            <div className="form-group mb-3">
                                <label className="col-sm-3 control-label">Symbol</label>
                                <div className="col-sm-9">
                                    <input type="file" className="form-control" onChange={e => setFormData({...formData, symbol: e.target.files[0]})} />
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
        .label {
            display: inline;
            padding: .2em .6em .3em;
            font-size: 75%;
            font-weight: 700;
            line-height: 1;
            color: #fff;
            text-align: center;
            white-space: nowrap;
            vertical-align: baseline;
            border-radius: .25em;
        }
        .label-primary { background-color: #3c8dbc; }
        .label-default { background-color: #777; }
        /* ... Reuse other styles from Voters.jsx ... */
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

export default Candidates
