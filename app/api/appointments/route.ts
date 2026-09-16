import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    return NextResponse.json({
      success: true,
      appointmentId: `APT-SEH-${Date.now().toString().slice(-6)}`,
      status: 'SCHEDULED',
      message: 'Outpatient consultation slot booked at Sankara Eye Hospital',
      details: body
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
