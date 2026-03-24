import { NextRequest, NextResponse } from 'next/server';
import { hash } from '@node-rs/argon2';
import db from '@/lib/db';
import { createSession, setSessionCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const { email, username, password } = await request.json();

  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 422 });
  }
  if (!username || typeof username !== 'string' || username.trim().length === 0) {
    return NextResponse.json({ error: 'Username is required' }, { status: 422 });
  }
  if (!password || typeof password !== 'string' || password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 422 });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
  }

  const hashedPassword = await hash(password);
  const userId = crypto.randomUUID();
  db.prepare('INSERT INTO users (id, email, username, hashed_password) VALUES (?, ?, ?, ?)').run(
    userId,
    email,
    username.trim(),
    hashedPassword
  );

  const sessionId = createSession(userId);
  const response = NextResponse.json({ user: { id: userId, email, username: username.trim() } }, { status: 201 });
  setSessionCookie(response, sessionId);
  return response;
}
