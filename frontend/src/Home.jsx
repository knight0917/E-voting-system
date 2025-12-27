import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function Home({ token, user, handleLogout }) {
  const [positions, setPositions] = useState([])
  const [alreadyVoted, setAlreadyVoted] = useState(false)
  const [electionTitle, setElectionTitle] = useState('')
  const [votes, setVotes] = useState({}) // {positionId: [candidateId]}
  const [modalOpen, setModalOpen] = useState(false)
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

  const handleVoteChange = (posId, candId, maxVote, isChecked) => {
    setVotes(prev => {
        const currentVotes = prev[posId] || []
        if (maxVote > 1) {
            if (isChecked) {
                if (currentVotes.length >= maxVote) return prev
                return { ...prev, [posId]: [...currentVotes, candId] }
            } else {
                return { ...prev, [posId]: currentVotes.filter(id => id !== candId) }
            }
        } else {
            return { ...prev, [posId]: [candId] }
        }
    })
  }

  const handlePreview = () => {
    // Generate preview data locally
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
        alert("Please select at least one candidate")
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
        alert('Vote submitted successfully!')
        setModalOpen(false)
        fetchBallot()
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
          <div className="container" style={{marginTop: '20px'}}>
               <div className="text-center">
                    <h3>You have already voted for this election.</h3>
                    <button className="btn btn-flat btn-primary btn-lg" onClick={handleLogout}>Logout</button>
               </div>
          </div>
      )
  }

  return (
    <div className="wrapper">
      <header className="main-header">
        <nav className="navbar navbar-light bg-light">
            <div className="container">
                <span className="navbar-brand">Voting System</span>
                <span className="navbar-text">
                    <img src={user?.photo && user.photo !== 'profile.jpg' ? `http://127.0.0.1:8000/static/images/${user.photo}` : 'https://via.placeholder.com/30'} 
                         className="rounded-circle" style={{width: 30, height: 30, marginRight: 10}} alt="User"/>
                    {user?.firstname} {user?.lastname}
                    <button onClick={handleLogout} className="btn btn-sm btn-outline-danger ms-3">Logout</button>
                </span>
            </div>
        </nav>
      </header>
      
      <div className="content-wrapper container mt-4">
        <h1 className="text-center">{electionTitle.toUpperCase()}</h1>
        
        {positions.map(position => (
            <div className="card mb-3" key={position.id}>
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">{position.description}</h5>
                    <button className="btn btn-sm btn-success" onClick={() => resetPosition(position.id)}>Reset</button>
                </div>
                <div className="card-body">
                    <p>
                        {position.max_vote > 1 ? `Select up to ${position.max_vote} candidates` : 'Select only one candidate'}
                    </p>
                    <ul className="list-unstyled">
                        {position.candidates.map(candidate => (
                            <li key={candidate.id} className="mb-2 d-flex align-items-center">
                                <input 
                                    type={position.max_vote > 1 ? "checkbox" : "radio"}
                                    name={position.slug}
                                    className="me-2"
                                    checked={votes[position.id]?.includes(candidate.id) || false}
                                    onChange={(e) => handleVoteChange(position.id, candidate.id, position.max_vote, e.target.checked)}
                                />
                                <img src={candidate.photo ? `http://127.0.0.1:8000/static/images/${candidate.photo}` : 'https://via.placeholder.com/50'} 
                                     style={{width: 50, height: 50, marginRight: 10}} alt="" />
                                <span>{candidate.firstname} {candidate.lastname}</span>
                                <button className="btn btn-xs btn-primary ms-2" onClick={() => alert(candidate.platform)}>Platform</button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        ))}
        
        <div className="text-center mb-5">
            <button className="btn btn-success me-2" onClick={handlePreview}>Preview</button>
            <button className="btn btn-primary" onClick={handleSubmit}>Submit</button>
        </div>
        
        {modalOpen && (
            <div className="modal show d-block" tabIndex="-1" style={{background: 'rgba(0,0,0,0.5)'}}>
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Vote Preview</h5>
                    <button type="button" className="btn-close" onClick={() => setModalOpen(false)}></button>
                  </div>
                  <div className="modal-body">
                    {previewData.map((item, idx) => (
                        <div key={idx} className="row mb-2">
                            <strong className="col-4 text-end">{item.position}:</strong>
                            <span className="col-8">{item.candidates}</span>
                        </div>
                    ))}
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Close</button>
                    <button type="button" className="btn btn-primary" onClick={handleSubmit}>Confirm Submit</button>
                  </div>
                </div>
              </div>
            </div>
        )}

      </div>
    </div>
  )
}

export default Home
