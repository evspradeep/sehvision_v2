import { NextRequest, NextResponse } from 'next/server';

interface ReferralLead {
  leadId: string;
  source: string;
  screeningSessionId: string;
  opCardId: string;
  qrId: string;
  studentId: string;
  schoolName: string;
  gradeClass: string;
  section: string;
  referralReason: string;
  urgency: string;
  status: string;
  timestamp: string;
}

const memoryReferrals: ReferralLead[] = [
  {
    leadId: 'REF-2026-001',
    source: 'SANKARA_SCHOOL_SCREENING',
    screeningSessionId: 'sess-demo-002',
    opCardId: 'SEH-OP-2026-8813',
    qrId: 'k3P9x42VwR',
    studentId: 'std-k3P9x42VwR',
    schoolName: 'Sankara Vidyalaya Higher Secondary School, Pammal',
    gradeClass: 'Class 3',
    section: 'B',
    referralReason: 'Right eye 6/24 (Inter-ocular difference >= 2 lines). Suspected amblyopia risk.',
    urgency: 'HIGH',
    status: 'parent_informed',
    timestamp: '2026-03-02T10:15:00Z',
  }
];

export async function GET() {
  return NextResponse.json({
    success: true,
    count: memoryReferrals.length,
    referrals: memoryReferrals,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const leadId = `REF-2026-${String(memoryReferrals.length + 1).padStart(3, '0')}`;
    const newLead: ReferralLead = {
      leadId,
      source: body.source || 'SANKARA_SCHOOL_SCREENING',
      screeningSessionId: body.screeningSessionId || '',
      opCardId: body.opCardId || '',
      qrId: body.qrId || '',
      studentId: body.studentId || '',
      schoolName: body.schoolName || '',
      gradeClass: body.gradeClass || '',
      section: body.section || '',
      referralReason: body.referralReason || 'Visual screening threshold exceeded',
      urgency: body.urgency || 'ROUTINE',
      status: body.status || 'recommended',
      timestamp: new Date().toISOString(),
    };

    memoryReferrals.unshift(newLead);

    return NextResponse.json({
      success: true,
      leadId,
      message: 'Referral lead queued for Sankara Community Ophthalmology CRM',
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
