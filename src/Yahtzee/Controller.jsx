import { useContext } from "react"
import { useParams } from "react-router-dom"

import { Context as AppContext } from "./../App"

import { roll } from "./api"
import { Context as YahtzeeContext } from "./Yahtzee"

const Controller = () => (
  <div className="controller">
    <RollCount />
    <RollButton />
  </div>
)

const RollCount = () => {
  const { game: { RollCount }} = useContext(YahtzeeContext)

  const classes = ["roll", "counter", "roll-" + RollCount]
  const className = classes.join(" ")

  return <div className={className}><div /><div /><div /></div>
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
    return <button className="roll" onClick={handleRoll}>Roll</button>
  } else {
    return <button className="roll" disabled>Roll</button>
  }
}

export default Controller