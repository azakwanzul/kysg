import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../contexts/AuthContext'

export const useGameLogic = () => {
  const { user } = useAuth()
  const [dailyWord, setDailyWord] = useState('')
  const [guesses, setGuesses] = useState([])
  const [currentGuess, setCurrentGuess] = useState('')
  const [gameStatus, setGameStatus] = useState('playing') // 'playing', 'won', 'lost'
  const [hasPlayedToday, setHasPlayedToday] = useState(false)
  const [loading, setLoading] = useState(true)

  // Get today's date in YYYY-MM-DD format
  const getToday = () => {
    return new Date().toISOString().split('T')[0]
  }

  // Load or create daily word for today (same for all players)
  const loadDailyWord = async () => {
    try {
      // First check if today's word already exists
      const { data: existingWord, error: checkError } = await supabase
        .from('daily_word')
        .select('word')
        .eq('date', getToday())
        .single()

      if (checkError && checkError.code !== 'PGRST116') throw checkError

      if (existingWord) {
        setDailyWord(existingWord.word)
        return
      }

      // If no word exists for today, create one using a deterministic method
      // Use the date as a seed to ensure all players get the same word
      const { data: wordlist, error: wordlistError } = await supabase
        .from('wordlist')
        .select('word')
        .order('word')

      if (wordlistError) throw wordlistError

      if (wordlist && wordlist.length > 0) {
        // Use date as seed for consistent random selection
        const today = new Date(getToday())
        const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate()
        const randomIndex = seed % wordlist.length
        const selectedWord = wordlist[randomIndex]
        
        // Insert the selected word as today's daily word
        const { error: insertError } = await supabase
          .from('daily_word')
          .insert({
            date: getToday(),
            word: selectedWord.word
          })

        if (insertError) throw insertError

        setDailyWord(selectedWord.word)
      } else {
        // Fallback word if no words in database
        setDailyWord('makan')
      }
    } catch (error) {
      console.error('Error loading daily word:', error)
      setDailyWord('makan')
    }
  }

  // Load daily word
  useEffect(() => {
    loadDailyWord()
  }, [])

  // Check if user has already played today
  useEffect(() => {
    const checkPlayedToday = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('scores')
          .select('*')
          .eq('user_id', user.id)
          .eq('game_date', getToday())
          .single()

        if (error && error.code !== 'PGRST116') throw error
        setHasPlayedToday(!!data)
      } catch (error) {
        console.error('Error checking played today:', error)
        setHasPlayedToday(false)
      } finally {
        setLoading(false)
      }
    }

    checkPlayedToday()
  }, [user, dailyWord])

  // Validate guess
  const validateGuess = (guess) => {
    if (guess.length !== 5) return false
    // Add Malay word validation here
    return true
  }

  // Submit guess
  const submitGuess = async () => {
    if (!validateGuess(currentGuess) || guesses.length >= 6) return

    const newGuesses = [...guesses, currentGuess]
    setGuesses(newGuesses)
    setCurrentGuess('')

    // Check if won
    if (currentGuess.toLowerCase() === dailyWord.toLowerCase()) {
      setGameStatus('won')
      await saveScore(newGuesses.length)
      return
    }

    // Check if lost
    if (newGuesses.length >= 6) {
      setGameStatus('lost')
      await saveScore(0)
      return
    }
  }

  // Save score to database with correct point calculation
  const saveScore = async (attemptsUsed) => {
    if (!user) return

    // Correct point calculation:
    // 100 points for 1st try, 90 for 2nd, 80 for 3rd, 70 for 4th, 60 for 5th, 50 for 6th
    // 0 points if failed (attemptsUsed = 0)
    let points = 0
    if (attemptsUsed > 0) {
      points = Math.max(50, 100 - (attemptsUsed - 1) * 10)
    }

    try {
      const { error } = await supabase
        .from('scores')
        .insert({
          user_id: user.id,
          game_date: getToday(),
          attempts_used: attemptsUsed,
          points: points
        })

      if (error) throw error
      console.log(`Score saved: ${points} points for ${attemptsUsed} attempts`)
    } catch (error) {
      console.error('Error saving score:', error)
    }
  }

  // Get tile status for a guess
  const getTileStatus = (guess, index) => {
    if (!dailyWord) return 'empty'
    
    const guessLetter = guess[index].toLowerCase()
    const wordLetter = dailyWord[index].toLowerCase()
    
    if (guessLetter === wordLetter) return 'correct'
    if (dailyWord.toLowerCase().includes(guessLetter)) return 'present'
    return 'absent'
  }

  return {
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
  }
}