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
    const showPrompt = () => prompt("Please enter your name:", currentName)
    let newName = showPrompt()

    while (newName !== null && newName.trim() === "") {
      newName = showPrompt()
    }

    if (newName !== null) {
      callback(newName.trim())
    }
  }

  useEffect(() => {
    if (name === null) {
      promptForName(name, onNameChange)
    }
  }, [name, onNameChange])

  const finalName = (name !== null ? name : "<Player>")

  return (
    <header>
      <div class="header-left">
        <div class="title item">
          <img src="/icon/dice-192.png" alt="logo" />
          <span>Dajsz</span>
        </div>
        <div class="new-game action item" onClick={handleClickOnNewGame}>New Game</div>
      </div>
      <div class="header-right">
        <div class="name item" onClick={() => promptForName(name, onNameChange)}>You play as <em class="action" title={finalName}>{finalName}</em></div>
        <InviteButtonChooser />
      </div>
    </header>
    )
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
    <div class="share action item" title="Share" onClick={handleClick}>
      <img src="/share.png" alt="share" />
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

  const image = "/clipboard" + (copied ? "-copied" : "") + ".png"

  return (
    <div class="share action item" title="Share" onClick={handleClick}>
      <img src={image} alt="share" />
    </div>)
}

export default App
