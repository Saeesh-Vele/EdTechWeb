import { db, auth } from '../firebase/config';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

// ─── activityLogs (for Weekly Activity chart) ────────────────────────────────

export type ActivityType = 'video' | 'notes' | 'assessment';

/**
 * Save a duration-based activity log (drives the Weekly Activity bar chart).
 * Path: users/{uid}/activityLogs/{logId}
 * Ignores sessions shorter than 5 seconds.
 */
export async function saveActivity(
  type: ActivityType,
  durationInSeconds: number
): Promise<void> {
  if (durationInSeconds < 5) return;

  const currentUser = auth.currentUser;
  if (!currentUser) return;

  try {
    await addDoc(collection(db, 'users', currentUser.uid, 'activityLogs'), {
      type,
      duration: durationInSeconds,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.error('Failed to save activity log:', err);
  }
}

// ─── activities (for Recent Activity feed) ────────────────────────────────────

export type RecentActivityType =
  | 'quiz_completed'
  | 'course_enrolled'
  | 'video_watched'
  | 'notes_read'
  | 'assessment_started';

/**
 * Log a named user action to the Recent Activity feed.
 * Path: users/{uid}/activities/{activityId}
 *
 * Dedup guard: pass a dedupeKey (e.g. course name) to prevent logging the
 * same action twice in rapid succession.
 */
const recentLoggedKeys = new Set<string>();

export async function logActivity(
  type: RecentActivityType,
  title: string,
  dedupeKey?: string
): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser) return;

  // Prevent duplicate logs within the same session
  const key = dedupeKey ?? `${type}::${title}`;
  if (recentLoggedKeys.has(key)) return;
  recentLoggedKeys.add(key);

  // Remove dedup lock after 10 seconds so re-enrolling etc. works later
  setTimeout(() => recentLoggedKeys.delete(key), 10_000);

  try {
    await addDoc(collection(db, 'users', currentUser.uid, 'activities'), {
      type,
      title,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.error('Failed to log activity:', err);
  }
}

// ─── Time formatter ───────────────────────────────────────────────────────────

/**
 * Converts a Date to a human-readable relative time string.
 * e.g. "Just now", "5 mins ago", "2 hours ago", "Yesterday", "3 days ago"
 */
export function timeAgo(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime(); // ms

  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'Just now';

  const minutes = Math.floor(diff / 60_000);
  if (minutes < 60) return `${minutes} min${minutes === 1 ? '' : 's'} ago`;

  const hours = Math.floor(diff / 3_600_000);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;

  const days = Math.floor(diff / 86_400_000);
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}

// ─── Activity type metadata ───────────────────────────────────────────────────

export const ACTIVITY_META: Record<
  RecentActivityType,
  { icon: string; color: string }
> = {
  quiz_completed:    { icon: '✅', color: '#6ee7b7' },
  course_enrolled:   { icon: '📚', color: '#93c5fd' },
  video_watched:     { icon: '📺', color: '#c4b5fd' },
  notes_read:        { icon: '📖', color: '#fde68a' },
  assessment_started:{ icon: '📝', color: '#fca5a5' },
};
