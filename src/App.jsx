import React, { useState, useEffect } from "react"
import { BrowserRouter as Router, Switch, Route, useHistory } from "react-router-dom"

import Yahtzee from "./Yahtzee"
import * as api from "./api"

const App = () => {
  const [player, setPlayer] = useState(window.localStorage.getItem("name") || null)

  const handleNameChange = (newName) => {
    window.localStorage.setItem("name", newName)
    setPlayer(newName)
  }

  return (
    <Router>
      <Header
        name={player}
        onNameChange={handleNameChange} />

      <Switch>
        <Route exact path="/">
          <Home />
        </Route>
        <Route path="/:gameId">
          <Yahtzee player={player} />
        </Route>
      </Switch>
    </Router>
  )
}

const Home = () => (
  <p></p>
)

const Header = ({ name, onNameChange, onNewGame }) => {
  const history = useHistory()

  const handleClickOnNewGame = () => {
    api.create(name)
      .then(gameId => history.push(gameId.substring(1)))
  }

  const promptForName = (currentName, callback) => {
    let newName = null

    while (newName === null) {
      newName = prompt("Please enter your name:", currentName)
    }

    callback(newName)
  }

  useEffect(() => {
    if (name === null) {
      promptForName(name, onNameChange)
    }
  }, [name, onNameChange])

  const finalName = (name !== null ? name : "<Player>")

  return (
    <div className="menu">
      <div className="actions">
        <div className="actionable button" onClick={handleClickOnNewGame}><em>New Game</em></div>
        <InviteButtonChooser />
      </div>

      <div className="player" onClick={() => promptForName(name, onNameChange)}>
        You play as <em className="actionable">{finalName}</em>.
      </div>
    </div>)
}

const InviteButtonChooser = () => {
  if (navigator.share) {
    return <ShareButton />
  } else if (navigator.clipboard) {
    return <ClipboardButton />
  } else {
    return null
  }
}

const ShareButton = () => {
  const handleClick = () => {
    navigator.share({
      title: "Invited to Dajsz",
      text: "Click to join: ",
      url: window.location.href,
    })
      .then(() => console.log("shared"))
      .catch((error) => console.log("error sharing", error))
  }

  return (
    <div className="actionable button" onClick={handleClick}>
      <div className="share icon"></div>
    </div>)
}

const ClipboardButton = () => {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) {
      return
    }

    setTimeout(() => setCopied(false), 5000)
  }, [copied])

  const handleClick = () => {
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => setCopied(true))
  }

  const classes = ["clipboard", "icon"]
  if (copied) {
    classes.push("copied")
  }
  const className = classes.join(" ")

  return (
    <div className="actionable button" onClick={handleClick}>
      <div className={className}></div>
    </div>)
}

export default App
