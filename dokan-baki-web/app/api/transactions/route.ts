import { NextResponse } from 'next/server';
import { getTransactions, addTransaction } from '@/lib/db';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const shopId = searchParams.get('shopId');

        if (!shopId) {
            return NextResponse.json({ success: false, error: 'Shop ID required' }, { status: 400 });
        }

        const transactions = await getTransactions(shopId);
        return NextResponse.json({ success: true, transactions });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { shopId, customerName, mobileNumber, amount, date, type, dueDate, productName } = body;

        if (!shopId || !customerName || !amount || !type) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        const newTransaction = await addTransaction({
            shopId,
            customerName,
            mobileNumber,
            amount,
            date,
            type, // 'DUE' or 'PAYMENT'
            dueDate,
            productName
        });

        return NextResponse.json({ success: true, transaction: newTransaction });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
