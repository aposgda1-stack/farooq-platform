'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'farooq_student';

export function useStudent() {
  const [student, setStudent] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setStudent(JSON.parse(saved));
      }
    } catch (e) {}
    setIsLoaded(true);
  }, []);

  const saveStudent = useCallback((name) => {
    const trimmed = name?.trim();
    if (!trimmed) return;
    // Build a stable anonymous ID from name + timestamp (first time only)
    const existing = (() => {
      try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch { return null; }
    })();
    const id = existing?.id || `student_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const data = { id, name: trimmed };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setStudent(data);
    return data;
  }, []);

  const clearStudent = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setStudent(null);
  }, []);

  return { student, isLoaded, saveStudent, clearStudent };
}
