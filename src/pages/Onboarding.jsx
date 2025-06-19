import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { User, Check } from 'lucide-react'

const Onboarding = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isAvailable, setIsAvailable] = useState(null)

  // Check if user already has a username
  useEffect(() => {
    const checkUsername = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from('users')
          .select('username')
          .eq('id', user.id)
          .single()

        if (error && error.code !== 'PGRST116') throw error
        
        if (data?.username) {
          navigate('/')
        }
      } catch (error) {
        console.error('Error checking username:', error)
      }
    }

    checkUsername()
  }, [user, navigate])

  // Check username availability
  useEffect(() => {
    const checkAvailability = async () => {
      if (!username || username.length < 3) {
        setIsAvailable(null)
        return
      }

      try {
        const { data, error } = await supabase
          .from('users')
          .select('username')
          .eq('username', username.toLowerCase())
          .single()

        if (error && error.code !== 'PGRST116') throw error
        
        setIsAvailable(!data)
      } catch (error) {
        console.error('Error checking availability:', error)
        setIsAvailable(false)
      }
    }

    const timeoutId = setTimeout(checkAvailability, 500)
    return () => clearTimeout(timeoutId)
  }, [username])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!username || !isAvailable) return

    setLoading(true)
    setError('')

    try {
      const { error } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email,
          username: username.toLowerCase()
        })

      if (error) throw error

      navigate('/')
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Welcome to KYSG!</h1>
        <p className="text-gray-400">Choose your username to get started</p>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-10 py-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-wordle-green"
                placeholder="Enter your username"
                minLength={3}
                maxLength={20}
                pattern="[a-zA-Z0-9_]+"
                title="Only letters, numbers, and underscores allowed"
                required
              />
              {isAvailable === true && (
                <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 text-wordle-green" size={20} />
              )}
            </div>
            
            {username && (
              <div className="mt-2 text-sm">
                {isAvailable === true && (
                  <span className="text-wordle-green">✓ Username available</span>
                )}
                {isAvailable === false && (
                  <span className="text-red-400">✗ Username taken</span>
                )}
                {isAvailable === null && username.length < 3 && (
                  <span className="text-gray-400">Username must be at least 3 characters</span>
                )}
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-500 text-white p-3 rounded text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !username || !isAvailable}
            className="w-full bg-wordle-green text-white py-3 rounded-md font-medium hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Setting up...' : 'Continue'}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-400">
          <p>Your username will be visible to other players</p>
          <p>You can change it later in your profile</p>
        </div>
      </div>
    </div>
  )
}

export default Onboarding 