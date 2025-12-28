import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from './DashboardLayout'


function AdminDashboard() {
  const [stats, setStats] = useState({
    summary: { positions: 0, candidates: 0, voters: 0, votes_cast: 0 },
    tally: []
  })
  const [loading, setLoading] = useState(true)
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
                { id: 10, name: "Candidate Y", votes: 5 }
              ]
            }
          ]
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [navigate])

  const getMaxVotes = (candidates) => {
    const max = Math.max(...candidates.map(c => c.votes), 0);
    return max === 0 ? 1 : max;
  }

  return (
    <DashboardLayout title="Dashboard" loading={loading}>
        <section className="content">
            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[
                    { label: 'No. of Positions', val: stats.summary.positions, icon: 'list-check', color: 'from-indigo-500 to-indigo-700', link: '/positions' },
                    { label: 'No. of Candidates', val: stats.summary.candidates, icon: 'user-tie', color: 'from-emerald-500 to-emerald-700', link: '/candidates' },
                    { label: 'Total Voters', val: stats.summary.voters, icon: 'users', color: 'from-amber-500 to-amber-700', link: '/voters' },
                    { label: 'Voters Voted', val: stats.summary.votes_cast, icon: 'check-to-slot', color: 'from-rose-500 to-rose-700', link: '/votes' }
                ].map((item, i) => (
                    <div key={i} className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${item.color} p-5 shadow-lg text-white transition-all hover:-translate-y-1 hover:shadow-xl group`}>
                        <div className="relative z-10">
                            <h3 className="text-3xl font-bold mb-1">{item.val}</h3>
                            <p className="text-white/80 font-medium text-sm uppercase tracking-wide">{item.label}</p>
                        </div>
                        <div className="absolute top-0 right-0 -mt-2 -mr-2 opacity-20 transform rotate-12 group-hover:scale-110 transition-transform duration-500">
                            <i className={`fa fa-${item.icon} text-7xl`}></i>
                        </div>
                        <button 
                            onClick={() => navigate(item.link)} 
                            className="absolute bottom-0 left-0 w-full py-2 bg-black/10 text-center text-xs font-semibold backdrop-blur-sm hover:bg-black/20 transition-colors flex justify-center items-center cursor-pointer"
                        >
                            More Info <i className="fa fa-arrow-circle-right ml-1"></i>
                        </button>
                    </div>
                ))}
            </div>

            {/* Votes Tally */}
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Votes Tally</h3>
                <button 
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
                >
                    <i className="fa fa-print"></i> Print
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {stats.tally.map((pos, index) => {
                        const maxVotes = getMaxVotes(pos.candidates);
                        return (
                        <div key={index} className="bg-slate-900 rounded-xl border border-slate-800 shadow-sm overflow-hidden hover:border-slate-700 transition-colors">
                            <div className="px-6 py-4 border-b border-slate-800 bg-slate-800/50 flex justify-between items-center">
                                <h4 className="text-lg font-semibold text-slate-100">{pos.position}</h4>
                                <span className="text-xs font-mono text-slate-500 bg-slate-950 px-2 py-1 rounded">ID: {index + 1}</span>
                            </div>
                            <div className="p-6 space-y-5">
                                {pos.candidates.map((cand, idx) => {
                                    const percentage = (cand.votes / maxVotes) * 100;
                                    // Modern progress bar colors
                                    const colors = [
                                        'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]', 
                                        'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]', 
                                        'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]', 
                                        'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]'
                                    ];
                                    const colorClass = colors[idx % 4];
                                    
                                    return (
                                        <div key={cand.id}>
                                            <div className="flex justify-between mb-2 text-sm">
                                                <div className="flex items-center gap-2">
                                                    {cand.symbol && (
                                                        <img src={`http://127.0.0.1:8000${cand.symbol}`} className="w-6 h-6 object-contain rounded bg-white/5 p-0.5 border border-slate-700" alt="S" />
                                                    )}
                                                    <span className="font-medium text-slate-300">{cand.name}</span>
                                                </div>
                                                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-xs text-indigo-300 font-mono border border-slate-700">{cand.votes} votes</span>
                                            </div>
                                            <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
                                                <div 
                                                    className={`${colorClass} h-full rounded-full transition-all duration-1000 ease-out`} 
                                                    style={{width: `${percentage}%`}}
                                                ></div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                        )
                })}
            </div>
        </section>
    </DashboardLayout>
  )
}

export default AdminDashboard
