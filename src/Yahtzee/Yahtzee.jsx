import { createContext, useContext, useState, useEffect, useRef } from "react"
import { useParams } from "react-router-dom"

import { Context as AppContext } from "./../App"

import { baseUri, load } from "./api"
import Controller from "./Controller"
import Scores from "./Scores"
import JoinModal from "./JoinModal"
import "./Yahtzee.css"

import Dices from "./Dices/Dices"

export const Context = createContext({})

const Yahtzee = () => {
  const { name } = useContext(AppContext)

  const { gameId } = useParams()

  const [game, setGame] = useState(null)

  const [showJoinModal, setShowJoinModal] = useState(false)
  const [rolling, setRolling] = useState(false)
  const [lastScore, setLastScore] = useState(null)

  const ws = useRef(null)

  const updateGame = (fresh) => {
    setGame(current => { return { ...current, ...fresh } })
  }

  const scoreSheetDiff = (oldPlayersArray, newPlayersArray) => {
    const result = {}

    newPlayersArray.map((p) => p.User).forEach((user, idx) => {
      const oldCategories = Object.keys(oldPlayersArray[idx].ScoreSheet)
      const newCategories = Object.keys(newPlayersArray[idx].ScoreSheet)
      const diff = newCategories.filter((c) => !oldCategories.includes(c))

      result[user] = diff
    })

    return result
  }

  useEffect(() => { // handle game loading
    setGame(null)

    load(gameId, name, (data) => {
      updateGame(data)
    })
  }, [gameId]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { // handle websocket creation
    if (gameId === null) {
      return
    }

    ws.current = new WebSocket("wss://" + baseUri + "/" + gameId + "/ws")

    return () => {
      ws.current.close();
    }
  }, [gameId])

  useEffect(() => { // handle websocket onevent

    if (!ws.current) {
      return
    }

    ws.current.onmessage = (e) => {
      const event = JSON.parse(e.data)
      if (event.Action === "roll") {
        setRolling(true)
      } else if (event.Action === "score") {
        setLastScore({
          user: game.Players.map(p => p.User).indexOf(event.User),
          category: scoreSheetDiff(game.Players, event.Data.Players)[event.User],
        })
      }

      updateGame(event.Data)
    }
  }, [game?.Players])

  if (game === null) {
    return null
  }

  return (
    <Context.Provider value={{ game, updateGame, rolling, setRolling, lastScore, setLastScore }}>
      <div className="Yahtzee">
        <Dices />
        <Controller />
        <Scores
          lastScore={lastScore} />
      </div>
      <JoinModal
        show={showJoinModal}
        setShow={setShowJoinModal} />
    </Context.Provider>)
}

export default Yahtzee
