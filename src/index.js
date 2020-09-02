import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Yahtzee from './Yahtzee';

const apiResponse = {
  "Players": [
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
  }],
  "Dices": [
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
  }],
  "Current": 1,
  "RollCount": 2
}

ReactDOM.render(
  <React.StrictMode>
    <Yahtzee {...apiResponse} player="Bob" />
  </React.StrictMode>,
  document.getElementById('root')
);
