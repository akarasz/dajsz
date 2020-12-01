import React, { useState } from "react"
import Yahtzee from "./Yahtzee"
import Menu from "./Menu"

const App = () => {
  const [gameId, setGameId] = useState(window.location.hash.substring(2) || null)
  const [player, setPlayer] = useState(window.localStorage.getItem("name") || null)

  const handleNameChange = (newName) => {
    window.localStorage.setItem("name", newName)
    setPlayer(newName)
  }

  const handleNewGame = (newGameId) => {
    setGameId(newGameId)
  }

  return (
    <div>
      <Menu
        name={player}
        onNameChange={handleNameChange}
        onNewGame={handleNewGame} />
      <Yahtzee player={player} gameId={gameId} />
    </div>
  )
}

export default App
