import "./Modal.css"

const Modal = ({ showing, setShowing, children }) => {
  if (!showing) {
    return null
  }

  return (
    <div className="modal" onClick={() => setShowing(false)}>
      <div onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
   </div>)
}

export default Modal