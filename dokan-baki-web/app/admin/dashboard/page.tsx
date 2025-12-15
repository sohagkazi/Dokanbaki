import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAllPayments, getUserById, getAllUsersWithStats } from "@/lib/db";
import { approvePaymentAction, rejectPaymentAction, logoutAction } from "@/app/actions";
import { Check, X, LogOut, LayoutDashboard } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin_session');

    if (!adminSession) {
        redirect('/admin/login');
    }

    const payments = await getAllPayments();

    // Sort payments: Pending first, then by date desc
    const sortedPayments = [...payments].sort((a, b) => {
        if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
        if (a.status !== 'PENDING' && b.status === 'PENDING') return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Admin Header */}
            <header className="bg-gray-900 text-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <LayoutDashboard className="h-6 w-6 text-red-500" />
                        <h1 className="text-xl font-bold">Dokan Baki - Super Admin Panel</h1>
                    </div>
                    <div>
                        <form action={async () => {
                            'use server';
                            const c = await cookies();
                            c.delete('admin_session');
                            redirect('/admin/login');
                        }}>
                            <button className="flex items-center gap-2 text-gray-300 hover:text-white transition">
                                <LogOut className="w-5 h-5" /> Logout
                            </button>
                        </form>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Payment Requests ({payments.filter(p => p.status === 'PENDING').length})</h2>
                </div>

                <div className="bg-white shadow overflow-hidden rounded-lg border border-gray-200">
                    <ul className="divide-y divide-gray-200">
                        {sortedPayments.map(payment => (
                            <li key={payment.id} className="p-6">
                                <div className="flex items-center justify-between flex-wrap gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${payment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                                payment.status === 'APPROVED' ? 'bg-green-100 text-green-800 border-green-200' :
                                                    'bg-red-100 text-red-800 border-red-200'
                                                }`}>
                                                {payment.status}
                                            </span>
                                            <span className="text-sm text-gray-500">{new Date(payment.createdAt).toLocaleString()}</span>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900">
                                            {payment.amount} BDT  <span className="text-gray-500 font-normal">for</span> {payment.plan}
                                        </h3>
                                        <div className="mt-1 text-sm text-gray-600 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                                            <p><span className="font-semibold">Method:</span> {payment.method}</p>
                                            <p><span className="font-semibold">Sender:</span> {payment.senderNumber}</p>
                                            <p><span className="font-semibold">Trx ID:</span> {payment.transactionId}</p>
                                            <p><span className="font-semibold">User ID:</span> {payment.userId}</p>
                                        </div>
                                    </div>

                                    {payment.status === 'PENDING' && (
                                        <div className="flex items-center gap-3">
                                            <form action={rejectPaymentAction.bind(null, payment.id)}>
                                                <button className="flex items-center px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 transition">
                                                    <X className="w-4 h-4 mr-2" /> Reject
                                                </button>
                                            </form>
                                            <form action={approvePaymentAction.bind(null, payment.id, payment.userId, payment.plan, payment.amount)}>
                                                <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 shadow-sm transition">
                                                    <Check className="w-4 h-4 mr-2" /> Approve
                                                </button>
                                            </form>
                                        </div>
                                    )}
                                </div>
                            </li>
                        ))}
                        {sortedPayments.length === 0 && (
                            <li className="p-12 text-center text-gray-500">No payment records found.</li>
                        )}
                    </ul>
                </div>

                <div className="mb-8 mt-12">
                    <h2 className="text-2xl font-bold text-gray-900">All Users & Shops</h2>
                </div>

                <div className="bg-white shadow overflow-hidden rounded-lg border border-gray-200">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Info</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Plan</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shops</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customers</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Due</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expires</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {(await getAllUsersWithStats()).map((user) => {
                                    const plan = user.subscriptionPlan ? user.subscriptionPlan : 'FREE';
                                    return (
                                        <tr key={user.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                        <div className="text-sm text-gray-500">{user.mobile}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${plan === 'FREE' ? 'bg-gray-100 text-gray-800' :
                                                    plan === 'TITANIUM' ? 'bg-purple-100 text-purple-800' :
                                                        'bg-blue-100 text-blue-800'
                                                    }`}>
                                                    {plan}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div className="font-medium text-gray-900">{user.shopCount} Shops</div>
                                                {user.shopNames && user.shopNames.length > 0 && (
                                                    <div className="text-xs text-gray-400 mt-1">
                                                        {user.shopNames.join(', ')}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {user.totalCustomers} Customers
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-bold">
                                                {user.totalDue ?? 0} BDT
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {user.subscriptionExpiry ? new Date(user.subscriptionExpiry).toLocaleDateString() : 'Never'}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

            </main>
        </div>
    );
}
