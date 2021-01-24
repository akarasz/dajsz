import { useContext, useEffect } from "react"
import { useParams } from "react-router-dom"

import { Context as AppContext } from "./../App"

import { lock } from "./api"
import { Context as YahtzeeContext } from "./Yahtzee"

const Dices = () => {
  const { game: { Dices }, rolling, setRolling } = useContext(YahtzeeContext)

  useEffect(() => { // handle stopping roll animation
    if (!rolling) {
      return
    }

    setTimeout(() => setRolling(false), 200)
  }, [rolling, setRolling])


  return (
    <div className="dices">
      {Dices.map((dice, i) => {
        return <Dice key={i}
          index={i}
          dice={dice} />
      })}
    </div>)
}

const Dice = ({ dice, index }) => {
  const { name } = useContext(AppContext)
  const { rolling, game: { Players, CurrentPlayer, RollCount } } = useContext(YahtzeeContext)
  const { gameId } = useParams()

  const myTurn = Players.length > 0 && Players[CurrentPlayer].User === name
  const beforeFirstRoll = RollCount <= 0
  const afterLastRoll = RollCount >= 3

  const clickable = myTurn && !beforeFirstRoll && !afterLastRoll && !rolling

  const handleLock = () => {
    if (clickable) {
      lock(gameId, name, index)
    }
  }

  const classes = ["dice"]
  if (rolling && !dice.Locked) {
    classes.push("rolling")
  } else {
    classes.push("face-" + dice.Value)
  }
  if (dice.Locked) {
    classes.push("locked")
  }
  if (clickable) {
    classes.push("action")
  }

  return <div className={classes.join(" ")} onClick={handleLock} />
}

export default Dices