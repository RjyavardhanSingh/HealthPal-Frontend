import React from 'react';
import { Link } from 'react-router-dom';

const DoctorCard = ({ doctor }) => {
  return (
    <Link 
      to={`/doctors/${doctor._id}`}
      className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="p-2">
        <div className="mb-3 flex justify-center">
          {doctor.profileImage ? (
            <img 
              src={doctor.profileImage} 
              alt={doctor.name} 
              className="w-16 h-16 rounded-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://via.placeholder.com/150?text=Doctor";
              }}
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-xl font-medium text-gray-600">{doctor.name?.charAt(0) || 'D'}</span>
            </div>
          )}
        </div>
        <div className="text-center">
          <h3 className="font-medium text-gray-900 text-sm">{doctor.name || 'Unknown Doctor'}</h3>
          <p className="text-xs text-gray-500 mb-1">{doctor.specialization || 'Specialist'}</p>
          <div className="flex items-center justify-center text-xs text-yellow-500">
            <span>★</span>
            <span className="ml-1 text-gray-600">{doctor.rating || '4.5'}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default DoctorCard;