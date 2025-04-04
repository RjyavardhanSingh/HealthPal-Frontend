import React from 'react';

const LoadingSpinner = ({ size = 'md', color = 'primary' }) => {
  let dimensions, borderWidth;
  
  switch (size) {
    case 'sm':
      dimensions = 'h-4 w-4';
      borderWidth = 'border-2';
      break;
    case 'lg':
      dimensions = 'h-10 w-10';
      borderWidth = 'border-4';
      break;
    case 'md':
    default:
      dimensions = 'h-6 w-6';
      borderWidth = 'border-3';
      break;
  }
  
  let borderColor;
  switch (color) {
    case 'white':
      borderColor = 'border-white';
      break;
    case 'gray':
      borderColor = 'border-gray-600';
      break;
    case 'primary':
    default:
      borderColor = 'border-primary-600';
      break;
  }
  
  return (
    <div className="flex justify-center items-center py-4">
      <div className={`animate-spin rounded-full ${dimensions} border-t-transparent ${borderWidth} ${borderColor}`}></div>
    </div>
  );
};

export default LoadingSpinner;