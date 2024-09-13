import React from "react";

const InputField = ({ label, id, value, onChange, placeholder = "", readOnly = false }) => (
    <div>
        <label htmlFor={id} className="block mb-1 text-sm font-medium text-gray-700">
            {label}
        </label>
        <input
            type="text"
            id={id}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full p-2 bg-gray-100 rounded border border-gray-300"
            readOnly={readOnly}
        />
    </div>
);

export default InputField;
