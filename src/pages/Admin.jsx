import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { Upload, Plus, Trash2, Calendar, FileText } from 'lucide-react'

const Admin = () => {
  const { user } = useAuth()
  const [dailyWord, setDailyWord] = useState('')
  const [newWord, setNewWord] = useState('')
  const [wordList, setWordList] = useState([])
  const [selectedDate, setSelectedDate] = useState('')
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (user?.email !== 'admin@kysg.com') {
      return
    }
    loadDailyWord()
    loadWordList()
  }, [user])

  const loadDailyWord = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const { data, error } = await supabase
        .from('daily_word')
        .select('*')
        .eq('date', today)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      setDailyWord(data?.word || '')
      setSelectedDate(today)
    } catch (error) {
      console.error('Error loading daily word:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadWordList = async () => {
    try {
      const { data, error } = await supabase
        .from('wordlist')
        .select('*')
        .order('word')

      if (error) throw error
      setWordList(data || [])
    } catch (error) {
      console.error('Error loading word list:', error)
    }
  }

  const handleSetDailyWord = async () => {
    if (!selectedDate || !newWord) return

    setUploading(true)
    setError('')
    setSuccess('')

    try {
      const { error } = await supabase
        .from('daily_word')
        .upsert({
          date: selectedDate,
          word: newWord.toLowerCase()
        })

      if (error) throw error

      setSuccess('Daily word updated successfully!')
      setNewWord('')
      loadDailyWord()
    } catch (error) {
      setError(error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleAddWord = async () => {
    if (!newWord) return

    setUploading(true)
    setError('')
    setSuccess('')

    try {
      const { error } = await supabase
        .from('wordlist')
        .insert({ word: newWord.toLowerCase() })

      if (error) throw error

      setSuccess('Word added successfully!')
      setNewWord('')
      loadWordList()
    } catch (error) {
      setError(error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteWord = async (wordId) => {
    if (!confirm('Are you sure you want to delete this word?')) return

    try {
      const { error } = await supabase
        .from('wordlist')
        .delete()
        .eq('id', wordId)

      if (error) throw error

      setSuccess('Word deleted successfully!')
      loadWordList()
    } catch (error) {
      setError(error.message)
    }
  }

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    setUploading(true)
    setError('')
    setSuccess('')

    try {
      const text = await file.text()
      const words = text.split('\n')
        .map(word => word.trim().toLowerCase())
        .filter(word => word.length === 5 && /^[a-z]+$/.test(word))

      if (words.length === 0) {
        throw new Error('No valid 5-letter words found in file')
      }

      const { error } = await supabase
        .from('wordlist')
        .insert(words.map(word => ({ word })))

      if (error) throw error

      setSuccess(`${words.length} words added successfully!`)
      loadWordList()
    } catch (error) {
      setError(error.message)
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  // Check if user is admin
  if (user?.email !== 'admin@kysg.com') {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400">You don't have permission to access the admin panel.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-xl">Loading admin panel...</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Admin Panel</h1>
        <p className="text-gray-400">Manage words and game settings</p>
      </div>

      {error && (
        <div className="bg-red-500 text-white p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-wordle-green text-white p-4 rounded-lg mb-6">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Word Management */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <Calendar className="mr-2" size={20} />
            Daily Word Management
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Current Daily Word
              </label>
              <div className="bg-gray-700 px-4 py-3 rounded-md text-white font-mono">
                {dailyWord || 'Not set'}
              </div>
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-wordle-green"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                New Word
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newWord}
                  onChange={(e) => setNewWord(e.target.value)}
                  className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-wordle-green"
                  placeholder="Enter 5-letter word"
                  maxLength={5}
                />
                <button
                  onClick={handleSetDailyWord}
                  disabled={uploading || !newWord || newWord.length !== 5}
                  className="px-4 py-3 bg-wordle-green text-white rounded-md hover:bg-green-600 transition-colors disabled:opacity-50"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Word List Management */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <FileText className="mr-2" size={20} />
            Word List Management
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Add Single Word
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newWord}
                  onChange={(e) => setNewWord(e.target.value)}
                  className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-wordle-green"
                  placeholder="Enter 5-letter word"
                  maxLength={5}
                />
                <button
                  onClick={handleAddWord}
                  disabled={uploading || !newWord || newWord.length !== 5}
                  className="px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Upload Word List (CSV/TXT)
              </label>
              <input
                type="file"
                accept=".csv,.txt"
                onChange={handleFileUpload}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-wordle-green file:text-white hover:file:bg-green-600"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Word Count: {wordList.length}
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Word List Display */}
      <div className="bg-gray-800 rounded-lg p-6 mt-6">
        <h2 className="text-xl font-bold text-white mb-4">Word List</h2>
        
        <div className="max-h-96 overflow-y-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {wordList.map((word) => (
              <div
                key={word.id}
                className="flex items-center justify-between bg-gray-700 px-3 py-2 rounded"
              >
                <span className="text-white font-mono">{word.word}</span>
                <button
                  onClick={() => handleDeleteWord(word.id)}
                  className="text-red-400 hover:text-red-300 ml-2"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Admin 