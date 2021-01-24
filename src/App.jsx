import { createContext, useState } from "react"
import { BrowserRouter as Router, Switch, Route } from "react-router-dom"

import Home from "./Home"
import Privacy from "./Privacy"
import Support from "./Support"

import "./App.css"

import Header from "./Header/Header"

import Yahtzee from "./Yahtzee/Yahtzee"

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
        <Content>
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
        </Content>
      </Router>
    </Context.Provider>
  )
}

const Content = ({ children }) => (
  <div class="Content">
    {children}
  </div>)

export default App
