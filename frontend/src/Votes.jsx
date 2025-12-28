import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from './DashboardLayout'



function Votes() {
  const [votes, setVotes] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const token = localStorage.getItem('admin_token')

  useEffect(() => {
    if (!token) {
      navigate('/admin-login')
      return
    }
    fetchVotes()
  }, [navigate, token])

  const fetchVotes = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/admin/votes/', {
        headers: { 'Authorization': `Token ${token}` }
      })
      setVotes(response.data)
    } catch (err) {
      console.error("Error fetching votes", err)
      if (err.response && err.response.status === 401) {
          localStorage.removeItem('admin_token')
          navigate('/admin-login')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResetVotes = async () => {
      if(!window.confirm("WARNING: This will delete ALL votes. This action cannot be undone. Are you sure?")) return;
      
      try {
          await axios.post('http://127.0.0.1:8000/api/admin/votes/reset/', {}, {
            headers: { 'Authorization': `Token ${token}` }
          })
          alert("All votes have been reset.");
          fetchVotes();
      } catch(err) {
          console.error("Reset failed", err);
          alert("Failed to reset votes.");
      }
  }

  return (
    <DashboardLayout title="Votes" loading={loading}>
        <section className="bg-slate-900 rounded-xl border border-slate-800 shadow-sm overflow-hidden animate-fade-in">
             <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
                <h3 className="text-lg font-semibold text-white">All Votes</h3>
                <button onClick={handleResetVotes} className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-lg shadow-rose-500/20">
                    <i className="fa fa-refresh"></i> Reset Votes
                </button>
             </div>
             
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-300">
                    <thead className="text-xs text-slate-400 uppercase bg-slate-950 border-b border-slate-700">
                        <tr>
                            <th className="px-6 py-4 font-semibold tracking-wider">Voter ID</th>
                            <th className="px-6 py-4 font-semibold tracking-wider">Candidate Voted For</th>
                            <th className="px-6 py-4 font-semibold tracking-wider">Symbol</th>
                            <th className="px-6 py-4 font-semibold tracking-wider">Position</th>
                            <th className="px-6 py-4 font-semibold tracking-wider">Time</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {votes.map(vote => (
                            <tr key={vote.id} className="hover:bg-slate-800/50 transition-colors">
                                <td className="px-6 py-4 font-mono font-medium text-slate-200">{vote.voter_id_number}</td>
                                <td className="px-6 py-4 font-medium text-white">{vote.candidate_name}</td>
                                <td className="px-6 py-4">
                                    {vote.candidate_symbol && (
                                        <img src={`http://127.0.0.1:8000${vote.candidate_symbol}`} className="w-8 h-8 object-contain rounded bg-white/5 p-0.5" alt="Symbol" />
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                     <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                        {vote.position_name}
                                     </span>
                                </td>
                                <td className="px-6 py-4 text-slate-400">{new Date(vote.timestamp).toLocaleString()}</td>
                            </tr>
                        ))}
                        {votes.length === 0 && !loading && (
                            <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500 italic">No votes recorded yet.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    </DashboardLayout>
  )
}

export default Votes
