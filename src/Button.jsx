import "./Button.css"
import "./Clickable.css"

export const Button = ({ onClick, disabled, children }) => (
  <button className="Clickable" onClick={onClick} disabled={disabled}>
    {children}
  </button>)