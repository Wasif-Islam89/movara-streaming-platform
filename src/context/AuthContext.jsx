import { createContext, useContext, useState, useEffect } from 'react';
import { 
  getStoredAuthUser, 
  setStoredAuthUser, 
  removeStoredAuthUser 
} from '../utils/localStorage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Load initial user state from centralized storage
  const [user, setUser] = useState(() => getStoredAuthUser());

  const isAuthenticated = Boolean(user);

  // Sync user state changes to localStorage
  useEffect(() => {
    if (user) {
      setStoredAuthUser(user);
    } else {
      removeStoredAuthUser();
    }
  }, [user]);

  function login({ email, name }) {
    const newUser = {
      email: email || 'wasif@example.com',
      name: name || (email ? email.split('@')[0] : 'Wasif'),
      token: `movora-token-${Date.now()}`,
      loggedInAt: new Date().toISOString(),
      plan: 'Premium 4K Ultra HD',
    };
    setUser(newUser);
    return newUser;
  }

  function signup({ email, name, password }) {
    const newUser = {
      email: email || 'wasif@example.com',
      name: name || (email ? email.split('@')[0] : 'Wasif'),
      token: `movora-token-${Date.now()}`,
      loggedInAt: new Date().toISOString(),
      plan: 'Premium 4K Ultra HD (Free Trial)',
    };
    setUser(newUser);
    return newUser;
  }

  function logout() {
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
