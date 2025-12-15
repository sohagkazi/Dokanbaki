"use server";

import { NextRequest, NextResponse } from "next/server";
import { createPayment, getUserById, updateUser } from "@/lib/db";
import { redirect } from "next/navigation";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const userId = searchParams.get('userId');
        const plan = searchParams.get('plan');
        const reqAmount = searchParams.get('amount');

        if (!userId || !plan) {
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/subscription/checkout?error=missing_params`);
        }

        if (status === 'success') {
            // In a real production scenario, you should verify the transaction with Piprapay API 
            // using a 'verify-payment' endpoint before trusting the callback blindly.
            // For now, we trust the callback parameters as per the initial implementation plan.

            await createPayment({
                userId: userId,
                amount: Number(reqAmount),
                method: 'Piprapay',
                transactionId: `TRX_PIPRA_${Date.now()}`, // Ideally get this from searchParams if available
                senderNumber: 'Online',
                plan: plan as 'PRO' | 'PLATINUM' | 'TITANIUM' | 'SMS_PACK'
            });

            // Update User Plan
            const user = await getUserById(userId);
            if (user) {
                if (plan === 'SMS_PACK') {
                    await updateUser(userId, { smsBalance: (user.smsBalance || 0) + 1000 });
                } else {
                    const amountNum = Number(reqAmount);
                    let days = 30;

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
        console.error("Payment Callback Error:", error);
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/subscription/checkout?error=server_error`);
    }
}
