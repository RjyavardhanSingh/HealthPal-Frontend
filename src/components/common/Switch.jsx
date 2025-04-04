import React from 'react';

const Switch = ({ enabled, onChange, label }) => {
  return (
    <div className="flex items-center">
      <button
        type="button"
        onClick={onChange}
        className={`
          relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer 
          transition-colors ease-in-out duration-200 focus:outline-none
          ${enabled ? 'bg-primary-600' : 'bg-gray-200'}
        `}
        role="switch"
        aria-checked={enabled}
      >
        <span className="sr-only">{label}</span>
        <span
          className={`
            pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 
            transition ease-in-out duration-200
            ${enabled ? 'translate-x-5' : 'translate-x-0'}
          `}
        />
      </button>
      {label && (
        <span className="ml-2 text-sm text-gray-700">{label}</span>
      )}
    </div>
  );
};

export default Switch;