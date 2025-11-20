"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// Типизация пользователя
type UserType = {
  uid: string;
  displayName: string;
  email: string;
};

interface UserContextType {
  user: UserType | null;
  loading: boolean;
  userData: any; 
  setUserData: (data: any) => void;
}

const UserContext = createContext<UserContextType>({} as UserContextType);

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  // 1. ЖЕСТКО ЗАДАЕМ ПОЛЬЗОВАТЕЛЯ (Фейковый вход)
  const [user] = useState<UserType>({
    uid: "local-admin-user",
    displayName: "Admin",
    email: "admin@myself.com",
  });
  
  const [userData, setUserDataState] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 2. ПРИ ЗАГРУЗКЕ ЧИТАЕМ ИЗ БРАУЗЕРА (LocalStorage)
  useEffect(() => {
    // Проверяем, есть ли данные в браузере
    if (typeof window !== 'undefined') {
      const localData = localStorage.getItem("fitai_user_data");
      if (localData) {
        try {
          setUserDataState(JSON.parse(localData));
        } catch (e) {
          console.error("Error parsing local data", e);
        }
      }
    }
    setLoading(false);
  }, []);

  // 3. ФУНКЦИЯ СОХРАНЕНИЯ (Вместо базы данных)
  const setUserData = (data: any) => {
    setUserDataState(data);
    if (typeof window !== 'undefined') {
      localStorage.setItem("fitai_user_data", JSON.stringify(data));
    }
  };

  return (
    <UserContext.Provider value={{ user, loading, userData, setUserData }}>
      {children}
    </UserContext.Provider>
  );
};