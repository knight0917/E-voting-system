import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from './DashboardLayout'


function Positions() {
  const [positions, setPositions] = useState([])
  const [loading, setLoading] = useState(true)

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
              msg = JSON.stringify(err.response.data);
          }
          setValidationError(msg);
      }
  }

  return (
    <DashboardLayout title="Positions" loading={loading}>
        <section className="bg-slate-900 rounded-xl border border-slate-800 shadow-sm overflow-hidden animate-fade-in">
             <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
                <a href="#addnew" onClick={(e) => {e.preventDefault(); openAddModal()}} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-lg shadow-indigo-500/20">
                    <i className="fa fa-plus"></i> New Position
                </a>
             </div>
             
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-300">
                    <thead className="text-xs text-slate-400 uppercase bg-slate-950 border-b border-slate-700">
                        <tr>
                            <th className="px-6 py-4 font-semibold tracking-wider">Description</th>
                            <th className="px-6 py-4 font-semibold tracking-wider">Max Vote</th>
                            <th className="px-6 py-4 font-semibold tracking-wider">Priority</th>
                            <th className="px-6 py-4 font-semibold tracking-wider text-right">Tools</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {positions.map(pos => (
                            <tr key={pos.id} className="hover:bg-slate-800/50 transition-colors">
                                <td className="px-6 py-4 font-medium text-white">{pos.description}</td>
                                <td className="px-6 py-4">{pos.max_vote}</td>
                                <td className="px-6 py-4">{pos.priority}</td>
                                <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                                    <button onClick={() => openEditModal(pos)} className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 rounded text-xs font-medium transition-colors border border-emerald-600/30"><i className="fa fa-edit"></i> Edit</button>
                                    <button onClick={() => handleDelete(pos.id)} className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 rounded text-xs font-medium transition-colors border border-rose-600/30"><i className="fa fa-trash"></i> Delete</button>
                                </td>
                            </tr>
                        ))}
                        {positions.length === 0 && !loading && (
                            <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-500 italic">No positions found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </section>

        {/* Modal */}
        {showModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
                <div className="relative bg-slate-900 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-700 animate-slide-up flex flex-col">
                    <div className="flex justify-between items-center p-5 border-b border-slate-800 bg-slate-800/50">
                        <h4 className="text-xl font-bold text-white">{editMode ? 'Edit Position' : 'Add New Position'}</h4>
                        <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white transition-colors text-2xl leading-none">&times;</button>
                    </div>
                    
                    <div className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {validationError && (
                                <div className="bg-rose-500/10 border border-rose-500/50 text-rose-400 px-4 py-3 rounded-lg text-sm flex items-start gap-3">
                                    <i className="fa fa-circle-exclamation mt-0.5"></i>
                                    <span className="whitespace-pre-line">{validationError}</span>
                                </div>
                            )}

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-400">Description <span className="text-rose-500">*</span></label>
                                <input type="text" className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required placeholder="e.g., President" />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-5">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-400">Max Vote <span className="text-rose-500">*</span></label>
                                    <input type="number" className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" value={formData.max_vote} onChange={e => setFormData({...formData, max_vote: e.target.value})} required min="1" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-400">Priority <span className="text-rose-500">*</span></label>
                                    <input type="number" className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})} required placeholder="Order" />
                                </div>
                            </div>
                            
                            <div className="pt-4 flex justify-end gap-3 border-t border-slate-800 mt-6">
                                <button type="button" className="px-5 py-2.5 rounded-lg border border-slate-600 text-slate-300 font-medium hover:bg-slate-800 transition-colors" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="px-5 py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2" name="save">
                                    <i className="fa fa-save"></i> Save Position
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

export default Positions
