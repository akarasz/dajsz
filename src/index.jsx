import React from "react"
import ReactDOM from "react-dom"
import ReactGA from "react-ga"

import App from "./App"
import "./index.css"

if (window.tracking) {
  ReactGA.initialize(window.tracking)
  ReactGA.pageview(window.location.pathname + window.location.search)
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
)