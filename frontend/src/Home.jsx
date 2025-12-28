import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function Home({ token, user, handleLogout }) {
  const [positions, setPositions] = useState([])
  const [alreadyVoted, setAlreadyVoted] = useState(false)
  const [electionTitle, setElectionTitle] = useState('')
  const [votes, setVotes] = useState({}) // {positionId: [candidateId]}
  const [modalOpen, setModalOpen] = useState(false)
  const [platformModal, setPlatformModal] = useState(null) // { name, manifesto }
  const [previewData, setPreviewData] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    if (!token) {
        navigate('/')
        return
    }
    fetchBallot()
  }, [token])

  const fetchBallot = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/ballot/?token=${token}`)
      setPositions(response.data.positions)
      setAlreadyVoted(response.data.already_voted)
      setElectionTitle(response.data.election_title)
    } catch (err) {
      console.error(err)
    }
  }

  const handleVoteChange = (posId, candId, maxVote) => {
    setVotes(prev => {
        const currentVotes = prev[posId] || []
        const isSelected = currentVotes.includes(candId)

        if (maxVote > 1) {
            if (!isSelected) {
                if (currentVotes.length >= maxVote) return prev
                return { ...prev, [posId]: [...currentVotes, candId] }
            } else {
                return { ...prev, [posId]: currentVotes.filter(id => id !== candId) }
            }
        } else {
            // Radio behavior: if clicking selected, do nothing (or toggle off?). 
            // Usually radio switches to new one.
            return { ...prev, [posId]: [candId] }
        }
    })
  }

  const isCandidateSelected = (posId, candId) => {
      return votes[posId]?.includes(candId) || false
  }

  const handlePreview = () => {
    const preview = []
    positions.forEach(pos => {
        const selectedIds = votes[pos.id] || []
        if (selectedIds.length > 0) {
            const selectedCandidates = pos.candidates.filter(c => selectedIds.includes(c.id))
            preview.push({
                position: pos.description,
                candidates: selectedCandidates.map(c => `${c.firstname} ${c.lastname}`).join(', ')
            })
        }
    })
    
    if (preview.length === 0) {
        alert("Please select at least one candidate to cast your vote.")
        return
    }
    setPreviewData(preview)
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    try {
        await axios.post('http://127.0.0.1:8000/api/vote/', {
            token: token,
            votes: votes
        })
        setModalOpen(false)
        fetchBallot() // This will trigger the "already voted" view
    } catch (err) {
        alert(err.response?.data?.error || 'Submission failed')
    }
  }

  const resetPosition = (posId) => {
       setVotes(prev => {
           const newVotes = {...prev}
           delete newVotes[posId]
           return newVotes
       })
  }

  if (alreadyVoted) {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl animate-fade-in">
                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i className="fa fa-check text-4xl text-emerald-500"></i>
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Vote Submitted!</h2>
                <p className="text-slate-400 mb-8">Thank you for participating in the election. Your vote has been securely recorded.</p>
                <div className="flex flex-col gap-3">
                    <button onClick={handleLogout} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-indigo-500/20">
                        Sign Out
                    </button>
                    {/* Optional: Add a "View Results" button if public results are allowed */}
                </div>
            </div>
        </div>
      )
  }

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-200 selection:bg-indigo-500/30">
      
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 z-50 flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-3">
              <div className="text-indigo-500 text-2xl">
                  <i className="fa fa-vote-yea"></i>
              </div>
              <span className="font-bold text-xl tracking-tight text-white hidden sm:block">Secure Vote</span>
          </div>
          
          <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 bg-slate-800/50 py-1.5 px-3 rounded-full border border-slate-700/50">
                   <img 
                        src={user?.photo ? `http://127.0.0.1:8000${user.photo}` : `https://ui-avatars.com/api/?name=${user?.firstname}+${user?.lastname}&background=6366f1&color=fff`} 
                        className="w-8 h-8 rounded-full border border-slate-600 object-cover" 
                        alt="User"
                    />
                   <span className="text-sm font-medium text-white hidden md:block">{user?.firstname} {user?.lastname}</span>
              </div>
              <button 
                onClick={handleLogout} 
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                title="Logout"
              >
                  <i className="fa fa-sign-out-alt text-lg"></i>
              </button>
          </div>
      </nav>
      
      {/* Main Content */}
      <main className="pt-24 pb-20 px-4 max-w-7xl mx-auto space-y-12">
        <header className="text-center space-y-4 mb-12 animate-slide-up">
            <span className="inline-block py-1 px-3 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold uppercase tracking-widest border border-indigo-500/20">
                Official Ballot
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight drop-shadow-sm">
                {electionTitle || 'Election 2026'}
            </h1>
            <p className="max-w-2xl mx-auto text-slate-400 text-lg">
                Please review the candidates below carefully. Your vote is your voice.
            </p>
        </header>
        
        {positions.map((position, index) => (
            <section key={position.id} className="animate-slide-up" style={{animationDelay: `${index * 100}ms`}}>
                <div className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
                    <div className="p-6 border-b border-slate-800 bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-1">{position.description}</h2>
                            <p className="text-sm text-slate-400">
                                {position.max_vote > 1 
                                    ? `You generally vote for up to ` 
                                    : 'Select '}
                                <span className="font-semibold text-indigo-400">
                                    {position.max_vote > 1 ? position.max_vote : 'one'} candidate
                                </span>
                            </p>
                        </div>
                        {votes[position.id]?.length > 0 && (
                            <button 
                                onClick={() => resetPosition(position.id)}
                                className="text-xs font-medium text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1"
                            >
                                <i className="fa fa-undo"></i> Reset Selection
                            </button>
                        )}
                    </div>
                    
                    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {position.candidates.map(candidate => {
                            const selected = isCandidateSelected(position.id, candidate.id);
                            
                            return (
                                <div 
                                    key={candidate.id} 
                                    className={`relative group rounded-xl border-2 transition-all duration-300 cursor-pointer overflow-hidden
                                        ${selected 
                                            ? 'border-indigo-500 bg-indigo-500/10 shadow-[0_0_20px_rgba(99,102,241,0.3)] scale-[1.02]' 
                                            : 'border-slate-800 bg-slate-900 hover:border-slate-600 hover:bg-slate-800'
                                        }
                                    `}
                                    onClick={() => handleVoteChange(position.id, candidate.id, position.max_vote)}
                                >
                                    {/* Selection Checkmark */}
                                    {selected && (
                                        <div className="absolute top-3 right-3 w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white shadow-lg z-10 animate-bounce-small">
                                            <i className="fa fa-check"></i>
                                        </div>
                                    )}

                                    {/* Image Aspect Ratio Container */}
                                    <div className="aspect-square w-full overflow-hidden bg-slate-950 relative">
                                        <img 
                                            src={candidate.photo ? `http://127.0.0.1:8000${candidate.photo}` : `https://ui-avatars.com/api/?name=${candidate.firstname}+${candidate.lastname}`} 
                                            alt={`${candidate.firstname} ${candidate.lastname}`}
                                            className={`w-full h-full object-cover transition-transform duration-500 ${selected ? 'scale-110' : 'group-hover:scale-105'}`}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
                                        
                                        {/* Name overlay on image for impact */}
                                        <div className="absolute bottom-0 left-0 right-0 p-4">
                                            <h3 className="text-xl font-bold text-white leading-tight">
                                                {candidate.firstname} {candidate.lastname}
                                            </h3>
                                        </div>
                                    </div>

                                    <div className="p-4">
                                        <button 
                                            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors border border-slate-700 flex items-center justify-center gap-2 z-20 relative"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setPlatformModal({ 
                                                    name: `${candidate.firstname} ${candidate.lastname}`, 
                                                    manifesto: candidate.manifesto || candidate.platform || "No platform information provided."
                                                });
                                            }}
                                        >
                                            <i className="fa fa-file-alt text-indigo-400"></i> View Manifesto
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>
        ))}
        
        {/* Floating or Fixed Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-lg border-t border-slate-800 p-4 z-40">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <div className="text-sm text-slate-400 hidden sm:block">
                     Selections: <span className="text-white font-mono">{Object.values(votes).flat().length}</span> candidates chosen
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                    <button 
                        onClick={handlePreview} 
                        className="flex-1 sm:flex-none px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-colors border border-slate-700"
                    >
                        Preview Selections
                    </button>
                    <button 
                        onClick={handleSubmit} 
                        className="flex-1 sm:flex-none px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/20 transition-all hover:-translate-y-0.5"
                    >
                        Submit Vote <i className="fa fa-paper-plane ml-2"></i>
                    </button>
                </div>
            </div>
        </div>

      </main>

      {/* Preview Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setModalOpen(false)}></div>
            <div className="relative bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-700 animate-slide-up">
                <div className="p-6 border-b border-slate-800">
                    <h3 className="text-xl font-bold text-white flex items-center gap-3">
                        <i className="fa fa-clipboard-check text-indigo-500"></i> Review Your Vote
                    </h3>
                </div>
                <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
                    {previewData.map((item, idx) => (
                        <div key={idx} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">{item.position}</div>
                            <div className="text-white font-medium text-lg">{item.candidates}</div>
                        </div>
                    ))}
                </div>
                <div className="p-6 border-t border-slate-800 flex gap-4 bg-slate-900/50">
                    <button 
                        className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-colors"
                        onClick={() => setModalOpen(false)}
                    >
                        Keep Editing
                    </button>
                    <button 
                        className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/20 transition-all"
                        onClick={handleSubmit}
                    >
                        Confirm & Submit
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Platform/Manifesto Modal */}
      {platformModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setPlatformModal(null)}></div>
            <div className="relative bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-700 animate-fade-in">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white">{platformModal.name} - Manifesto</h3>
                    <button onClick={() => setPlatformModal(null)} className="text-slate-400 hover:text-white">&times;</button>
                </div>
                <div className="p-6 max-h-[60vh] overflow-y-auto text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {platformModal.manifesto}
                </div>
            </div>
        </div>
      )}

    </div>
  )
}

export default Home
