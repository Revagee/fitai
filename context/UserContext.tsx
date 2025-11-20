// context/UserContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// Типизация (оставляем как есть или упрощаем)
type UserType = {
  uid: string;
  displayName: string;
  email: string;
};

interface UserContextType {
  user: UserType | null;
  loading: boolean;
  userData: any; // Данные профиля (вес, рост и т.д.)
  setUserData: (data: any) => void;
}

const UserContext = createContext<UserContextType>({} as UserContextType);

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  // Жестко задаем пользователя "Admin"
  const [user] = useState<UserType>({
    uid: "local-user-1",
    displayName: "Admin",
    email: "admin@local.host",
  });
  
  const [userData, setUserDataState] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // При загрузке ищем сохраненные данные в браузере
  useEffect(() => {
    const localData = localStorage.getItem("fitai_user_data");
    if (localData) {
      setUserDataState(JSON.parse(localData));
    }
    setLoading(false);
  }, []);

  // Функция сохранения данных
  const setUserData = (data: any) => {
    setUserDataState(data);
    // Сохраняем в браузер
    localStorage.setItem("fitai_user_data", JSON.stringify(data));
  };

  return (
    <UserContext.Provider value={{ user, loading, userData, setUserData }}>
      {children}
    </UserContext.Provider>
  );
};

