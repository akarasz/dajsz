import React, { useState, useEffect, useRef } from "react"
import "./Yahtzee.css"
import * as api from "./api"
import config from "./config.js"

const Yahtzee = ({ gameId, player }) => {

  const [loaded, setLoaded] = useState(false)
  const [rolling, setRolling] = useState(false)
  const [lastScore, setLastScore] = useState(null)
  const [game, setGame] = useState({})
  const [suggestions, setSuggestions] = useState({})

  const ws = useRef(null)

  const updateGame = (fresh) => {
    setGame(current => { return { ...current, ...fresh } })
  }

  useEffect(() => { // handle suggestions
    if (rolling) {
      return
    }

    if (!game.Players) {
      return
    }

    if (game.RollCount === 0 ||
        game.Players.length === 0 ||
        game.Players[game.CurrentPlayer].User !== player) {
      setSuggestions({})
      return
    }

    api.suggestions(player, game.Dices, setSuggestions)
  }, [rolling, game.RollCount, game.Players, game.CurrentPlayer]) // eslint-disable-line react-hooks/exhaustive-deps


  useEffect(() => { // handle game loading
    setLoaded(false)
    setGame({})

    api.load(gameId, player, (data) => {
      updateGame(data)
      setLoaded(true)
    })
  }, [gameId]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { // handle setting loaded state
    setLoaded('Players' in game)
  }, [game])

  useEffect(() => { // handle offering to join
    if (!game.Players || !loaded) {
      return
    }

    const gameNotStartedYet =
      game.RollCount === 0 &&
      game.CurrentPlayer === 0 &&
      game.Round === 0
    const alreadyJoined = game.Players.map((p) => p.User).includes(player)

    if (gameNotStartedYet && game.Players.length === 0) {
      api.join(gameId, player, updateGame)
      return
    }

    if (gameNotStartedYet && !alreadyJoined) {
      if (window.confirm("Game hasn't started yet! Do you want to join?")) {
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
        const currentCategories = Object.keys(game.Players.filter(p => p.User === event.User)[0].ScoreSheet)
        const newCategories = Object.keys(event.Data.Players.filter(p => p.User === event.User)[0].ScoreSheet)
        const diff = newCategories.filter(c => !currentCategories.includes(c))

        setLastScore({user: event.User, category: diff})
      }

      updateGame(event.Data)
    }
  }, [game.Players])

  useEffect(() => { // handle stopping roll animation
    if (!rolling) {
      return
    }

    setTimeout(() => {
      setRolling(false)
    }, 200)
  }, [rolling]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { // handle stopping blinking last score
    if (!lastScore) {
      return
    }

    setTimeout(() => setLastScore(null), 2000)
  }, [lastScore])

  if (!loaded) {
    return <p>Loading game <strong>{gameId}</strong>...</p>
  }

  const myTurn = game.Players.length > 0 && game.Players[game.CurrentPlayer].User === player

  const canLock = myTurn && game.RollCount > 0 && game.RollCount < 3
  const canRoll = myTurn && game.RollCount < 3 && game.Round < 13 && !rolling
  const canScroll = myTurn && game.RollCount > 0 && !rolling

  return (
    <div id={gameId} className="yahtzee">
      <Dices
        dices={game.Dices}
        rolling={rolling}
        active={canLock}
        onLock={(idx) => api.lock(gameId, player, idx, updateGame)} />
      <Controller
        rollCount={game.RollCount}
        active={canRoll}
        onRoll={() => api.roll(gameId, player, updateGame)} />
      <Scores
        players={game.Players}
        suggestions={suggestions}
        currentPlayer={game.CurrentPlayer}
        round={game.Round}
        active={canScroll}
        onScore={(category) => api.score(gameId, player, category, updateGame)}
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
        <ScoresHeader players={props.players} round={props.round} />
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

const ScoresHeader = ({ round, players }) => {
  let isWinner = []
  if (round === 13) {
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

const ScoreLine = (props) => {
  const handleClick = () => {
    if (props.category === "bonus") {
      return
    }

    props.onScore(props.category)
  }

  return <tr>
    <td>{props.title}</td>
    {props.players.map((p, i) => {
      const currentPlayer = parseInt(props.currentPlayer) === i && props.round < 13
      const hasScore = props.category in p.ScoreSheet
      const hasSuggestions = Object.keys(props.suggestions).length !== 0
      const actionable = (props.category !== "bonus" && props.active)

      let bonusMessage
      if (props.category === "bonus" && !("bonus" in p.ScoreSheet)) {
        const total =
          (p.ScoreSheet["ones"] || 0) +
          (p.ScoreSheet["twos"] || 0) +
          (p.ScoreSheet["threes"] || 0) +
          (p.ScoreSheet["fours"] || 0) +
          (p.ScoreSheet["fives"] || 0) +
          (p.ScoreSheet["sixes"] || 0)
        const remains = 63 - total
        if (remains > 0) {
          bonusMessage = "still need " + remains
        }
      }
      bonusMessage = hasSuggestions ? bonusMessage : ""

      const val = (currentPlayer && !hasScore) ?
          (props.category !== "bonus" ?
              props.suggestions[props.category] :
              bonusMessage) :
          p.ScoreSheet[props.category]

      let classNames = []
      if (currentPlayer) {
        classNames.push("current-player")
      }
      if (!hasScore) {
        classNames.push("suggestion")
      }
      if (actionable) {
        classNames.push("actionable")
      }
      if (props.lastScore !== null &&
          props.lastScore.user === props.players[i].User &&
          props.lastScore.category.includes(props.category) &&
          !currentPlayer) {
        classNames.push("scored")
      }

      return (
        <td className={classNames.join(" ")} key={i} onClick={actionable ? handleClick : undefined}>
         {val}
        </td>)
    })}
  </tr>
}

export default Yahtzee
