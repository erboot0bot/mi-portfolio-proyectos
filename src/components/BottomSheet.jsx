import './BottomSheet.css'

export default function BottomSheet({ open, onClose, title, children }) {
  return (
    <>
      <div
        className={`bottom-sheet-overlay${open ? ' open' : ''}`}
        onClick={onClose}
      />
      <div className={`bottom-sheet${open ? ' open' : ''}`}>
        <div className="bottom-sheet-handle" />
        <div className="bottom-sheet-header">
          <span className="bottom-sheet-title">{title}</span>
          <button className="bottom-sheet-close" onClick={onClose}>×</button>
        </div>
        <div className="bottom-sheet-body">{children}</div>
      </div>
    </>
  )
}
