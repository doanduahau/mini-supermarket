import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  const isAuthPage = request.nextUrl.pathname.startsWith('/login');

  const decodeJwt = (t: string) => {
    try {
      const base64Url = t.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };
  
  const protectedRoutes = [
    '/dashboard', '/employees', '/shifts', '/attendance', 
    '/salary', '/bonus', '/reports', '/my'
  ];

  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname === route || request.nextUrl.pathname.startsWith(`${route}/`)
  );

  if (request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isProtectedRoute && token) {
    const decoded = decodeJwt(token);
    if (decoded && decoded.role === 'employee') {
      const isEmployeeRoute = 
        request.nextUrl.pathname === '/dashboard' || 
        request.nextUrl.pathname.startsWith('/announcements') || 
        request.nextUrl.pathname.startsWith('/my');
                              
      if (!isEmployeeRoute) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
  }

  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
