import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from './DashboardLayout'
// import './AdminDashboard.css'


function ElectionTitle() {
  const [title, setTitle] = useState("Voting System")
  const [loading, setLoading] = useState(true)
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
          
          // Clear success message after 3 seconds
          setTimeout(() => {
              setSuccessMessage('')
          }, 3000)
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
    <DashboardLayout title="Election Title" loading={loading}>
        <div className="max-w-xl mx-auto">
            <section className="bg-slate-900 rounded-xl border border-slate-800 shadow-lg overflow-hidden animate-fade-in">
                <div className="p-4 border-b border-slate-800 bg-slate-800/50">
                    <h3 className="text-lg font-semibold text-white">Configure Election Title</h3>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6">
                    {validationError && (
                         <div className="bg-rose-500/10 border border-rose-500/50 text-rose-400 px-4 py-3 rounded-lg text-sm flex items-start gap-3 mb-6">
                            <i className="fa fa-circle-exclamation mt-0.5"></i>
                            <div>{validationError}</div>
                        </div>
                    )}
                    {successMessage && (
                        <div className="bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 px-4 py-3 rounded-lg text-sm flex items-start gap-3 mb-6">
                            <i className="fa fa-circle-check mt-0.5"></i>
                            <div>{successMessage}</div>
                        </div>
                    )}

                    <div className="mb-6">
                        <label htmlFor="electionTitle" className="block text-xs font-medium text-slate-400 uppercase mb-2">Election Title</label>
                        <input 
                            type="text" 
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors shadow-inner" 
                            id="electionTitle" 
                            placeholder="Enter election title" 
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div className="flex justify-end pt-4 border-t border-slate-800">
                        <button type="submit" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                            <i className="fa fa-save"></i> Save Changes
                        </button>
                    </div>
                </form>
            </section>
        </div>
    </DashboardLayout>
  )
}

export default ElectionTitle
