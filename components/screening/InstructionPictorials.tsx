import React from 'react';

/**
 * Pictorial representation 1: Keep device 1 meter distance
 * Features a device on a desk/stand, a student standing at eye level,
 * the signature yellow Sankara "PLEASE STAND HERE" footprint circle,
 * and a clear 1 Meter (<-- 1m -->) distance dimension marker.
 */
export const PictorialOneMeter: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Keep device 1 meter distance illustration"
    >
      <defs>
        {/* Soft background glow */}
        <radialGradient id="bgGlow1" cx="60" cy="60" r="55" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFF7ED" />
          <stop offset="1" stopColor="#FFEDD5" stopOpacity="0.4" />
        </radialGradient>
        {/* Device screen gradient */}
        <linearGradient id="screenGrad" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#1E293B" />
          <stop offset="1" stopColor="#0F172A" />
        </linearGradient>
      </defs>

      {/* Background circle */}
      <rect width="120" height="120" rx="20" fill="url(#bgGlow1)" />

      {/* Floor line */}
      <line x1="8" y1="102" x2="112" y2="102" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="3 3" />

      {/* Left side: Device on Stand */}
      <g id="device-stand">
        {/* Table/Stand base */}
        <path d="M12 102 L28 102" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />
        <path d="M20 102 L20 72" stroke="#64748B" strokeWidth="2.5" />
        {/* Device body (Tablet/Phone) */}
        <rect x="11" y="44" width="18" height="28" rx="3" fill="url(#screenGrad)" stroke="#334155" strokeWidth="1.5" />
        {/* Screen glass */}
        <rect x="13" y="47" width="14" height="22" rx="1.5" fill="#FFFFFF" />
        {/* Tumbling E on screen */}
        <path d="M16 53 H24 M16 57 H22 M16 61 H24 M16 53 V61" stroke="#EA580C" strokeWidth="1.5" strokeLinecap="round" />
      </g>

      {/* Yellow Sankara "PLEASE STAND HERE" Footprint Circle */}
      <g id="footprint-circle">
        <ellipse cx="94" cy="100" rx="16" ry="7" fill="#FACC15" stroke="#EAB308" strokeWidth="1.5" />
        {/* Left footprint */}
        <path
          d="M90 98 C90 96 92 95 93 96 C93.5 97 92.5 99 92 101 C91.5 101.5 90 100 90 98 Z"
          fill="#1E293B"
        />
        <circle cx="93.5" cy="95" r="0.8" fill="#1E293B" />
        {/* Right footprint */}
        <path
          d="M95 98 C95 96 97 95 98 96 C98.5 97 97.5 99 97 101 C96.5 101.5 95 100 95 98 Z"
          fill="#1E293B"
        />
        <circle cx="98.5" cy="95" r="0.8" fill="#1E293B" />
      </g>

      {/* Right side: Student Standing */}
      <g id="standing-student">
        {/* Legs */}
        <line x1="91" y1="84" x2="91" y2="98" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
        <line x1="97" y1="84" x2="97" y2="98" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
        {/* Body (Blue shirt with orange collar) */}
        <path d="M84 56 C84 52 104 52 104 56 L102 84 L86 84 Z" fill="#0284C7" />
        <path d="M91 52 L94 57 L97 52 Z" fill="#EA580C" />
        {/* Head */}
        <circle cx="94" cy="38" r="9" fill="#FBBF24" />
        {/* Hair */}
        <path d="M85 36 C86 28 102 28 103 36 C100 32 96 32 94 33 C91 32 87 33 85 36 Z" fill="#1E293B" />
        {/* Eye looking towards screen */}
        <circle cx="90" cy="38" r="1.5" fill="#0F172A" />
        {/* Sight line from eye to screen */}
        <line x1="86" y1="38" x2="31" y2="54" stroke="#EA580C" strokeWidth="1" strokeDasharray="2 2" />
      </g>

      {/* Dimension arrow: 1 METER */}
      <g id="dimension-arrow">
        {/* Horizontal span */}
        <line x1="28" y1="88" x2="80" y2="88" stroke="#EA580C" strokeWidth="1.8" />
        {/* Left arrow head */}
        <path d="M33 85 L28 88 L33 91" stroke="#EA580C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        {/* Right arrow head */}
        <path d="M75 85 L80 88 L75 91" stroke="#EA580C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        {/* Badge */}
        <rect x="39" y="80" width="30" height="15" rx="4" fill="#EA580C" />
        <text x="54" y="91" fill="#FFFFFF" fontSize="8.5" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">
          1 METER
        </text>
      </g>
    </svg>
  );
};

