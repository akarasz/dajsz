import { createContext, useContext, useState, useEffect } from "react"
import { BrowserRouter as Router, Switch, Link, Route, useHistory } from "react-router-dom"

import Header from "./Header"
import Home from "./Home"
import Privacy from "./Privacy"
import Support from "./Support"
import Yahtzee from "./Yahtzee"

export const Context = createContext({})

const App = () => {
  const [name, setName] = useState(window.localStorage.getItem("name") || null)

  const changeName = (newName) => {
    window.localStorage.setItem("name", newName)
    setName(newName)
  }

  return (
    <Context.Provider value={{name, changeName}}>
      <Router>
        <Header />
        <Switch>
          <Route exact path="/">
            <Home />
          </Route>
          <Route exact path="/privacy">
            <Privacy />
          </Route>
          <Route exact path="/support">
            <Support />
          </Route>
          <Route path="/:gameId">
            <Yahtzee />
          </Route>
        </Switch>
      </Router>
    </Context.Provider>
  )
}

export default App
