import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

import challengesData from "@/data/challenges.json";

const STORAGE_KEY = "challenge_history";

interface ChallengeHistory {
  completedDates: string[];
  streak: number;
  totalCompleted: number;
}

function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getYesterdayKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function daysSinceEpoch(): number {
  return Math.floor(Date.now() / 86400000);
}

export function getTodayChallenge() {
  const index = daysSinceEpoch() % challengesData.challenges.length;
  return challengesData.challenges[index];
}

export function useDailyChallenge() {
  const [history, setHistory] = useState<ChallengeHistory>({
    completedDates: [],
    streak: 0,
    totalCompleted: 0,
  });
  const [loading, setLoading] = useState(true);

  const todayChallenge = getTodayChallenge();
  const todayKey = getTodayKey();
  const isCompletedToday = history.completedDates.includes(todayKey);

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: ChallengeHistory = JSON.parse(raw);
        // Recalculate streak based on dates
        const streak = calculateStreak(parsed.completedDates);
        setHistory({ ...parsed, streak });
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  function calculateStreak(completedDates: string[]): number {
    if (completedDates.length === 0) return 0;
    const sorted = [...completedDates].sort().reverse();
    const today = getTodayKey();
    const yesterday = getYesterdayKey();

    // Streak starts from today or yesterday
    if (sorted[0] !== today && sorted[0] !== yesterday) return 0;

    let streak = 0;
    const d = new Date();
    // If today is not completed yet, start counting from yesterday
    if (sorted[0] !== today) {
      d.setDate(d.getDate() - 1);
    }

    for (let i = 0; i < 365; i++) {
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      if (completedDates.includes(key)) {
        streak++;
        d.setDate(d.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  }

  const completeToday = useCallback(async () => {
    const key = getTodayKey();
    const newDates = history.completedDates.includes(key)
      ? history.completedDates
      : [...history.completedDates, key];
    const newHistory: ChallengeHistory = {
      completedDates: newDates,
      streak: calculateStreak(newDates),
      totalCompleted: newDates.length,
    };
    setHistory(newHistory);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
  }, [history]);

  const getWeekDates = useCallback(() => {
    const dates: { key: string; day: string; completed: boolean }[] = [];
    const d = new Date();
    // Start from 6 days ago
    d.setDate(d.getDate() - 6);
    const dayNames = ["日", "一", "二", "三", "四", "五", "六"];
    for (let i = 0; i < 7; i++) {
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      dates.push({
        key,
        day: dayNames[d.getDay()],
        completed: history.completedDates.includes(key),
      });
      d.setDate(d.getDate() + 1);
    }
    return dates;
  }, [history.completedDates]);

  return {
    todayChallenge,
    isCompletedToday,
    streak: history.streak,
    totalCompleted: history.totalCompleted,
    completedDates: history.completedDates,
    loading,
    completeToday,
    getWeekDates,
  };
}
