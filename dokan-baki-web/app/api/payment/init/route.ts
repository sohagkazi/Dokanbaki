"use server";

import { NextRequest, NextResponse } from "next/server";
import { getUserById } from "@/lib/db";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { amount, plan, userId } = body;

        const store_id = process.env.STORE_ID;
        const store_passwd = process.env.STORE_PASSWORD;
        const is_live = process.env.IS_LIVE === 'true';

        if (!store_id || !store_passwd) {
            return NextResponse.json({ error: "SSL Commerz credentials not found" }, { status: 500 });
        }

        const tran_id = `TRX_${Date.now()}`;
        const user = await getUserById(userId);

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        const data = {
            store_id,
            store_passwd,
            total_amount: amount,
            currency: "BDT",
            tran_id,
            success_url: `${appUrl}/api/payment/success?userId=${userId}&plan=${plan}&amount=${amount}`,
            fail_url: `${appUrl}/api/payment/fail`,
            cancel_url: `${appUrl}/api/payment/cancel`,
            ipn_url: `${appUrl}/api/payment/ipn`,
            cus_name: user.name,
            cus_email: user.mobile + "@example.com", // Placeholder as we don't have email
            cus_add1: "Dhaka",
            cus_add2: "Dhaka",
            cus_city: "Dhaka",
            cus_state: "Dhaka",
            cus_postcode: "1000",
            cus_country: "Bangladesh",
            cus_phone: user.mobile,
            cus_fax: user.mobile,
            shipping_method: "NO",
            product_name: plan,
            product_category: "Subscription",
            product_profile: "general",
        };

        const sslUrl = is_live
            ? "https://securepay.sslcommerz.com/gwprocess/v4/api.php"
            : "https://sandbox.sslcommerz.com/gwprocess/v4/api.php";

        const formData = new URLSearchParams(data as any);

        const response = await fetch(sslUrl, {
            method: "POST",
            body: formData,
        });

        const result = await response.json();

        if (result.status === "SUCCESS") {
            return NextResponse.json({ url: result.GatewayPageURL });
        } else {
            return NextResponse.json({ error: result.failedreason || "Payment initiation failed" }, { status: 400 });
        }

    } catch (error) {
        console.error("Payment Init Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
