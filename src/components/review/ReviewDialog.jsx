import React, { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import StarRatingInput from './StarRatingInput';

const ReviewDialog = ({ doctorId, doctorName, onClose, appointmentId }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating < 1) {
      toast.error('Please select a rating');
      return;
    }
    
    try {
      setSubmitting(true);
      
      await api.doctors.addReview(doctorId, {
        rating,
        comment,
        appointmentId
      });
      
      toast.success('Thank you for your review!');
      onClose(true); // true indicates successful submission
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = () => {
    onClose(false); // false indicates skipped
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Rate Your Experience</h2>
        <p className="mb-6 text-gray-600">How was your appointment with Dr. {doctorName}?</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-center mb-4">
            <StarRatingInput 
              rating={rating} 
              onRatingChange={setRating} 
              size="lg"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Comments (optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows="3"
              placeholder="Share your experience..."
            ></textarea>
          </div>
          
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={handleSkip}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700"
            >
              Skip
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-primary-600 text-white rounded-md disabled:bg-primary-400"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewDialog;