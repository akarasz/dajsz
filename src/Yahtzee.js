import React from 'react';
import './Yahtzee.css';

function Yahtzee() {
  const dices = [
  {
    "Value":3,
    "Locked":false
  },
  {
    "Value":5,
    "Locked":true
  },
  {
    "Value":2,
    "Locked":false
  },
  {
    "Value":5,
    "Locked":true
  },
  {
    "Value":5,
    "Locked":true
  }]

  const players = [
  {
    "Name": "Alice",
    "ScoreSheet": {
      "ones": 5,
      "threes": 12
    }
  },
  {
    "Name": "Bob",
    "ScoreSheet": {
      "full-house": 25
    }
  },
  {
    "Name": "Carol",
    "ScoreSheet": {
      "fives": 20
    }
  }]

  return (
    <div className="yahtzee">
      <Dices dices={dices} />
      <Controller rollCount="2" />
      <Scores players={players} currentPlayer="1" />
    </div>
  );
}

function Dices(props) {
  return (
    <div className="dices">
      {props.dices.map((d, i) => {
        return <Dice index={i} value={d.Value} locked={d.Locked} />
      })}
    </div>
  );
}

function Dice(props) {
  let id = "dice-" + props.index
  let className = "dice face-" + props.value
  if (props.locked) {
    className += " locked"
  }

  return (
    <div id={id} className={className} />
  );
}

function Controller(props) {
  return (
    <div className="controller">
      <div className="roll counter">{props.rollCount} rolls out of 3</div>
      <div className="roll button">Roll</div>
    </div>
  );
}

function Scores(props) {
  return (
    <div className="scores">
      <table>
        <tr>
          <th/>
          {props.players.map((p, i) => {
            return <th>{p.Name}</th>
          })}
        </tr>
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
            Object.keys(p.ScoreSheet).map(function(c, ci) {
              total += p.ScoreSheet[c]
            })
            return <td>{total}</td>
          })}
        </tr>
      </table>
    </div>
  );
}

function ScoreLine(props) {
  return <tr>
      <td>{props.title}</td>
      {props.players.map((p, i) => {
        return <td className={parseInt(props.currentPlayer) === i ? 'current-player' : ''}>
         {p.ScoreSheet[props.category]}
        </td>
      })}
    </tr>
}

export default Yahtzee;
