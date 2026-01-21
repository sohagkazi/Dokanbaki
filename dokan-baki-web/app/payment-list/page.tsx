
import Link from "next/link";
import { ArrowLeft, User, Calendar, FileText } from "lucide-react";
import DownloadPDFButton from "@/components/download-pdf-button";
import { getTransactions } from "@/lib/db";
import { getCurrentShopId } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function PaymentList() {
    const shopId = await getCurrentShopId();
    if (!shopId) redirect('/login');

    const allTransactions = await getTransactions(shopId);

    const payments = allTransactions
        .filter((t: any) => t.type === 'PAYMENT')
        .sort((a: any, b: any) => {
            if (b.date !== a.date) return b.date.localeCompare(a.date);
            return b.createdAt.localeCompare(a.createdAt);
        });

    const totalCollected = payments.reduce((sum: number, t: any) => sum + t.amount, 0);

    // Prepare data for PDF
    const pdfHeaders = ['Date', 'Customer', 'Mobile', 'Amount'];
    const pdfData = payments.map((p: any) => [
        p.date,
        p.customerName,
        p.mobileNumber || '-',
        p.amount.toLocaleString()
    ]);

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
            {/* Header with Gradient */}
            <div className="bg-gradient-to-r from-green-600 to-green-500 pb-20 pt-8 px-4 shadow-md">
                <div className="max-w-3xl mx-auto">
                    <div className="flex justify-between items-start mb-6">
                        <Link href="/" className="inline-flex items-center text-white/80 hover:text-white transition">
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            Back to Dashboard
                        </Link>
                        {payments.length > 0 && (
                            <DownloadPDFButton
                                title="Payment List"
                                filename="payment_list"
                                headers={pdfHeaders}
                                data={pdfData}
                            />
                        )}
                    </div>
                    <div className="flex justify-between items-end">
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-white">Payment List</h1>
                            <p className="text-green-100 mt-2">History of all received payments.</p>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl border border-white/10 text-right">
                            <p className="text-green-50 text-xs uppercase tracking-wider font-semibold">Total Collected</p>
                            <p className="text-3xl font-bold text-white">৳ {totalCollected.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-3xl mx-auto px-4 -mt-10 relative z-10 pb-10">
                <div className="space-y-4">
                    {payments.length === 0 ? (
                        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center">
                            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <h3 className="text-xl font-bold text-gray-700">No Payments Yet!</h3>
                            <p className="text-gray-500 mt-2">You haven't recorded any payments yet.</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 border-b border-gray-100">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {payments.map((payment: any) => (
                                            <tr key={payment.id} className="hover:bg-gray-50 transition">
                                                <td className="px-6 py-4 text-gray-600 font-mono text-sm whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-4 h-4 text-gray-400" />
                                                        {payment.date}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="bg-green-50 p-2 rounded-full">
                                                            <User className="w-4 h-4 text-green-600" />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-800">{payment.customerName}</p>
                                                            <p className="text-xs text-gray-500">{payment.mobileNumber || '-'}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="inline-block bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-bold border border-green-100">
                                                        + ৳ {payment.amount.toLocaleString()}
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
