import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from './DashboardLayout'


function Candidates() {
  const [candidates, setCandidates] = useState([])
  const [positions, setPositions] = useState([])
  const [loading, setLoading] = useState(true)

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
    symbol: null,
    manifesto: ''
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

    fetchPositions()
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
          symbol: null,
          manifesto: ''
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
          symbol: null,
          manifesto: cand.manifesto || ''
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
      data.append('manifesto', formData.manifesto);
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
    <DashboardLayout title="Candidates List" loading={loading}>
        <section className="bg-slate-900 rounded-xl border border-slate-800 shadow-sm overflow-hidden animate-fade-in">
             <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
                <a href="#addnew" onClick={(e) => {e.preventDefault(); openAddModal()}} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-lg shadow-indigo-500/20">
                    <i className="fa fa-plus"></i> New Candidate
                </a>
             </div>
             
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-300">
                    <thead className="text-xs text-slate-400 uppercase bg-slate-950 border-b border-slate-700">
                        <tr>
                            <th className="px-6 py-4 font-semibold tracking-wider">ID</th>
                            <th className="px-6 py-4 font-semibold tracking-wider">Position</th>
                            <th className="px-6 py-4 font-semibold tracking-wider">Name</th>
                            <th className="px-6 py-4 font-semibold tracking-wider">Party</th>
                            <th className="px-6 py-4 font-semibold tracking-wider">Identity</th>
                            <th className="px-6 py-4 font-semibold tracking-wider">Gender</th>
                            <th className="px-6 py-4 font-semibold tracking-wider">Photo</th>
                            <th className="px-6 py-4 font-semibold tracking-wider">Symbol</th>
                            <th className="px-6 py-4 font-semibold tracking-wider">Manifesto</th>
                            <th className="px-6 py-4 font-semibold tracking-wider text-right">Tools</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {candidates.map(cand => (
                            <tr key={cand.id} className="hover:bg-slate-800/50 transition-colors">
                                <td className="px-6 py-4 font-mono text-slate-500">{cand.candidate_id}</td>
                                <td className="px-6 py-4 font-medium text-white">{cand.position_name}</td>
                                <td className="px-6 py-4 text-white">{cand.firstname} {cand.lastname}</td>
                                <td className="px-6 py-4">
                                    {cand.party_type === 'party' ? (
                                        <span className="px-2 py-1 rounded text-xs font-semibold bg-indigo-900/50 text-indigo-300 border border-indigo-700/50">{cand.party_name}</span>
                                    ) : (
                                        <span className="px-2 py-1 rounded text-xs font-semibold bg-slate-700 text-slate-300 border border-slate-600">Independent</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="block text-xs text-slate-500 uppercase">{cand.identity_type || 'N/A'}</span>
                                    <span className="font-mono text-slate-300">{cand.identity_number}</span>
                                </td>
                                <td className="px-6 py-4">{cand.gender}</td>
                                <td className="px-6 py-4">
                                    <img 
                                        src={cand.photo ? `http://127.0.0.1:8000${cand.photo}` : `https://ui-avatars.com/api/?name=${cand.firstname}+${cand.lastname}`} 
                                        className="w-10 h-10 rounded-full border border-slate-600 object-cover" 
                                        alt="Candidate"
                                    />
                                </td>
                                <td className="px-6 py-4">
                                    {cand.symbol && <img src={`http://127.0.0.1:8000${cand.symbol}`} className="w-10 h-10 object-contain rounded bg-white/5 p-1" alt="Symbol" />}
                                </td>
                                <td className="px-6 py-4 text-xs max-w-xs truncate text-slate-400">
                                    {cand.manifesto ? (cand.manifesto.length > 50 ? cand.manifesto.substring(0, 50) + "..." : cand.manifesto) : <em>-</em>}
                                </td>
                                <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                                    <button onClick={() => openEditModal(cand)} className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 rounded text-xs font-medium transition-colors border border-emerald-600/30"><i className="fa fa-edit"></i> Edit</button>
                                    <button onClick={() => handleDelete(cand.id)} className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 rounded text-xs font-medium transition-colors border border-rose-600/30"><i className="fa fa-trash"></i> Delete</button>
                                </td>
                            </tr>
                        ))}
                        {candidates.length === 0 && !loading && (
                            <tr><td colSpan="10" className="px-6 py-8 text-center text-slate-500 italic">No candidates found. Click "New Candidate" to add one.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </section>

        {/* Modal */}
        {showModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
                <div className="relative bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-700 animate-slide-up max-h-[90vh] flex flex-col">
                    <div className="flex justify-between items-center p-5 border-b border-slate-800 bg-slate-800/50">
                        <h4 className="text-xl font-bold text-white">{editMode ? 'Edit Candidate' : 'Add New Candidate'}</h4>
                        <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white transition-colors text-2xl leading-none">&times;</button>
                    </div>
                    
                    <div className="p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {validationError && (
                                <div className="bg-rose-500/10 border border-rose-500/50 text-rose-400 px-4 py-3 rounded-lg text-sm flex items-start gap-3">
                                    <i className="fa fa-circle-exclamation mt-0.5"></i>
                                    <span className="whitespace-pre-line">{validationError}</span>
                                </div>
                            )}
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-400">Position <span className="text-rose-500">*</span></label>
                                    <select className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all appearance-none" value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} required>
                                        <option value="">Select Position</option>
                                        {positions.map(pos => (
                                            <option key={pos.id} value={pos.id}>{pos.description}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-400">Gender</label>
                                    <select className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all appearance-none" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-400">Firstname <span className="text-rose-500">*</span></label>
                                    <input type="text" className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" value={formData.firstname} onChange={e => setFormData({...formData, firstname: e.target.value})} required />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-400">Lastname <span className="text-rose-500">*</span></label>
                                    <input type="text" className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" value={formData.lastname} onChange={e => setFormData({...formData, lastname: e.target.value})} required />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-400">Affiliation</label>
                                    <select className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all appearance-none" value={formData.party_type} onChange={e => setFormData({...formData, party_type: e.target.value})}>
                                        <option value="independent">Independent</option>
                                        <option value="party">Political Party</option>
                                    </select>
                                </div>
                                {formData.party_type === 'party' && (
                                    <div className="space-y-1 animate-fade-in">
                                        <label className="text-sm font-medium text-slate-400">Party Name <span className="text-rose-500">*</span></label>
                                        <input type="text" className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" value={formData.party_name} onChange={e => setFormData({...formData, party_name: e.target.value})} required />
                                    </div>
                                )}
                            </div>

                             <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-400">Identity Type</label>
                                    <select className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all appearance-none" value={formData.identity_type} onChange={e => setFormData({...formData, identity_type: e.target.value})}>
                                        <option value="aadhaar">Aadhaar Card</option>
                                        <option value="voter_id">Voter ID Card</option>
                                        <option value="passport">Passport</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-400">Identity Number <span className="text-rose-500">*</span></label>
                                    <input type="text" className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" value={formData.identity_number} onChange={e => setFormData({...formData, identity_number: e.target.value})} required />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-400">Address <span className="text-rose-500">*</span></label>
                                <textarea className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" rows="2" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} required></textarea>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-400">Manifesto</label>
                                <textarea className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" rows="3" value={formData.manifesto} onChange={e => setFormData({...formData, manifesto: e.target.value})} placeholder="Platform description..."></textarea>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-400">Photo</label>
                                    <input type="file" className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-slate-800 file:text-indigo-400 hover:file:bg-slate-700 transition-all border border-slate-700 rounded-lg cursor-pointer bg-slate-950" onChange={e => setFormData({...formData, photo: e.target.files[0]})} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-400">Symbol</label>
                                    <input type="file" className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-slate-800 file:text-indigo-400 hover:file:bg-slate-700 transition-all border border-slate-700 rounded-lg cursor-pointer bg-slate-950" onChange={e => setFormData({...formData, symbol: e.target.files[0]})} />
                                </div>
                            </div>
                            
                            <div className="pt-4 flex justify-end gap-3 border-t border-slate-800 mt-6">
                                <button type="button" className="px-5 py-2.5 rounded-lg border border-slate-600 text-slate-300 font-medium hover:bg-slate-800 transition-colors" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="px-5 py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2" name="save">
                                    <i className="fa fa-save"></i> Save Candidate
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        )}
    </DashboardLayout>
  )
}

export default Candidates
