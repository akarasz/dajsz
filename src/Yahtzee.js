import React from 'react';
import './Yahtzee.css';

function Yahtzee() {
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
      <Dices />
      <Controller />
      <Scores players={players} currentPlayer="1" />
    </div>
  );
}

function Dices() {
  return (
    <div className="dices">
      <Dice index="0" value="3" />
      <Dice index="1" value="5" locked />
      <Dice index="2" value="2" />
      <Dice index="3" value="5" locked />
      <Dice index="4" value="5" locked />
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

function Controller() {
  return (
    <div className="controller">
      <div className="roll counter">2 rolls out of 3</div>
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
        <ScoreLine {...props} title="Aces" func={(p) => p.ScoreSheet["ones"]} />
        <ScoreLine {...props} title="Twos" func={(p) => p.ScoreSheet["twos"]} />
        <ScoreLine {...props} title="Threes" func={(p) => p.ScoreSheet["threes"]} />
        <ScoreLine {...props} title="Fours" func={(p) => p.ScoreSheet["fours"]} />
        <ScoreLine {...props} title="Fives" func={(p) => p.ScoreSheet["fives"]} />
        <ScoreLine {...props} title="Sixes" func={(p) => p.ScoreSheet["sixes"]} />
        <ScoreLine {...props} title="Bonus" func={(p) => p.ScoreSheet["bonus"]} />
        <ScoreLine {...props} title="Three of a kind" func={(p) => p.ScoreSheet["three-of-a-kind"]} />
        <ScoreLine {...props} title="Four of a kind" func={(p) => p.ScoreSheet["four-of-a-kind"]} />
        <ScoreLine {...props} title="Full House" func={(p) => p.ScoreSheet["full-house"]} />
        <ScoreLine {...props} title="Small Straight" func={(p) => p.ScoreSheet["small-straight"]} />
        <ScoreLine {...props} title="Large Straight" func={(p) => p.ScoreSheet["large-straight"]} />
        <ScoreLine {...props} title="Yahtzee" func={(p) => p.ScoreSheet["yahtzee"]} />
        <ScoreLine {...props} title="Chance" func={(p) => p.ScoreSheet["chance"]} />
        <ScoreLine {...props} title="Total" func={(p) => {
            let total = 0
            Object.keys(p.ScoreSheet).map(function(c, ci) {
              total += p.ScoreSheet[c]
            })
            return total
        }} />
      </table>
    </div>
  );
}

function ScoreLine(props) {
  return <tr>
    <td>{props.title}</td>
    {props.players.map((p, i) => {
      return <td>{props.func(p)}</td>
    })}
    </tr>
}

export default Yahtzee;
