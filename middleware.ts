import { NextResponse, NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

// Middleware to check for token/authentication
export async function tokenCheck(request: NextRequest) {
  const token = request.cookies.get('dmspId')?.value;
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error('JWT secret not found');
  }

  if (token) {
    try {
      jwt.verify(token, jwtSecret);
      return NextResponse.next();
    } catch (err) {
      return NextResponse.redirect('/login');
    }
  } else {
    return NextResponse.redirect('/login');
  }
}

// Middleware for updating custom header
export async function updateHeaderWithURL(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-url', request.url);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}