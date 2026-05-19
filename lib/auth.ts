import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const getSecretKey = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return new TextEncoder().encode(secret);
};

export interface TokenPayload {
  id: string;
  email: string;
  role: string;
  [key: string]: any;
}

export async function signToken(payload: TokenPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('365d') // Lifetime session (365 days)
    .sign(getSecretKey());
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload as unknown as TokenPayload;
  } catch (error) {
    return null;
  }
}

export async function getSession(request?: NextRequest) {
  let token: string | undefined;

  if (request) {
    token = request.cookies.get('auth_token')?.value;
    // Fallback to Auth header
    if (!token) {
      const authHeader = request.headers.get('Authorization');
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
  } else {
    // If used in Server Components/Actions without request object
    const cookieStore = await cookies();
    token = cookieStore.get('auth_token')?.value;
  }

  if (!token) return null;
  return await verifyToken(token);
}

export async function getAdminSession(request?: NextRequest) {
  let token: string | undefined;

  if (request) {
    token = request.cookies.get('admin_token')?.value;
  } else {
    const cookieStore = await cookies();
    token = cookieStore.get('admin_token')?.value;
  }

  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload || (payload.role !== 'admin' && payload.role !== 'superadmin')) {
    return null;
  }
  return payload;
}

export async function verifyAdmin(request?: NextRequest) {
  return await getAdminSession(request);
}
