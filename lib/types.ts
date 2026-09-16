export type OptotypeOrientation = 'up' | 'down' | 'left' | 'right';

export type EyeTested = 'right' | 'left' | 'binocular';

export type ScreeningOverallStatus = 'normal' | 'recheck' | 'referral';

export type ReferralStatus = 
  | 'recommended' 
  | 'parent_informed' 
  | 'appointment_booked' 
  | 'exam_completed' 
  | 'treatment_advised' 
  | 'closed';

export type UserRole = 
  | 'super_admin' 
  | 'org_admin' 
  | 'school_coordinator' 
  | 'screening_staff' 
  | 'clinical_reviewer';

export interface CalibrationData {
  pxPerMm: number;
  calibratedObjectWidthMm: number;
  userAdjustedPx: number;
  dpr: number;
  screenWidth: number;
  screenHeight: number;
  viewportWidth: number;
  viewportHeight: number;
  userAgent: string;
  calibratedAt: string;
  method: 'card' | 'preset' | 'ruler';
}

export interface ScreeningResponse {
  responseId: string;
  sessionId: string;
  eye: EyeTested;
  questionNumber: number;
  optotypeOrientation: OptotypeOrientation;
  optotypeSizeMm: number;
  snellenEquivalent: string;
  expectedAnswer: OptotypeOrientation;
  userAnswer: OptotypeOrientation | 'timeout' | 'skip';
  correct: boolean;
  responseTimeMs: number;
  timestamp: string;
}

export interface ColourVisionResponse {
  plateId: string;
  plateName: string;
  expectedOption: string;
  userOption: string;
  correct: boolean;
  responseTimeMs: number;
}

export interface EyeAcuityResult {
  eye: EyeTested;
  smallestIdentifiedMm: number;
  snellenEquivalent: string;
  logMarEquivalent: number;
  trialsPassed: number;
  totalTrials: number;
  passedThreshold: boolean;
  rawResponses: ScreeningResponse[];
}

export interface ColourVisionResult {
  tested: boolean;
  platesCount: number;
  correctCount: number;
  status: 'normal' | 'concern';
  summaryText: string;
  responses: ColourVisionResponse[];
}

export interface StudentProfile {
  studentId: string;
  opCardId: string;
  qrId: string;
  name?: string; // Opaque by default in student screening views
  schoolId: string;
  schoolName: string;
  gradeClass: string;
  section: string;
  age?: number;
  gender?: 'M' | 'F' | 'Other';
  parentContactMasked?: string;
}

export interface ScreeningSession {
  sessionId: string;
  studentId: string;
  opCardId: string;
  qrId: string;
  schoolId: string;
  schoolName: string;
  gradeClass: string;
  section: string;
  deviceId: string;
  startedAt: string;
  completedAt?: string;
  testDistanceCm: number;
  calibration: CalibrationData;
  rightEyeResult?: EyeAcuityResult;
  leftEyeResult?: EyeAcuityResult;
  binocularResult?: EyeAcuityResult;
  colourVisionResult?: ColourVisionResult;
  overallStatus: ScreeningOverallStatus;
  referralRequired: boolean;
  referralStatus?: ReferralStatus;
  clinicalNotes?: string;
  syncStatus: 'synced' | 'pending' | 'failed';
  offlineCreated: boolean;
  responses: ScreeningResponse[];
}

export interface ClinicalAcuityLevel {
  levelIndex: number;
  snellenEquivalent: string; // e.g. "6/60", "6/36", "6/24", "6/18", "6/12", "6/9", "6/6"
  optotypePhysicalHeightMmAt3m: number; // e.g. 43.6mm for 6/60 at 3m, 4.36mm for 6/6
  optotypePhysicalHeightMmAt1m: number; // e.g. 14.5mm for 6/60 at 1m (~1.4cm physical reference)
  logMar: number;
  trialsPerLevel: number;
  passingScore: number; // e.g. 3 out of 4 correct
}

export interface ClinicalConfig {
  id: string;
  version: string;
  title: string;
  lastUpdated: string;
  approvedByClinician: string;
  testingDistanceCm: number; // Default 150cm (1.5m) or 300cm (3m) or 100cm (1m)
  acuityLevels: ClinicalAcuityLevel[];
  startLevelIndex: number;
  passingThresholdSnellen: string; // e.g. "6/9" or "6/12"
  referralRuleInterocularDifferenceLines: number; // e.g. 2 lines difference flags referral
  binocularTestingEnabled: boolean;
  colourVisionEnabled: boolean;
  colourVisionPlatesCount: number;
  colourVisionPassThreshold: number; // e.g. 4 out of 5 correct
  practiceTrialsCount: number;
  allowRetestOnFailure: boolean;
  clinicalDisclaimer: string;
}

export interface SchoolSummary {
  schoolId: string;
  schoolName: string;
  location: string;
  contactPerson: string;
  phone: string;
  totalStudentsRegistered: number;
  totalScreened: number;
  normalCount: number;
  recheckCount: number;
  referralCount: number;
  followupsCompleted: number;
}

export type SupportedLanguage = 'en' | 'te' | 'hi' | 'ta' | 'kn';

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
}
