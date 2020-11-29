import React, { useState, useEffect, useRef } from "react"
import "./Yahtzee.css"
import * as api from "./api"
import config from "./config.js"

const Yahtzee = ({ gameId, player }) => {

  const [loaded, setLoaded] = useState(false)
  const [game, setGame] = useState({})
  const [suggestions, setSuggestions] = useState({})

  // states for animations
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

  useEffect(() => { // handle suggestions
    if (!loaded || rolling) {
      return
    }

    const rolledAlready = game.RollCount > 0
    const activeTurn = game.Players[game.CurrentPlayer].User === player

    if (activeTurn && rolledAlready) {
      api.suggestions(player, game.Dices, setSuggestions)
    } else {
      setSuggestions({})
    }
  }, [rolling, game.RollCount, game.Players, game.CurrentPlayer]) // eslint-disable-line react-hooks/exhaustive-deps


  useEffect(() => { // handle game loading
    setLoaded(false)
    setSuggestions({})
    setGame({})

    api.load(gameId, player, (data) => {
      updateGame(data)
      setLoaded(true)
    })
  }, [gameId]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { // handle setting loaded state
    setLoaded(!(!game.Players))
  }, [game])

  useEffect(() => { // handle offering to join
    if (!loaded) {
      return
    }

    const startedAlready = game.RollCount + game.CurrentPlayer + game.Round > 0

    if (startedAlready) {
      return
    }

    const hasPlayers = game.Players.length > 0
    const joinedAlready = game.Players.map((p) => p.User).includes(player)

    if (!hasPlayers) {
      api.join(gameId, player, updateGame)
    } else if (!joinedAlready) {
      if (window.confirm("Do you want to join?")) {
        api.join(gameId, player, updateGame)
      }
    }
  }, [loaded, gameId]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { // handle websocket creation
    if (!gameId) {
      return
    }

    ws.current = new WebSocket(config.baseUri.ws + "/" + gameId + "/ws")

    return () => {
      ws.current.close();
    }
  }, [gameId])

  useEffect(() => { // handle websocket onevent
    if (!ws.current) {
      return
    }

    ws.current.onmessage = (e) => {
      const event = JSON.parse(JSON.parse(e.data))
      if (event.Action === "roll") {
        setRolling(true)
      } else if (event.Action === "score") {
        setLastScore({
          user: event.User,
          category: scoreSheetDiff(game.Players, event.Data.Players)[event.User],
        })
      }

      updateGame(event.Data)
    }
  }, [game.Players])

  useEffect(() => { // handle stopping roll animation
    if (!rolling) {
      return
    }

    setTimeout(() => setRolling(false), 200)
  }, [rolling])

  useEffect(() => { // handle stopping blinking last score
    if (!lastScore) {
      return
    }

    setTimeout(() => setLastScore(null), 2000)
  }, [lastScore])

  if (!loaded) {
    return <p>Loading game <strong>{gameId}</strong>...</p>
  }

  const gameEnded = game.Round >= 13
  const beforeFirstRoll = game.RollCount <= 0
  const turnEnded = game.RollCount >= 3
  const playersTurn = game.Players.length > 0 && game.Players[game.CurrentPlayer].User === player

  const canLock = playersTurn && !beforeFirstRoll && !turnEnded
  const canRoll = playersTurn && !turnEnded && !gameEnded && !rolling
  const canScore = playersTurn && !beforeFirstRoll && !rolling
  const handleLock = (idx) => api.lock(gameId, player, idx)
  const handleRoll = () => api.roll(gameId, player)
  const handleScore = (category) => api.score(gameId, player, category)

  return (
    <div id={gameId} className="yahtzee">
      <Dices
        dices={game.Dices}
        rolling={rolling}
        active={canLock}
        onLock={handleLock} />
      <Controller
        rollCount={game.RollCount}
        active={canRoll}
        onRoll={handleRoll} />
      <Scores
        players={game.Players}
        suggestions={suggestions}
        activePlayerIdx={game.CurrentPlayer}
        gameEnded={gameEnded}
        canClick={canScore}
        onScore={handleScore}
        playersTurn={playersTurn}
        lastScore={lastScore} />
    </div>)
}

const Dices = ({ dices, rolling, active, onLock }) => (
  <div className="dices">
    {dices.map((d, i) => {
      return <Dice
        index={i}
        key={i}
        value={d.Value}
        locked={d.Locked}
        rolling={rolling}
        active={active}
        onLock={onLock} />
    })}
  </div>
)

