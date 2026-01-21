import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAllUsersWithStats } from "@/lib/db";
import { getLiveUserCount } from "@/lib/online-tracker";
import { logoutAction } from "@/app/actions";
import { LogOut, LayoutDashboard, Users, Store, DollarSign } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin_session');

    if (!adminSession) {
        redirect('/admin/login');
    }

    const users = await getAllUsersWithStats();
    const totalUsers = users.length;
    const totalShops = users.reduce((acc: number, user: any) => acc + user.shopCount, 0);
    const totalDue = users.reduce((acc: number, user: any) => acc + (user.totalDue || 0), 0);
    const liveUsers = getLiveUserCount(5); // Active in last 5 minutes

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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Total Users Card */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Users</p>
                            <h3 className="text-3xl font-bold text-gray-900 mt-1">{totalUsers}</h3>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-full">
                            <Users className="w-8 h-8 text-blue-600" />
                        </div>
                    </div>

                    {/* Total Shops Card */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Shops</p>
                            <h3 className="text-3xl font-bold text-gray-900 mt-1">{totalShops}</h3>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-full">
                            <Store className="w-8 h-8 text-purple-600" />
                        </div>
                    </div>

                    {/* Total Due Card */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Due</p>
                            <h3 className="text-3xl font-bold text-red-600 mt-1">{totalDue} BDT</h3>
                        </div>
                        <div className="bg-red-50 p-3 rounded-full">
                            <DollarSign className="w-8 h-8 text-red-600" />
                        </div>
                    </div>

                    {/* Live Online Users Card */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Live Online</p>
                            <h3 className="text-3xl font-bold text-green-600 mt-1">{liveUsers}</h3>
                            <p className="text-xs text-green-500 mt-1">Active in last 5m</p>
                        </div>
                        <div className="bg-green-50 p-3 rounded-full">
                            <div className="relative">
                                <Users className="w-8 h-8 text-green-600" />
                                <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white bg-green-400 animate-pulse" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900">All Users & Shops</h2>
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
                                {users.map((user: any) => {
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
