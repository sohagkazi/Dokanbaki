"use server";

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/subscription/checkout?error=cancelled`);
}
