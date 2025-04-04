import React, { useState } from 'react';

const AuthDebug = () => {
  const [expanded, setExpanded] = useState(false);
  const [authData, setAuthData] = useState({});
  
  const refreshDebugData = () => {
    const data = {
      authToken: localStorage.getItem('authToken')?.substring(0, 20) + '...',
      currentUser: JSON.parse(localStorage.getItem('currentUser') || 'null'),
      apiHeaders: document.cookie,
      timestamp: new Date().toISOString()
    };
    setAuthData(data);
  };
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button 
        onClick={() => {
          setExpanded(!expanded);
          if (!expanded) refreshDebugData();
        }}
        className="bg-gray-800 text-white p-2 rounded-full shadow-lg"
      >
        {expanded ? '✕' : '🔧'}
      </button>
      
      {expanded && (
        <div className="bg-white p-4 rounded shadow-lg mt-2 border border-gray-300 max-w-md">
          <h3 className="font-bold mb-2">Auth Debug</h3>
          <div className="text-xs overflow-auto max-h-48">
            <pre>{JSON.stringify(authData, null, 2)}</pre>
          </div>
          <div className="mt-2 space-x-2">
            <button 
              onClick={refreshDebugData}
              className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
            >
              Refresh
            </button>
            <button 
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="bg-red-500 text-white px-2 py-1 rounded text-xs"
            >
              Clear & Reload
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthDebug;