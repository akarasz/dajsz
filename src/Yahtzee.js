import React from 'react';

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
    <div className="controller"></div>
  );
}

function Scores() {
  return (
    <div className="scores"></div>
  );
}

export default Yahtzee;
