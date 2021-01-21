import "./Modal.css"

const Modal = ({ showing, handleClose, children }) => {
  if (!showing) {
    return null
  }

  return (
    <div className="modal" onClick={handleClose}>
      <div onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
   </div>)
}

export default Modal