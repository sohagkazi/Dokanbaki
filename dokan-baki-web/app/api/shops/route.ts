import { NextResponse } from 'next/server';
import { getShopsByOwner, createShop } from '@/lib/db';

export async function GET(request: Request) {
    try {
        const userId = request.headers.get('x-user-id');
        if (!userId) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const shops = await getShopsByOwner(userId);
        return NextResponse.json({ success: true, shops });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const userId = request.headers.get('x-user-id');
        if (!userId) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, mobile } = body;

        if (!name) {
            return NextResponse.json({ success: false, error: 'Shop Name is required' }, { status: 400 });
        }

        const newShop = await createShop(userId, name, mobile || '');
        return NextResponse.json({ success: true, shop: newShop });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
