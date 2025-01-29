import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import {useAuth} from "./providers/authProvider";

export function middleware(request) {
    let cookie = request.cookies.get('token');
    if (!request.cookies.has('token')) {
        console.log(`User not authorized to access ${request.url}`);
        return NextResponse.redirect(new URL('/', request.url))
    }
}

export const config = {
    matcher: ['/admin/:path*', '/organizer/:path*', "/user/:path*"],
};