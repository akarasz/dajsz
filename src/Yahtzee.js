import React from 'react';
import './Yahtzee.css';

const suggestions = {  // will come from backend
  "chance": 20,
  "fives": 15,
  "four-of-a-kind": 0,
  "fours": 0,
  "full-house": 0,
  "large-straight": 0,
  "ones": 0,
  "sixes": 0,
  "small-straight": 0,
  "three-of-a-kind": 15,
  "threes": 3,
  "twos": 2,
  "yahtzee": 0
}

function Yahtzee(props) {
  return (
    <div className="yahtzee">
      <Dices dices={props.Dices} />
      <Controller rollCount={props.RollCount} />
      <Scores players={props.Players} suggestions={suggestions} currentPlayer={props.Current} />
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
      <RollButton />
    </div>
  );
}

function RollButton() {
    return <div className="roll button">Roll</div>
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
        const currentPlayer = parseInt(props.currentPlayer) === i
        const hasScore = props.category in p.ScoreSheet

        let className = ''
        if (currentPlayer) {
            className += ' current-player'
        }
        if (!hasScore) {
            className += ' suggestion'
        }

        return <td className={className}>
           {currentPlayer && !hasScore ? props.suggestions[props.category] : p.ScoreSheet[props.category]}
          </td>
      })}
    </tr>
}

export default Yahtzee;
