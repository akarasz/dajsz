import React from 'react';
import './Yahtzee.css';

class Yahtzee extends React.Component {
  constructor(props) {
    super(props)
    this.loadGame = this.loadGame.bind(this)
    this.handleRoll = this.handleRoll.bind(this)
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

    const myTurn = this.state.Players.length > 0 && this.state.Players[this.state.CurrentPlayer].Name === this.props.player

    return (
      <div id={this.props.game} className="yahtzee">
        <Dices
          dices={this.state.Dices}
          active={myTurn && this.state.RollCount > 0 && this.state.RollCount < 3}
          onLock={this.handleLock} />
        <Controller
          rollCount={this.state.RollCount}
          active={myTurn && this.state.RollCount < 3 && this.state.Round < 13}
          onRoll={this.handleRoll} />
        <Scores
          players={this.state.Players}
          suggestions={this.state.suggestions || {}}
          currentPlayer={this.state.CurrentPlayer}
          round={this.state.Round}
          active={myTurn && this.state.RollCount > 0}
          onScore={this.handleScore} />
      </div>
    )
  }

  componentDidMount() {
    this.loadGame()
  }

  componentDidUpdate(prevProps) {
    if (prevProps.game !== this.props.game) {
      this.loadGame()
    }
  }

  loadGame() {
    const headers = new Headers()
    headers.append('Authorization', 'Basic ' + btoa(this.state.player + ':'))
    fetch("http://akarasz.me:8000/" + this.props.game, {
      headers: headers,
    })
    .then(
      (res) => {
        if (res.status === 200) {
          res.json().then((body) => {
            this.setState({
              ...body,
              isLoaded: true,
            })
            this.handleSuggestionRefresh(body.Dices)
          })
        } else if (res.status === 404) {
          this.setState({
            isLoaded: false,
            error: "not found",
          })
        } else {
          this.setState({
            isLoaded: false,
            error: "error",
          })
        }
      },
      (error) => {
        this.setState({
          isLoaded: false,
          error: "error",
        })
        console.log(error)
      }
    )
  }

  handleRoll() {
    const headers = new Headers()
    headers.append('Authorization', 'Basic ' + btoa(this.props.player + ':'))
    fetch("http://akarasz.me:8000/" + this.props.game + "/roll", {
      method: "POST",
      headers: headers,
    })
    .then(
      (res) => {
        if (res.status === 200) {
          res.json().then((body) => {
            console.log(body)
            this.setState({...body})

            this.handleSuggestionRefresh(body.Dices)
          })
        } else {
          console.log(res)
        }
      },
      (error) => {
        console.log(error)
      }
    )
  }

  handleSuggestionRefresh(dices) {
    if (this.state.RollCount === 0) {
      this.setState({suggestions: {}})
      return
    }

    const params = dices.map(d => "dice=" + d.Value).join("&")
    fetch("http://akarasz.me:8000/score?" + params, {
      method: "GET",
      headers: new Headers({
        "Authorization": "Basic " + btoa(this.props.player + ":"),
      }),
    })
    .then(
      (res) => {
        if (res.status === 200) {
          res.json().then((body) => {
            this.setState({
              suggestions: body
            })
          })
        } else {
          console.log(res)
        }
      },
      (error) => {
        console.log(error)
      }
    )
  }

  handleScore(category) {
    const headers = new Headers()
    headers.append('Authorization', 'Basic ' + btoa(this.props.player + ':'))
    fetch("http://akarasz.me:8000/" + this.props.game + "/score", {
      method: "POST",
      headers: headers,
      body: category,
    })
    .then(
      (res) => {
        if (res.status === 200) {
          res.json().then((body) => {
            this.setState({...body})
            this.handleSuggestionRefresh(body.Dices)
          })
        } else {
          console.log(res)
        }
      },
      (error) => {
        console.log(error)
      }
    )
  }

  handleLock(idx) {
    const headers = new Headers()
    headers.append('Authorization', 'Basic ' + btoa(this.props.player + ':'))
    fetch("http://akarasz.me:8000/" + this.props.game + "/lock/" + idx, {
      method: "POST",
      headers: headers,
    })
    .then(
      (res) => {
        if (res.status === 200) {
          res.json().then((body) => {
            console.log(body)
            this.setState({
              Dices: body,
            })
          })
        } else {
          console.log(res)
        }
      },
      (error) => {
        console.log(error)
      }
    )
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
    let className = "dice face-" + this.props.value
    if (this.props.locked) {
      className += " locked"
    }
    if (this.props.active) {
      className += " actionable"
    }

    return <div className={className} onClick={this.handleClick} />
  }
}

const Controller = (props) => (
  <div className="controller">
    <div className="roll counter">{props.rollCount} rolls out of 3</div>
    <RollButton {...props} />
  </div>
)

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
          <tr>
            <th/>
            {props.players.map((p, i) => {
              return <th key={i}>{p.Name}</th>
            })}
          </tr>
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

        let className = ''
        if (currentPlayer) {
          className += ' current-player'

          if (this.props.category !== 'bonus' && this.props.active) {
            className += ' actionable'
          }

        }
        if (!hasScore) {
          className += ' suggestion'
        }

        return <td className={className} key={i} onClick={this.props.active ? this.handleClick : undefined}>
           {currentPlayer && !hasScore ?
             this.props.suggestions[this.props.category] :
             p.ScoreSheet[this.props.category]}
          </td>
      })}
    </tr>
  }
}

export default Yahtzee;
