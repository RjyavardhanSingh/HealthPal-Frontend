import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ReviewDialog from '../components/review/ReviewDialog';
import { toast } from 'react-toastify';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewData, setReviewData] = useState(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await api.notifications.getAll();
        setNotifications(response.data.data || []);
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError('Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // Handle notification click
  const handleNotificationClick = async (notification) => {
    try {
      console.log('Handling notification click:', notification);
      
      // Mark notification as read
      await api.notifications.markAsRead(notification._id);
      
      // Update notification in local state
      setNotifications(notifications.map(n => 
        n._id === notification._id ? { ...n, read: true } : n
      ));
      
      // Handle different notification types
      if (notification.data?.type === 'appointment') {
        navigate(`/appointments/${notification.data.appointmentId}`);
      } else if (notification.data?.type === 'review_request') {
        // Show review dialog
        const doctorName = notification.title.includes('- Review Your Doctor') 
          ? notification.title.split('- Review Your Doctor')[1].trim()
          : 'your doctor';
          
        console.log('Opening review dialog for doctor:', doctorName);
        
        setReviewData({
          doctorId: notification.data.doctorId,
          appointmentId: notification.data.appointmentId,
          doctorName: doctorName
        });
      } else if (notification.data?.type === 'prescription') {
        navigate(`/prescriptions/${notification.data.prescriptionId}`);
      } else if (notification.data?.type === 'medical_record') {
        navigate(`/medical-records/${notification.data.recordId}`);
      }
    } catch (err) {
      console.error('Error handling notification:', err);
      toast.error('Failed to process notification');
    }
  };

  // Format notification date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  // Handle review dialog close
  const handleReviewClose = () => {
    setReviewData(null);
  };

  if (loading) {
    return <div className="flex justify-center p-8"><LoadingSpinner /></div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Notifications</h1>
      
      {error && <div className="bg-red-50 p-4 mb-4 text-red-700 rounded">{error}</div>}
      
      {notifications.length === 0 ? (
        <div className="bg-gray-50 p-8 text-center rounded-lg">
          <p className="text-gray-500">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map(notification => (
            <div
              key={notification._id}
              className={`p-4 rounded-lg shadow-sm cursor-pointer transition-colors ${
                notification.read ? 'bg-gray-50' : 'bg-white border-l-4 border-primary-500'
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex justify-between items-start">
                <h3 className={`font-medium ${!notification.read && 'text-primary-700'}`}>
                  {notification.title}
                </h3>
                <span className="text-xs text-gray-500">{formatDate(notification.createdAt)}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
            </div>
          ))}
        </div>
      )}
      
      {reviewData && (
        <ReviewDialog
          doctorId={reviewData.doctorId}
          doctorName={reviewData.doctorName}
          appointmentId={reviewData.appointmentId}
          onClose={handleReviewClose}
        />
      )}
    </div>
  );
};

export default Notifications;