/**
 * Pictorial representation 2: Keep one eye closed (Cover left eye)
 * Directly matches the Sankara Eye Hospital flyer:
 * School boy wearing blue shirt with orange collar, using his palm/hand
 * to gently cover his left eye, with the right eye open and alert.
 */
export const PictorialCoverOneEye: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Cover one eye illustration"
    >
      <defs>
        <radialGradient id="bgGlow2" cx="60" cy="60" r="55" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F0FDF4" />
          <stop offset="1" stopColor="#DCFCE7" stopOpacity="0.5" />
        </radialGradient>
      </defs>

      {/* Background circle */}
      <rect width="120" height="120" rx="20" fill="url(#bgGlow2)" />

      {/* Boy Body (Blue shirt with orange collar matching Sankara flyer) */}
      <g id="student-body">
        {/* Shoulders */}
        <path d="M26 112 C26 92 40 82 60 82 C80 82 94 92 94 112 Z" fill="#0284C7" />
        {/* Orange collar V */}
        <path d="M52 82 L60 94 L68 82" fill="#EA580C" />
        <path d="M54 82 L60 90 L66 82" stroke="#FFFFFF" strokeWidth="0.8" />
        {/* Neck */}
        <rect x="54" y="72" width="12" height="12" fill="#FBBF24" rx="2" />
      </g>

      {/* Head */}
      <g id="student-head">
        {/* Ears */}
        <circle cx="37" cy="56" r="4.5" fill="#F59E0B" />
        <circle cx="83" cy="56" r="4.5" fill="#F59E0B" />

        {/* Face */}
        <circle cx="60" cy="54" r="23" fill="#FBBF24" />

        {/* Hair (Black neat haircut as in the flyer) */}
        <path
          d="M37 50 C37 32 45 23 60 23 C75 23 83 32 83 50 C80 38 74 34 68 34 C63 34 57 32 52 35 C45 35 39 40 37 50 Z"
          fill="#0F172A"
        />

        {/* Smile */}
        <path d="M54 67 Q60 72 66 67" stroke="#92400E" strokeWidth="1.8" strokeLinecap="round" />

        {/* Open Right Eye (Left side of viewer's perspective) */}
        <g id="open-eye">
          <ellipse cx="49" cy="53" rx="4.5" ry="4" fill="#FFFFFF" />
          <circle cx="49" cy="53" r="2.3" fill="#0F172A" />
          <circle cx="48" cy="52" r="0.7" fill="#FFFFFF" />
          {/* Eyebrow */}
          <path d="M44 46 Q49 43 54 46" stroke="#0F172A" strokeWidth="1.5" strokeLinecap="round" />
        </g>

        {/* Closed/Covered Eye (Right side of viewer's perspective) */}
        {/* Hand gently covering the eye with palm, exactly as shown in Sankara flyer */}
        <g id="covering-hand">
          {/* Arm coming up */}
          <path
            d="M84 96 C86 86 84 72 78 64 L70 65 C76 74 77 86 76 96 Z"
            fill="#0284C7"
          />
          {/* Palm cupping the eye */}
          <rect x="65" y="43" width="14" height="18" rx="6" fill="#F59E0B" transform="rotate(-10 65 43)" />
          {/* Fingers definition */}
          <path d="M72 41 L72 56 M76 43 L76 56 M80 46 L80 56" stroke="#D97706" strokeWidth="1.2" strokeLinecap="round" />
        </g>
      </g>

      {/* Instructional Badge: EYE 1 */}
      <g id="eye-badge">
        <rect x="22" y="8" width="76" height="15" rx="7.5" fill="#15803D" />
        <text x="60" y="19" fill="#FFFFFF" fontSize="8" fontWeight="800" textAnchor="middle" fontFamily="sans-serif">
          ✓ TEST FIRST EYE
        </text>
      </g>
    </svg>
  );
};

