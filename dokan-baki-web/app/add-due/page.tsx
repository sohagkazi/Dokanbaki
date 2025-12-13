import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCurrentShopId } from "@/lib/auth";
import { getCustomersWithDue } from "@/lib/db";
import { redirect } from "next/navigation";
import AddDueForm from "./add-due-form";

interface PageProps {
    searchParams: Promise<{ name?: string }>;
}

export default async function AddDue({ searchParams }: PageProps) {
    const shopId = await getCurrentShopId();
    if (!shopId) redirect('/login');

    const { name } = await searchParams;
    const prefillName = name ? decodeURIComponent(name) : undefined;

    // Fetch existing customers for autocomplete
    const customersWithDue = await getCustomersWithDue(shopId);

    // We want a unique list of customers. getCustomersWithDue returns grouped by customer, so it's already unique by name.
    // Just map to the format needed by the form.
    const uniqueCustomers = customersWithDue.map(c => ({
        name: c.name,
        phone: c.phone
    }));

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
            {/* Header with Gradient */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-700 pb-20 pt-8 px-4 shadow-md">
                <div className="max-w-md mx-auto">
                    <Link href="/" className="inline-flex items-center text-white/80 hover:text-white transition mb-6">
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-white">Add New Due</h1>
                    <p className="text-gray-300 mt-2">Record a new credit transaction for a customer.</p>
                </div>
            </div>

            <main className="max-w-md mx-auto px-4 -mt-10 relative z-10">
                <AddDueForm customers={uniqueCustomers} prefillName={prefillName} />
            </main>
        </div>
    );
}
