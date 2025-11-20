"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import Dashboard from '@/components/Dashboard';

export default function DashboardPage() {
  const { userData, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Если загрузка завершилась (!loading) И данных всё ещё нет (!userData)
    // Только тогда выкидываем на анкету
    if (!loading && !userData) {
      router.push('/onboarding');
    }
  }, [userData, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-gray-900">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  // Если данных нет (но редирект еще не сработал), не рендерим дашборд, чтобы не было ошибок
  if (!userData) {
    return null;
  }

  return <Dashboard />;
}
