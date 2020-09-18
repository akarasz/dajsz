const baseUrl = "http://yahtzee.akarasz.me"

const headers = (user) => (
  new Headers({
    "Authorization": "Basic " + btoa(user + ":"),
  })
)

export const create = (user) => (
  fetch(baseUrl, {
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
  fetch(baseUrl + "/" + gameID, {
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
  fetch(baseUrl + "/" + gameID + "/join", {
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
  fetch(baseUrl + "/" + gameID + "/roll", {
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
  fetch(baseUrl + "/" + gameID + "/lock/" + diceIdx, {
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
  fetch(baseUrl + "/" + gameID + "/score", {
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
  fetch(baseUrl + "/score?dices=" + dices.map(d => d.Value).join(","), {
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
