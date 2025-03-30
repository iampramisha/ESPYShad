// src/middleware.ts
import { NextResponse } from 'next/server';
import { withAuth } from 'next-auth/middleware';
import type { NextRequestWithAuth } from 'next-auth/middleware';

// Define public routes at the top level
const publicRoutes = ['/login', '/register', '/verify-request', '/api/public'];

export default withAuth(
  function middleware(req: NextRequestWithAuth) {
    const { nextUrl } = req;
    const isLoggedIn = req.nextauth.token !== null;
    
    // Redirect unauthenticated users away from protected routes
    if (!isLoggedIn && !publicRoutes.includes(nextUrl.pathname)) {
      return NextResponse.redirect(new URL('/login', nextUrl));
    }

    // Handle email verification for authenticated users
    if (isLoggedIn) {
      const token = req.nextauth.token;
      
      if (!token?.emailVerified && !nextUrl.pathname.startsWith('/verify-request')) {
        return NextResponse.redirect(
          new URL(`/verify-request?email=${token?.email || ''}`, nextUrl)
        );
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {  // <-- Now properly receiving req parameter
        const isPublic = publicRoutes.includes(new URL(req.url).pathname);
        return isPublic || token !== null;
      },
    },
  }
);

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};