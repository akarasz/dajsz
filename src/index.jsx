import React from "react"
import ReactDOM from "react-dom"
import "./index.css"
import App from "./App"
import ReactGA from "react-ga"
import config from "./config.js"

if (config.tracking) {
  ReactGA.initialize(config.tracking)
  ReactGA.pageview(window.location.pathname + window.location.search)
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
)