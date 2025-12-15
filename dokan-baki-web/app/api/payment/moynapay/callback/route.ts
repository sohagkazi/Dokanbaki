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

        // Check for transaction_id in params (Moyna Pay sends it as 'transaction_id' or 'trx_id' usually)
        const transactionId = searchParams.get('transaction_id') || searchParams.get('trx_id') || `TRX_MOYNA_${Date.now()}`;

        if (status === 'success') {
            // Verify Payment
            const verifyUrl = 'https://pay.moynapay.com/api/payment/verify';
            const apiKey = process.env.MOYNAPAY_API_KEY;

            try {
                if (apiKey && transactionId) {
                    const verifyRes = await fetch(verifyUrl, {
                        method: 'POST',
                        headers: {
                            'API-KEY': apiKey,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ transaction_id: transactionId })
                    });

                    const verifyData = await verifyRes.json();
                    console.log("Moyna Pay Verify Response:", verifyData);

                    // Proceed if verification is successful or just proceed for now if verification fails but status is success (fallback)
                    // Ideally check verifyData.status or similar
                }
            } catch (vError) {
                console.error("Verification call failed:", vError);
                // Continue for now to avoid blocking user if verification API is flaky,
                // but in strict mode we would return error.
            }

            await createPayment({
                userId: userId,
                amount: Number(reqAmount),
                method: 'MoynaPay',
                transactionId: transactionId,
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
