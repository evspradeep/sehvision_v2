import { ClinicalConfig } from './types';
import { calculateOptotypeHeightMm, snellenToLogMAR } from './optotypeMath';

/**
 * CLINICAL PROTOCOL CONFIGURATION
 * 
 * IMPORTANT CLINICAL NOTICE:
 * This configuration defines the screening thresholds and protocol for Sankara Eye Hospital's
 * school screening program. It is decoupled from the UI logic to allow authorized clinical teams
 * to validate, calibrate, and adapt the protocol per institutional ethics & optometric standards.
 * 
 * DISCLAIMER:
 * This software is a preliminary screening tool to identify children who may require formal evaluation.
 * It is NOT a diagnostic device and cannot confirm refractive errors, amblyopia, strabismus, or ocular pathology.
 */

// Default testing distance is 150 cm (1.5 m) for handheld/table setup in school screening rooms
export const DEFAULT_TESTING_DISTANCE_CM = 150;

export const DEFAULT_CLINICAL_CONFIG: ClinicalConfig = {
  id: 'sankara-school-v1',
  version: '1.4.0',
  title: 'Sankara School Eye Screening Standard Protocol',
  lastUpdated: '2026-03-01',
  approvedByClinician: 'Dr. S. K. Ramanathan, Chief Pediatric Ophthalmologist, Sankara Eye Hospital',
  testingDistanceCm: DEFAULT_TESTING_DISTANCE_CM,
  startLevelIndex: 1, // Start at 6/36 for friendly confidence building
  passingThresholdSnellen: '6/9',
  referralRuleInterocularDifferenceLines: 2, // Anisometropia / Amblyopia risk threshold
  binocularTestingEnabled: false, // Optional, can be toggled by clinician
  colourVisionEnabled: true,
  colourVisionPlatesCount: 5,
  colourVisionPassThreshold: 4, // 4 out of 5 to pass
  practiceTrialsCount: 3,
  allowRetestOnFailure: true,
  clinicalDisclaimer: 'This screening is not a clinical diagnosis. Qualified eye examination by an optometrist or ophthalmologist at Sankara Eye Hospital is required for definitive assessment and prescription.',
  acuityLevels: [
    {
      levelIndex: 0,
      snellenEquivalent: '6/60',
      optotypePhysicalHeightMmAt3m: calculateOptotypeHeightMm(60, 3000), // ~43.6mm
      optotypePhysicalHeightMmAt1m: calculateOptotypeHeightMm(60, 1000), // ~14.5mm (corresponds to ~1.4cm physical reference!)
      logMar: snellenToLogMAR('6/60'), // 1.00
      trialsPerLevel: 3,
      passingScore: 2,
    },
    {
      levelIndex: 1,
      snellenEquivalent: '6/36',
      optotypePhysicalHeightMmAt3m: calculateOptotypeHeightMm(36, 3000), // ~26.2mm
      optotypePhysicalHeightMmAt1m: calculateOptotypeHeightMm(36, 1000), // ~8.7mm
      logMar: snellenToLogMAR('6/36'), // 0.78
      trialsPerLevel: 4,
      passingScore: 3,
    },
    {
      levelIndex: 2,
      snellenEquivalent: '6/24',
      optotypePhysicalHeightMmAt3m: calculateOptotypeHeightMm(24, 3000), // ~17.5mm
      optotypePhysicalHeightMmAt1m: calculateOptotypeHeightMm(24, 1000), // ~5.8mm
      logMar: snellenToLogMAR('6/24'), // 0.60
      trialsPerLevel: 4,
      passingScore: 3,
    },
    {
      levelIndex: 3,
      snellenEquivalent: '6/18',
      optotypePhysicalHeightMmAt3m: calculateOptotypeHeightMm(18, 3000), // ~13.1mm (~1.3 - 1.4cm physical reference chart line)
      optotypePhysicalHeightMmAt1m: calculateOptotypeHeightMm(18, 1000), // ~4.36mm
      logMar: snellenToLogMAR('6/18'), // 0.48
      trialsPerLevel: 4,
      passingScore: 3,
    },
    {
      levelIndex: 4,
      snellenEquivalent: '6/12',
      optotypePhysicalHeightMmAt3m: calculateOptotypeHeightMm(12, 3000), // ~8.7mm
      optotypePhysicalHeightMmAt1m: calculateOptotypeHeightMm(12, 1000), // ~2.9mm
      logMar: snellenToLogMAR('6/12'), // 0.30
      trialsPerLevel: 4,
      passingScore: 3,
    },
    {
      levelIndex: 5,
      snellenEquivalent: '6/9',
      optotypePhysicalHeightMmAt3m: calculateOptotypeHeightMm(9, 3000), // ~6.5mm
      optotypePhysicalHeightMmAt1m: calculateOptotypeHeightMm(9, 1000), // ~2.2mm
      logMar: snellenToLogMAR('6/9'), // 0.18
      trialsPerLevel: 4,
      passingScore: 3,
    },
    {
      levelIndex: 6,
      snellenEquivalent: '6/6',
      optotypePhysicalHeightMmAt3m: calculateOptotypeHeightMm(6, 3000), // ~4.36mm
      optotypePhysicalHeightMmAt1m: calculateOptotypeHeightMm(6, 1000), // ~1.45mm
      logMar: snellenToLogMAR('6/6'), // 0.00
      trialsPerLevel: 4,
      passingScore: 3,
    }
  ]
};

/**
 * Calculates physical height in millimeters for any Snellen level at the given testing distance.
 */
export function getHeightForLevelAndDistance(levelIndex: number, distanceCm: number, config: ClinicalConfig = DEFAULT_CLINICAL_CONFIG): number {
  const level = config.acuityLevels[levelIndex];
  if (!level) return 14.0; // Fallback to 1.4cm
  const parts = level.snellenEquivalent.split('/');
  const den = parts.length === 2 ? parseFloat(parts[1]) : 18;
  const distanceMm = distanceCm * 10;
  return calculateOptotypeHeightMm(den, distanceMm, 6);
}
