import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Trophy, Calendar, Clock, Users } from 'lucide-react'

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([])
  const [timeframe, setTimeframe] = useState('daily') // 'daily', 'weekly', 'all-time'
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLeaderboard()
    
    // Set up real-time subscription for scores table
    const subscription = supabase
      .channel('scores_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'scores' }, 
        () => {
          // Reload leaderboard when scores change
          loadLeaderboard()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [timeframe])

  const loadLeaderboard = async () => {
    setLoading(true)
    
    try {
      console.log('Loading leaderboard for timeframe:', timeframe)
      
      // First, get all scores for the timeframe
      let scoresQuery = supabase
        .from('scores')
        .select('*')
        .order('points', { ascending: false })

      // Apply timeframe filter
      if (timeframe === 'daily') {
        const today = new Date().toISOString().split('T')[0]
        console.log('Filtering for today:', today)
        scoresQuery = scoresQuery.eq('game_date', today)
      } else if (timeframe === 'weekly') {
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        const weekAgoStr = weekAgo.toISOString().split('T')[0]
        console.log('Filtering for week from:', weekAgoStr)
        scoresQuery = scoresQuery.gte('game_date', weekAgoStr)
      }

      const { data: scores, error: scoresError } = await scoresQuery.limit(50)
      console.log('Raw scores data:', scores)
      console.log('Scores error if any:', scoresError)

      if (scoresError) throw scoresError

      if (!scores || scores.length === 0) {
        console.log('No scores found for this timeframe')
        setLeaderboard([])
        return
      }

      // Get unique user IDs from scores
      const userIds = [...new Set(scores.map(score => score.user_id))]
      console.log('User IDs found:', userIds)

      // Get usernames for these users
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, username')
        .in('id', userIds)

      console.log('Users data:', users)
      console.log('Users error if any:', usersError)

      if (usersError) throw usersError

      // Create a map of user_id to username
      const userMap = {}
      users.forEach(user => {
        userMap[user.id] = user.username
      })

      // Group by user and calculate stats
      const userStats = {}
      scores.forEach(score => {
        const username = userMap[score.user_id] || 'Unknown User'
        if (!userStats[username]) {
          userStats[username] = {
            username,
            totalPoints: 0,
            totalGames: 0,
            totalAttempts: 0,
            avgAttempts: 0
          }
        }
        
        userStats[username].totalPoints += score.points
        userStats[username].totalGames += 1
        userStats[username].totalAttempts += score.attempts_used
      })

      // Calculate averages and sort
      const leaderboardData = Object.values(userStats).map(user => ({
        ...user,
        avgAttempts: user.totalAttempts / user.totalGames
      })).sort((a, b) => b.totalPoints - a.totalPoints)

      console.log('Processed leaderboard data:', leaderboardData)
      setLeaderboard(leaderboardData)
    } catch (error) {
      console.error('Error loading leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTimeframeLabel = () => {
    switch (timeframe) {
      case 'daily': return 'Today'
      case 'weekly': return 'This Week'
      case 'all-time': return 'All Time'
      default: return ''
    }
  }

  const getTimeframeIcon = () => {
    switch (timeframe) {
      case 'daily': return Calendar
      case 'weekly': return Clock
      case 'all-time': return Users
      default: return Trophy
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Leaderboard</h1>
        <p className="text-gray-400">See how you rank against other players</p>
      </div>

      {/* Timeframe Selector */}
      <div className="flex justify-center mb-6">
        <div className="bg-gray-800 rounded-lg p-1 flex">
          {[
            { key: 'daily', label: 'Daily', icon: Calendar },
            { key: 'weekly', label: 'Weekly', icon: Clock },
            { key: 'all-time', label: 'All Time', icon: Users }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTimeframe(key)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                timeframe === key
                  ? 'bg-wordle-green text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              <Icon size={16} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="bg-gray-700 px-6 py-4">
          <div className="flex items-center space-x-2">
            {(() => {
              const Icon = getTimeframeIcon()
              return <Icon size={20} />
            })()}
            <h2 className="text-xl font-bold text-white">
              {getTimeframeLabel()} Leaderboard
            </h2>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="text-gray-400">Loading leaderboard...</div>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-400">No data available for this timeframe</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Player
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Points
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Games
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Avg Attempts
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {leaderboard.map((player, index) => (
                  <tr key={player.username} className="hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {index < 3 ? (
                          <Trophy 
                            className={`mr-2 ${
                              index === 0 ? 'text-yellow-400' :
                              index === 1 ? 'text-gray-300' :
                              'text-orange-600'
                            }`} 
                            size={20} 
                          />
                        ) : null}
                        <span className="text-white font-medium">
                          #{index + 1}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-white font-medium">
                        {player.username}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-wordle-green font-bold">
                        {player.totalPoints}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-300">
                        {player.totalGames}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-300">
                        {player.avgAttempts.toFixed(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Leaderboard 