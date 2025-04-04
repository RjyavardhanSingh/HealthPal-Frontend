import React from 'react';
import notificationService from '../../services/notificationService';
import { toast } from 'react-toastify';

const NotificationPrompt = ({ onPermissionChange }) => {
  const requestPermission = async () => {
    try {
      const granted = await notificationService.requestPermission();
      
      if (granted) {
        toast.success('Notifications enabled successfully!');
        notificationService.setupMessageListener();
      } else {
        toast.warning('You need to allow notifications for medication and appointment reminders.');
      }
      
      if (onPermissionChange) {
        onPermissionChange(granted);
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast.error('Could not enable notifications');
    }
  };
  
  return (
    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-blue-700">
            Enable notifications to receive medication reminders and appointment updates.
          </p>
          <div className="mt-2">
            <button
              onClick={requestPermission}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-1 px-3 rounded text-xs"
            >
              Enable Notifications
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPrompt;