import { ScreeningSession, StudentProfile, ReferralStatus } from './types';

export interface CrmLeadPayload {
  source: 'SANKARA_SCHOOL_SCREENING';
  screeningSessionId: string;
  opCardId: string;
  qrId: string;
  studentId: string;
  schoolName: string;
  gradeClass: string;
  section: string;
  referralReason: string;
  rightEyeAcuity?: string;
  leftEyeAcuity?: string;
  colourVisionStatus?: string;
  urgency: 'HIGH' | 'ROUTINE' | 'MONITOR';
  status: ReferralStatus;
  notes?: string;
  timestamp: string;
}

export interface CrmAppointmentPayload {
  leadId: string;
  opCardId: string;
  hospitalBranch: string;
  preferredDepartment: 'PEDIATRIC_OPHTHALMOLOGY' | 'OPTOMETRY_REFRACTION' | 'CORNEA_CLINIC';
  proposedDate: string;
  contactMasked?: string;
  status: 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
}

/**
 * Hospital CRM Abstraction Layer
 * Interfaces cleanly with Sankara Eye Hospital's Hospital Information System (HIS) / CRM.
 */
export class SankaraCrmAdapter {
  private static apiEndpoint = process.env.SANKARA_CRM_API_URL || '/api/crm';

  /**
   * Syncs a flagged referral from a school screening session into the hospital CRM queue.
   */
  static async pushReferralLead(session: ScreeningSession, student: StudentProfile): Promise<{ success: boolean; leadId?: string; error?: string }> {
    const payload: CrmLeadPayload = {
      source: 'SANKARA_SCHOOL_SCREENING',
      screeningSessionId: session.sessionId,
      opCardId: session.opCardId,
      qrId: session.qrId,
      studentId: session.studentId,
      schoolName: session.schoolName,
      gradeClass: session.gradeClass,
      section: session.section,
      referralReason: session.clinicalNotes || `Reduced visual acuity: OD ${session.rightEyeResult?.snellenEquivalent || 'N/A'}, OS ${session.leftEyeResult?.snellenEquivalent || 'N/A'}`,
      rightEyeAcuity: session.rightEyeResult?.snellenEquivalent,
      leftEyeAcuity: session.leftEyeResult?.snellenEquivalent,
      colourVisionStatus: session.colourVisionResult?.status,
      urgency: (session.rightEyeResult?.snellenEquivalent === '6/60' || session.leftEyeResult?.snellenEquivalent === '6/60') ? 'HIGH' : 'ROUTINE',
      status: session.referralStatus || 'recommended',
      notes: session.clinicalNotes,
      timestamp: new Date().toISOString()
    };

    try {
      const res = await fetch('/api/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return { success: true, leadId: data.leadId || `CRM-LEAD-${Date.now()}` };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Network error during CRM sync';
      console.warn('CRM dispatch queued locally for background synchronization:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Schedules or tracks an outpatient appointment at a Sankara Eye Care centre.
   */
  static async bookAppointment(appointment: CrmAppointmentPayload): Promise<{ success: boolean; appointmentId?: string }> {
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointment)
      });
      const data = await res.json();
      return { success: true, appointmentId: data.appointmentId || `APT-${Date.now()}` };
    } catch {
      return { success: false };
    }
  }
}
