import React from "react";

const NoteContentModal = ({ isOpen, onClose, noteContent }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4">Comprobante</h2>
        
        {/* Reemplaza el texto con una imagen */}
        <img src={noteContent} alt="Contenido de la Nota" className="mb-4 max-w-full h-auto" />
        
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-lg"
          onClick={onClose}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default NoteContentModal;
