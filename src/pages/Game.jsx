import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useGameLogic } from '../hooks/useGameLogic'
import Board from '../components/Board'
import Keyboard from '../components/Keyboard'
import ShareModal from '../components/ShareModal'
import { supabase } from '../lib/supabaseClient'

const Game = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [showShareModal, setShowShareModal] = useState(false)
  const [userProfile, setUserProfile] = useState(null)
  
  const {
    dailyWord,
    guesses,
    currentGuess,
    setCurrentGuess,
    gameStatus,
    hasPlayedToday,
    loading,
    submitGuess,
    getTileStatus,
    validateGuess
  } = useGameLogic()

  // Load user profile
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from('users')
          .select('username')
          .eq('id', user.id)
          .single()

        if (error) throw error
        setUserProfile(data)
      } catch (error) {
        console.error('Error loading profile:', error)
        // If no username, redirect to onboarding
        if (error.code === 'PGRST116') {
          navigate('/onboarding')
        }
      }
    }

    loadProfile()
  }, [user, navigate])

  // Handle key press (for both virtual and physical keyboard)
  const handleKeyPress = useCallback((key) => {
    if (currentGuess.length < 5) {
      setCurrentGuess(prev => prev + key)
    }
  }, [currentGuess.length, setCurrentGuess])

  const handleDelete = useCallback(() => {
    setCurrentGuess(prev => prev.slice(0, -1))
  }, [setCurrentGuess])

  const handleSubmit = useCallback(() => {
    if (currentGuess.length === 5 && validateGuess(currentGuess)) {
      submitGuess()
    }
  }, [currentGuess.length, validateGuess, submitGuess])

  // Enhanced keyboard input handling for physical keyboard
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't handle keyboard input if game is over or user has played today
      if (gameStatus !== 'playing' || hasPlayedToday) return

      // Don't handle keyboard input if user is typing in an input field
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return

      const key = e.key.toLowerCase()

      if (key === 'enter') {
        e.preventDefault()
        handleSubmit()
      } else if (key === 'backspace' || key === 'delete') {
        e.preventDefault()
        handleDelete()
      } else if (/^[a-z]$/.test(key)) {
        e.preventDefault()
        handleKeyPress(key.toUpperCase())
      }
    }

    // Add event listener
    window.addEventListener('keydown', handleKeyDown)
    
    // Cleanup
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gameStatus, hasPlayedToday, handleKeyPress, handleDelete, handleSubmit])

  const handleReset = () => {
    window.location.reload()
  }

  // Show share modal when game ends
  useEffect(() => {
    if (gameStatus !== 'playing' && (guesses.length > 0 || gameStatus === 'lost')) {
      setShowShareModal(true)
    }
  }, [gameStatus, guesses])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-xl">Loading game...</div>
      </div>
    )
  }

  if (!userProfile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-xl">Loading profile...</div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-0">
      {/* Header */}
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">KYSG</h1>
        <p className="text-gray-400 text-sm sm:text-base">Welcome, {userProfile.username}!</p>
      </div>

      {/* Game Status */}
      {hasPlayedToday && (
        <div className="bg-gray-800 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 text-center">
          <p className="text-white mb-2 text-sm sm:text-base">You've already played today!</p>
          <p className="text-gray-400 text-xs sm:text-sm">Come back tomorrow for a new word</p>
        </div>
      )}

      {gameStatus === 'won' && (
        <div className="bg-wordle-green rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 text-center">
          <p className="text-white font-bold mb-2 text-sm sm:text-base">Congratulations!</p>
          <p className="text-white text-sm sm:text-base">You found the word in {guesses.length} tries!</p>
        </div>
      )}

      {gameStatus === 'lost' && (
        <div className="bg-red-600 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 text-center">
          <p className="text-white font-bold mb-2 text-sm sm:text-base">Game Over!</p>
          <p className="text-white text-sm sm:text-base">The word was: {dailyWord.toUpperCase()}</p>
        </div>
      )}

      {/* Game Board */}
      <div className="mb-6 sm:mb-8">
        <Board
          guesses={guesses}
          currentGuess={currentGuess}
          getTileStatus={getTileStatus}
        />
      </div>

      {/* Keyboard */}
      <Keyboard
        onKeyPress={handleKeyPress}
        onEnter={handleSubmit}
        onDelete={handleDelete}
        onReset={handleReset}
        gameStatus={gameStatus}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        guesses={guesses}
        gameStatus={gameStatus}
        dailyWord={dailyWord}
      />
    </div>
  )
}

export default Game 