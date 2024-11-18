// src/hooks/useUserAuth.ts

import { useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { useUnit } from 'effector-react';
import { $userData, fetchUserDataFx, resetUserData } from '@/models/userModel';
import { auth } from '@/lib/firebase';
import { UserData } from '@/types/UserData';

const useUserData = () => {
  const userData = useUnit($userData); // Получаем данные из Effector store
  const [user, setUser] = useState<User | null>(null); // Локальное состояние пользователя
  const [loading, setLoading] = useState(true); // Флаг загрузки

  useEffect(() => {
    // Подписываемся на изменения состояния авторизации
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchUserDataFx(currentUser); // Загружаем данные пользователя из Firestore
      } else {
        resetUserData(); // Очищаем данные пользователя при выходе
      }
      setLoading(false); // Завершаем загрузку после получения данных
    });

    return () => unsubscribe(); // Отписываемся при размонтировании
  }, []);

  return { userData, loading, user };
};

export default useUserData;
