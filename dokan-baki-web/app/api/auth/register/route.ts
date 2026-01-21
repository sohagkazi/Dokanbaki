import { NextResponse } from 'next/server';
import { createUser } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, mobile, password, email } = body;

        if (!name || !mobile || !password) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        try {
            const newUser = await createUser(name, mobile, hashedPassword, email);
            const { password: _, ...userInfo } = newUser;

            return NextResponse.json({ success: true, user: userInfo });
        } catch (dbError: any) {
            if (dbError.message.includes('already exists')) {
                return NextResponse.json({ success: false, error: dbError.message }, { status: 409 });
            }
            throw dbError;
        }

    } catch (error: any) {
        console.error('Register API Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
