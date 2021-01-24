import { useContext, useState } from "react"

import { Context as AppContext } from "./../App"
import { Button } from "./../Button"

import Modal from "./../Modal"

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
      <p>Please enter your name:</p>
      <input autoFocus type="text" value={input !== null ? input : ""} onChange={updateInput} onKeyDown={handleKeyPress} />
      <div className="buttons">
        <Button small text="Save"
          onClick={handleSave}
          disabled={input === null || input.trim() === ""} />
        <Button small secondary text="Cancel"
          onClick={handleCancel}
          disabled={name === null || name.trim() === ""} />
      </div>
    </Modal>)
}

export default NameChangeModal