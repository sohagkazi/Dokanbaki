import Link from "next/link";
import { ArrowLeft, Edit2, MapPin, User as UserIcon, LogOut, Store } from "lucide-react";
import { getCurrentUserId } from "@/lib/auth";
import { getUserById } from "@/lib/db";
import { redirect } from "next/navigation";
import { logoutAction } from "../actions";

export const dynamic = 'force-dynamic';

export default async function UserProfile() {
    const userId = await getCurrentUserId();
    if (!userId) redirect('/login');

    const user = await getUserById(userId);
    if (!user) redirect('/login');

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
                    <Link href="/shops" className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition text-gray-600">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-lg font-bold text-gray-800">User Account</h1>
                    <div className="w-9" />
                </div>
            </div>

            <main className="max-w-md mx-auto px-4 py-8">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden text-center p-8">
                    <div className="w-24 h-24 bg-blue-50 rounded-full mx-auto mb-4 flex items-center justify-center border-4 border-white shadow-sm overflow-hidden relative">
                        {user.image ? (
                            <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                            <UserIcon className="w-10 h-10 text-blue-300" />
                        )}
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                    <p className="text-gray-500 mb-6">{user.mobile}</p>

                    <div className="space-y-4 text-left">
                        <div className="bg-gray-50 p-4 rounded-xl flex items-center gap-4">
                            <div className="bg-white p-2 rounded-full shadow-sm">
                                <MapPin className="w-5 h-5 text-red-500" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Address</p>
                                <p className="font-medium text-gray-800">{user.address || 'Not set'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex gap-3">
                        <Link href="/user-profile/edit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-500/30 transition flex items-center justify-center gap-2">
                            <Edit2 className="w-4 h-4" />
                            Edit Profile
                        </Link>
                    </div>
                </div>

                <div className="mt-6">
                    <Link href="/shops" className="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 py-3 rounded-xl font-semibold shadow-sm transition flex items-center justify-center gap-2">
                        <Store className="w-5 h-5" />
                        My Shops
                    </Link>
                </div>

                <div className="mt-4">
                    <form action={logoutAction}>
                        <button type="submit" className="w-full bg-white hover:bg-red-50 text-red-600 border border-red-100 py-3 rounded-xl font-semibold shadow-sm transition flex items-center justify-center gap-2">
                            <LogOut className="w-5 h-5" />
                            Sign Out
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}
