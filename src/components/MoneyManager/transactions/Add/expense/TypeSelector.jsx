// TypeSelector.jsx
import React from 'react';
import { CreditCardOutlined, ShoppingOutlined } from '@ant-design/icons';

const TypeSelector = ({ selectedType, onTypeChange }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <button
        onClick={() => onTypeChange("gasto")}
        className={`p-2 rounded-lg border-2 transition-all ${
          selectedType === "gasto"
            ? "border-red-500 bg-red-50"
            : "border-gray-200 hover:border-red-300"
        }`}
      >
        <CreditCardOutlined className="text-3xl text-red-500 mb-2" />
        <div className="text-lg font-semibold">Gasto</div>
      </button>
      <button
        onClick={() => onTypeChange("compra")}
        className={`p-2 rounded-lg border-2 transition-all ${
          selectedType === "compra"
            ? "border-red-500 bg-red-50"
            : "border-gray-200 hover:border-red-300"
        }`}
      >
        <ShoppingOutlined className="text-3xl text-red-500 mb-2" />
        <div className="text-lg font-semibold">Compra</div>
      </button>
    </div>
  );
};

export default TypeSelector;