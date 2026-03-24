import { NextRequest, NextResponse } from 'next/server';
import { verify } from '@node-rs/argon2';
import db from '@/lib/db';
import { createSession, setSessionCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password required' }, { status: 422 });
  }

  const user = db
    .prepare('SELECT id, email, username, hashed_password FROM users WHERE email = ?')
    .get(email) as { id: string; email: string; username: string; hashed_password: string } | undefined;

  if (!user) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  const valid = await verify(user.hashed_password, password);
  if (!valid) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  const sessionId = createSession(user.id);
  const response = NextResponse.json({ user: { id: user.id, email: user.email, username: user.username } });
  setSessionCookie(response, sessionId);
  return response;
}
