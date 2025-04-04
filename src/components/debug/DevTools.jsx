import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const DevTools = () => {
  const { clearAuthState } = useAuth();
  const [visible, setVisible] = useState(false);
  
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button 
        className="bg-black text-white p-2 rounded opacity-50 hover:opacity-100"
        onClick={() => setVisible(!visible)}
      >
        🛠️
      </button>
      
      {visible && (
        <div className="absolute bottom-12 right-0 bg-gray-900 p-4 rounded shadow-lg text-white">
          <h4 className="font-bold mb-2">Developer Tools</h4>
          <button 
            className="bg-red-600 text-white px-2 py-1 rounded"
            onClick={() => {
              clearAuthState();
              window.location.href = '/login';
            }}
          >
            Force Logout
          </button>
          
          <div className="mt-2">
            <p>Auth info:</p>
            <pre className="text-xs">
              {JSON.stringify(JSON.parse(localStorage.getItem('currentUser') || '{}'), null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default DevTools;