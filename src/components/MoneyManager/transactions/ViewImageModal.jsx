import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

const VoucherContentModal = ({ isOpen, onClose, voucherContent }) => {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div ref={modalRef} className="relative bg-white rounded-lg shadow-lg w-full max-w-3xl mx-4 overflow-hidden">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          <X size={24} />
        </button>
        <div className="p-4">
          <img
            src={voucherContent}
            alt="Contenido de la Nota"
            className="w-full h-auto object-contain max-h-[80vh]"
          />
        </div>
      </div>
    </div>
  );
};

export default VoucherContentModal;