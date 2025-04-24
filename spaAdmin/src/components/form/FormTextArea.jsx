import React from 'react';

const FormTextArea = ({ label, name, value, onChange, required = false, placeholder, className = '' }) => {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <textarea
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                placeholder={placeholder}
                className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 ${className}`}
            />
        </div>
    );
};

export default FormTextArea;
