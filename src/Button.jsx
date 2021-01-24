import "./Button.css"
import "./Clickable.css"

export const Button = ({ text, onClick, small, secondary, disabled }) => (
  <button
    className={`Clickable${small ? " Small" : ""}${secondary ? " Secondary" : ""}`}
    onClick={onClick}
    disabled={disabled}>
    {text}
  </button>)