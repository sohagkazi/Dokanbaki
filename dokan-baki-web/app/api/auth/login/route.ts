import { NextResponse } from 'next/server';
import { getUserByMobile, getUserByEmail } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { mobile, password } = body; // mobile can be email too

        if (!mobile || !password) {
            return NextResponse.json({ success: false, error: 'Missing credentials' }, { status: 400 });
        }

        let user;
        if (mobile.includes('@')) {
            user = await getUserByEmail(mobile);
        } else {
            user = await getUserByMobile(mobile);
        }

        if (!user) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }

        const isValid = await bcrypt.compare(password, user.password || '');
        if (!isValid) {
            return NextResponse.json({ success: false, error: 'Invalid password' }, { status: 401 });
        }

        // Return user info (excluding password)
        const { password: _, ...userInfo } = user;

        return NextResponse.json({
            success: true,
            user: userInfo
        });

    } catch (error: any) {
        console.error('Login API Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
