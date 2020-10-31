import React from 'react'
import Yahtzee from './Yahtzee'
import './App.css'
import * as api from './api'
import ReactGA from 'react-ga';
import config from './config.js'

class App extends React.Component {
  constructor(props) {
    super(props)
    this.handleNameChange = this.handleNameChange.bind(this)
    this.handleGameChange = this.handleGameChange.bind(this)

    const gameFromHash = window.location.hash.substring(2)
    this.state = {
      game: (gameFromHash !== "" ? gameFromHash : null),
      player: window.localStorage.getItem("name"),
    }
  }

  handleNameChange(newName) {
    window.localStorage.setItem("name", newName)
    this.setState({player: newName})
  }

  handleGameChange(newGame) {
    this.setState({game: newGame})
  }

  render() {
    return (
      <div>
        <Player
          name={this.state.player}
          onNameChange={this.handleNameChange}
          onNewGame={this.handleGameChange}
      />
        { this.state.game != null ?
          <Yahtzee player={this.state.player} game={this.state.game} /> :
          undefined }
      </div>
    )
  }

  componentDidMount() {
    if (config.tracking) {
      ReactGA.initialize(config.tracking);
      ReactGA.pageview(window.location.pathname + window.location.search);
    }
  }
}

class Player extends React.Component {
  constructor(props) {
    super(props)
    this.handleClickOnName = this.handleClickOnName.bind(this)
    this.handleClickOnNewGame = this.handleClickOnNewGame.bind(this)
    this.handleClickOnShare = this.handleClickOnShare.bind(this)
  }

  handleClickOnName() {
    let newName = ""

    newName = prompt("Please enter your name:", this.props.name);

    if (newName != null) {
      this.props.onNameChange(newName)
    }
  }

  handleClickOnNewGame() {
    api.create(this.props.name)
      .then((gameId) => {
        window.location.hash = gameId
        return gameId
      })
      .then(gameId => gameId.substring(1))
      .then(gameId => {
        api.join(gameId, this.props.name)
        return gameId
      })
      .then((gameId) => this.props.onNewGame(gameId))
  }

  handleClickOnShare() {
    const url = window.location.toString()

    console.log(navigator)
    if (navigator.share) {
      navigator.share({
        title: 'Invited to Dajsz',
        text: 'Click to join: ',
        url: url,
      })
        .then(() => console.log('shared'))
        .catch((error) => console.log('error sharing', error));
    } else {
      navigator.clipboard.writeText(url).then(function() {
        alert("Game link copied to clipboard.")
      }, function(err) {
        console.error('error copy to clipboard', err);
      });
    }
  }

  render() {
    const name = (this.props.name != null ?
      this.props.name :
      "<Player>")

    return (
      <div className="menu">
        <div className="actions">
          <div className="actionable button" onClick={this.handleClickOnNewGame}><em>New Game</em></div>
          <div className="actionable button" onClick={this.handleClickOnShare}><div className="share"></div></div> 
        </div>

        <div className="player" onClick={this.handleClickOnName}>
          You play as <em className="actionable">{name}</em>.
        </div>
      </div>
    )
  }

  componentDidMount() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
      .then(function(registration) {
        console.log('Registration successful, scope is:', registration.scope);
      })
      .catch(function(error) {
        console.log('Service worker registration failed, error:', error);
      });
    }

    if (this.props.name == null) {
      this.handleClickOnName()
    }
  }
}

export default App
