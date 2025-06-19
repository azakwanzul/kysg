import { Delete, RotateCcw } from 'lucide-react'

const Keyboard = ({ onKeyPress, onEnter, onDelete, onReset, gameStatus }) => {
  const keys = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
  ]

  const handleKeyClick = (key) => {
    if (gameStatus !== 'playing') return
    onKeyPress(key)
  }

  const handleEnter = () => {
    if (gameStatus !== 'playing') return
    onEnter()
  }

  const handleDelete = () => {
    if (gameStatus !== 'playing') return
    onDelete()
  }

  return (
    <div className="space-y-2 px-2 sm:px-0">
      {/* Letter Keys */}
      {keys.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center space-x-1">
          {row.map((key) => (
            <button
              key={key}
              onClick={() => handleKeyClick(key)}
              className="keyboard-key"
            >
              {key}
            </button>
          ))}
        </div>
      ))}
      
      {/* Control Keys */}
      <div className="flex justify-center space-x-1">
        <button
          onClick={handleEnter}
          className="keyboard-key enter-key"
        >
          ENTER
        </button>
        <button
          onClick={handleDelete}
          className="keyboard-key delete-key"
        >
          <Delete size={16} className="sm:w-5 sm:h-5" />
        </button>
      </div>

      {/* Reset Button (only show when game is over) */}
      {gameStatus !== 'playing' && (
        <div className="flex justify-center mt-4">
          <button
            onClick={onReset}
            className="flex items-center space-x-2 px-4 py-2 bg-wordle-green text-white rounded-md hover:bg-green-600 transition-colors text-sm sm:text-base"
          >
            <RotateCcw size={16} className="sm:w-4 sm:h-4" />
            <span>Play Again</span>
          </button>
        </div>
      )}
    </div>
  )
}

export default Keyboard 