'use client'

import React from 'react';
export function UserProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
export function useUser() {
  return { user: null, loading: false, updateUser: async () => {}, logout: async () => {} };
}

