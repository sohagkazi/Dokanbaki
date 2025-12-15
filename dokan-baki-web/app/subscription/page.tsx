import Link from "next/link";
import { getCurrentUserId } from "@/lib/auth";
import { getUserById, getShopsByOwner } from "@/lib/db";
import { Check, AlertTriangle, CreditCard, MessageSquare, Store } from "lucide-react";

export default async function SubscriptionPage({ searchParams }: { searchParams: Promise<{ error?: string, success?: string }> }) {
    const userId = await getCurrentUserId();
    // Removed early return for no userId to allow public viewing

    const { error, success } = await searchParams;

    // Default values for public view
    let currentPlan = 'FREE';
    let shopCount = 0;
    let limit = 1;
    let user = null;
    let isLimitReached = false;

    if (userId) {
        user = await getUserById(userId);
        const shops = await getShopsByOwner(userId);
        if (user) {
            currentPlan = user.subscriptionPlan || 'FREE';
            shopCount = shops.length;
        }

        // Limits - Updated for Free App
        const limits = {
            'FREE': Infinity,
            'PRO': Infinity,
            'PLATINUM': Infinity,
            'TITANIUM': Infinity
        };
        limit = limits[currentPlan as keyof typeof limits] || Infinity;
        isLimitReached = false; // Always false
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                        Your Subscription
                    </h2>
                    <p className="mt-4 text-xl text-gray-500">
                        Enjoy all features for free.
                    </p>
                </div>

                {/* Current Status */}
                {userId && user && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-12 max-w-3xl mx-auto">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Current Status: <span className="text-green-600">Active</span></h3>
                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                    <span className="flex items-center gap-1">
                                        <Store className="w-4 h-4" /> Shops: <strong>{shopCount} / ∞</strong>
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <MessageSquare className="w-4 h-4" /> SMS Balance: <strong>{user.smsBalance || 'Unlimited'}</strong>
                                    </span>
                                </div>
                            </div>
                            <div className="bg-green-50 text-green-800 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                                <Check className="w-4 h-4" />
                                All Features Unlocked
                            </div>
                        </div>
                    </div>
                )}

                {/* Free Plan Card */}
                <div className="max-w-md mx-auto">
                    <div className="relative flex flex-col rounded-2xl border border-green-500 shadow-xl bg-white p-8">
                        <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase">
                            Free Forever
                        </div>
                        <div className="mb-4 text-center">
                            <h3 className="text-lg font-bold text-green-600 uppercase tracking-wide">Standard Plan</h3>
                            <div className="mt-4 flex items-center justify-center text-gray-900">
                                <span className="text-5xl font-extrabold tracking-tight">Free</span>
                            </div>
                            <p className="mt-2 text-sm text-gray-500">No credit card required.</p>
                        </div>
                        <ul className="mt-6 space-y-4 flex-1">
                            <li className="flex">
                                <Check className="flex-shrink-0 w-5 h-5 text-green-500" />
                                <span className="ml-3 text-gray-500 font-medium">Unlimited Shops</span>
                            </li>
                            <li className="flex">
                                <Check className="flex-shrink-0 w-5 h-5 text-green-500" />
                                <span className="ml-3 text-gray-500">Free SMS Notifications</span>
                            </li>
                            <li className="flex">
                                <Check className="flex-shrink-0 w-5 h-5 text-green-500" />
                                <span className="ml-3 text-gray-500">Premium Support</span>
                            </li>
                            <li className="flex">
                                <Check className="flex-shrink-0 w-5 h-5 text-green-500" />
                                <span className="ml-3 text-gray-500">All Features Included</span>
                            </li>
                        </ul>
                        {/* No buttons needed here as it's just info for logged in user, or link to dashboard */}
                        <div className="mt-8">
                            <Link href="/shops" className="block w-full py-4 px-6 border border-transparent rounded-lg text-center font-bold bg-green-600 text-white hover:bg-green-700 shadow-md transition">
                                Go to Dashboard
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="mt-12 text-center">
                    <Link href="/shops" className="text-blue-600 hover:text-blue-800 font-medium">
                        &larr; Back to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
