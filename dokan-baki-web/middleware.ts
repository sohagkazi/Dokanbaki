import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { USER_COOKIE, SHOP_COOKIE } from './lib/constants';

export function middleware(request: NextRequest) {
    const userId = request.cookies.get(USER_COOKIE)?.value;
    const shopId = request.cookies.get(SHOP_COOKIE)?.value;
    const path = request.nextUrl.pathname;

    // 1. Auth Pages (Login/Register/Forgot Password) & Public Pages & Admin
    // 1. Auth Pages (Login/Register/Forgot Password) & Public Pages & Admin
    if (path.startsWith('/admin')) {
        return NextResponse.next();
    }

    if (path === '/login' || path === '/register' || path === '/forgot-password') {
        if (userId) {
            // If logged in, redirect to Dashboard or Shop Selection
            if (shopId) {
                return NextResponse.redirect(new URL('/', request.url));
            } else {
                return NextResponse.redirect(new URL('/shops', request.url));
            }
        }
        return NextResponse.next();
    }

    // 2. Root("/") - Landing Page vs Dashboard
    if (path === '/') {
        if (!userId) {
            // Guest: Show Landing Page
            return NextResponse.next();
        }
        if (!shopId) {
            // User but no shop selected: Allow them to see Landing Page
            // but app/page.tsx should probably show a "Select Shop" button in nav
            return NextResponse.next();
        }
        // User & Shop Selected: Show Dashboard
        return NextResponse.next();
    }

    // 3. Other Protected Pages (/customers, /add-due, etc.)
    if (!userId) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // If logged in but no shop context active, force selection (except for /shops and /user-profile)
    if (!shopId && path !== '/shops' && !path.startsWith('/user-profile') && !path.startsWith('/subscription')) {
        return NextResponse.redirect(new URL('/shops', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
