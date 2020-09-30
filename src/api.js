import config from './config.js'

const headers = (user) => (
  new Headers({
    "Authorization": "Basic " + btoa(user + ":"),
  })
)

export const create = (user) => (
  fetch(config.baseUri.http, {
    method: "POST",
    headers: headers(user),
  })
  .then((res) => {
    if (res.status === 201) {
      return res.headers.get("location")
    } else {
      throw res
    }
  })
)

export const load = (gameID, user) => (
  fetch(config.baseUri.http + "/" + gameID, {
    headers: headers(user),
  })
  .then((res) => Promise.all([res.status, res.json()]))
  .then(([code, body]) => {
    if (code === 200) {
      return {
        ...body,
        isLoaded: true,
      }
    } else if (code === 404) {
      return {
        isLoaded: false,
        error: "not found",
      }
    } else {
      return {
        isLoaded: false,
        error: "error",
      }
    }
  })
)

export const join = (gameID, user) => (
  fetch(config.baseUri.http + "/" + gameID + "/join", {
    method: "POST",
    headers: headers(user),
  })
  .then((res) => Promise.all([res.status, res.json()]))
  .then(([code, body]) => {
    if (code === 201) {
      return body
    } else {
      throw (code, body)
    }
  })
)

export const roll = (gameID, user) => (
  fetch(config.baseUri.http + "/" + gameID + "/roll", {
    method: "POST",
    headers: headers(user),
  })
  .then((res) => Promise.all([res.status, res.json()]))
  .then(([code, body]) => {
    if (code === 200) {
      return body
    } else {
      throw (code, body)
    }
  })
)

export const lock = (gameID, user, diceIdx) => (
  fetch(config.baseUri.http + "/" + gameID + "/lock/" + diceIdx, {
    method: "POST",
    headers: headers(user),
  })
  .then((res) => Promise.all([res.status, res.json()]))
  .then(([code, body]) => {
    if (code === 200) {
      return body
    } else {
      throw (code, body)
    }
  })
)

export const score = (gameID, user, category) => (
  fetch(config.baseUri.http + "/" + gameID + "/score", {
    method: "POST",
    headers: headers(user),
    body: category,
  })
  .then((res) => Promise.all([res.status, res.json()]))
  .then(([code, body]) => {
    if (code === 200) {
      return body
    } else {
      throw (code, body)
    }
  })
)

export const suggestions = (user, dices) => (
  fetch(config.baseUri.http + "/score?dices=" + dices.map(d => d.Value).join(","), {
    method: "GET",
    headers: headers(user),
  })
  .then((res) => Promise.all([res.status, res.json()]))
  .then(([code, body]) => {
    if (code === 200) {
      return body
    } else {
      throw (code, body)
    }
  })
)
