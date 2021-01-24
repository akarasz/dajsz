import React from "react"
import ReactDOM from "react-dom"
import App from "./App"
import ReactGA from "react-ga"

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