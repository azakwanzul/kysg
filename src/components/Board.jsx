import TileRow from './TileRow'

const Board = ({ guesses, currentGuess, getTileStatus }) => {
  const rows = Array(6).fill(null)

  return (
    <div className="flex flex-col space-y-2 mb-8">
      {rows.map((_, index) => {
        const guess = guesses[index] || ''
        const isCurrentRow = index === guesses.length
        
        return (
          <TileRow
            key={index}
            guess={isCurrentRow ? currentGuess : guess}
            getTileStatus={getTileStatus}
            isComplete={!isCurrentRow && guess.length === 5}
          />
        )
      })}
    </div>
  )
}

export default Board 