import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from './DashboardLayout'
// import './AdminDashboard.css'


function Voters() {
  const [voters, setVoters] = useState([])
  const [loading, setLoading] = useState(true)
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
      
      // 3. Validate Password (if provided)
      if (formData.password) {
          if (!/^\d{1,4}$/.test(formData.password)) {
               setValidationError("Password must be numeric and up to 4 digits only.");
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
    <DashboardLayout title="Voters List" loading={loading}>
        <section className="bg-slate-900 rounded-xl border border-slate-800 shadow-sm overflow-hidden animate-fade-in">
             <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
                <a href="#addnew" onClick={(e) => {e.preventDefault(); openAddModal()}} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-lg shadow-indigo-500/20">
                    <i className="fa fa-plus"></i> New Voter
                </a>
             </div>
             
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-300">
                    <thead className="text-xs text-slate-400 uppercase bg-slate-950 border-b border-slate-700">
                        <tr>
                            <th className="px-6 py-4 font-semibold tracking-wider">Voter ID</th>
                            <th className="px-6 py-4 font-semibold tracking-wider">Password</th>
                            <th className="px-6 py-4 font-semibold tracking-wider">Lastname</th>
                            <th className="px-6 py-4 font-semibold tracking-wider">Firstname</th>
                            <th className="px-6 py-4 font-semibold tracking-wider">Middlename</th>
                            <th className="px-6 py-4 font-semibold tracking-wider">Gender</th>
                            <th className="px-6 py-4 font-semibold tracking-wider">Identity No.</th>
                            <th className="px-6 py-4 font-semibold tracking-wider">Type</th>
                            <th className="px-6 py-4 font-semibold tracking-wider">Photo</th>
                            <th className="px-6 py-4 font-semibold tracking-wider text-right">Tools</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {voters.map(voter => (
                            <tr key={voter.id} className="hover:bg-slate-800/50 transition-colors">
                                <td className="px-6 py-4 font-mono text-xs text-indigo-400 font-semibold">{voter.voters_id}</td>
                                <td className="px-6 py-4 text-center">
                                    {voter.password_set ? (
                                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto border border-emerald-500/20">
                                            <i className="fa fa-check text-emerald-500 text-sm"></i>
                                        </div>
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto border border-rose-500/20">
                                            <i className="fa fa-times text-rose-500 text-sm"></i>
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 font-medium text-white">{voter.lastname}</td>
                                <td className="px-6 py-4">{voter.firstname}</td>
                                <td className="px-6 py-4">{voter.middlename}</td>
                                <td className="px-6 py-4">{voter.gender}</td>
                                <td className="px-6 py-4 font-mono text-xs">{voter.aadhaar_hash}</td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-700 text-slate-300 uppercase border border-slate-600">
                                        {voter.identity_type || 'aadhaar'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <img 
                                        src={voter.photo ? `http://127.0.0.1:8000${voter.photo}` : `https://ui-avatars.com/api/?name=${voter.firstname}+${voter.lastname}`} 
                                        width="30" height="30" 
                                        className="rounded-full ring-2 ring-slate-700"
                                        alt="Voter"
                                    />
                                </td>
                                <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                                    <button onClick={() => openEditModal(voter)} className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 rounded text-xs font-medium transition-colors border border-emerald-600/30"><i className="fa fa-edit"></i> Edit</button>
                                    <button onClick={() => handleDelete(voter.id)} className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 rounded text-xs font-medium transition-colors border border-rose-600/30"><i className="fa fa-trash"></i> Delete</button>
                                </td>
                            </tr>
                        ))}
                        {voters.length === 0 && !loading && (
                            <tr><td colSpan="8" className="px-6 py-8 text-center text-slate-500 italic">No voters found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </section>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
            <div className="relative bg-slate-900 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-700 animate-slide-up flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-5 border-b border-slate-800 bg-slate-800/50">
                    <h4 className="text-xl font-bold text-white">{editMode ? 'Edit Voter' : 'Add New Voter'}</h4>
                    <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white transition-colors text-2xl leading-none">&times;</button>
                </div>
                
                <div className="p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {validationError && (
                            <div className="bg-rose-500/10 border border-rose-500/50 text-rose-400 px-4 py-3 rounded-lg text-sm flex items-start gap-3 whitespace-pre-line">
                                <i className="fa fa-circle-exclamation mt-0.5"></i>
                                <div>{validationError}</div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Firstname</label>
                                <input type="text" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors" value={formData.firstname} onChange={e => setFormData({...formData, firstname: e.target.value})} required />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Middlename</label>
                                <input type="text" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors" value={formData.middlename} onChange={e => setFormData({...formData, middlename: e.target.value})} placeholder="Optional" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Lastname</label>
                            <input type="text" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors" value={formData.lastname} onChange={e => setFormData({...formData, lastname: e.target.value})} required />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Age</label>
                                <input type="number" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} required min="18" placeholder="18+" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Gender</label>
                                <select className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors appearance-none" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Address</label>
                            <textarea className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors resize-none h-20" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} required></textarea>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Identity Type</label>
                                <select className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors appearance-none" value={formData.identity_type} onChange={e => setFormData({...formData, identity_type: e.target.value})}>
                                    <option value="aadhaar">Aadhaar Card</option>
                                    <option value="voter_id">Voter ID Card</option>
                                    <option value="passport">Passport</option>
                                </select>
                            </div>
                             <div>
                                <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Identity No.</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors" 
                                    value={formData.aadhaar_hash} 
                                    onChange={e => setFormData({...formData, aadhaar_hash: e.target.value})} 
                                    required 
                                    placeholder="Enter ID Number"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Password</label>
                            <input 
                                type="password" 
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors" 
                                value={formData.password} 
                                onChange={e => {
                                    const val = e.target.value;
                                    if (/^\d{0,4}$/.test(val)) {
                                        setFormData({...formData, password: val})
                                    }
                                }} 
                                placeholder={editMode ? "Leave blank to keep current" : "Enter max 4 digits"} 
                                required={!editMode} 
                                maxLength="4"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Photo</label>
                            <input type="file" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 transition-colors" onChange={e => setFormData({...formData, photo: e.target.files[0]})} />
                        </div>

                        <div className="flex justify-end pt-4 border-t border-slate-800 space-x-3">
                            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors">Cancel</button>
                            <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20">Save Voter</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
      )}
    </DashboardLayout>
  )
}

export default Voters
