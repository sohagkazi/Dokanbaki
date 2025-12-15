"use server";

import { NextRequest, NextResponse } from "next/server";
import { getUserById } from "@/lib/db";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { amount, plan, userId } = body;

        const apiKey = process.env.MOYNAPAY_API_KEY;
        const apiBaseUrl = process.env.MOYNAPAY_BASE_URL || 'https://pay.moynapay.com/api/payment/create';

        if (!apiKey) {
            console.error("Moyna Pay API Key missing");
            return NextResponse.json({ error: "Server configuration error: API Key missing" }, { status: 500 });
        }

        const user = await getUserById(userId);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        // Construct payload strictly matching the user's snippet structure
        const payload = {
            success_url: `${appUrl}/api/payment/moynapay/callback?status=success&userId=${userId}&plan=${plan}&amount=${amount}`,
            cancel_url: `${appUrl}/api/payment/moynapay/callback?status=cancel`,
            webhook_url: `${appUrl}/api/payment/moynapay/webhook`, // Added although not fully implemented receiving end yet
            metadata: {
                phone: user.mobile,
                userId: userId,
                plan: plan
            },
            amount: amount.toString()
        };

        console.log("Initializing Moyna Pay...", { url: apiBaseUrl, payload });

        const response = await fetch(apiBaseUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "API-KEY": apiKey
            },
            body: JSON.stringify(payload),
        });

        const result = await response.json();
        console.log("Moyna Pay Response:", result);

        if (result.status === 'success' && result.payment_url) {
            return NextResponse.json({ url: result.payment_url });
        } else if (result.url) {
            return NextResponse.json({ url: result.url });
        } else {
            return NextResponse.json({ error: result.message || "Payment initiation failed" }, { status: 400 });
        }

    } catch (error) {
        console.error("Moyna Pay Init Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
