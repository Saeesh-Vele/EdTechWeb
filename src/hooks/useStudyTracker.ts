/**
 * useStudyTracker.ts
 *
 * React hook that tracks the duration of a study activity (video, notes,
 * or assessment) and persists it to Firebase when the session ends.
 *
 * Features:
 *  - Starts counting on mount, pauses on tab hide, resumes on tab show
 *  - Saves on unmount (page navigation) or after 5-min idle
 *  - Handles page refresh via sessionStorage (recovers pending session)
 *  - Minimum session length: 10 seconds (shorter sessions are discarded)
 *  - Writes to:
 *      ✅ users/{uid}/studySessions      (individual session record)
 *      ✅ users/{uid}/analytics/weekly   (pre-aggregated via increment())
 *      ✅ users/{uid}/activities         (Recent Activity feed)
 */

import { useEffect, useRef, useCallback } from 'react';
import { auth } from '../firebase/config';
import { saveStudySession, type SessionType } from '../services/studyTrackingService';
import { logActivity, type ActivityType } from '../utils/activityLogger';

// ─── Types ───────────────────────────────────────────────────────────────────

interface StudySessionConfig {
  type: ActivityType; // 'video' | 'notes' | 'assessment'
  skill?: string;     // specific skill/topic
  domain?: string;    // course / domain name — used as courseId
}

// sessionStorage key for crash/refresh recovery
const SESSION_STORAGE_KEY = 'smart_edu_pending_session';

interface PendingSession {
  startMs: number;
  type: SessionType;
  courseId: string;
  skill: string;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

const useStudyTracker = (config: StudySessionConfig) => {
  const startTimeRef    = useRef<number>(Date.now());
  const accumulatedRef  = useRef<number>(0);      // ms accumulated while tab was visible
  const hiddenAtRef     = useRef<number | null>(null);
  const savedRef        = useRef<boolean>(false);

  const courseId = config.domain || config.skill || 'general';
  const skill    = config.skill || '';

  // ── Core save function ───────────────────────────────────────────────────
  const saveSession = useCallback(async () => {
    if (savedRef.current) return;

    const currentUser = auth.currentUser;
    if (!currentUser) return;

    // Compute final duration
    let totalSecs = Math.floor(accumulatedRef.current / 1000);
    if (!hiddenAtRef.current) {
      // Tab is still visible — add time since last resume
      totalSecs += Math.floor((Date.now() - startTimeRef.current) / 1000);
    }

    if (totalSecs < 10) return; // discard micro-sessions

    savedRef.current = true;

    // Clear sessionStorage — session is being saved now
    sessionStorage.removeItem(SESSION_STORAGE_KEY);

    try {
      // 1. Persist to Firestore (studySessions + analytics/weekly)
      await saveStudySession(currentUser.uid, config.type, courseId, totalSecs);

      // 2. Log to Recent Activity feed
      const mins = Math.round(totalSecs / 60);
      const timeLabel = mins < 1 ? 'a few seconds' : `${mins} min${mins === 1 ? '' : 's'}`;
      const context = skill || courseId;

      if (config.type === 'video') {
        logActivity(
          'video_watched',
          context ? `Watched video: ${context}` : 'Watched a video',
          `video::${context}::${Math.floor(Date.now() / 60_000)}`
        );
      } else if (config.type === 'notes') {
        logActivity(
          'notes_read',
          context ? `Read notes: ${context}` : 'Read study notes',
          `notes::${context}::${Math.floor(Date.now() / 60_000)}`
        );
      } else if (config.type === 'assessment') {
        logActivity(
          'assessment_started',
          context
            ? `Studied for assessment: ${context} (${timeLabel})`
            : `Studied for assessment (${timeLabel})`,
          `assessment::${context}::${Math.floor(Date.now() / 60_000)}`
        );
      }
    } catch (err) {
      console.error('[useStudyTracker] Failed to save session:', err);
      savedRef.current = false; // allow retry
    }
  }, [config.type, courseId, skill]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Recover any session that was interrupted by a page refresh ───────────
  useEffect(() => {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (raw) {
      try {
        const pending: PendingSession = JSON.parse(raw);
        const elapsedSecs = Math.floor((Date.now() - pending.startMs) / 1000);
        const currentUser = auth.currentUser;

        if (elapsedSecs >= 10 && currentUser) {
          // Save the orphaned session in the background
          saveStudySession(currentUser.uid, pending.type, pending.courseId, elapsedSecs)
            .catch(console.error);
        }
      } catch {
        // Ignore malformed data
      }
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }, []); // run once on mount only

  // ── Main tracking effect ─────────────────────────────────────────────────
  useEffect(() => {
    // Reset per-session state
    startTimeRef.current   = Date.now();
    accumulatedRef.current = 0;
    hiddenAtRef.current    = null;
    savedRef.current       = false;

    // Persist current session start to sessionStorage for refresh recovery
    const pendingData: PendingSession = {
      startMs:  Date.now(),
      type:     config.type,
      courseId,
      skill,
    };
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(pendingData));

    const IDLE_TIMEOUT = 5 * 60 * 1000; // 5 minutes

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Pause — accumulate elapsed time
        const now = Date.now();
        accumulatedRef.current += now - startTimeRef.current;
        hiddenAtRef.current = now;
      } else {
        // Resume
        if (hiddenAtRef.current) {
          const hiddenFor = Date.now() - hiddenAtRef.current;

          if (hiddenFor >= IDLE_TIMEOUT) {
            // User was away too long — save this session and start fresh
            saveSession();
            savedRef.current   = false;
            accumulatedRef.current = 0;
          }
        }
        startTimeRef.current = Date.now();
        hiddenAtRef.current  = null;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      saveSession(); // save on navigate away / component unmount
    };
  }, [saveSession, config.type, courseId, skill]);

  // ── Manual end (e.g. quiz submit) ────────────────────────────────────────
  const endSession = useCallback(() => {
    saveSession();
  }, [saveSession]);

  return { endSession };
};

export default useStudyTracker;
