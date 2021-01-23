import { createContext, useContext, useState, useEffect, useRef } from "react"
import { useParams } from "react-router-dom"

import { Context as AppContext } from "./App"
import Modal from "./Modal"
import * as api from "./api"
import config from "./config.js"

export const Context = createContext({})

const MyTurn = () => {
  const { name } = useContext(AppContext)
  const { game: { Players, CurrentPlayer }} = useContext(Context)

  return Players.length > 0 && Players[CurrentPlayer].User === name
}

const BeforeFirstRoll = () => {
  const { game: { RollCount }} = useContext(Context)

  return RollCount <= 0
}

const AfterLastRoll = () => {
  const { game: { RollCount }} = useContext(Context)

  return RollCount >= 3
}

const AfterLastRound = () => {
  const { game: { Round }} = useContext(Context)

  return Round >= 13
}

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

    api.load(gameId, name, (data) => {
      updateGame(data)
    })
  }, [gameId]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { // handle websocket creation
    if (gameId === null) {
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
      const event = JSON.parse(e.data)
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
  }, [game?.Players])

  if (game === null) {
    return null
  }

  return (
    <Context.Provider value={{ game, updateGame, rolling, setRolling, lastScore, setLastScore }}>
      <div className="yahtzee">
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

const JoinModal = ({ show, setShow }) => {
  const { name } = useContext(AppContext)
  const { updateGame, game } = useContext(Context)
  const { gameId } = useParams()

  useEffect(() => { // handle offering to join
    if (game === null) {
      return
    }

    const startedAlready = game.RollCount + game.CurrentPlayer + game.Round > 0
    if (startedAlready) {
      return
    }

    const hasPlayers = game.Players.length > 0
    const joinedAlready = game.Players.map((p) => p.User).includes(name)

    if (!hasPlayers) {
      api.join(gameId, name, updateGame)
    } else if (!joinedAlready) {
      setShow(true)
    }
  }, [game?.Players.length, gameId]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleYes = () => {
    api.join(gameId, name, updateGame)
    setShow(false)
  }

  const handleNo = () => {
    setShow(false)
  }

  return (
    <Modal showing={show} handleClose={handleNo}>
      <div className="dialog">
        <p>Do you want to join?</p>
        <div className="buttons">
          <button className="small"
            onClick={handleYes}>Yes</button>
          <button className="small secondary"
            onClick={handleNo}>No</button>
        </div>
      </div>
    </Modal>)
}

const Dices = () => {
  const { game: { Dices }, rolling, setRolling } = useContext(Context)

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
  const { rolling } = useContext(Context)
  const { gameId } = useParams()
  const myTurn = MyTurn()
  const beforeFirstRoll = BeforeFirstRoll()
  const afterLastRoll = AfterLastRoll()

  const clickable = myTurn && !beforeFirstRoll && !afterLastRoll && !rolling

  const handleLock = () => {
    if (clickable) {
      api.lock(gameId, name, index)
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

const Controller = () => (
  <div className="controller">
    <RollCount />
    <RollButton />
  </div>
)

const RollCount = () => {
  const { game: { RollCount }} = useContext(Context)

  const classes = ["roll", "counter", "roll-" + RollCount]
  const className = classes.join(" ")

  return <div className={className}><div /><div /><div /></div>
}

const RollButton = () => {
  const { name } = useContext(AppContext)
  const { rolling } = useContext(Context)
  const { gameId } = useParams()
  const myTurn = MyTurn()
  const afterLastRoll = AfterLastRoll()
  const afterLastRound = AfterLastRound()

  const clickable = myTurn && !afterLastRoll && !afterLastRound && !rolling

  const handleRoll = () => {
    api.roll(gameId, name)
  }

  if (clickable) {
    return <button className="roll" onClick={handleRoll}>Roll</button>
  } else {
    return <button className="roll" disabled>Roll</button>
  }
}

const Scores = () => {
  const { name } = useContext(AppContext)
  const { game: { Dices, RollCount, Players, CurrentPlayer }, rolling, lastScore, setLastScore } = useContext(Context)
  const [suggestions, setSuggestions] = useState({})

  useEffect(() => { // handle suggestions
    if (rolling || !Players || Players.length === 0) {
      return
    }

    const rolledAlready = RollCount > 0
    const activeTurn = Players[CurrentPlayer].User === name

    if (activeTurn && rolledAlready) {
      api.suggestions(name, Dices, setSuggestions)
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
    <div className="scores">
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
  const { game: { Players }} = useContext(Context)

  let isWinner = []
  if (AfterLastRound()) {
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
        return <th key={i} className={isWinner[i] ? "winner" : ""}>{p.User}</th>
      })}
    </tr>
  )
}

const ScoreLine = ({ title, category, suggestions }) => {
  const { game: { Players, CurrentPlayer } } = useContext(Context)

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
  const { lastScore, rolling } = useContext(Context)
  const { gameId } = useParams()

  const myTurn = MyTurn()
  const beforeFirstRoll = BeforeFirstRoll()
  const canClick = myTurn && !beforeFirstRoll && !rolling
  const afterLastRound = AfterLastRound()

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

    api.score(gameId, name, category)
  }
  const classes = []
  if (activePlayer && !afterLastRound) {
    classes.push("current-player")
  }
  if (!hasScore) {
    classes.push("suggestion")
  }
  if (canClick && !bonus) {
    classes.push("action")
  }
  if (scoredAnimation) {
    classes.push("scored")
  }
  const className = classes.join(" ")

  return <td className={className} key={category} onClick={handleClick}>{val}</td>
}

export default Yahtzee
