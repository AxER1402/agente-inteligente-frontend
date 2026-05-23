import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface UserContextType {
  currentUser: string;
  login: (username: string, password?: string) => boolean;
  logout: () => void;
  registerUser: (username: string, password?: string) => void;
  hasPassword: (username: string) => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<string>('Invitado');

  useEffect(() => {
    const savedUser = localStorage.getItem('signai_active_user');
    if (savedUser) {
      setCurrentUser(savedUser);
    } else {
      // Si no hay usuario guardado, migramos el progreso antiguo a "Invitado"
      const oldMastered = localStorage.getItem('signai_mastered_letters');
      const oldStreak = localStorage.getItem('signai_streak');
      const oldLastStreakDate = localStorage.getItem('signai_last_streak_date');

      if (oldMastered) localStorage.setItem('signai_mastered_letters_Invitado', oldMastered);
      if (oldStreak) localStorage.setItem('signai_streak_Invitado', oldStreak);
      if (oldLastStreakDate) localStorage.setItem('signai_last_streak_date_Invitado', oldLastStreakDate);

      // Limpiar los viejos para evitar remigraciones
      localStorage.removeItem('signai_mastered_letters');
      localStorage.removeItem('signai_streak');
      localStorage.removeItem('signai_last_streak_date');

      localStorage.setItem('signai_active_user', 'Invitado');

      // Asegurarse de que "Invitado" esté en la lista de usuarios
      const recentUsersStr = localStorage.getItem('signai_recent_users');
      const recentUsers: string[] = recentUsersStr ? JSON.parse(recentUsersStr) : [];
      if (!recentUsers.includes('Invitado')) {
        recentUsers.unshift('Invitado');
        localStorage.setItem('signai_recent_users', JSON.stringify(recentUsers));
      }
    }
  }, []);

  const getPasswords = (): Record<string, string> => {
    const str = localStorage.getItem('signai_user_passwords');
    return str ? JSON.parse(str) : {};
  };

  const hasPassword = (username: string): boolean => {
    const passwords = getPasswords();
    return !!passwords[username];
  };

  // Devuelve true si el login fue exitoso, false si la contraseña es incorrecta
  const login = (username: string, password?: string): boolean => {
    const trimmed = username.trim();
    if (!trimmed) return false;

    const passwords = getPasswords();
    if (passwords[trimmed] && passwords[trimmed] !== password) {
      return false; // Contraseña incorrecta
    }

    setCurrentUser(trimmed);
    localStorage.setItem('signai_active_user', trimmed);
    return true;
  };

  const registerUser = (username: string, password?: string) => {
    const trimmed = username.trim();
    if (!trimmed) return;

    // Guardar en la lista de usuarios recientes
    const recentUsersStr = localStorage.getItem('signai_recent_users');
    const recentUsers: string[] = recentUsersStr ? JSON.parse(recentUsersStr) : ['Invitado'];
    if (!recentUsers.includes(trimmed)) {
      recentUsers.push(trimmed);
      localStorage.setItem('signai_recent_users', JSON.stringify(recentUsers));
    }

    // Guardar contraseña si se proporcionó
    if (password && password.trim()) {
      const passwords = getPasswords();
      passwords[trimmed] = password.trim();
      localStorage.setItem('signai_user_passwords', JSON.stringify(passwords));
    }

    setCurrentUser(trimmed);
    localStorage.setItem('signai_active_user', trimmed);
  };

  const logout = () => {
    setCurrentUser('Invitado');
    localStorage.setItem('signai_active_user', 'Invitado');
  };

  return (
    <UserContext.Provider value={{ currentUser, login, logout, registerUser, hasPassword }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
