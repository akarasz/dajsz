import React from 'react';
import './Yahtzee.css';

function Yahtzee() {
  return (
    <div className="yahtzee">
      <Dices />
      <Controller />
      <Scores />
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

function Scores() {
  return (
    <div className="scores">
      <table>
        <tr>
          <th/>
          <th>Alice</th>
          <th>Bob</th>
          <th>Carol</th>
        </tr>
        <tr>
          <td>Aces</td>
          <td>5</td>
          <td className="suggestion">0</td>
          <td/>
        </tr>
        <tr>
          <td>Twos</td>
          <td/>
          <td className="suggestion">2</td>
          <td/>
        </tr>
        <tr>
          <td>Threes</td>
          <td>12</td>
          <td className="suggestion">3</td>
          <td/>
        </tr>
        <tr>
          <td>Fours</td>
          <td/>
          <td className="suggestion">0</td>
          <td/>
        </tr>
        <tr>
          <td>Fives</td>
          <td/>
          <td className="suggestion selected">15</td>
          <td>20</td>
        </tr>
        <tr>
          <td>Sixes</td>
          <td/>
          <td className="suggestion">0</td>
          <td/>
        </tr>
        <tr>
          <td>Bonus</td>
          <td/>
          <td/>
          <td/>
        </tr>
        <tr>
          <td>Three of a kind</td>
          <td/>
          <td className="suggestion">15</td>
          <td/>
        </tr>
        <tr>
          <td>Four of a kind</td>
          <td/>
          <td className="suggestion">0</td>
          <td/>
        </tr>
        <tr>
          <td>Full House</td>
          <td/>
          <td>25</td>
          <td/>
        </tr>
        <tr>
          <td>Small Straight</td>
          <td/>
          <td className="suggestion">0</td>
          <td/>
        </tr>
        <tr>
          <td>Large Straight</td>
          <td/>
          <td className="suggestion">0</td>
          <td/>
        </tr>
        <tr>
          <td>Yahtzee</td>
          <td/>
          <td className="suggestion">0</td>
          <td/>
        </tr>
        <tr>
          <td>Chance</td>
          <td/>
          <td className="suggestion">20</td>
          <td/>
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
