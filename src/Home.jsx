import { useContext } from "react"
import { Link, useHistory } from "react-router-dom"

import { Context as AppContext } from "./App"
import { Button } from "./Button"
import "./Home.css"

import { create } from "./Yahtzee/api"

const Home = () => {
  const { name } = useContext(AppContext)
  const history = useHistory()

  const handleClickOnNewGame = () => {
    create(name)
      .then(gameId => history.push(gameId.substring(1)))
  }

  return (
    <div className="Home">
      <Button text="New Game"
        onClick={handleClickOnNewGame} />
      <div>
        <ul>
          <li><Link to="/privacy">Privacy</Link></li>
          <li><Link to="/support">Support</Link></li>
        </ul>
      </div>
    </div>)
}

export default Home