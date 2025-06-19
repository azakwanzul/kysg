const TileRow = ({ guess, getTileStatus, isComplete }) => {
  const tiles = Array(5).fill(null)

  return (
    <div className="flex justify-center space-x-2">
      {tiles.map((_, index) => {
        const letter = guess[index] || ''
        const status = isComplete ? getTileStatus(guess, index) : 'empty'
        
        return (
          <div
            key={index}
            className={`tile ${
              status === 'correct' ? 'tile-correct' :
              status === 'present' ? 'tile-present' :
              status === 'absent' ? 'tile-absent' :
              'bg-transparent'
            }`}
          >
            {letter}
          </div>
        )
      })}
    </div>
  )
}

export default TileRow 