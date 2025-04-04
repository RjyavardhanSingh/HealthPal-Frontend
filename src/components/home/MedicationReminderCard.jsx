import React from "react";
import { formatTime } from "../../utils/formatters";

const MedicationReminderCard = ({ reminder }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 flex items-center">
      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-blue-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>

      <div className="flex-grow">
        <h3 className="font-medium text-gray-900">{reminder.medicineName}</h3>
        <p className="text-sm text-gray-500">
          {reminder.dosage} • {reminder.frequency}
        </p>
        <div className="flex items-center mt-1 text-xs text-gray-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3 w-3 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Next dose: {formatTime(reminder.nextDoseTime)}
        </div>
      </div>

      <button className="ml-2 p-2 rounded-full hover:bg-gray-100">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
          />
        </svg>
      </button>
    </div>
  );
};

export default MedicationReminderCard;