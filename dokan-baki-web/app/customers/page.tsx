import Link from "next/link";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { getTransactions } from "@/lib/db";
import DeleteCustomerButton from "@/components/delete-customer-button";
import { getCurrentShopId } from "@/lib/auth";
import { redirect } from "next/navigation";
import DownloadPDFButton from "@/components/download-pdf-button";

export const dynamic = 'force-dynamic';

export default async function Customers() {
    const shopId = await getCurrentShopId();
    if (!shopId) redirect('/login');

    const transactions = await getTransactions(shopId);

    // Calculate stats per customer
    const customerMap = new Map();

    transactions.forEach(t => {
        if (!customerMap.has(t.customerName)) {
            customerMap.set(t.customerName, {
                id: t.customerName, // using name as ID for now
                name: t.customerName,
                phone: t.mobileNumber,
                due: 0,
                lastDate: t.date
            });
        }
        const customer = customerMap.get(t.customerName);
        if (t.type === 'DUE') {
            customer.due += t.amount;
        } else {
            customer.due -= t.amount;
        }
        // Update phone if the new transaction has a phone (simplified logic)
        if (t.mobileNumber) customer.phone = t.mobileNumber;

        // Update lastDate
        if (t.date > (customer.lastDate || '')) {
            customer.lastDate = t.date;
        }
    });

    const customers = Array.from(customerMap.values()) as { id: string, name: string, phone?: string, due: number, lastDate?: string }[];

    // Sort by name
    customers.sort((a, b) => a.name.localeCompare(b.name));

    // Filter for PDF (only those with due)
    const customersWithDue = customers.filter(c => c.due > 0);
    const pdfHeaders = ['Customer', 'Mobile', 'Last Date', 'Due Amount'];
    const pdfData = customersWithDue.map(c => [
        c.name,
        c.phone || '-',
        c.lastDate || '-',
        c.due.toLocaleString()
    ]);

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition text-gray-600">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="text-xl font-bold text-gray-800">Customers</h1>
                    </div>
                    {customersWithDue.length > 0 && (
                        <DownloadPDFButton
                            title="Customers with Due"
                            filename="customers_due_list"
                            headers={pdfHeaders}
                            data={pdfData}
                        />
                    )}
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800">Customers ({customers.length})</h2>
                    <Link href="/add-due" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">
                        + Add Customer
                    </Link>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="divide-y divide-gray-100">
                        {customers.map((customer) => (
                            <div
                                key={customer.id}
                                className="px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition border-b border-gray-100 last:border-0"
                            >
                                <Link href={`/customer/${encodeURIComponent(customer.name)}`} className="flex-1 block focus:outline-none">
                                    <div>
                                        <p className="font-semibold text-gray-800 hover:text-blue-600 transition">{customer.name}</p>
                                        <p className="text-sm text-gray-500">{customer.phone}</p>
                                    </div>
                                </Link>
                                <div className="text-right flex items-center gap-4 pl-4">
                                    <div className="flex flex-col items-end">
                                        <p className="text-sm text-gray-500">Due</p>
                                        <p className={`font-bold ${customer.due > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                            ৳ {customer.due.toLocaleString()}
                                        </p>
                                    </div>

                                    <DeleteCustomerButton customerName={customer.name} />
                                </div>
                            </div>
                        ))}
                        {customers.length === 0 && (
                            <div className="p-8 text-center text-gray-500">
                                No customers found. Add a due entry to create one.
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
