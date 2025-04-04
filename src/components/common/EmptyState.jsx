import React from 'react';
import { Link } from 'react-router-dom';

const EmptyState = ({ icon, title, description, buttonText, buttonLink }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
      <div className="flex justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-4">{description}</p>
      {buttonText && buttonLink && (
        <Link 
          to={buttonLink} 
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
        >
          {buttonText}
        </Link>
      )}
    </div>
  );
};

export default EmptyState;