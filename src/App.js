import React from 'react'
import Yahtzee from './Yahtzee'
import './App.css'

class App extends React.Component {
  constructor(props) {
    super(props)
    this.handleNameChange = this.handleNameChange.bind(this)

    const game = window.location.hash.substring(1)
    this.state = {game: (game !== "" ? game : null)}
  }

  handleNameChange(newName) {
    this.setState({player: newName})
  }

  render() {
    return (
      <div>
        <Player
          name={this.state.player}
          onNameChange={this.handleNameChange} />
        { this.state.game != null ?
          <Yahtzee player={this.state.player} game={window.location.hash.substring(1)} /> :
          undefined }
      </div>
    )
  }
}

class Player extends React.Component {
  constructor(props) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
  }

  handleClick() {
    let newName = ""

    newName = prompt("Please enter your name:", this.props.name);

    if (newName != null) {
      this.props.onNameChange(newName)
    }
  }

  render() {
    const name = (this.props.name != null ?
      this.props.name :
      "<Player>")

    return (
      <div className="player">
        You play as <em className="actionable" onClick={this.handleClick}>{name}</em>.
      </div>
    )
  }

  componentDidMount() {
    if (this.props.name == null) {
      this.handleClick()
    }
  }
}

export default App
