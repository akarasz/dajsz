import React from 'react'
import Yahtzee from './Yahtzee'
import './App.css'

class App extends React.Component {
  constructor(props) {
    super(props)
    this.handleNameChange = this.handleNameChange.bind(this)
    this.handleGameChange = this.handleGameChange.bind(this)

    const game = window.location.hash.substring(2)
    this.state = {game: (game !== "" ? game : null)}
  }

  handleNameChange(newName) {
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
    const headers = new Headers()
    headers.append('Authorization', 'Basic ' + btoa(this.props.name + ':'))
    fetch("https://enigmatic-everglades-66668.herokuapp.com/", {
      method: "POST",
      headers: headers,
    })
    .then(
      (res) => {
        if (res.status === 201) {
          const game = res.headers.get("location")
          window.location.hash = game

          fetch("https://enigmatic-everglades-66668.herokuapp.com" + game + "/join", {
            method: "POST",
            headers: headers,
          })
          .then(
            (res) => {
              if (res.status === 201) {
                this.props.onNewGame(game)
              } else {
                console.log("omg2", res)
              }
            },
            (error) => {
              console.log("omg2 error", error)
            }
          )

        } else {
          console.log("omg", res)
        }
      },
      (error) => {
        console.log("omg error", error)
      }
    )
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
