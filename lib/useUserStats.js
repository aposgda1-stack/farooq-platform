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
  solvedQuestions: []
};

export const BADGES = {
  STARTER:      { id: 'starter',       name: 'بادئ',        icon: '🎓', desc: 'أول سؤال صح' },
  ON_FIRE:      { id: 'on_fire',       name: 'On Fire',      icon: '🔥', desc: 'streak 5 صح متتالي' },
  CHAPTER_MASTER:{ id: 'chapter_master',name: 'فصل مكتمل',  icon: '⭐', desc: 'خلصت فصل بالكامل' },
  EXCELLENT:    { id: 'excellent',     name: 'ممتاز',        icon: '🏆', desc: '90%+ في امتحان' },
  PERFECT:      { id: 'perfect',       name: 'مثالي',        icon: '🎯', desc: '100% في امتحان' },
  SPEED:        { id: 'speed',         name: 'سريع',         icon: '⚡', desc: 'Speed Mode 10/10' },
  REVIEWER:     { id: 'reviewer',      name: 'المراجع',      icon: '📚', desc: 'راجع 50 سؤال خطأ' },
  ADVENTURER:   { id: 'adventurer',    name: 'المغامر',      icon: '🎲', desc: 'عمل 5 امتحانات عشوائية' },
};

export function useUserStats() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [isLoaded, setIsLoaded] = useState(false);
  const syncTimerRef = useRef(null);
  const statsRef = useRef(DEFAULT_STATS);

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

  const syncToCloud = useCallback(async (currentStats) => {
    if (!user) return;

    try {
      const response = await fetch('/api/sync-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          email: user.primaryEmailAddress?.emailAddress,
          name: user.fullName || user.username || 'Student',
          type: 'cloud_sync',
          fullStats: currentStats
        })
      });

      if (!response.ok) {
        throw new Error('Sync failed');
      }
    } catch (error) {
      console.error('Cloud sync error:', error);
    }
  }, [user]);

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

  const addPoints = useCallback((points) => {
    const current = statsRef.current;
    const newStats = { ...current, totalPoints: (current.totalPoints || 0) + points };
    saveStats(newStats);
  }, [saveStats]);

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
