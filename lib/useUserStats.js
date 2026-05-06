'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';

const DEFAULT_STATS = {
  totalPoints: 0,
  questionsSolved: 0,
  streak: 0,
  lastPlayedDate: null,
  badges: [],
  chapterProgress: {},
  wrongAnswers: [],
  recentActivity: [],
  solvedQuestions: [],
  finalExamDone: false,
  notifications: []
};

import { BADGES } from './badges';

export { BADGES };

export function useUserStats() {
  const { user: clerkUser } = useUser();
  const { getToken } = useAuth();
  const [customUser, setCustomUser] = useState(null);
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [isLoaded, setIsLoaded] = useState(false);
  const syncTimerRef = useRef(null);
  const statsRef = useRef(DEFAULT_STATS);

  // Determine active user (Clerk takes precedence, then Custom)
  const activeUser = clerkUser ? {
    id: clerkUser.id,
    email: clerkUser.primaryEmailAddress?.emailAddress,
    name: clerkUser.fullName || clerkUser.username || 'Student',
    source: 'clerk'
  } : customUser ? {
    id: customUser.id,
    email: customUser.email,
    name: customUser.name || 'Student',
    source: 'custom'
  } : null;

  useEffect(() => {
    // Check for custom session
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data?.user) setCustomUser(data.user);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('farooq_stats');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setStats(parsed);
        statsRef.current = parsed;
      } catch (e) {
        console.error('Failed to parse stats');
      }
    }
    setIsLoaded(true);
  }, []);

  // Sync from cloud once on mount when user becomes available
  useEffect(() => {
    if (activeUser && isLoaded) {
      syncToCloud(statsRef.current);
    }
  }, [activeUser, isLoaded, syncToCloud]);

  const syncToCloud = useCallback(async (currentStats) => {
    if (!activeUser) return;

    try {
      const response = await fetch('/api/sync-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: activeUser.id,
          email: activeUser.email,
          name: activeUser.name,
          type: 'cloud_sync',
          fullStats: currentStats
        })
      });

      if (!response.ok) {
        throw new Error('Sync failed');
      }

      const data = await response.json();
      if (data.totalPoints !== undefined || data.finalExamDone !== undefined || data.notifications !== undefined) {
        const updatedStats = { 
          ...statsRef.current, 
          totalPoints: data.totalPoints ?? statsRef.current.totalPoints,
          finalExamDone: data.finalExamDone ?? statsRef.current.finalExamDone,
          notifications: data.notifications ?? statsRef.current.notifications
        };
        setStats(updatedStats);
        statsRef.current = updatedStats;
        localStorage.setItem('farooq_stats', JSON.stringify(updatedStats));
      }
    } catch (error) {
      console.error('Cloud sync error:', error);
    }
  }, [activeUser]);

  const saveStats = useCallback((newStats) => {
    if (newStats.solvedQuestions && newStats.solvedQuestions.length > 500) {
      newStats.solvedQuestions = newStats.solvedQuestions.slice(-500);
    }

    setStats(newStats);
    statsRef.current = newStats;
    localStorage.setItem('farooq_stats', JSON.stringify(newStats));

    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(() => {
      syncToCloud(newStats);
    }, 5000); // 5 second debounce for cloud sync
  }, [syncToCloud]);

  const addPoints = useCallback(async (points) => {
    // 1. Update local state for immediate feedback
    const current = statsRef.current;
    const newStats = { ...current, totalPoints: (current.totalPoints || 0) + points };
    setStats(newStats);
    statsRef.current = newStats;
    localStorage.setItem('farooq_stats', JSON.stringify(newStats));

    // 2. Sync to cloud specifically for points addition
    if (!activeUser) return;
    try {
      const response = await fetch('/api/sync-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: activeUser.id,
          email: activeUser.email,
          name: activeUser.name,
          type: 'quiz_completion',
          score: points // Using points as the increment value
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.totalPoints !== undefined) {
           const syncedStats = { 
             ...statsRef.current, 
             totalPoints: data.totalPoints, 
             finalExamDone: data.finalExamDone,
             notifications: data.notifications || statsRef.current.notifications
           };
           setStats(syncedStats);
           statsRef.current = syncedStats;
           localStorage.setItem('farooq_stats', JSON.stringify(syncedStats));
        }
      }
    } catch (err) {
      console.error('Failed to sync points:', err);
    }
  }, [activeUser]);

  const recordAnswer = useCallback((isCorrect, questionId, wrongData = null) => {
    const current = statsRef.current;
    let newStats = { ...current };

    const qId = questionId || 'unknown';
    const wasSolved = newStats.solvedQuestions?.includes(qId);

    if (isCorrect && !wasSolved) {
      newStats.questionsSolved = (newStats.questionsSolved || 0) + 1;
      newStats.solvedQuestions = [...(newStats.solvedQuestions || []), qId];

      if (!newStats.badges?.includes('starter')) {
        newStats.badges = [...(newStats.badges || []), 'starter'];
      }
    }

    if (!isCorrect && wrongData) {
      const updated = [...(newStats.wrongAnswers || []), wrongData];
      newStats.wrongAnswers = updated.slice(-200);
    }

    saveStats(newStats);
    return wasSolved;
  }, [saveStats]);

  const recordActivity = useCallback((activity) => {
    const current = statsRef.current;
    const newStats = { ...current };
    newStats.recentActivity = [activity, ...(newStats.recentActivity || [])].slice(0, 10);
    saveStats(newStats);
  }, [saveStats]);

  const awardBadge = useCallback((badgeId) => {
    const current = statsRef.current;
    if (!current.badges?.includes(badgeId)) {
      saveStats({ ...current, badges: [...(current.badges || []), badgeId] });
    }
  }, [saveStats]);

  const updateChapterProgress = useCallback((chapterId, totalQs, solvedCount) => {
    const current = statsRef.current;
    const newStats = { ...current };
    if (!newStats.chapterProgress) newStats.chapterProgress = {};

    const percentage = Math.round((solvedCount / totalQs) * 100);
    const existing = newStats.chapterProgress[chapterId] || 0;
    newStats.chapterProgress[chapterId] = Math.max(existing, percentage);
    saveStats(newStats);
  }, [saveStats]);

  return {
    activeUser,
    stats,
    isLoaded,
    saveStats,
    addPoints,
    recordAnswer,
    recordActivity,
    awardBadge,
    updateChapterProgress,
    syncNow: () => syncToCloud(statsRef.current)
  };
}
