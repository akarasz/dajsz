const baseUrl = window.baseUrl || "api.dajsz.hu"

const config = {
  tracking: window.tracking || "",
  baseUri: {
    http: "https://" + baseUrl,
    ws: "wss://" + baseUrl
  }
}

export default config
