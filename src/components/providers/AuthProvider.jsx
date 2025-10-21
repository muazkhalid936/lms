"use client";
import { useEffect } from 'react';
import useAuthStore from '@/store/authStore';

export default function AuthProvider({ children }) {
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    // Initialize auth state when the app starts
    initializeAuth();
  }, [initializeAuth]);

  return children;
}