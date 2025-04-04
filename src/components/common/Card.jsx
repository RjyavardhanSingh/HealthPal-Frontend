import React from 'react';

const Card = ({ title, children, headerAction, footerAction, className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow overflow-hidden ${className}`}>
      {title && (
        <div className="px-4 py-5 sm:px-6 flex items-center justify-between">
          {typeof title === 'string' ? (
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          ) : (
            title
          )}
          {headerAction}
        </div>
      )}
      <div className={`${title ? 'border-t border-gray-200' : ''} px-4 py-5 sm:p-6`}>
        {children}
      </div>
      {footerAction && (
        <div className="border-t border-gray-200 px-4 py-4 sm:px-6">
          {footerAction}
        </div>
      )}
    </div>
  );
};

export default Card;