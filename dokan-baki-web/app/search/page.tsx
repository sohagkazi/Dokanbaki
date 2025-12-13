
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCustomersWithDue } from "@/lib/db";
import { getCurrentShopId } from "@/lib/auth";
import { redirect } from "next/navigation";
import SearchClient from "./search-client";

export const dynamic = 'force-dynamic';

export default async function SearchPage() {
    const shopId = await getCurrentShopId();
    if (!shopId) redirect('/login');

    const customers = await getCustomersWithDue(shopId);

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
            {/* Header with Gradient */}
            <div className="bg-gradient-to-r from-cyan-600 to-blue-500 pb-20 pt-8 px-4 shadow-md">
                <div className="max-w-3xl mx-auto">
                    <Link href="/" className="inline-flex items-center text-white/80 hover:text-white transition mb-6">
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back to Dashboard
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Find Customers</h1>
                        <p className="text-cyan-100 mt-2">Search for customers to check their due status.</p>
                    </div>
                </div>
            </div>

            <main className="max-w-3xl mx-auto px-4 -mt-10 relative z-10 pb-10">
                <SearchClient customers={customers} />
            </main>
        </div>
    );
}
