import Link from "next/link";
import { ArrowLeft, User, Phone, FileText, ArrowRight } from "lucide-react";
import { getCustomersWithDue } from "@/lib/db";
import { getCurrentShopId } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

import DownloadPDFButton from "@/components/download-pdf-button";

export default async function DueList() {
    const shopId = await getCurrentShopId();
    if (!shopId) redirect('/login');

    const allCustomers = await getCustomersWithDue(shopId);
    const dueCustomers = allCustomers.filter(c => c.totalDue > 0);
    const totalOutstanding = dueCustomers.reduce((sum, c) => sum + c.totalDue, 0);

    // Prepare data for PDF
    const pdfHeaders = ['Customer', 'Mobile', 'Last Date', 'Due Amount'];
    const pdfData = dueCustomers.map(c => [
        c.name,
        c.phone || '-',
        c.lastDate || '-',
        c.totalDue.toLocaleString()
    ]);

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
            {/* Header with Gradient */}
            <div className="bg-gradient-to-r from-orange-600 to-orange-500 pb-20 pt-8 px-4 shadow-md">
                <div className="max-w-3xl mx-auto">
                    <div className="flex justify-between items-start mb-6">
                        <Link href="/" className="inline-flex items-center text-white/80 hover:text-white transition">
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            Back to Dashboard
                        </Link>
                        {dueCustomers.length > 0 && (
                            <DownloadPDFButton
                                title="Due List"
                                filename="due_list"
                                headers={pdfHeaders}
                                data={pdfData}
                            />
                        )}
                        <Link href="/customers" className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center ml-2">
                            All Customers <ArrowRight className="w-4 h-4 ml-1" />
                        </Link>
                    </div>
                    <div className="flex justify-between items-end">
                        <div>
                            <h1 className="text-3xl font-bold text-white">Current Due List</h1>
                            <p className="text-orange-100 mt-2">List of customers with outstanding payments.</p>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl border border-white/10 text-right">
                            <p className="text-orange-50 text-xs uppercase tracking-wider font-semibold">Total Outstanding</p>
                            <p className="text-3xl font-bold text-white">৳ {totalOutstanding.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-3xl mx-auto px-4 -mt-10 relative z-10 pb-10">
                <div className="space-y-4">
                    {dueCustomers.length === 0 ? (
                        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center">
                            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <h3 className="text-xl font-bold text-gray-700">No Dues Found!</h3>
                            <p className="text-gray-500 mt-2 mb-6">Everyone has paid their dues. Great job!</p>
                            <Link href="/customers" className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition">
                                View Customer History <ArrowRight className="w-4 h-4 ml-2" />
                            </Link>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 border-b border-gray-100">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Mobile</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Date</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Due Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {dueCustomers.map((customer) => (
                                            <tr key={customer.name} className="hover:bg-gray-50 transition">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="bg-orange-50 p-2 rounded-full">
                                                            <User className="w-4 h-4 text-orange-600" />
                                                        </div>
                                                        <span className="font-semibold text-gray-800">{customer.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-600 font-mono text-sm">
                                                    {customer.phone || '-'}
                                                </td>
                                                <td className="px-6 py-4 text-gray-500 text-sm">
                                                    {customer.lastDate || '-'}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="inline-block bg-red-50 text-red-700 px-3 py-1 rounded-full text-sm font-bold border border-red-100">
                                                        ৳ {customer.totalDue.toLocaleString()}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
