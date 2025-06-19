import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabaseClient'
import Layout from './components/Layout'
import Login from './pages/Login'
import Onboarding from './pages/Onboarding'
import Game from './pages/Game'
import Leaderboard from './pages/Leaderboard'
import Profile from './pages/Profile'
import Admin from './pages/Admin'

function App() {
  const { user, loading } = useAuth()
  const [hasUsername, setHasUsername] = useState(null)
  const [checkingUsername, setCheckingUsername] = useState(false)

  // Check if user has username
  useEffect(() => {
    const checkUsername = async () => {
      if (!user) {
        setHasUsername(null)
        return
      }

      setCheckingUsername(true)
      try {
        const { data, error } = await supabase
          .from('users')
          .select('username')
          .eq('id', user.id)
          .single()

        if (error && error.code === 'PGRST116') {
          // No username found
          setHasUsername(false)
        } else if (error) {
          throw error
        } else {
          // Username exists
          setHasUsername(true)
        }
      } catch (error) {
        console.error('Error checking username:', error)
        setHasUsername(false)
      } finally {
        setCheckingUsername(false)
      }
    }

    checkUsername()
  }, [user])

  if (loading || checkingUsername) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  // User is logged in but doesn't have username - redirect to onboarding
  if (hasUsername === false) {
    return (
      <Routes>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="*" element={<Navigate to="/onboarding" replace />} />
      </Routes>
    )
  }

  // User is logged in and has username - show main app
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Game />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

export default App 