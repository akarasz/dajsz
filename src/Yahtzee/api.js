export const baseUri = "api.dajsz.akarasz.me"

const b64EncodeUnicode = (str) => {
  // first we use encodeURIComponent to get percent-encoded UTF-8,
  // then we convert the percent encodings into raw bytes which
  // can be fed into btoa.
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
    function toSolidBytes(match, p1) {
      return String.fromCharCode("0x" + p1)
  }))
}

const headers = (user) => (
  new Headers({
    "Authorization": "Basic " + b64EncodeUnicode(user + ":"),
  })
)

const doNothing = (data) => { return }

export const create = (user) => (
  fetch("https://" + baseUri, {
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

export const load = (gameID, user, onSuccess) => (
  fetch("https://" + baseUri + "/" + gameID, {
    headers: headers(user),
  })
  .then((res) => Promise.all([res.status, res.json()]))
  .then(([code, body]) => {
    if (code === 200) {
      (onSuccess || doNothing)(body)
    } else {
      throw (code, body)
    }
  })
)

export const join = (gameID, user, onSuccess) => (
  fetch("https://" + baseUri + "/" + gameID + "/join", {
    method: "POST",
    headers: headers(user),
  })
  .then((res) => Promise.all([res.status, res.json()]))
  .then(([code, body]) => {
    if (code === 201) {
      (onSuccess || doNothing)(body)
    } else {
      throw (code, body)
    }
  })
)

export const roll = (gameID, user, onSuccess) => (
  fetch("https://" + baseUri + "/" + gameID + "/roll", {
    method: "POST",
    headers: headers(user),
  })
  .then((res) => Promise.all([res.status, res.json()]))
  .then(([code, body]) => {
    if (code === 200) {
      (onSuccess || doNothing)(body)
    } else {
      throw (code, body)
    }
  })
)

export const lock = (gameID, user, diceIdx, onSuccess) => (
  fetch("https://" + baseUri + "/" + gameID + "/lock/" + diceIdx, {
    method: "POST",
    headers: headers(user),
  })
  .then((res) => Promise.all([res.status, res.json()]))
  .then(([code, body]) => {
    if (code === 200) {
      (onSuccess || doNothing)(body)
    } else {
      throw (code, body)
    }
  })
)

export const score = (gameID, user, category, onSuccess) => (
  fetch("https://" + baseUri + "/" + gameID + "/score", {
    method: "POST",
    headers: headers(user),
    body: category,
  })
  .then((res) => Promise.all([res.status, res.json()]))
  .then(([code, body]) => {
    if (code === 200) {
      (onSuccess || doNothing)(body)
    } else {
      throw (code, body)
    }
  })
)

export const suggestions = (user, dices, onSuccess) => (
  fetch("https://" + baseUri + "/score?dices=" + dices.map(d => d.Value).join(","), {
    method: "GET",
    headers: headers(user),
  })
  .then((res) => Promise.all([res.status, res.json()]))
  .then(([code, body]) => {
    if (code === 200) {
      (onSuccess || doNothing)(body)
    } else {
      throw (code, body)
    }
  })
)
