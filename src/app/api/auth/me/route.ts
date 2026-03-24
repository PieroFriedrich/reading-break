import { NextRequest, NextResponse } from 'next/server';
import { validateRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const user = validateRequest(request);
  return NextResponse.json({ user });
}