/**
 * Pictorial representation 3: Keep the next eye closed (Cover other eye)
 * Directly matches the Sankara Eye Hospital flyer Step 4:
 * Same school boy now gently cupping/covering the other eye with his other palm,
 * switching to test the second eye.
 */
export const PictorialCoverNextEye: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Cover next eye illustration"
    >
      <defs>
        <radialGradient id="bgGlow3" cx="60" cy="60" r="55" gradientUnits="userSpaceOnUse">
          <stop stopColor="#EFF6FF" />
          <stop offset="1" stopColor="#DBEAFE" stopOpacity="0.5" />
        </radialGradient>
      </defs>

      {/* Background circle */}
      <rect width="120" height="120" rx="20" fill="url(#bgGlow3)" />

      {/* Boy Body (Blue shirt with orange collar) */}
      <g id="student-body-2">
        {/* Shoulders */}
        <path d="M26 112 C26 92 40 82 60 82 C80 82 94 92 94 112 Z" fill="#0284C7" />
        {/* Orange collar V */}
        <path d="M52 82 L60 94 L68 82" fill="#EA580C" />
        <path d="M54 82 L60 90 L66 82" stroke="#FFFFFF" strokeWidth="0.8" />
        {/* Neck */}
        <rect x="54" y="72" width="12" height="12" fill="#FBBF24" rx="2" />
      </g>

      {/* Head */}
      <g id="student-head-2">
        {/* Ears */}
        <circle cx="37" cy="56" r="4.5" fill="#F59E0B" />
        <circle cx="83" cy="56" r="4.5" fill="#F59E0B" />

        {/* Face */}
        <circle cx="60" cy="54" r="23" fill="#FBBF24" />

        {/* Hair */}
        <path
          d="M37 50 C37 32 45 23 60 23 C75 23 83 32 83 50 C80 38 74 34 68 34 C63 34 57 32 52 35 C45 35 39 40 37 50 Z"
          fill="#0F172A"
        />

        {/* Smile */}
        <path d="M54 67 Q60 72 66 67" stroke="#92400E" strokeWidth="1.8" strokeLinecap="round" />

        {/* Open Left Eye (Right side of viewer's perspective) */}
        <g id="open-eye-left">
          <ellipse cx="71" cy="53" rx="4.5" ry="4" fill="#FFFFFF" />
          <circle cx="71" cy="53" r="2.3" fill="#0F172A" />
          <circle cx="70" cy="52" r="0.7" fill="#FFFFFF" />
          {/* Eyebrow */}
          <path d="M66 46 Q71 43 76 46" stroke="#0F172A" strokeWidth="1.5" strokeLinecap="round" />
        </g>

        {/* Hand gently covering the opposite eye (Left side of viewer's perspective) */}
        <g id="covering-hand-left">
          {/* Arm coming up from left */}
          <path
            d="M36 96 C34 86 36 72 42 64 L50 65 C44 74 43 86 44 96 Z"
            fill="#0284C7"
          />
          {/* Palm cupping the eye */}
          <rect x="42" y="41" width="14" height="18" rx="6" fill="#F59E0B" transform="rotate(10 42 41)" />
          {/* Fingers definition */}
          <path d="M48 41 L48 56 M44 43 L44 56 M40 46 L40 56" stroke="#D97706" strokeWidth="1.2" strokeLinecap="round" />
        </g>
      </g>

      {/* Instructional Badge: EYE 2 */}
      <g id="eye-badge-2">
        <rect x="22" y="8" width="76" height="15" rx="7.5" fill="#0284C7" />
        <text x="60" y="19" fill="#FFFFFF" fontSize="8" fontWeight="800" textAnchor="middle" fontFamily="sans-serif">
          ✓ TEST NEXT EYE
        </text>
      </g>
    </svg>
  );
};

