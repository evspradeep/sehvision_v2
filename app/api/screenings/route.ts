import { NextRequest, NextResponse } from 'next/server';
import { DEMO_SCREENING_SESSIONS } from '@/lib/mockData';
import { ScreeningSession } from '@/lib/types';

// In-memory backing store for the current runtime (synchronized with client offline storage)
let memorySessions: ScreeningSession[] = [...DEMO_SCREENING_SESSIONS];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const schoolId = searchParams.get('schoolId');
  const status = searchParams.get('status');

  let filtered = [...memorySessions];
  if (schoolId) {
    filtered = filtered.filter(s => s.schoolId === schoolId);
  }
  if (status) {
    filtered = filtered.filter(s => s.overallStatus === status);
  }

  return NextResponse.json({
    success: true,
    count: filtered.length,
    sessions: filtered,
  });
}

export async function POST(req: NextRequest) {
  try {
    const session: ScreeningSession = await req.json();

    if (!session || !session.sessionId) {
      return NextResponse.json({ success: false, error: 'Invalid session payload' }, { status: 400 });
    }

    // Upsert session
    const idx = memorySessions.findIndex(s => s.sessionId === session.sessionId);
    if (idx >= 0) {
      memorySessions[idx] = { ...session, syncStatus: 'synced' };
    } else {
      memorySessions.unshift({ ...session, syncStatus: 'synced' });
    }

    return NextResponse.json({
      success: true,
      message: 'Screening session successfully recorded in Sankara central repository.',
      sessionId: session.sessionId,
      syncedAt: new Date().toISOString()
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
