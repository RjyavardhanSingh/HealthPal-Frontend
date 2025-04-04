import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../services/api';

export const useFetch = (endpoint, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { userToken } = useAuth();
  
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    const { signal } = controller;
    
    const fetchData = async () => {
      setLoading(true);
      
      try {
        const headers = {
          'Content-Type': 'application/json',
          ...(userToken && { Authorization: `Bearer ${userToken}` }),
          ...options.headers
        };
        
        const response = await fetch(`${API_URL}${endpoint}`, {
          ...options,
          headers,
          signal
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const responseData = await response.json();
        
        if (isMounted) {
          setData(responseData);
          setError(null);
        }
      } catch (err) {
        if (isMounted && err.name !== 'AbortError') {
          console.error(`Error fetching ${endpoint}:`, err);
          setError(err.message || 'An error occurred while fetching data');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    fetchData();
    
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [endpoint, userToken, JSON.stringify(options)]);
  
  return { data, loading, error };
};

export default useFetch;