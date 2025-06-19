import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { User, Edit, Save, X, Trophy, Target, Calendar } from 'lucide-react'

const Profile = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [stats, setStats] = useState(null)
  const [editing, setEditing] = useState(false)
  const [newUsername, setNewUsername] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadProfile()
    loadStats()
  }, [user])

  const loadProfile = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('users')
        .select('username')
        .eq('id', user.id)
        .single()

      if (error) throw error
      setProfile(data)
      setNewUsername(data.username)
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('scores')
        .select('points, attempts_used, game_date')
        .eq('user_id', user.id)

      if (error) throw error

      const totalGames = data.length
      const totalPoints = data.reduce((sum, score) => sum + score.points, 0)
      const totalAttempts = data.reduce((sum, score) => sum + score.attempts_used, 0)
      const avgAttempts = totalGames > 0 ? totalAttempts / totalGames : 0
      const bestScore = Math.max(...data.map(score => score.points), 0)
      const gamesWon = data.filter(score => score.points > 0).length
      const winRate = totalGames > 0 ? (gamesWon / totalGames) * 100 : 0

      setStats({
        totalGames,
        totalPoints,
        avgAttempts,
        bestScore,
        gamesWon,
        winRate
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const handleSaveUsername = async () => {
    if (!newUsername || newUsername === profile.username) {
      setEditing(false)
      return
    }

    setSaving(true)
    setError('')

    try {
      // Check if username is available
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('username')
        .eq('username', newUsername.toLowerCase())
        .neq('id', user.id)
        .single()

      if (checkError && checkError.code !== 'PGRST116') throw checkError
      
      if (existingUser) {
        setError('Username is already taken')
        return
      }

      // Update username
      const { error } = await supabase
        .from('users')
        .update({ username: newUsername.toLowerCase() })
        .eq('id', user.id)

      if (error) throw error

      setProfile({ ...profile, username: newUsername.toLowerCase() })
      setEditing(false)
    } catch (error) {
      setError(error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setNewUsername(profile.username)
    setEditing(false)
    setError('')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-xl">Loading profile...</div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Profile</h1>
        <p className="text-gray-400">Manage your account and view your stats</p>
      </div>

      {/* Profile Section */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-white mb-4">Account Information</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Email
            </label>
            <div className="bg-gray-700 px-4 py-3 rounded-md text-gray-300">
              {user.email}
            </div>
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Username
            </label>
            {editing ? (
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-wordle-green"
                    placeholder="Enter new username"
                    minLength={3}
                    maxLength={20}
                  />
                </div>
                <button
                  onClick={handleSaveUsername}
                  disabled={saving}
                  className="px-4 py-3 bg-wordle-green text-white rounded-md hover:bg-green-600 transition-colors disabled:opacity-50"
                >
                  <Save size={20} />
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-gray-700 px-4 py-3 rounded-md">
                <span className="text-white">{profile.username}</span>
                <button
                  onClick={() => setEditing(true)}
                  className="text-gray-400 hover:text-white"
                >
                  <Edit size={20} />
                </button>
              </div>
            )}
            
            {error && (
              <div className="mt-2 text-red-400 text-sm">{error}</div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      {stats && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Game Statistics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-gray-700 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Trophy className="text-wordle-yellow" size={24} />
              </div>
              <div className="text-2xl font-bold text-white">{stats.totalPoints}</div>
              <div className="text-gray-400 text-sm">Total Points</div>
            </div>

            <div className="bg-gray-700 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Target className="text-wordle-green" size={24} />
              </div>
              <div className="text-2xl font-bold text-white">{stats.totalGames}</div>
              <div className="text-gray-400 text-sm">Games Played</div>
            </div>

            <div className="bg-gray-700 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Calendar className="text-blue-400" size={24} />
              </div>
              <div className="text-2xl font-bold text-white">{stats.winRate.toFixed(1)}%</div>
              <div className="text-gray-400 text-sm">Win Rate</div>
            </div>

            <div className="bg-gray-700 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">{stats.avgAttempts.toFixed(1)}</div>
              <div className="text-gray-400 text-sm">Avg Attempts</div>
            </div>

            <div className="bg-gray-700 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">{stats.bestScore}</div>
              <div className="text-gray-400 text-sm">Best Score</div>
            </div>

            <div className="bg-gray-700 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">{stats.gamesWon}</div>
              <div className="text-gray-400 text-sm">Games Won</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile 