import { useContext } from "react"
import { useParams } from "react-router-dom"

import { Context as AppContext } from "./../App"
import { Button } from "./../Button"

import { roll } from "./api"
import { Context as YahtzeeContext } from "./Yahtzee"
import "./Controller.css"

const Controller = () => (
  <div className="Controller">
    <RollCount />
    <RollButton />
  </div>
)

const RollCount = () => {
  const { game: { RollCount }} = useContext(YahtzeeContext)

  return (
    <div className="RollCounter" data-roll={RollCount}>
      <div /><div /><div />
    </div>)
}

const RollButton = () => {
  const { name } = useContext(AppContext)
  const { rolling, game: { Players, CurrentPlayer, RollCount, Round } } = useContext(YahtzeeContext)
  const { gameId } = useParams()

  const myTurn = Players.length > 0 && Players[CurrentPlayer].User === name
  const afterLastRoll = RollCount >= 3
  const afterLastRound = Round >= 13

  const clickable = myTurn && !afterLastRoll && !afterLastRound && !rolling

  const handleRoll = () => {
    roll(gameId, name)
  }

  if (clickable) {
    return <Button onClick={handleRoll}>Roll</Button>
  } else {
    return <Button disabled>Roll</Button>
  }
}

export default Controller