const baseUrl = window.baseUrl || "yahtzee.akarasz.me"

const config = {
  tracking: window.tracking || "",
  baseUri: {
    http: "https://" + baseUrl,
    ws: "wss://" + baseUrl
  }
}

export default config
