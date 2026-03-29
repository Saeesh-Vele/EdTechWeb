/**
 * studyTrackingService.ts
 *
 * Single source of truth for study session persistence.
 *
 * Architecture:
 *   users/{uid}/studySessions/{id}   — individual session records
 *   users/{uid}/analytics/weekly     — pre-aggregated weekly totals
 *
 * The weekly document is incremented atomically via Firestore increment(),
 * so it never resets to zero unexpectedly and survives concurrent writes.
 */

import { db } from '../firebase/config';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  collection,
  serverTimestamp,
  increment,
  onSnapshot,
  runTransaction,
  type Timestamp,
  type Unsubscribe,
} from 'firebase/firestore';

// ─── Types ───────────────────────────────────────────────────────────────────

export type SessionType = 'video' | 'notes' | 'assessment';

export interface WeeklyAnalytics {
  Mon: number;
  Tue: number;
  Wed: number;
  Thu: number;
  Fri: number;
  Sat: number;
  Sun: number;
  totalMinutes: number;
  weekStart: string;  // ISO date of the Monday of this week (YYYY-MM-DD)
  lastUpdated: Timestamp | null;
}

// ─── Week helpers ─────────────────────────────────────────────────────────────

/** Returns the ISO date string (YYYY-MM-DD) of the Monday of the current week */
export function getCurrentWeekStart(): string {
  const now = new Date();
  const day = now.getDay(); // 0=Sun … 6=Sat
  const diffToMon = day === 0 ? -6 : 1 - day;
  const mon = new Date(now);
  mon.setDate(now.getDate() + diffToMon);
  mon.setHours(0, 0, 0, 0);
  return mon.toISOString().split('T')[0];
}

/** Returns the short day label for today: Mon | Tue | … | Sun */
export function getTodayKey(): keyof WeeklyAnalytics {
  const keys: (keyof WeeklyAnalytics)[] = [
    'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat',
  ];
  return keys[new Date().getDay()];
}

const EMPTY_WEEK_DATA = {
  Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0,
  totalMinutes: 0,
};

// ─── Service functions ────────────────────────────────────────────────────────

/**
 * Ensures the analytics/weekly document exists for the current user
 * and belongs to the current calendar week.
 * If the document is missing or stale (previous week), it is reset.
 *
 * Safe to call on every dashboard load — uses a Firestore transaction
 * so concurrent calls don't corrupt data.
 */
export async function ensureWeeklyAnalytics(userId: string): Promise<void> {
  const weeklyRef = doc(db, 'users', userId, 'analytics', 'weekly');
  const currentWeekStart = getCurrentWeekStart();

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(weeklyRef);

    if (!snap.exists()) {
      // First time ever — create fresh
      tx.set(weeklyRef, {
        ...EMPTY_WEEK_DATA,
        weekStart: currentWeekStart,
        lastUpdated: serverTimestamp(),
      });
      return;
    }

    const data = snap.data() as WeeklyAnalytics;

    if (data.weekStart !== currentWeekStart) {
      // New week — reset while preserving the document path
      tx.set(weeklyRef, {
        ...EMPTY_WEEK_DATA,
        weekStart: currentWeekStart,
        lastUpdated: serverTimestamp(),
      });
    }
    // Same week — nothing to do
  });
}

/**
 * Saves a completed study session to Firestore:
 *   1. Appends to studySessions subcollection (for history)
 *   2. Atomically increments analytics/weekly via Firestore increment()
 *
 * Uses a transaction on analytics/weekly to handle week rollovers safely.
 *
 * @param userId        Firebase Auth UID
 * @param type          Session type
 * @param courseId      Course / domain identifier
 * @param durationSecs  Session length in seconds (must be ≥ 10)
 */
export async function saveStudySession(
  userId: string,
  type: SessionType,
  courseId: string,
  durationSecs: number
): Promise<void> {
  if (durationSecs < 10) return; // ignore micro-sessions

  const durationMins = Math.max(1, Math.round(durationSecs / 60));
  const now = new Date();
  const startTime = new Date(now.getTime() - durationSecs * 1000);

  // 1. Record individual session (for detailed history)
  await addDoc(collection(db, 'users', userId, 'studySessions'), {
    type,
    courseId,
    startTime: startTime,
    endTime: now,
    duration: durationMins, // minutes, as per spec
    createdAt: serverTimestamp(),
  });

  // 2. Atomically update the pre-aggregated weekly document
  const weeklyRef = doc(db, 'users', userId, 'analytics', 'weekly');
  const currentWeekStart = getCurrentWeekStart();
  const dayKey = getTodayKey();

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(weeklyRef);

    if (!snap.exists() || (snap.data() as WeeklyAnalytics).weekStart !== currentWeekStart) {
      // Missing or stale — create with just this session's minutes
      const fresh: Record<string, any> = {
        ...EMPTY_WEEK_DATA,
        weekStart: currentWeekStart,
        lastUpdated: serverTimestamp(),
        totalMinutes: durationMins,
      };
      fresh[dayKey as string] = durationMins;
      tx.set(weeklyRef, fresh);
    } else {
      // Existing current-week doc — use increment() for atomicity
      tx.update(weeklyRef, {
        [dayKey as string]: increment(durationMins),
        totalMinutes: increment(durationMins),
        lastUpdated: serverTimestamp(),
      });
    }
  });
}

/**
 * Subscribes to real-time updates of the user's analytics/weekly document.
 * Calls the callback immediately with the current value, then on every change.
 *
 * Returns the Firestore unsubscribe function.
 */
export function subscribeWeeklyAnalytics(
  userId: string,
  onData: (data: WeeklyAnalytics) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const weeklyRef = doc(db, 'users', userId, 'analytics', 'weekly');
  const currentWeekStart = getCurrentWeekStart();

  return onSnapshot(
    weeklyRef,
    (snap) => {
      if (!snap.exists()) {
        // Doc hasn't been created yet — show zeros
        onData({ ...EMPTY_WEEK_DATA, weekStart: currentWeekStart, lastUpdated: null });
        return;
      }

      const data = snap.data() as WeeklyAnalytics;

      if (data.weekStart !== currentWeekStart) {
        // Stale week — show zeros until ensureWeeklyAnalytics resets it
        onData({ ...EMPTY_WEEK_DATA, weekStart: currentWeekStart, lastUpdated: null });
        // Trigger async reset
        ensureWeeklyAnalytics(userId).catch(console.error);
        return;
      }

      onData(data);
    },
    (err) => {
      console.error('[studyTrackingService] weekly analytics error:', err);
      onError?.(err);
    }
  );
}

/**
 * Formats totalMinutes into a human-readable string.
 * e.g.  45 → "45m"  |  75 → "1h 15m"  |  120 → "2h"
 */
export function formatStudyTime(totalMinutes: number): string {
  if (totalMinutes <= 0) return '0m';
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}
