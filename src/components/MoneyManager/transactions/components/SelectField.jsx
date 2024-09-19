import React from "react";

const SelectField = ({ label, id, value, onChange, options, disabled = false }) => (
    <div>
        <label htmlFor={id} className="block mb-1 text-sm font-medium text-gray-700">
            {label}
        </label>
        <select
            id={id}
            value={value}
            onChange={onChange}
            className="w-full p-2 bg-gray-100 rounded border border-gray-300"
            disabled={disabled}
        >
            <option value="">Selecciona una opción</option>
            {options.map((opt) => (
                <option
                    key={opt.id || opt.value}
                    value={opt.id || opt.value}
                >
                    {opt.name || opt.label}
                </option>
            ))}
        </select>
    </div>
);

export default SelectField;