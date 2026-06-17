import React from 'react';

const Modal = ({ isOpen, onClose, children }) => (
  isOpen && (
    <div className='modal-overlay'>
      <div className='modal-content'>
        {children}
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  )
);

export default Modal;
