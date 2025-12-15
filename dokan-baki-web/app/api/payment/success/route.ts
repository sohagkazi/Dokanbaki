"use server";

import { NextRequest, NextResponse } from "next/server";
import { createPayment, getUserById, updateUser } from "@/lib/db";
import { redirect } from "next/navigation";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const data = Object.fromEntries(formData.entries());

        const { status, tran_id, val_id, amount } = data;
        const userId = req.nextUrl.searchParams.get('userId');
        const plan = req.nextUrl.searchParams.get('plan');
        const reqAmount = req.nextUrl.searchParams.get('amount');

        if (!userId || !plan) {
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/subscription/checkout?error=missing_params`);
        }

        if (status === 'VALID' || status === 'VALIDATED') {
            // Payment success. Update DB.

            // 1. Record Payment
            await createPayment({
                userId: userId,
                amount: Number(reqAmount),
                method: 'SSL Commerz',
                transactionId: tran_id as string,
                senderNumber: 'Card/Online', // Or use card_brand if available in data
                plan: plan as 'PRO' | 'PLATINUM' | 'TITANIUM' | 'SMS_PACK'
            });

            // 2. Update User Plan
            const user = await getUserById(userId);
            if (user) {
                if (plan === 'SMS_PACK') {
                    await updateUser(userId, { smsBalance: (user.smsBalance || 0) + 1000 });
                } else {
                    // Infer billing duration from amount
                    const amountNum = Number(reqAmount);
                    let days = 30;
                    // Simple heuristic: if amount is large (yearly price), give 365 days.
                    // PRO: 100/1000, PLAT: 200/2000, TIT: 500/5000
                    if (
                        (plan === 'PRO' && amountNum >= 1000) ||
                        (plan === 'PLATINUM' && amountNum >= 2000) ||
                        (plan === 'TITANIUM' && amountNum >= 5000)
                    ) {
                        days = 365;
                    }

                    await updateUser(userId, {
                        subscriptionPlan: plan as any,
                        subscriptionExpiry: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
                    });
                }
            }

            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/admin/dashboard?payment=success`);
        } else {
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/subscription/checkout?error=failed`);
        }
    } catch (error) {
        console.error("Payment Success Error:", error);
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/subscription/checkout?error=server_error`);
    }
}
