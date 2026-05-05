'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useUser } from '@clerk/nextjs';

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

// FIX #19: Debounce localStorage writes too (not just cloud sync)
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function useUserStats() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [isLoaded, setIsLoaded] = useState(false);
  const syncTimerRef = useRef(null);
  const statsRef = useRef(DEFAULT_STATS); // FIX #2: Keep ref in sync for non-stale closures

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
      await fetch('/api/sync-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          email: user.primaryEmailAddress?.emailAddress,
          name: user.fullName,
          type: 'cloud_sync',
          fullStats: currentStats
        }),
      });
    } catch (err) {
      console.error('Cloud sync failed', err);
    }
  }, [user]);

  const saveStats = useCallback((newStats) => {
    // FIX #8: Cap solvedQuestions to last 500 to prevent unbounded growth
    if (newStats.solvedQuestions && newStats.solvedQuestions.length > 500) {
      newStats.solvedQuestions = newStats.solvedQuestions.slice(-500);
    }

    setStats(newStats);
    statsRef.current = newStats;

    // FIX #19: Write to localStorage immediately but debounce cloud sync only
    localStorage.setItem('farooq_stats', JSON.stringify(newStats));

    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(() => {
      syncToCloud(newStats);
    }, 2000);
  }, [syncToCloud]);

  const addPoints = useCallback((points) => {
    // FIX #7: addPoints now uses the ref to avoid stale state
    const current = statsRef.current;
    const newStats = { ...current, totalPoints: current.totalPoints + points };
    saveStats(newStats);
  }, [saveStats]);

  // FIX #7: recordAnswer no longer adds points internally — caller controls points
  const recordAnswer = useCallback((isCorrect, questionId, wrongData = null) => {
    const current = statsRef.current;
    let newStats = { ...current };

    const qId = questionId || 'unknown';
    const wasSolved = newStats.solvedQuestions?.includes(qId);

    if (isCorrect && !wasSolved) {
      newStats.questionsSolved += 1;
      newStats.solvedQuestions = [...(newStats.solvedQuestions || []), qId];

      if (!newStats.badges.includes('starter')) {
        newStats.badges = [...newStats.badges, 'starter'];
      }
    }

    if (!isCorrect && wrongData) {
      // FIX #8: Cap wrongAnswers too
      const updated = [...newStats.wrongAnswers, wrongData];
      newStats.wrongAnswers = updated.slice(-200);
    }

    saveStats(newStats);
    return wasSolved; // Return whether it was already solved (useful for caller)
  }, [saveStats]);

  const recordActivity = useCallback((activity) => {
    const current = statsRef.current;
    const newStats = { ...current };
    newStats.recentActivity = [activity, ...newStats.recentActivity].slice(0, 10);
    saveStats(newStats);
  }, [saveStats]);

  const awardBadge = useCallback((badgeId) => {
    const current = statsRef.current;
    if (!current.badges.includes(badgeId)) {
      saveStats({ ...current, badges: [...current.badges, badgeId] });
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