/**
 * Pictorial representation 4: Passing criteria (≥ 4 of 5 symbols)
 * Visual representation of the Tumbling E optotypes with checkmarks
 * indicating 4/5 passing threshold for Sankara screening protocol.
 */
export const PictorialPassingCriteria: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Passing criteria illustration"
    >
      <defs>
        <radialGradient id="bgGlow4" cx="60" cy="60" r="55" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFBEB" />
          <stop offset="1" stopColor="#FEF3C7" stopOpacity="0.5" />
        </radialGradient>
      </defs>

      <rect width="120" height="120" rx="20" fill="url(#bgGlow4)" />

      {/* Chart board */}
      <rect x="18" y="24" width="84" height="84" rx="10" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" />

      {/* Header bar */}
      <rect x="18" y="24" width="84" height="18" rx="10" fill="#F8FAFC" />
      <text x="60" y="37" fill="#475569" fontSize="8" fontWeight="800" textAnchor="middle" fontFamily="sans-serif">
        5 SYMBOLS TEST
      </text>

      {/* Row of 5 Tumbling E symbols with 4 checkmarks */}
      {/* 1 */}
      <g transform="translate(24, 50)">
        <rect width="12" height="12" rx="2" fill="#F1F5F9" />
        <path d="M3 3 H9 M3 6 H8 M3 9 H9 M3 3 V9" stroke="#0F172A" strokeWidth="1" />
        <circle cx="10" cy="10" r="3" fill="#16A34A" />
        <path d="M8.5 10 L9.5 11 L11.5 9" stroke="#FFFFFF" strokeWidth="0.8" strokeLinecap="round" />
      </g>

      {/* 2 */}
      <g transform="translate(40, 50)">
        <rect width="12" height="12" rx="2" fill="#F1F5F9" />
        <path d="M9 3 V9 M6 3 V8 M3 3 V9 M3 3 H9" stroke="#0F172A" strokeWidth="1" />
        <circle cx="10" cy="10" r="3" fill="#16A34A" />
        <path d="M8.5 10 L9.5 11 L11.5 9" stroke="#FFFFFF" strokeWidth="0.8" strokeLinecap="round" />
      </g>

      {/* 3 */}
      <g transform="translate(56, 50)">
        <rect width="12" height="12" rx="2" fill="#F1F5F9" />
        <path d="M9 3 H3 M9 6 H4 M9 9 H3 M9 3 V9" stroke="#0F172A" strokeWidth="1" />
        <circle cx="10" cy="10" r="3" fill="#16A34A" />
        <path d="M8.5 10 L9.5 11 L11.5 9" stroke="#FFFFFF" strokeWidth="0.8" strokeLinecap="round" />
      </g>

      {/* 4 */}
      <g transform="translate(72, 50)">
        <rect width="12" height="12" rx="2" fill="#F1F5F9" />
        <path d="M3 9 V3 M6 9 V4 M9 9 V3 M3 9 H9" stroke="#0F172A" strokeWidth="1" />
        <circle cx="10" cy="10" r="3" fill="#16A34A" />
        <path d="M8.5 10 L9.5 11 L11.5 9" stroke="#FFFFFF" strokeWidth="0.8" strokeLinecap="round" />
      </g>

      {/* 5 */}
      <g transform="translate(88, 50)">
        <rect width="12" height="12" rx="2" fill="#F8FAFC" />
        <path d="M3 3 H9 M3 6 H8 M3 9 H9 M3 3 V9" stroke="#94A3B8" strokeWidth="1" />
      </g>

      {/* Pass status banner */}
      <rect x="24" y="74" width="72" height="24" rx="6" fill="#EA580C" />
      <text x="60" y="86" fill="#FFFFFF" fontSize="8" fontWeight="800" textAnchor="middle" fontFamily="sans-serif">
        PASS: ≥ 4 OF 5
      </text>
      <text x="60" y="94" fill="#FED7AA" fontSize="6.5" fontWeight="600" textAnchor="middle" fontFamily="sans-serif">
        &lt; 4 needs further test
      </text>
    </svg>
  );
};

