import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export function middleware(request) {
    if (!request.cookies.has('token')) {
        console.log(`User not authorized to access ${request.url}`);
        return NextResponse.redirect(new URL('/login', request.url))
    }
    let cookie = request.cookies.get('token');

}

export const config = {
    matcher: ['/admin/:path*', '/organizer/:path*', "/dashboard/:path*"],
};