import "./Modal.css"

const Modal = ({ showing, handleClose, children }) => {
  if (!showing) {
    return null
  }

  return (
    <div className="Modal" onClick={handleClose}>
      <div onClick={(e) => e.stopPropagation()}>
        <div  className="Dialog">
          {children}
        </div>
      </div>
   </div>)
}

export default Modal