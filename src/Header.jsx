import { useContext, useState, useEffect } from "react"
import { Link } from "react-router-dom"

import { Context as AppContext } from "./App"
import Modal from "./Modal"

const Header = () => {
  const [showModal, setShowModal] = useState(false)

  const { name } = useContext(AppContext)

  useEffect(() => {
    if (name === null || name === "") {
      setShowModal(true)
    }
  }, [name])

  return (
    <header>
      <div className="header-left">
        <Link to="/" className="title action item">
            <img src="/icon/dice-192.png" alt="logo" />
            <span>Dajsz</span>
        </Link>
      </div>
      <div className="header-right">
        <div className="name item" onClick={() => setShowModal(true)}>
          You play as <em className="action" title={name}>{name}</em>
        </div>
        <InviteButtonChooser />
      </div>

      <NameChangeModal show={showModal}
        handleClose={() => setShowModal(false)} />
    </header>)
}

const NameChangeModal = ({ show, handleClose }) => {
  const { name, changeName } = useContext(AppContext)

  const [input, setInput] = useState(name)

  const updateInput = (e) => {
    setInput(e.target.value)
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSave()
    } else if (e.key === "Escape") {
      handleCancel()
    }
  }

  const handleCancel = () => {
    setInput(name)

    if (name === null || name.trim() === "") {
      return
    }

    handleClose()
  }

  const handleSave = () => {
    if (input === null || input.trim() === "") {
      return
    }

    changeName(input.trim())
    handleClose()
  }

  return (
    <Modal showing={show} handleClose={handleCancel}>
      <div className="dialog">
        <p>Please enter your name:</p>
        <input autoFocus type="text" value={input !== null ? input : ""} onChange={updateInput} onKeyDown={handleKeyPress} />
        <div className="buttons">
          <button className="small"
            onClick={handleSave}
            disabled={input === null || input.trim() === ""}>Save</button>
          <button className="small secondary"
            onClick={handleCancel}
            disabled={name === null || name.trim() === ""}>Cancel</button>
        </div>
      </div>
    </Modal>)
}

const InviteButtonChooser = () => {
  if (navigator.share) {
    return <ShareButton />
  } else if (navigator.clipboard) {
    return <ClipboardButton />
  } else {
    return null
  }
}

const ShareButton = () => {
  const handleClick = () => {
    navigator.share({
      title: "Invited to Dajsz",
      text: "Click to join: ",
      url: window.location.href,
    })
      .then(() => console.log("shared"))
      .catch((error) => console.log("error sharing", error))
  }

  return (
    <div className="share action item" title="Share" onClick={handleClick}>
      <img src="/share.png" alt="share" />
    </div>)
}

const ClipboardButton = () => {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) {
      return
    }

    setTimeout(() => setCopied(false), 5000)
  }, [copied])

  const handleClick = () => {
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => setCopied(true))
  }

  const image = "/clipboard" + (copied ? "-copied" : "") + ".png"

  return (
    <div className="share action item" title="Share" onClick={handleClick}>
      <img src={image} alt="share" />
    </div>)
}

export default Header