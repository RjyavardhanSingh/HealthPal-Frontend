import React from 'react';
import { Link } from 'react-router-dom';

const DashboardSection = ({ title, children, seeAllLink = null, className = '' }) => {
  return (
    <section className={`mb-8 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        {seeAllLink && (
          <Link to={seeAllLink.to} className="text-sm text-primary-600 font-medium">
            {seeAllLink.text || 'See All'}
          </Link>
        )}
      </div>
      {children}
    </section>
  );
};

export default DashboardSection;