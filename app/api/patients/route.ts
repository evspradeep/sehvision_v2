import { NextRequest, NextResponse } from 'next/server';
import { DEMO_STUDENTS } from '@/lib/mockData';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const qrId = searchParams.get('qrId');

  if (qrId) {
    const student = DEMO_STUDENTS.find(s => s.qrId.toLowerCase() === qrId.toLowerCase());
    if (student) {
      return NextResponse.json({ success: true, student });
    }
  }

  return NextResponse.json({
    success: true,
    students: DEMO_STUDENTS.map(s => ({
      studentId: s.studentId,
      opCardId: s.opCardId,
      qrId: s.qrId,
      schoolName: s.schoolName,
      gradeClass: s.gradeClass,
      section: s.section
    }))
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    return NextResponse.json({
      success: true,
      patientId: body.studentId || `std-${Date.now()}`,
      message: 'Student patient record synced to Sankara Hospital Registry'
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
