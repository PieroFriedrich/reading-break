import { NextRequest, NextResponse } from 'next/server';
import { validateRequest, invalidateSession, clearSessionCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const sessionId = request.cookies.get('rb_session')?.value;
  if (sessionId) invalidateSession(sessionId);

  const response = NextResponse.json({ ok: true });
  clearSessionCookie(response);
  return response;
}
