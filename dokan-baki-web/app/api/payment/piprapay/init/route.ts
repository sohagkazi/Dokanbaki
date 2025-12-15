"use server";

import { NextRequest, NextResponse } from "next/server";
import { getUserById } from "@/lib/db";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { amount, plan, userId } = body;

        const apiKey = process.env.PIPRAPAY_API_KEY;
        const apiBaseUrl = process.env.PIPRAPAY_BASE_URL || 'https://piprapay.com/api/v1'; // Defaulting, but needs verification

        if (!apiKey) {
            return NextResponse.json({ error: "Piprapay credentials not found" }, { status: 500 });
        }

        const user = await getUserById(userId);

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const transactionId = `TRX_PIPRA_${Date.now()}`;

        // Construct payload based on standard payment gateway patterns
        // TODO: Verify exact field names with Piprapay documentation
        const payload = {
            api_key: apiKey,
            amount: amount,
            currency: "BDT",
            full_name: user.name,
            email: user.email || "user@example.com",
            phone: user.mobile,
            transaction_id: transactionId,
            success_url: `${appUrl}/api/payment/piprapay/callback?status=success&userId=${userId}&plan=${plan}&amount=${amount}`,
            cancel_url: `${appUrl}/api/payment/piprapay/callback?status=cancel`,
            fail_url: `${appUrl}/api/payment/piprapay/callback?status=fail`,
            metadata: {
                userId,
                plan
            }
        };

        console.log("Attempting Piprapay Init...");
        console.log("API Key Present:", !!apiKey);
        console.log("Base URL:", apiBaseUrl);
        console.log("Payload Preview:", JSON.stringify(payload));

        const response = await fetch(`${apiBaseUrl}/create-charge`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(payload),
        });

        const result = await response.json();
        console.log("Piprapay Init Payload:", JSON.stringify(payload, null, 2));
        console.log("Piprapay Init Response:", JSON.stringify(result, null, 2));

        if (result.payment_url) {
            return NextResponse.json({ url: result.payment_url });
        } else if (result.url) {
            return NextResponse.json({ url: result.url });
        } else {
            console.error("Piprapay Init Response:", result);
            return NextResponse.json({ error: result.message || "Payment initiation failed" }, { status: 400 });
        }

    } catch (error) {
        console.error("Payment Init Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
