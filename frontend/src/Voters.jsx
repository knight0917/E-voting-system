import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import './AdminDashboard.css'

function Voters() {
  const [voters, setVoters] = useState([])
  const [loading, setLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768)
  const [showModal, setShowModal] = useState(false)
  const [editMode, setEditMode] = useState(false)
  
  // Form State
  const [formData, setFormData] = useState({
    id: null,
    firstname: '',
    middlename: '', 
    lastname: '',
    address: '',
    identity_type: 'aadhaar', // Default
    aadhaar_hash: '', // Holds the actual ID Number
    age: '',
    gender: 'Male', // Added default gender
    password: '',
    photo: null
  })
  
  const [validationError, setValidationError] = useState('');

  const navigate = useNavigate()
  const token = localStorage.getItem('admin_token')

  useEffect(() => {
    if (!token) {
      navigate('/admin-login')
      return
    }
    fetchVoters()

    const handleResize = () => setIsSidebarOpen(window.innerWidth > 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [navigate, token])

  const fetchVoters = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/admin/voters/', {
        headers: { 'Authorization': `Token ${token}` }
      })
      setVoters(response.data)
    } catch (err) {
      console.error("Error fetching voters", err)
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
          firstname: '', 
          middlename: '', 
          lastname: '', 
          address: '', 
          identity_type: 'aadhaar',
          aadhaar_hash: '', 
          age: '',
          gender: 'Male',
          password: '',
          photo: null
        })
      setValidationError('');
      setEditMode(false)
      setShowModal(true)
  }

  const openEditModal = (voter) => {
      setFormData({
          id: voter.id,
          firstname: voter.firstname,
          middlename: voter.middlename || '',
          lastname: voter.lastname,
          address: voter.address || '',
          identity_type: voter.identity_type || 'aadhaar',
          aadhaar_hash: voter.aadhaar_hash || '', 
          age: voter.age || '',
          gender: voter.gender || 'Male',
          password: '',
          photo: null // Don't prefill file input
      })
      setValidationError('');
      setEditMode(true)
      setShowModal(true)
  }

  const handleDelete = async (id) => {
      if(!window.confirm("Are you sure you want to delete this voter?")) return;
      
      try {
          await axios.delete(`http://127.0.0.1:8000/api/admin/voters/${id}/`, {
            headers: { 'Authorization': `Token ${token}` }
          })
          fetchVoters()
      } catch (err) {
          alert("Failed to delete voter")
          console.error(err)
      }
  }

  const validateForm = () => {
      // 1. Validate Age
      if (parseInt(formData.age) < 18) {
          setValidationError("Voter must be 18 years or older.");
          return false;
      }

      // 2. Validate Identity Type Rules
      const val = formData.aadhaar_hash;
      const type = formData.identity_type;

      if (type === 'aadhaar') {
          // Input only no. which cannot be more or less than 16
          if (!/^\d{16}$/.test(val)) {
              setValidationError("Aadhaar must be exactly 16 digits (numbers only).");
              return false;
          }
      } else if (type === 'voter_id') {
          // Letter and number, exactly 10 char
          // Regex: alphanumeric, length 10
          if (val.length !== 10 || !/^[a-zA-Z0-9]+$/.test(val)) {
              setValidationError("Voter ID must be exactly 10 alphanumeric characters.");
              return false;
          }
      } else if (type === 'passport') {
          // Letter and no, cannot exceed 8
          if (val.length > 8 || !/^[a-zA-Z0-9]+$/.test(val)) {
              setValidationError("Passport No. must be alphanumeric and not exceed 8 characters.");
              return false;
          }
      }

      setValidationError('');
      return true;
  }

  const handleSubmit = async (e) => {
      e.preventDefault()
      if (!validateForm()) return;

      const data = new FormData();
      data.append('firstname', formData.firstname);
      data.append('lastname', formData.lastname);
      if (formData.middlename) data.append('middlename', formData.middlename);
      data.append('address', formData.address);
      data.append('identity_type', formData.identity_type);
      data.append('aadhaar_hash', formData.aadhaar_hash);
      data.append('age', formData.age);
      data.append('gender', formData.gender);
      if (formData.password) data.append('password', formData.password);
      if (formData.photo) data.append('photo', formData.photo);
      
      try {
          const config = {
              headers: { 
                  'Authorization': `Token ${token}`,
                  'Content-Type': 'multipart/form-data'
              }
          };

          if (editMode) {
              await axios.put(`http://127.0.0.1:8000/api/admin/voters/${formData.id}/`, data, config)
          } else {
              await axios.post('http://127.0.0.1:8000/api/admin/voters/', data, config)
          }
          setShowModal(false)
          fetchVoters()
      } catch (err) {
          console.error("Error saving voter", err)
          let msg = "Failed to save voter.";
          
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
          } else if (err.message) {
              msg = err.message;
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
            <li><a href="#" className="active"><i className="fa fa-users"></i> <span>Voters</span></a></li>
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
                    Voters List
                </h1>
                <ol className="breadcrumb">
                    <li><a href="/admin-dashboard"><i className="fa fa-home"></i> Home</a></li>
                    <li className="active">Voters</li>
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
                                            <th>Voter ID</th>
                                            <th>Firstname</th>
                                            <th>Middlename</th>
                                            <th>Lastname</th>
                                            <th>Age</th>
                                            <th>Gender</th>
                                            <th>Address</th>
                                            <th>Identity No.</th>
                                            <th>Type</th>
                                            <th>Photo</th>
                                            <th>Tools</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {voters.map(voter => (
                                            <tr key={voter.id}>
                                                <td>{voter.voters_id}</td>
                                                <td>{voter.firstname}</td>
                                                <td>{voter.middlename}</td>
                                                <td>{voter.lastname}</td>
                                                <td>{voter.age}</td>
                                                <td>{voter.gender}</td>
                                                <td>{voter.address}</td>
                                                <td>{voter.aadhaar_hash}</td>
                                                <td>
                                                    <span className="badge bg-gray" style={{textTransform:'uppercase'}}>{voter.identity_type || 'aadhaar'}</span>
                                                </td>
                                                <td>
                                                    <img 
                                                        src={voter.photo ? `http://127.0.0.1:8000${voter.photo}` : `https://ui-avatars.com/api/?name=${voter.firstname}+${voter.lastname}`} 
                                                        width="30" height="30" 
                                                        style={{borderRadius:'50%'}} 
                                                        alt="Voter"
                                                    />
                                                </td>
                                                <td>
                                                    <button onClick={() => openEditModal(voter)} className="btn btn-success btn-sm btn-flat me-2"><i className="fa fa-edit"></i> Edit</button>
                                                    <button onClick={() => handleDelete(voter.id)} className="btn btn-danger btn-sm btn-flat"><i className="fa fa-trash"></i> Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                                        {voters.length === 0 && !loading && (
                                            <tr><td colSpan="11" className="text-center">No voters found.</td></tr>
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
                        <h4 className="modal-title"><b>{editMode ? 'Edit Voter' : 'Add New Voter'}</b></h4>
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
                                <label className="col-sm-3 control-label">Firstname</label>
                                <div className="col-sm-9">
                                    <input type="text" className="form-control" value={formData.firstname} onChange={e => setFormData({...formData, firstname: e.target.value})} required />
                                </div>
                            </div>
                             {/* Added Middlename Field */}
                            <div className="form-group mb-3">
                                <label className="col-sm-3 control-label">Middlename</label>
                                <div className="col-sm-9">
                                    <input type="text" className="form-control" value={formData.middlename} onChange={e => setFormData({...formData, middlename: e.target.value})} placeholder="Optional" />
                                </div>
                            </div>
                            <div className="form-group mb-3">
                                <label className="col-sm-3 control-label">Lastname</label>
                                <div className="col-sm-9">
                                    <input type="text" className="form-control" value={formData.lastname} onChange={e => setFormData({...formData, lastname: e.target.value})} required />
                                </div>
                            </div>
                            <div className="form-group mb-3">
                                <label className="col-sm-3 control-label">Age</label>
                                <div className="col-sm-9">
                                    <input type="number" className="form-control" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} required min="18" placeholder="Must be 18+" />
                                </div>
                            </div>
                            
                            {/* Gender Field */}
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

                            <div className="form-group mb-3">
                                <label className="col-sm-3 control-label">Address</label>
                                <div className="col-sm-9">
                                    <textarea className="form-control" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} required></textarea>
                                </div>
                            </div>
                            
                            {/* Identity Type Selection */}
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
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        value={formData.aadhaar_hash} 
                                        onChange={e => setFormData({...formData, aadhaar_hash: e.target.value})} 
                                        required 
                                        placeholder={
                                            formData.identity_type === 'aadhaar' ? '16 Digits (Numbers)' :
                                            formData.identity_type === 'voter_id' ? '10 Characters (Alphanumeric)' :
                                            'Max 8 Characters (Alphanumeric)'
                                        }
                                    />
                                </div>
                            </div>
                            <div className="form-group mb-3">
                                <label className="col-sm-3 control-label">Password</label>
                                <div className="col-sm-9">
                                    <input type="password" className="form-control" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder={editMode ? "Leave blank to keep current" : "Enter password"} required={!editMode} />
                                </div>
                            </div>
                            
                            <div className="form-group mb-3">
                                <label className="col-sm-3 control-label">Photo</label>
                                <div className="col-sm-9">
                                    <input type="file" className="form-control" onChange={e => setFormData({...formData, photo: e.target.files[0]})} />
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

export default Voters
