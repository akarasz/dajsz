import React from 'react'
import './Yahtzee.css'
import * as api from './api'
import config from './config.js'

class Yahtzee extends React.Component {
  constructor(props) {
    super(props)
    this.loadGame = this.loadGame.bind(this)
    this.offerJoin = this.offerJoin.bind(this)
    this.handleRoll = this.handleRoll.bind(this)
    this.handleRollStop = this.handleRollStop.bind(this)
    this.handleLock = this.handleLock.bind(this)
    this.handleScore = this.handleScore.bind(this)
    this.handleSuggestionRefresh = this.handleSuggestionRefresh.bind(this)
    this.state = {
      isLoaded: false
    }
  }

  render() {
    if (!this.state.isLoaded) {
      return <p>Loading game <strong>{this.props.game}</strong>... {this.state.error}</p>
    }

    const myTurn = this.state.Players.length > 0 && this.state.Players[this.state.CurrentPlayer].User === this.props.player

    return (
      <div id={this.props.game} className="yahtzee">
        <Dices
          dices={this.state.Dices}
          rolling={this.state.rolling}
          active={myTurn && this.state.RollCount > 0 && this.state.RollCount < 3}
          onLock={this.handleLock} />
        <Controller
          rollCount={this.state.RollCount}
          active={myTurn && this.state.RollCount < 3 && this.state.Round < 13 && !this.state.rolling}
          onRoll={this.handleRoll} />
        <Scores
          players={this.state.Players}
          suggestions={this.state.suggestions || {}}
          currentPlayer={this.state.CurrentPlayer}
          round={this.state.Round}
          active={myTurn && this.state.RollCount > 0 && !this.state.rolling}
          onScore={this.handleScore}
          lastScoredUser={this.state.lastScoredUser}
          lastScoredCategory={this.state.lastScoredCategory} />
      </div>
    )
  }

  componentDidMount() {
    this.loadGame()
  }

  offerJoin() {
    const gameNotStartedYet =
      this.state.RollCount === 0 &&
      this.state.CurrentPlayer === 0 &&
      this.state.Round === 0
    const alreadyJoined = this.state.Players.map((p) => p.User).includes(this.props.player)

    if (gameNotStartedYet && !alreadyJoined) {
      if (window.confirm("Game hasn't started yet! Do you want to join?")) {
        api.join(this.props.game, this.props.player)
          .then((res) => this.setState(res))
      }
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.game !== this.props.game) {
      this.loadGame()
    }
  }

  loadGame() {
    api.load(this.props.game, this.props.player)
      .then((res) => {
        if (res.isLoaded) {
          this.setState(res)
          this.handleSuggestionRefresh(res.Dices)
          this.offerJoin()
        }
      })
      .then((__) => {
        const ws = new WebSocket(config.baseUri.ws + '/' + this.props.game + '/ws')

        ws.onmessage = (e) => {
          this.setState(JSON.parse(JSON.parse(e.data)))
        }
      })
  }

  handleRoll() {
    api.roll(this.props.game, this.props.player)
      .then((res) => {
        this.handleRollStop(res.Dices)
        this.setState({...res, rolling: true})
      })
  }

  handleRollStop(dices) {
    setTimeout(() => {
      this.setState({rolling: false})
      this.handleSuggestionRefresh(dices)
    }, 200)
  }

  handleSuggestionRefresh(dices) {
    if (this.state.RollCount === 0 || this.state.Players.length === 0 ||
      this.state.Players[this.state.CurrentPlayer].User !== this.props.player) {
      this.setState({suggestions: {}})
      return
    }

    api.suggestions(this.props.player, dices)
      .then((res) => this.setState({suggestions: res}))
  }

  handleScore(category) {
    api.score(this.props.game, this.props.player, category)
      .then((res) => {
        this.setState({
          ...res,
          lastScoredUser: this.props.player,
          lastScoredCategory: category,
        })
        this.handleSuggestionRefresh(res.Dices)
        setTimeout(() => {
          this.setState({
            lastScoredUser: undefined,
            lastScoredCategory: undefined
          })
        }, 2000)
      })
  }

