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
      <Scores players={players} />
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
        <tr>
          <td>Aces</td>
          {props.players.map((p, i) => {
              return <td>{p.ScoreSheet["ones"]}</td>
          })}
        </tr>
        <tr>
          <td>Twos</td>
          {props.players.map((p, i) => {
              return <td>{p.ScoreSheet["twos"]}</td>
          })}
        </tr>
        <tr>
          <td>Threes</td>
          {props.players.map((p, i) => {
              return <td>{p.ScoreSheet["threes"]}</td>
          })}
        </tr>
        <tr>
          <td>Fours</td>
          {props.players.map((p, i) => {
              return <td>{p.ScoreSheet["fours"]}</td>
          })}
        </tr>
        <tr>
          <td>Fives</td>
          {props.players.map((p, i) => {
              return <td>{p.ScoreSheet["fives"]}</td>
          })}
        </tr>
        <tr>
          <td>Sixes</td>
          {props.players.map((p, i) => {
              return <td>{p.ScoreSheet["sixes"]}</td>
          })}
        </tr>
        <tr>
          <td>Bonus</td>
          {props.players.map((p, i) => {
              return <td>{p.ScoreSheet["bonus"]}</td>
          })}
        </tr>
        <tr>
          <td>Three of a kind</td>
          {props.players.map((p, i) => {
              return <td>{p.ScoreSheet["three-of-a-kind"]}</td>
          })}
        </tr>
        <tr>
          <td>Four of a kind</td>
          {props.players.map((p, i) => {
              return <td>{p.ScoreSheet["four-of-a-kind"]}</td>
          })}
        </tr>
        <tr>
          <td>Full House</td>
          {props.players.map((p, i) => {
              return <td>{p.ScoreSheet["full-house"]}</td>
          })}
        </tr>
        <tr>
          <td>Small Straight</td>
          {props.players.map((p, i) => {
              return <td>{p.ScoreSheet["small-straight"]}</td>
          })}
        </tr>
        <tr>
          <td>Large Straight</td>
          {props.players.map((p, i) => {
              return <td>{p.ScoreSheet["large-straight"]}</td>
          })}
        </tr>
        <tr>
          <td>Yahtzee</td>
          {props.players.map((p, i) => {
              return <td>{p.ScoreSheet["yahtzee"]}</td>
          })}
        </tr>
        <tr>
          <td>Chance</td>
          {props.players.map((p, i) => {
              return <td>{p.ScoreSheet["chance"]}</td>
          })}
        </tr>
        <tr>
          <td>Total</td>
          <td>17</td>
          <td>25</td>
          <td>20</td>
        </tr>
      </table>
    </div>
  );
}

export default Yahtzee;
