import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from './DashboardLayout'
// import './AdminDashboard.css'


function BallotPosition() {
  const [positions, setPositions] = useState([])
  const [loading, setLoading] = useState(true)
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
      // Sort by priority ASC (1 shows first, etc.) - or however backend sends it
      // Let's assume we want to control the order.
      // If "Higher number shows first", then DESC. 
      // Let's assume standard intuitive sort: Item 1 (Priority 1), Item 2 (Priority 2).
      const sorted = response.data.sort((a, b) => a.priority - b.priority);
      setPositions(sorted)
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

  const moveUp = async (index) => {
      if (index === 0) return;
      const current = positions[index];
      const prev = positions[index - 1];
      
      // Swap priorities locally for immediate UI update
      const newPositions = [...positions];
      newPositions[index] = prev;
      newPositions[index - 1] = current;
      setPositions(newPositions);

      // Persist changes
      await updatePriority(current, prev.priority);
      await updatePriority(prev, current.priority);
      fetchPositions();
  }

  const moveDown = async (index) => {
      if (index === positions.length - 1) return;
      const current = positions[index];
      const next = positions[index + 1];

      // Swap priorities locally
      const newPositions = [...positions];
      newPositions[index] = next;
      newPositions[index + 1] = current;
      setPositions(newPositions);

      // Persist changes
      await updatePriority(current, next.priority);
      await updatePriority(next, current.priority);
      fetchPositions();
  }

  const updatePriority = async (item, newPriority) => {
      try {
          await axios.put(`http://127.0.0.1:8000/api/admin/positions/${item.id}/`, 
            { ...item, priority: newPriority }, 
            { headers: { 'Authorization': `Token ${token}` } }
          )
      } catch (err) {
          console.error("Failed to update priority", err)
      }
  }

  return (
    <DashboardLayout title="Ballot Position" loading={loading}>
        <section className="bg-slate-900 rounded-xl border border-slate-800 shadow-sm overflow-hidden animate-fade-in">
             <div className="p-4 border-b border-slate-800 bg-slate-800/50">
                <h3 className="text-lg font-semibold text-white">Reorder Positions</h3>
             </div>
             
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-300">
                    <thead className="text-xs text-slate-400 uppercase bg-slate-950 border-b border-slate-700">
                        <tr>
                            <th className="px-6 py-4 font-semibold tracking-wider">Description</th>
                            <th className="px-6 py-4 font-semibold tracking-wider">Max Vote</th>
                            <th className="px-6 py-4 font-semibold tracking-wider text-center">Move</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {positions.map((pos, index) => (
                            <tr key={pos.id} className="hover:bg-slate-800/50 transition-colors">
                                <td className="px-6 py-4 font-medium text-white">{pos.description}</td>
                                <td className="px-6 py-4">{pos.max_vote}</td>
                                <td className="px-6 py-4 text-center">
                                    <div className="inline-flex rounded-md shadow-sm" role="group">
                                        <button 
                                            onClick={() => moveUp(index)} 
                                            className={`px-3 py-1.5 text-xs font-medium border border-slate-700 rounded-l-lg ${
                                                index === 0 
                                                ? 'bg-slate-800 text-slate-600 cursor-not-allowed' 
                                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                                            }`}
                                            disabled={index === 0}
                                        >
                                            <i className="fa fa-arrow-up"></i>
                                        </button>
                                        <button 
                                            onClick={() => moveDown(index)} 
                                            className={`px-3 py-1.5 text-xs font-medium border-t border-b border-r border-slate-700 rounded-r-lg ${
                                                index === positions.length - 1 
                                                ? 'bg-slate-800 text-slate-600 cursor-not-allowed' 
                                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                                            }`}
                                            disabled={index === positions.length - 1}
                                        >
                                            <i className="fa fa-arrow-down"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    </DashboardLayout>
  )
}

export default BallotPosition
