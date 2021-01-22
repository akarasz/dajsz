import { createContext, useContext, useState, useEffect } from "react"
import { BrowserRouter as Router, Switch, Link, Route, useHistory } from "react-router-dom"

import Yahtzee from "./Yahtzee"
import Modal from "./Modal"
import * as api from "./api"

export const Context = createContext({})

const App = () => {
  const [name, setName] = useState(window.localStorage.getItem("name") || null)

  const changeName = (newName) => {
    window.localStorage.setItem("name", newName)
    setName(newName)
  }

  return (
    <Context.Provider value={{name, changeName}}>
      <Router>
        <Header />
        <Switch>
          <Route exact path="/">
            <Home />
          </Route>
          <Route exact path="/privacy">
            <Privacy />
          </Route>
          <Route exact path="/support">
            <Support />
          </Route>
          <Route path="/:gameId">
            <Yahtzee />
          </Route>
        </Switch>
      </Router>
    </Context.Provider>
  )
}

const Home = () => {
  const { name } = useContext(Context)
  const history = useHistory()

  const handleClickOnNewGame = () => {
    api.create(name)
      .then(gameId => history.push(gameId.substring(1)))
  }

  return (
    <div className="home">
      <button onClick={handleClickOnNewGame}>New Game</button>
      <div>
        <ul>
          <li><Link to="/privacy">Privacy</Link></li>
          <li><Link to="/support">Support</Link></li>
        </ul>
      </div>
    </div>)
}

const Privacy = () => (
  <div className="home">
    <Link to="/">← Go back</Link>
    <p>
      Dajsz and it's integrations are not storing any personal information, there
      is no permanent storage behind the service - all data created gets removed
      after 48 hours at the latest. You can check it for yourself - all code
      is available for the public:
    </p>

    <ul>
      <li><a href="https://github.com/akarasz/dajsz">Dajsz</a></li>
      <li><a href="https://github.com/akarasz/dajsz-slack">Slack integration</a></li>
      <li><a href="https://github.com/akarasz/yahtzee">Backend</a></li>
    </ul>

    <p>
      Dajsz uses Google Analytics for usage metrics. If you want to learn
      more about Google's privacy policy then you should head over
      <a href="https://support.google.com/analytics/answer/6004245"> there</a>.
    </p>
  </div>
)

const Support = () => (
  <div className="home">
    <Link to="/">← Go back</Link>
    <p>
      If you have questions or concerns about Dajsz you can reach out at
      <a href="mailto:support@dajsz.hu"> support@dajsz.hu</a>. If you found
      any bugs or issues you can report them
      <a href="https://github.com/akarasz/dajsz/issues"> here</a>.
    </p>
  </div>
)

const Header = () => {
  const [showModal, setShowModal] = useState(false)

  const { name } = useContext(Context)

  useEffect(() => {
    if (name === null || name === "") {
      setShowModal(true)
    }
  }, [name])

  return (
    <header>
      <div className="header-left">
        <Link to="/" className="title action item">
            <img src="/icon/dice-192.png" alt="logo" />
            <span>Dajsz</span>
        </Link>
      </div>
      <div className="header-right">
        <div className="name item" onClick={() => setShowModal(true)}>
          You play as <em className="action" title={name}>{name}</em>
        </div>
        <InviteButtonChooser />
      </div>

      <NameChangeModal show={showModal}
        handleClose={() => setShowModal(false)} />
    </header>)
}

const NameChangeModal = ({ show, handleClose }) => {
  const { name, changeName } = useContext(Context)

  const [input, setInput] = useState(name)

  const updateInput = (e) => {
    setInput(e.target.value)
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSave()
    } else if (e.key === "Escape") {
      handleCancel()
    }
  }

  const handleCancel = () => {
    setInput(name)

    if (name === null || name.trim() === "") {
      return
    }

    handleClose()
  }

  const handleSave = () => {
    if (input === null || input.trim() === "") {
      return
    }

    changeName(input.trim())
    handleClose()
  }

  return (
    <Modal showing={show} handleClose={handleCancel}>
      <div className="name dialog">
        <p>Please enter your name:</p>
        <input autoFocus type="text" value={input !== null ? input : ""} onChange={updateInput} onKeyDown={handleKeyPress} />
        <div className="buttons">
          <button className="small"
            onClick={handleSave}
            disabled={input === null || input.trim() === ""}>Save</button>
          <button className="small secondary"
            onClick={handleCancel}
            disabled={name === null || name.trim() === ""}>Cancel</button>
        </div>
      </div>
    </Modal>)
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
    <div className="share action item" title="Share" onClick={handleClick}>
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
    <div className="share action item" title="Share" onClick={handleClick}>
      <img src={image} alt="share" />
    </div>)
}

export default App