const Dice = ({ active, rolling, locked, value, index, onLock }) => {
  const handleClick = () => {
    if (active) {
      onLock(index)
    }
  }

  const classes = ["dice"]
  if (rolling && !locked) {
    classes.push("rolling")
  } else {
    classes.push("face-" + value)
  }
  if (locked) {
    classes.push("locked")
  }
  if (active) {
    classes.push("actionable")
  }

  return <div className={classes.join(" ")} onClick={handleClick} />
}

const Controller = ({ rollCount, active, onRoll }) => (
  <div className="controller">
    <RollCount rollCount={rollCount} />
    <RollButton active={active} onRoll={onRoll} />
  </div>
)

const RollCount = ({ rollCount }) => {
  const classes = ["roll", "counter", "roll-" + rollCount]
  const className = classes.join(" ")

  return <div className={className}><div /><div /><div /></div>
}

const RollButton = ({ active, onRoll }) => {
  const classes = ["roll", "button"]
  if (!active) {
    classes.push("disabled")
  }
  const className = classes.join(" ")

  let onClick = undefined
  if (active) {
    onClick = onRoll
  }

  return <div className={className} onClick={onClick}>Roll</div>
}

const Scores = (props) => (
  <div className="scores">
    <table>
      <thead>
        <ScoresHeader players={props.players} gameEnded={props.gameEnded} />
      </thead>
      <tbody>
        <ScoreLine {...props} title="Aces" category="ones" />
        <ScoreLine {...props} title="Twos" category="twos" />
        <ScoreLine {...props} title="Threes" category="threes" />
        <ScoreLine {...props} title="Fours" category="fours" />
        <ScoreLine {...props} title="Fives" category="fives" />
        <ScoreLine {...props} title="Sixes" category="sixes" />
        <ScoreLine {...props} title="Bonus" category="bonus" />
        <ScoreLine {...props} title="Three of a kind" category="three-of-a-kind" />
        <ScoreLine {...props} title="Four of a kind" category="four-of-a-kind" />
        <ScoreLine {...props} title="Full House" category="full-house" />
        <ScoreLine {...props} title="Small Straight" category="small-straight" />
        <ScoreLine {...props} title="Large Straight" category="large-straight" />
        <ScoreLine {...props} title="Yahtzee" category="yahtzee" />
        <ScoreLine {...props} title="Chance" category="chance" />
        <tr>
          <td>Total</td>
          {props.players.map((p, i) => {
            let total = 0
            Object.entries(p.ScoreSheet).forEach(([c, v]) => total += v)
            return <td key={i}>{total}</td>
          })}
        </tr>
      </tbody>
    </table>
  </div>
)

const ScoresHeader = ({ gameEnded, players }) => {
  let isWinner = []
  if (gameEnded) {
    const total = players
        .map(p => p.ScoreSheet)
        .map(scores => Object.values(scores).reduce((a, b) => a + b, 0))

    const max = Math.max(...total)

    isWinner = total
        .map(s => s === max)
  }

  return (
    <tr>
      <th/>
      {players.map((p, i) => {
        return <th key={i} className={isWinner[i] ? "winner" : ""}>{p.User}</th>
      })}
    </tr>
  )
}

const ScoreLine = ({ title, category, players, activePlayerIdx, suggestions, canClick, playersTurn, lastScore, gameEnded, onScore }) => {
  const handleClick = () => {
    if (category === "bonus") {
      return
    }

    onScore(category)
  }

  return (
    <tr>
      <td>{title}</td>
      {players.map((p, i) => <ScoreCell
          scoreSheet={p.ScoreSheet}
          category={category}
          suggestion={suggestions[category]}
          player={players[i]}
          canClick={canClick}
          playersTurn={playersTurn}
          activePlayer={i === parseInt(activePlayerIdx)}
          gameEnded={gameEnded}
          lastScore={lastScore}
          onClick={handleClick} />
      )}
    </tr>)
}

const ScoreCell = ({ scoreSheet, category, suggestion, player, canClick, playersTurn, activePlayer, gameEnded, lastScore, onClick }) => {

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
      lastScore.category.includes(category) && !activePlayer && !gameEnded

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

  const classes = []
  if (activePlayer && !gameEnded) {
    classes.push("current-player")
  }
  if (!hasScore) {
    classes.push("suggestion")
  }
  if (canClick && !bonus) {
    classes.push("actionable")
  }
  if (scoredAnimation) {
    classes.push("scored")
  }
  const className = classes.join(" ")

  const handleClick = canClick ? onClick : undefined

  return <td className={className} key={category} onClick={handleClick}>{val}</td>
}

export default Yahtzee
