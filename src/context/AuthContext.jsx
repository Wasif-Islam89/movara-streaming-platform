import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getStoredAuthUser,
  setStoredAuthUser,
  removeStoredAuthUser,
  getStoredRegisteredAccounts,
  saveRegisteredAccount,
  migrateProfileDataToSingleAccount,
} from '../utils/localStorage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    migrateProfileDataToSingleAccount();
    return getStoredAuthUser();
  });
  const [isSigningOut, setIsSigningOut] = useState(false);

  const isAuthenticated = Boolean(user);

  // Sync user state changes to localStorage
  useEffect(() => {
    if (user) {
      setStoredAuthUser(user);
    } else {
      removeStoredAuthUser();
    }
  }, [user]);

  const clearSigningOut = useCallback(() => {
    setIsSigningOut(false);
  }, []);

  function login({ email, name, password }) {
    const cleanEmail = (email || '').trim();
    const accounts = getStoredRegisteredAccounts();
    const matched = accounts.find(
      (a) => a.email?.toLowerCase() === cleanEmail.toLowerCase()
    );

    if (matched && matched.password && password && matched.password !== password) {
      return { ok: false, error: 'Incorrect password for this account.' };
    }

    const newUser = {
      id: matched?.id || `user-${cleanEmail.toLowerCase()}`,
      email: cleanEmail,
      name: name?.trim() || matched?.name || cleanEmail.split('@')[0] || 'Member',
      token: `movora-token-${Date.now()}`,
      loggedInAt: new Date().toISOString(),
      plan: matched?.plan || 'Premium 4K Ultra HD',
    };
    setIsSigningOut(false);
    setStoredAuthUser(newUser);
    setUser(newUser);
    return { ok: true, user: newUser };
  }

  function signup({ email, name, password }) {
    const cleanEmail = (email || '').trim();
    const cleanName = name?.trim() || cleanEmail.split('@')[0] || 'Member';
    const userId = `user-${Date.now()}`;
    const plan = 'Premium 4K Ultra HD (Free Trial)';

    saveRegisteredAccount({
      id: userId,
      email: cleanEmail,
      name: cleanName,
      password: password || '',
      plan,
    });

    const newUser = {
      id: userId,
      email: cleanEmail,
      name: cleanName,
      token: `movora-token-${Date.now()}`,
      loggedInAt: new Date().toISOString(),
      plan,
    };
    setIsSigningOut(false);
    setStoredAuthUser(newUser);
    setUser(newUser);
    return { ok: true, user: newUser };
  }

  function updateAccount({ name }) {
    const trimmed = typeof name === 'string' ? name.trim() : '';
    if (!trimmed) {
      return { ok: false, error: 'Display name cannot be empty.' };
    }
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, name: trimmed };
      const accounts = getStoredRegisteredAccounts();
      const existing = accounts.find(
        (a) => a.email?.toLowerCase() === prev.email?.toLowerCase()
      );
      if (existing) {
        saveRegisteredAccount({ ...existing, name: trimmed });
      }
      return updated;
    });
    return { ok: true };
  }

  function logout() {
    setIsSigningOut(true);
    removeStoredAuthUser();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isSigningOut,
        clearSigningOut,
        login,
        signup,
        updateAccount,
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
