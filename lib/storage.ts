import { ScreeningSession, CalibrationData, ClinicalConfig, StudentProfile } from './types';
import { DEFAULT_CLINICAL_CONFIG } from './clinicalConfig';
import { DEMO_SCREENING_SESSIONS, DEMO_STUDENTS } from './mockData';

const SESSIONS_KEY = 'sankara_screening_sessions_v1';
const PENDING_SYNC_KEY = 'sankara_pending_sync_v1';
const CALIBRATION_KEY = 'sankara_device_calibration_v1';
const CLINICAL_CONFIG_KEY = 'sankara_clinical_config_v1';
const LANGUAGE_KEY = 'sankara_preferred_language_v1';

function isClient(): boolean {
  return typeof window !== 'undefined';
}

export function getSavedLanguage(): string {
  if (!isClient()) return 'en';
  return localStorage.getItem(LANGUAGE_KEY) || 'en';
}

export function savePreferredLanguage(lang: string) {
  if (!isClient()) return;
  localStorage.setItem(LANGUAGE_KEY, lang);
}

export function getDeviceCalibration(): CalibrationData | null {
  if (!isClient()) return null;
  try {
    const raw = localStorage.getItem(CALIBRATION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveDeviceCalibration(data: CalibrationData) {
  if (!isClient()) return;
  try {
    localStorage.setItem(CALIBRATION_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save calibration', err);
  }
}

export function getClinicalConfig(): ClinicalConfig {
  if (!isClient()) return DEFAULT_CLINICAL_CONFIG;
  try {
    const raw = localStorage.getItem(CLINICAL_CONFIG_KEY);
    if (!raw) return DEFAULT_CLINICAL_CONFIG;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_CLINICAL_CONFIG;
  }
}

export function saveClinicalConfig(config: ClinicalConfig) {
  if (!isClient()) return;
  try {
    localStorage.setItem(CLINICAL_CONFIG_KEY, JSON.stringify(config));
  } catch (err) {
    console.error('Failed to save clinical config', err);
  }
}

export function getAllScreeningSessions(): ScreeningSession[] {
  if (!isClient()) return DEMO_SCREENING_SESSIONS;
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (!raw) {
      // Seed with demo sessions if empty so tester immediately sees data in admin
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(DEMO_SCREENING_SESSIONS));
      return DEMO_SCREENING_SESSIONS;
    }
    return JSON.parse(raw);
  } catch {
    return DEMO_SCREENING_SESSIONS;
  }
}

export function saveScreeningSession(session: ScreeningSession): boolean {
  if (!isClient()) return false;
  try {
    const sessions = getAllScreeningSessions();
    const existingIndex = sessions.findIndex(s => s.sessionId === session.sessionId);
    if (existingIndex >= 0) {
      sessions[existingIndex] = session;
    } else {
      sessions.unshift(session);
    }
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));

    // Also track in pending sync queue if offline
    if (session.syncStatus === 'pending') {
      addToSyncQueue(session.sessionId);
    }

    return true;
  } catch (err) {
    console.error('Failed to save screening session locally', err);
    return false;
  }
}

export function updateReferralStatus(sessionId: string, newStatus: ScreeningSession['referralStatus'], notes?: string): boolean {
  if (!isClient()) return false;
  try {
    const sessions = getAllScreeningSessions();
    const session = sessions.find(s => s.sessionId === sessionId);
    if (session) {
      session.referralStatus = newStatus;
      if (notes) {
        session.clinicalNotes = (session.clinicalNotes ? session.clinicalNotes + '\n' : '') + notes;
      }
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function getPendingSyncCount(): number {
  if (!isClient()) return 0;
  try {
    const raw = localStorage.getItem(PENDING_SYNC_KEY);
    if (!raw) return 0;
    const queue: string[] = JSON.parse(raw);
    return queue.length;
  } catch {
    return 0;
  }
}

function addToSyncQueue(sessionId: string) {
  try {
    const raw = localStorage.getItem(PENDING_SYNC_KEY);
    const queue: string[] = raw ? JSON.parse(raw) : [];
    if (!queue.includes(sessionId)) {
      queue.push(sessionId);
      localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(queue));
    }
  } catch (err) {
    console.error('Failed to update sync queue', err);
  }
}

export async function syncPendingSessionsToServer(): Promise<{ success: number; failed: number }> {
  if (!isClient()) return { success: 0, failed: 0 };
  const raw = localStorage.getItem(PENDING_SYNC_KEY);
  if (!raw) return { success: 0, failed: 0 };
  const queue: string[] = JSON.parse(raw);
  if (queue.length === 0) return { success: 0, failed: 0 };

  const allSessions = getAllScreeningSessions();
  let successCount = 0;
  let failedCount = 0;
  const remainingQueue: string[] = [];

  for (const sessId of queue) {
    const session = allSessions.find(s => s.sessionId === sessId);
    if (!session) continue;

    try {
      // Send to server-side Next.js route /api/screenings
      const res = await fetch('/api/screenings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(session)
      });

      if (res.ok) {
        session.syncStatus = 'synced';
        successCount++;
      } else {
        remainingQueue.push(sessId);
        failedCount++;
      }
    } catch {
      remainingQueue.push(sessId);
      failedCount++;
    }
  }

  localStorage.setItem(SESSIONS_KEY, JSON.stringify(allSessions));
  localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(remainingQueue));

  return { success: successCount, failed: failedCount };
}

export function lookupStudentByQrOrId(identifier: string): StudentProfile {
  // Check if matches known demo student
  const found = DEMO_STUDENTS.find(
    s => s.qrId.toLowerCase() === identifier.toLowerCase() || 
         s.studentId.toLowerCase() === identifier.toLowerCase() ||
         s.opCardId.toLowerCase() === identifier.toLowerCase()
  );

  if (found) return found;

  // Otherwise generate an opaque safe student profile for this unique QR token
  // Opaque token - no personally identifiable information exposed
  const cleanId = identifier.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 16);
  return {
    studentId: `std-${cleanId}`,
    opCardId: `SEH-OP-2026-${cleanId.slice(0, 4).toUpperCase()}`,
    qrId: cleanId,
    schoolId: 'sch-sankara-01',
    schoolName: 'Sankara School Screening Center',
    gradeClass: 'Class 4',
    section: 'A',
  };
}

export function exportSessionsAsJson() {
  if (!isClient()) return;
  const sessions = getAllScreeningSessions();
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(sessions, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `sankara_screening_backup_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
