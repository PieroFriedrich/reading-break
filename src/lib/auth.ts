import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import db from './db';

const SESSION_COOKIE = 'rb_session';
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export interface SessionUser {
  id: string;
  email: string;
  username: string;
}

export function generateSessionId(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function createSession(userId: string): string {
  const sessionId = generateSessionId();
  const expiresAt = Date.now() + SESSION_DURATION_MS;
  db.prepare('INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)').run(
    sessionId,
    userId,
    expiresAt
  );
  return sessionId;
}

export function invalidateSession(sessionId: string): void {
  db.prepare('DELETE FROM sessions WHERE id = ?').run(sessionId);
}

export function getSessionUser(sessionId: string): SessionUser | null {
  const row = db
    .prepare(
      `SELECT u.id, u.email, u.username
       FROM sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.id = ? AND s.expires_at > ?`
    )
    .get(sessionId, Date.now()) as { id: string; email: string; username: string } | undefined;
  return row ?? null;
}

export function setSessionCookie(response: NextResponse, sessionId: string): void {
  response.cookies.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: false,
    maxAge: SESSION_DURATION_MS / 1000,
  });
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set(SESSION_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

/** Validate session from an API route request. */
export function validateRequest(request: NextRequest): SessionUser | null {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  if (!sessionId) return null;
  return getSessionUser(sessionId);
}

/** Validate session from a Server Component (uses next/headers). */
export async function validateServerSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionId) return null;
  return getSessionUser(sessionId);
}
