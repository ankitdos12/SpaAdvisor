import React from 'react';

const FormInput = ({ label, name, value, onChange, type = 'text', required = false, placeholder, pattern, min, max, step, className = '' }) => {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                placeholder={placeholder}
                pattern={pattern}
                min={min}
                max={max}
                step={step}
                className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 ${className}`}
            />
        </div>
    );
};

export default FormInput;
