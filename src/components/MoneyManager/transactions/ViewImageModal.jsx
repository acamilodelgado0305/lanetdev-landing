import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

const NoteContentModal = ({ isOpen, onClose, noteContent }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleEscKey = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscKey);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Calcular las clases de tamaño dinámico en función del número de imágenes
  const modalWidth = noteContent.length <= 2 ? "max-w-md" : "max-w-3xl";
  const gridCols = noteContent.length === 1 ? "grid-cols-1" : "grid-cols-2 md:grid-cols-3";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        ref={modalRef}
        className={`relative bg-white rounded-lg shadow-lg w-full ${modalWidth} mx-4 overflow-hidden max-h-[90vh]`}
      >
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          <X size={24} />
        </button>
        <div className={`p-4 grid ${gridCols} gap-4 overflow-y-auto`}>
          {noteContent.map((url, index) => (
            <img
              key={index}
              src={url}
              alt={`Contenido de la Nota ${index + 1}`}
              className="w-full h-auto object-contain max-h-[40vh] rounded"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default NoteContentModal;
