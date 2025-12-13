
import Link from "next/link";
import { ArrowLeft, Phone, Calendar, ArrowRight } from "lucide-react";
import { getTransactions } from "@/lib/db";
import { getCurrentShopId } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

interface PageProps {
    params: Promise<{ name: string }>;
}

import DownloadPDFButton from "@/components/download-pdf-button";

export default async function CustomerDetails({ params }: PageProps) {
    const shopId = await getCurrentShopId();
    if (!shopId) redirect('/login');

    const { name } = await params;
    const decodedName = decodeURIComponent(name);

    const allTransactions = await getTransactions(shopId);
    const customerTransactions = allTransactions
        .filter(t => t.customerName === decodedName)
        .sort((a, b) => {
            // Sort by date descending
            if (b.date !== a.date) return b.date.localeCompare(a.date);
            return b.createdAt.localeCompare(a.createdAt);
        });

    if (customerTransactions.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 text-gray-900 font-sans p-6 text-center">
                <h1 className="text-xl font-bold mb-4">Customer Not Found</h1>
                <Link href="/" className="text-blue-600 hover:underline">Back to Dashboard</Link>
            </div>
        );
    }

    // Calculate generic stats
    const totalDue = customerTransactions.reduce((acc, t) => {
        return t.type === 'DUE' ? acc + t.amount : acc - t.amount;
    }, 0);

    const mobileNumber = customerTransactions.find(t => t.mobileNumber)?.mobileNumber;

    // Prepare data for PDF
    const pdfHeaders = ['Date', 'Type', 'Amount'];
    const pdfData = customerTransactions.map(t => [
        t.date,
        t.type,
        t.amount.toLocaleString()
    ]);

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
            {/* Header with Gradient */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 pb-20 pt-8 px-4 shadow-md">
                <div className="max-w-3xl mx-auto">
                    <div className="flex justify-between items-start mb-6">
                        <Link href="/customers" className="inline-flex items-center text-white/80 hover:text-white transition">
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            Back to Customers
                        </Link>
                        {customerTransactions.length > 0 && (
                            <DownloadPDFButton
                                title={`Transactions - ${decodedName}`}
                                filename={`transactions_${decodedName}`}
                                headers={pdfHeaders}
                                data={pdfData}
                                footer={`Total Current Due: ${totalDue.toLocaleString()} BDT`}
                            />
                        )}
                    </div>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-white">{decodedName}</h1>
                            {mobileNumber && (
                                <div className="flex items-center text-blue-100 mt-2">
                                    <Phone className="w-4 h-4 mr-2" />
                                    {mobileNumber}
                                </div>
                            )}
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl border border-white/10 text-right min-w-[150px]">
                            <p className="text-blue-50 text-xs uppercase tracking-wider font-semibold">Current Due</p>
                            <p className={`text-3xl font-bold ${totalDue > 0 ? 'text-red-300' : 'text-green-300'}`}>
                                ৳ {totalDue.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-3xl mx-auto px-4 -mt-10 relative z-10 pb-10">
                <div className="space-y-4">
                    {/* Action Buttons */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-3 overflow-x-auto">
                        <Link href={`/add-due?name=${encodeURIComponent(decodedName)}`} className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 py-3 rounded-lg font-bold text-center border border-red-200 transition whitespace-nowrap px-4">
                            + Add Due
                        </Link>
                        <Link href={`/add-payment?name=${encodeURIComponent(decodedName)}`} className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 py-3 rounded-lg font-bold text-center border border-green-200 transition whitespace-nowrap px-4">
                            + Add Payment
                        </Link>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100">
                            <h3 className="font-bold text-gray-800">Transaction History</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {customerTransactions.map((tx) => (
                                        <tr key={tx.id} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4 text-gray-600 font-mono text-sm whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-gray-400" />
                                                    {tx.date}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tx.type === 'DUE' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                                    }`}>
                                                    {tx.type === 'DUE' ? 'Due Given' : 'Payment Recv'}
                                                </span>
                                            </td>
                                            <td className={`px-6 py-4 text-right font-bold ${tx.type === 'DUE' ? 'text-red-600' : 'text-green-600'
                                                }`}>
                                                {tx.type === 'DUE' ? '-' : '+'} ৳ {tx.amount.toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
