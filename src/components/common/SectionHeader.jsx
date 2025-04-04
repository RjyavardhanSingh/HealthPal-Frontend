import React from 'react';
import { Link } from 'react-router-dom';

const SectionHeader = ({ title, linkUrl, linkText = 'See All' }) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-bold text-gray-800">{title}</h2>
      {linkUrl && (
        <Link to={linkUrl} className="text-sm text-primary-600 font-medium">
          {linkText}
        </Link>
      )}
    </div>
  );
};

export default SectionHeader;