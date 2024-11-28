// TypeSelector.jsx
import React from "react";
import { CreditCardOutlined, ShoppingOutlined } from "@ant-design/icons";

const TypeSelector = ({ selectedType, onTypeChange, selectedSubType, onSubTypeChange }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Botón de Gasto */}
      <button
        onClick={() => onTypeChange("gasto")}
        className={`p-2 rounded-lg border-2 transition-all ${selectedType === "gasto"
            ? "border-red-500 bg-red-50"
            : "border-gray-200 hover:border-red-300"
          }`}
      >
        <CreditCardOutlined className="text-3xl text-red-500 mb-2" />
        <div className="text-lg font-semibold">Gasto</div>
      </button>

      {/* Botón de Compra */}
      <button
        onClick={() => onTypeChange("compra")}
        className={`p-2 rounded-lg border-2 transition-all ${selectedType === "compra"
            ? "border-red-500 bg-red-50"
            : "border-gray-200 hover:border-red-300"
          }`}
      >
        <ShoppingOutlined className="text-3xl text-red-500 mb-2" />
        <div className="text-lg font-semibold">Compra</div>
      </button>


      <div className="col-span-2 mt-4">
        <label htmlFor="subType" className="block text-sm font-medium text-gray-700">
          Selecciona el tipo de egreso
        </label>
        <select
          id="subType"
          value={selectedSubType}
          onChange={(e) => onSubTypeChange(e.target.value)}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
        >
          <option value="">Seleccione una opción</option>
          <option value="legal">Egreso Legal</option>
          <option value="diverso">Egreso Diverso</option>
        </select>
      </div>

    </div>
  );
};

export default TypeSelector;
