import { useContext, useEffect, useState } from "react"
import { useParams } from "react-router-dom"

import { Context as AppContext } from "./../App"
import "./../Clickable.css"

import { score, suggestions as getSuggestions } from "./api"
import { Context as YahtzeeContext } from "./Yahtzee"
import "./Scores.css"

const UPPER_SECTION = [
  { id: "ones", title: "Aces" },
  { id: "twos", title: "Deuces" },
  { id: "threes", title: "Threes" },
  { id: "fours", title: "Fours" },
  { id: "fives", title: "Fives" },
  { id: "sixes", title: "Sixes" },
]

const CATEGORIES = [
  ...UPPER_SECTION,
  { id: "bonus", title: "Bonus" },
  { id: "three-of-a-kind", title: "Three of a kind" },
  { id: "four-of-a-kind", title: "Four of a kind" },
  { id: "full-house", title: "Full House" },
  { id: "small-straight", title: "Small Straight" },
  { id: "large-straight", title: "Large Straight" },
  { id: "yahtzee", title: "Yahtzee" },
  { id: "chance", title: "Chance" },
]

const transformData = (players, suggestions, currentPlayer, dices) => {
  // set scores from score sheet
  const data = CATEGORIES.map(category => {
    return {
      content: players.map(player => {
        return {
          scored: player.ScoreSheet[category.id]
        }
      }),
      ...category
    }
  })

  if (players.length === 0) {
    return data
  }

  // add hints for current player's column
  data.forEach((row, i) => {
    if (row.content[currentPlayer]["scored"] === undefined && suggestions[row.id] !== undefined) {
      data[i].content[currentPlayer]["suggestion"] = suggestions[row.id]
    }
  })

  // set bonus row (6th one in data)
  data[6].content.forEach((current, i) => {
    if (current["scored"] !== undefined) {
      return
    }

    const total = UPPER_SECTION
      .map(c => c.id)
      .map(id => players[i].ScoreSheet[id] || 0)
      .reduce((a, b) => a + b, 0)
    const left = 63 - total || 63

    current["hint"] = "need " + left + " more"
  })

  return data
}

const Scores = () => {
  const { name } = useContext(AppContext)
  const { game: { Dices, RollCount, Players, CurrentPlayer }, rolling, lastScore, setLastScore } = useContext(YahtzeeContext)
  const [suggestions, setSuggestions] = useState({})

  useEffect(() => { // load suggestions
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
          <ScoresHeader currentPlayer={CurrentPlayer} />
        </thead>
        <tbody>
          {transformData(Players, suggestions, CurrentPlayer, Dices).map((row, i) => (
            <ScoreLine key={i}
              highlight={CurrentPlayer}
              blink={lastScore?.category?.includes(row.id) ? (lastScore.user !== CurrentPlayer ? lastScore.user : undefined) : undefined}
              {...row} />)
          )}
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

const ScoreLine = ({ title, id, content, highlight, blink }) => {
  return (
    <tr>
      <td>{title}</td>
      {content.map((cell, i) => <ScoreCell key={i}
        category={id}
        highlight={i === highlight}
        blink={i === blink}
        {...cell} />)}
    </tr>)
}

const ScoreCell = ({ category, scored, suggestion, hint, highlight, blink }) => {
  const { name } = useContext(AppContext)
  const { gameId } = useParams()

  if (suggestion !== undefined) {
    return (
      <td
        className={`Suggestion Clickable${highlight ? " Highlighted" : ""}${blink ? " Blinking" : ""}`}
        onClick={() => score(gameId, name, category)}>{suggestion}</td>)
  } else if (hint !== undefined) {
    return (
      <td
        className={`Suggestion${highlight ? " Highlighted" : ""}${blink ? " Blinking" : ""}`}>{hint}</td>)
  } else {
    return <td className={`${highlight ? "Highlighted" : ""}${blink ? " Blinking" : ""}`}>{scored}</td>
  }
}

export default Scores
