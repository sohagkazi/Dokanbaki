
import Link from "next/link";
import {
    Edit2, MapPin, User, LogOut, ChevronRight, Store,
    Phone, Share2, HelpCircle, ShieldCheck, ArrowLeft
} from "lucide-react";
import { getCurrentShopId, getCurrentUserId } from "@/lib/auth";
import { getShopById, getUserById } from "@/lib/db";
import { redirect } from "next/navigation";
import { exitShopAction, logoutAction } from "../actions";

export const dynamic = 'force-dynamic';

export default async function Profile() {
    const shopId = await getCurrentShopId();
    const userId = await getCurrentUserId();

    if (!userId) redirect('/login');
    if (!shopId) redirect('/shops');

    const shop = await getShopById(shopId);
    const user = await getUserById(userId);

    if (!shop || !user) redirect('/login');

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans pb-24">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="p-2 -ml-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100 transition">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="text-xl font-bold text-gray-800">Profile & Check</h1>
                    </div>
                    <div className="w-6" /> {/* Spacer */}
                </div>
            </header>

            <main className="max-w-md mx-auto px-4 py-6 space-y-6">

                {/* User Profile Card */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border border-gray-200">
                            {user.image ? (
                                <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-7 h-7 text-gray-400" />
                            )}
                        </div>
                        <div>
                            <h2 className="font-bold text-gray-900 text-lg">{user.name}</h2>
                            <p className="text-gray-500 text-sm">{user.mobile}</p>
                        </div>
                    </div>
                    <Link href="/user-profile/edit" className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition">
                        <Edit2 className="w-4 h-4" />
                    </Link>
                </div>

                {/* Shop Profile Card */}
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-6 shadow-lg text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Store className="w-32 h-32" />
                    </div>

                    <div className="relative z-10 flex justify-between items-start">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30 mb-4 overflow-hidden">
                            {shop.image ? (
                                <img src={shop.image} alt={shop.name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-2xl font-bold">{shop.name.charAt(0)}</span>
                            )}
                        </div>
                        <Link href="/profile/edit" className="bg-white/20 hover:bg-white/30 p-2 rounded-lg backdrop-blur-sm transition">
                            <Edit2 className="w-4 h-4 text-white" />
                        </Link>
                    </div>

                    <h2 className="text-2xl font-bold relative z-10">{shop.name}</h2>
                    <div className="flex items-center gap-2 mt-2 text-blue-100 relative z-10 text-sm">
                        <MapPin className="w-4 h-4" />
                        <span>{shop.address || 'Address not set'}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-blue-100 relative z-10 text-sm">
                        <Phone className="w-4 h-4" />
                        <span>{shop.mobile || 'No contact info'}</span>
                    </div>
                </div>

                {/* Settings Menu */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
                    <h3 className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50/50">Settings</h3>

                    <form action={exitShopAction}>
                        <button type="submit" className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition text-left group">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-50 text-orange-600 rounded-lg group-hover:bg-orange-100 transition">
                                    <Store className="w-5 h-5" />
                                </div>
                                <span className="font-medium text-gray-700">Switch Shop</span>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-300" />
                        </button>
                    </form>

                    <button className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition text-left group">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-50 text-green-600 rounded-lg group-hover:bg-green-100 transition">
                                <Share2 className="w-5 h-5" />
                            </div>
                            <span className="font-medium text-gray-700">Share App</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-300" />
                    </button>

                    <button className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition text-left group">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-purple-100 transition">
                                <HelpCircle className="w-5 h-5" />
                            </div>
                            <span className="font-medium text-gray-700">Help & Support</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-300" />
                    </button>

                    <button className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition text-left group">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-cyan-50 text-cyan-600 rounded-lg group-hover:bg-cyan-100 transition">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <span className="font-medium text-gray-700">Privacy Policy</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-300" />
                    </button>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <form action={logoutAction}>
                        <button type="submit" className="w-full px-5 py-4 flex items-center justify-between hover:bg-red-50 transition text-left group">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-50 text-red-600 rounded-lg group-hover:bg-red-100 transition">
                                    <LogOut className="w-5 h-5" />
                                </div>
                                <span className="font-medium text-red-600">Log Out</span>
                            </div>
                        </button>
                    </form>
                </div>

                <div className="text-center text-gray-400 text-xs py-4">
                    <p>Baki Khata v1.0.0</p>
                </div>

            </main>
        </div>
    );
}
