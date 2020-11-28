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

  const offerJoin = () => {
    const gameNotStartedYet =
      game.RollCount === 0 &&
      game.CurrentPlayer === 0 &&
      game.Round === 0
    const alreadyJoined = game.Players.map((p) => p.User).includes(player)

    if (gameNotStartedYet && !alreadyJoined) {
      if (window.confirm("Game hasn't started yet! Do you want to join?")) {
        api.join(gameId, player)
          .then((res) => updateGame(res))
      }
    }
  }

  const loadGame = () => {
    api.load(gameId, player)
      .then((res) => {
        if (res.isLoaded) {
          updateGame(res)
        }
      })
  }

  const handleRoll = () => {
    api.roll(gameId, player)
      .then((res) => {
        updateGame(res)
      })
  }

  const handleScore = (category) => {
    api.score(gameId, player, category)
      .then((res) => {
        updateGame(res)
      })
  }

  const handleLock = (idx) => {
    api.lock(gameId, player, idx)
      .then((res) => updateGame(res))
  }

  useEffect(() => {
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

    api.suggestions(player, game.Dices)
      .then((res) => {
        setSuggestions(res)
      })
    }, [rolling, game.RollCount, game.Players, game.CurrentPlayer]) // eslint-disable-line react-hooks/exhaustive-deps


  useEffect(loadGame, [gameId]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setLoaded('Players' in game)
  }, [game])

  useEffect(() => {
    if (!loaded) {
      return
    }
    offerJoin()
  }, [loaded]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!gameId) {
      return
    }

    ws.current = new WebSocket(config.baseUri.ws + "/" + gameId + "/ws")

    return () => {
      ws.current.close();
    }
  }, [gameId])

  useEffect(() => {
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

  useEffect(() => {
    if (!rolling) {
      return
    }

    setTimeout(() => {
      setRolling(false)
    }, 200)
  }, [rolling]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!lastScore) {
      return
    }

    setTimeout(() => setLastScore(null), 2000)
  }, [lastScore])

  if (!loaded) {
    return <p>Loading game <strong>{gameId}</strong>...</p>
  }

  const myTurn = game.Players.length > 0 && game.Players[game.CurrentPlayer].User === player

  return (
    <div id={gameId} className="yahtzee">
      <Dices
        dices={game.Dices}
        rolling={rolling}
        active={myTurn && game.RollCount > 0 && game.RollCount < 3}
        onLock={handleLock} />
      <Controller
        rollCount={game.RollCount}
        active={myTurn && game.RollCount < 3 && game.Round < 13 && !rolling}
        onRoll={handleRoll} />
      <Scores
        players={game.Players}
        suggestions={suggestions}
        currentPlayer={game.CurrentPlayer}
        round={game.Round}
        active={myTurn && game.RollCount > 0 && !rolling}
        onScore={handleScore}
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
