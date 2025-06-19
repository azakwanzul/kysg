import { useState } from 'react'
import { X, Copy, Check } from 'lucide-react'

const ShareModal = ({ isOpen, onClose, guesses, gameStatus, dailyWord }) => {
  const [copied, setCopied] = useState(false)
  
  // Update this to your GitHub Pages domain
  const domain = 'https://azakwanzul.github.io/kysg'

  const generateShareText = () => {
    // Configurable domain - you can change this later
    const header = `${domain}\n`
    
    // Add the score line (like "956 4/6")
    const score = gameStatus === 'won' ? `${guesses.length}/6` : 'X/6'
    const scoreLine = `${score}\n`
    
    const board = guesses.map(guess => {
      return guess.split('').map((letter, index) => {
        const status = getTileStatus(guess, index)
        switch (status) {
          case 'correct': return '🟩'
          case 'present': return '🟨'
          case 'absent': return '⬛'
          default: return '⬜'
        }
      }).join('')
    }).join('\n')
    
    // Add the word if lost
    const footer = gameStatus === 'lost' ? `\n${dailyWord.toUpperCase()}` : ''
    
    return header + scoreLine + board + footer
  }

  const getTileStatus = (guess, index) => {
    const guessLetter = guess[index].toLowerCase()
    const wordLetter = dailyWord[index].toLowerCase()
    
    if (guessLetter === wordLetter) return 'correct'
    if (dailyWord.toLowerCase().includes(guessLetter)) return 'present'
    return 'absent'
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateShareText())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-wordle-dark border border-gray-700 rounded-lg p-4 sm:p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-bold">Share Result</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="bg-gray-800 p-3 sm:p-4 rounded mb-4 font-mono text-xs sm:text-sm whitespace-pre-line border border-gray-600">
          {generateShareText()}
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center space-x-2 bg-wordle-green text-white py-2 px-4 rounded hover:bg-green-600 transition-colors text-sm sm:text-base"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-600 rounded hover:bg-gray-700 transition-colors text-sm sm:text-base"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default ShareModal 