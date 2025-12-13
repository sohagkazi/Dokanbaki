
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCustomersWithDue } from "@/lib/db";
import { getCurrentShopId } from "@/lib/auth";
import { redirect } from "next/navigation";
import PaymentForm from "./payment-form";

export const dynamic = 'force-dynamic';

export default async function AddPayment() {
    const shopId = await getCurrentShopId();
    if (!shopId) redirect('/login');

    const allCustomers = await getCustomersWithDue(shopId);
    // Modified: No longer filtering by totalDue > 0. Showing all customers.
    const customers = allCustomers;

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
            {/* Header with Gradient */}
            <div className="bg-gradient-to-r from-green-600 to-green-500 pb-20 pt-8 px-4 shadow-md">
                <div className="max-w-2xl mx-auto">
                    <Link href="/" className="inline-flex items-center text-white/80 hover:text-white transition mb-6">
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-white">Add Payment</h1>
                    <p className="text-green-100 mt-2">Record a payment from any customer.</p>
                </div>
            </div>

            <main className="max-w-2xl mx-auto px-4 -mt-10 relative z-10 pb-10">
                <PaymentForm customers={customers} />
            </main>
        </div>
    );
}
