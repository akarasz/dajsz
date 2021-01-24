import { useContext, useEffect } from "react"
import { useParams } from "react-router-dom"

import { Context as AppContext } from "./../App"
import { Button } from "./../Button"
import Modal from "./../Modal"

import { Context as YahtzeeContext } from "./Yahtzee"
import { join } from "./api"

const JoinModal = ({ show, setShow }) => {
  const { name } = useContext(AppContext)
  const { updateGame, game } = useContext(YahtzeeContext)
  const { gameId } = useParams()

  useEffect(() => { // handle offering to join
    if (game === null || name === null || name === "") {
      return
    }

    const startedAlready = game.RollCount + game.CurrentPlayer + game.Round > 0
    if (startedAlready) {
      return
    }

    const hasPlayers = game.Players.length > 0
    const joinedAlready = game.Players.map((p) => p.User).includes(name)

    if (!hasPlayers) {
      join(gameId, name, updateGame)
    } else if (!joinedAlready) {
      setShow(true)
    }
  }, [game?.Players.length, gameId, name]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleYes = () => {
    join(gameId, name, updateGame)
    setShow(false)
  }

  const handleNo = () => {
    setShow(false)
  }

  return (
    <Modal showing={show} handleClose={handleNo}>
      <p>Do you want to join as <em>{name}</em> ?</p>
      <div className="buttons">
        <Button small text="Yes" onClick={handleYes} />
        <Button small secondary text="No" onClick={handleNo} />
      </div>
    </Modal>)
}

export default JoinModal