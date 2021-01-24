import { useContext, useEffect, useState } from "react"
import { useParams } from "react-router-dom"

import { Context as AppContext } from "./../App"
import "./../Clickable.css"

import { score, suggestions as getSuggestions } from "./api"
import { Context as YahtzeeContext } from "./Yahtzee"
import "./Scores.css"

const Scores = () => {
  const { name } = useContext(AppContext)
  const { game: { Dices, RollCount, Players, CurrentPlayer }, rolling, lastScore, setLastScore } = useContext(YahtzeeContext)
  const [suggestions, setSuggestions] = useState({})

  useEffect(() => { // handle suggestions
    if (rolling || !Players || Players.length === 0) {
      return
    }

    const rolledAlready = RollCount > 0
    const activeTurn = Players[CurrentPlayer].User === name

    if (activeTurn && rolledAlready) {
      getSuggestions(name, Dices, setSuggestions)
    } else {
      setSuggestions({})
    }
  }, [rolling, RollCount, Players, CurrentPlayer]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { // handle stopping blinking last score
    if (!lastScore) {
      return
    }

    setTimeout(() => setLastScore(null), 2000)
  }, [lastScore, setLastScore])

  return (
    <div className="Scores">
      <table>
        <thead>
          <ScoresHeader />
        </thead>
        <tbody>
          <ScoreLine suggestions={suggestions} title="Aces" category="ones" />
          <ScoreLine suggestions={suggestions} title="Twos" category="twos" />
          <ScoreLine suggestions={suggestions} title="Threes" category="threes" />
          <ScoreLine suggestions={suggestions} title="Fours" category="fours" />
          <ScoreLine suggestions={suggestions} title="Fives" category="fives" />
          <ScoreLine suggestions={suggestions} title="Sixes" category="sixes" />
          <ScoreLine suggestions={suggestions} title="Bonus" category="bonus" />
          <ScoreLine suggestions={suggestions} title="Three of a kind" category="three-of-a-kind" />
          <ScoreLine suggestions={suggestions} title="Four of a kind" category="four-of-a-kind" />
          <ScoreLine suggestions={suggestions} title="Full House" category="full-house" />
          <ScoreLine suggestions={suggestions} title="Small Straight" category="small-straight" />
          <ScoreLine suggestions={suggestions} title="Large Straight" category="large-straight" />
          <ScoreLine suggestions={suggestions} title="Yahtzee" category="yahtzee" />
          <ScoreLine suggestions={suggestions} title="Chance" category="chance" />
          <tr>
            <td>Total</td>
            {Players.map((p, i) => {
              let total = 0
              Object.entries(p.ScoreSheet).forEach(([c, v]) => total += v)
              return <td key={i}>{total}</td>
            })}
          </tr>
        </tbody>
      </table>
    </div>)
}

const ScoresHeader = () => {
  const { game: { Players, Round }} = useContext(YahtzeeContext)

  let isWinner = []
  if (Round >= 13) {
    const total = Players
        .map(p => p.ScoreSheet)
        .map(scores => Object.values(scores).reduce((a, b) => a + b, 0))

    const max = Math.max(...total)

    isWinner = total
        .map(s => s === max)
  }

  return (
    <tr>
      <th/>
      {Players.map((p, i) => {
        return <th key={i} className={isWinner[i] ? "Winner" : ""}>{p.User}</th>
      })}
    </tr>
  )
}

const ScoreLine = ({ title, category, suggestions }) => {
  const { game: { Players, CurrentPlayer } } = useContext(YahtzeeContext)

  return (
    <tr>
      <td>{title}</td>
      {Players.map((p, i) => <ScoreCell key={i}
          category={category}
          suggestion={suggestions[category]}
          player={p}
          activePlayer={i === parseInt(CurrentPlayer)} />
      )}
    </tr>)
}

const ScoreCell = ({ category, suggestion, player, activePlayer }) => {
  const { name } = useContext(AppContext)
  const { lastScore, rolling, game: { Players, CurrentPlayer, RollCount, Round } } = useContext(YahtzeeContext)
  const { gameId } = useParams()

  const myTurn = Players.length > 0 && Players[CurrentPlayer].User === name
  const beforeFirstRoll = RollCount <= 0
  const canClick = myTurn && !beforeFirstRoll && !rolling
  const afterLastRound = Round >= 13

  const scoreSheet = player.ScoreSheet

  const sumUpperSection = () => {
    return (scoreSheet["ones"] || 0) +
      (scoreSheet["twos"] || 0) +
      (scoreSheet["threes"] || 0) +
      (scoreSheet["fours"] || 0) +
      (scoreSheet["fives"] || 0) +
      (scoreSheet["sixes"] || 0)
  }

  const bonus = category === "bonus"
  const hasScore = category in scoreSheet
  const scoredAnimation = lastScore && lastScore.user === player.User &&
      lastScore.category.includes(category) && !activePlayer && !afterLastRound

  let val = scoreSheet[category]
  if (!hasScore) {
    if (bonus) {
      const remains = 63 - sumUpperSection()
      if (remains > 0) {
        val = "need " + remains + " more"
      }
    } else if (activePlayer) {
      val = suggestion
    }
  }

  const handleClick = () => {
    if (!canClick && !bonus) {
      return
    }

    score(gameId, name, category)
  }
  const classes = []
  if (activePlayer && !afterLastRound) {
    classes.push("Emphasized")
  }
  if (!hasScore) {
    classes.push("Suggestion")
  }
  if (canClick && !bonus) {
    classes.push("Clickable")
  }
  if (scoredAnimation) {
    classes.push("Blinking")
  }
  const className = classes.join(" ")

  return <td className={className} key={category} onClick={handleClick}>{val}</td>
}

export default Scores