  handleLock(idx) {
    api.lock(this.props.game, this.props.player, idx)
      .then((res) => this.setState(res))
  }
}

function Dices(props) {
  return (
    <div className="dices">
      {props.dices.map((d, i) => {
        return <Dice
          index={i}
          key={i}
          value={d.Value}
          locked={d.Locked}
          rolling={props.rolling}
          active={props.active}
          onLock={props.onLock} />
      })}
    </div>
  );
}

class Dice extends React.Component {
  constructor(props) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
  }

  handleClick() {
    if (this.props.active) {
      this.props.onLock(this.props.index)
    }
  }

  render() {
    let className = "dice "
    if (this.props.rolling && !this.props.locked) {
      className += "rolling"
    } else {
      className += "face-" + this.props.value
    }

    if (this.props.locked) {
      className += " locked"
    }

    if (this.props.active) {
      className += " actionable"
    }

    return <div className={className} onClick={this.handleClick} />
  }
}

function Controller(props) {
  const className = "roll counter roll-" + props.rollCount

  return (
    <div className="controller">
      <div className={className}><div /><div /><div /></div>
      <RollButton {...props} />
    </div>
  )
}

class RollButton extends React.Component {
  render() {
    let className = "roll button"
    if (!this.props.active) {
      className += " disabled"
    }

    return <div className={className} onClick={this.props.active ? this.props.onRoll : undefined}>Roll</div>
  }
}

function Scores(props) {
  return (
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
  );
}

const ScoresHeader = (props) => {
  var isWinner = []
  if (props.round === 13) {
    const total = props.players
        .map(p => p.ScoreSheet)
        .map(scores => Object.values(scores).reduce((a, b) => a + b, 0))

    const max = Math.max(...total)

    isWinner = total
        .map(s => s === max)
  }

  return (
    <tr>
      <th/>
      {props.players.map((p, i) => {
        return <th key={i} className={isWinner[i] ? "winner" : ""}>{p.User}</th>
      })}
    </tr>
  )
}

class ScoreLine extends React.Component {
  constructor(props) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
  }

  handleClick() {
    if (this.props.category === 'bonus') {
      return
    }

    this.props.onScore(this.props.category)
  }

  render() {
    return <tr>
      <td>{this.props.title}</td>
      {this.props.players.map((p, i) => {
        const currentPlayer = parseInt(this.props.currentPlayer) === i && this.props.round < 13
        const hasScore = this.props.category in p.ScoreSheet
        const hasSuggestions = Object.keys(this.props.suggestions).length !== 0
        const actionable = (this.props.category !== 'bonus' && this.props.active)

        let bonusMessage
        if (this.props.category === 'bonus' && !('bonus' in p.ScoreSheet)) {
          const total =
            (p.ScoreSheet['ones'] || 0) +
            (p.ScoreSheet['twos'] || 0) +
            (p.ScoreSheet['threes'] || 0) +
            (p.ScoreSheet['fours'] || 0) +
            (p.ScoreSheet['fives'] || 0) +
            (p.ScoreSheet['sixes'] || 0)
          const remains = 63 - total
          if (remains > 0) {
            bonusMessage = "still need " + remains
          }
        }
        bonusMessage = hasSuggestions ? bonusMessage : ""

        let classNames = []
        if (currentPlayer) {
          classNames.push('current-player')
        }
        if (!hasScore) {
          classNames.push('suggestion')
        }
        if (actionable) {
          classNames.push('actionable')
        }
        if (this.props.players[parseInt(this.props.currentPlayer)].User === this.props.lastScoredUser &&
            this.props.category === this.props.lastScoredCategory) {
          classNames.push('scored')
        }

        let className = classNames.join(' ')

        const val = (currentPlayer && !hasScore) ?
            (this.props.category !== 'bonus' ?
                this.props.suggestions[this.props.category] :
                bonusMessage) :
            p.ScoreSheet[this.props.category]

        return (
          <td className={className} key={i} onClick={actionable ? this.handleClick : undefined}>
           {val}
          </td>)
      })}
    </tr>
  }
}

export default Yahtzee;
