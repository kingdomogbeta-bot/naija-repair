import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const UsersContext = createContext();

export const useUsers = () => useContext(UsersContext);

export const UsersProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getToken, user } = useAuth();

  const fetchUsers = async () => {
    if (!user || user.role !== 'admin') return;
    try {
      setLoading(true);
      const token = getToken();
      const response = await fetch('https://naija-repair-api.onrender.com/api/users/all', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (response.ok) {
        setUsers(data);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [user]);

  return (
    <UsersContext.Provider value={{ users, loading, refreshUsers: fetchUsers }}>
      {children}
    </UsersContext.Provider>
  );
};