/**
 * Pictorial representation 4: Identify the direction of the "E" and select matching direction
 * Visual representation of the Tumbling-E symbol orientation with directional arrow response controls.
 */
export const PictorialEDirection: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Identify E direction and select corresponding direction illustration"
    >
      <defs>
        <radialGradient id="bgGlowEDir" cx="60" cy="60" r="55" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFBEB" />
          <stop offset="1" stopColor="#FEF3C7" stopOpacity="0.5" />
        </radialGradient>
      </defs>

      <rect width="120" height="120" rx="20" fill="url(#bgGlowEDir)" />

      {/* Top Badge: MATCH DIRECTION */}
      <g id="e-dir-badge">
        <rect x="18" y="5" width="84" height="13" rx="6.5" fill="#EA580C" />
        <text
          x="60"
          y="14.5"
          fill="#FFFFFF"
          fontSize="7"
          fontWeight="800"
          textAnchor="middle"
          fontFamily="sans-serif"
        >
          ✓ MATCH &quot;E&quot; DIRECTION
        </text>
      </g>

      {/* Screen card showing BIG Tumbling E */}
      <rect x="16" y="21" width="88" height="53" rx="8" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
      {/* Screen inner display */}
      <rect x="20" y="24" width="80" height="47" rx="5" fill="#F8FAFC" />

      {/* Massive, bold Tumbling E Facing Right (34px wide x 36px tall) */}
      <path
        d="M 43 29.5 H 77 V 36.7 H 50.2 V 43.9 H 71 V 51.1 H 50.2 V 58.3 H 77 V 65.5 H 43 Z"
        fill="#0F172A"
      />

      {/* Connecting guide arrow from open prongs of E to Right arrow button */}
      <path
        d="M 78 47.5 C 93 47.5 92 68 83 83"
        stroke="#16A34A"
        strokeWidth="1.8"
        strokeDasharray="2.5 2"
        fill="none"
      />
      <polygon points="80,84 86,85 84,79" fill="#16A34A" />

      {/* 4 Direction Response Arrows in 4 distinct colors (Pure arrows, no box outlines) */}
      {/* UP ARROW (Blue) */}
      <g transform="translate(47, 78)">
        <path d="M7 10 V2 M3.5 5.5 L7 2 L10.5 5.5" stroke="#2563EB" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* LEFT ARROW (Rose/Red) */}
      <g transform="translate(30, 92)">
        <path d="M10 5.5 H2 M5.5 2 L2 5.5 L5.5 9" stroke="#E11D48" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* DOWN ARROW (Amber/Yellow) */}
      <g transform="translate(47, 105)">
        <path d="M7 2 V10 M3.5 6.5 L7 10 L10.5 6.5" stroke="#D97706" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* RIGHT ARROW (Green/Emerald - Selected matching direction) */}
      <g transform="translate(68, 88)">
        <path d="M2 9.5 H18 M12 4 L18 9.5 L12 15" stroke="#16A34A" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        {/* Selection Checkmark Indicator */}
        <circle cx="21" cy="3" r="4.5" fill="#22C55E" stroke="#FFFFFF" strokeWidth="1" />
        <path d="M19.2 3 L20.4 4.2 L23 1.7" stroke="#FFFFFF" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
};
