import React from 'react'
import Yahtzee from './Yahtzee'
import './App.css'
import * as api from './api'

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
}

class Player extends React.Component {
  constructor(props) {
    super(props)
    this.handleClickOnName = this.handleClickOnName.bind(this)
    this.handleClickOnNewGame = this.handleClickOnNewGame.bind(this)
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
      .then(gameId => {
        api.join(gameId, this.props.name)
        return gameId
      })
      .then((gameId) => this.props.onNewGame(gameId))
  }

  render() {
    const name = (this.props.name != null ?
      this.props.name :
      "<Player>")

    return (
      <div className="menu">
        <div className="actions">
          <div className="actionable" onClick={this.handleClickOnNewGame}><em>New Game</em></div>
        </div>

        <div className="player" onClick={this.handleClickOnName}>
          You play as <em className="actionable">{name}</em>.
        </div>
      </div>
    )
  }

  componentDidMount() {
    if (this.props.name == null) {
      this.handleClickOnName()
    }
  }
}

export default App
