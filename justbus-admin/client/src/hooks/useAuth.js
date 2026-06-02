
import { useState, useEffect } from 'react';

export function useAuth() {
  const [token, setToken] = useState(localStorage.getItem('justbus_token'));

  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem('justbus_token'));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return { token, setToken };
}
