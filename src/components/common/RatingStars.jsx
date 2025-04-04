import React from 'react';
import { FaStar } from 'react-icons/fa';

const RatingStars = ({ rating }) => {
  const stars = Array(5).fill(0);

  return (
    <div>
      {stars.map((_, index) => (
        <FaStar
          key={index}
          color={index < rating ? '#ffc107' : '#e4e5e9'}
          size={20}
        />
      ))}
    </div>
  );
};

export default RatingStars;