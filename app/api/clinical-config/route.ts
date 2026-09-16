import { NextRequest, NextResponse } from 'next/server';
import { DEFAULT_CLINICAL_CONFIG } from '@/lib/clinicalConfig';
import { ClinicalConfig } from '@/lib/types';

let currentConfig: ClinicalConfig = { ...DEFAULT_CLINICAL_CONFIG };

export async function GET() {
  return NextResponse.json({
    success: true,
    config: currentConfig,
  });
}

export async function POST(req: NextRequest) {
  try {
    const updated: Partial<ClinicalConfig> = await req.json();
    currentConfig = {
      ...currentConfig,
      ...updated,
      lastUpdated: new Date().toISOString(),
    };
    return NextResponse.json({
      success: true,
      message: 'Clinical screening configuration updated and audited.',
      config: currentConfig,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
