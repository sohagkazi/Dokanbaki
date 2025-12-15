import Link from "next/link";
import Image from "next/image";
import { getCurrentUserId } from "@/lib/auth";
import { getUserById, getShopsByOwner } from "@/lib/db";
import { Check, AlertTriangle, CreditCard, MessageSquare, Store, ArrowLeft } from "lucide-react";

export default async function PricingPage({ searchParams }: { searchParams: Promise<{ error?: string, success?: string }> }) {
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

        // Limits
        const limits = {
            'FREE': 1,
            'PRO': 3,
            'PLATINUM': 10,
            'TITANIUM': Infinity
        };
        limit = limits[currentPlan as keyof typeof limits] || 1;
        isLimitReached = shopCount >= limit;
    }

    const plans = [
        {
            name: 'PRO',
            shops: 3,
            priceMo: 100,
            priceYr: 1000,
            sms: 10,
            color: 'blue',
            popular: false
        },
        {
            name: 'PLATINUM',
            shops: 10,
            priceMo: 200,
            priceYr: 2000,
            sms: 50,
            color: 'purple',
            popular: true
        },
        {
            name: 'TITANIUM',
            shops: 'Unlimited',
            priceMo: 500,
            priceYr: 5000,
            sms: 200,
            color: 'gray',
            popular: false
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                        Upgrade your Dokan
                    </h2>
                    <p className="mt-4 text-xl text-gray-500">
                        Choose a plan that fits your business needs.
                    </p>
                </div>

                {/* Success Message */}
                {success === 'payment_submitted' && (
                    <div className="bg-green-50 text-green-800 px-6 py-4 rounded-xl text-center mb-12 shadow-sm border border-green-200 max-w-3xl mx-auto">
                        <Check className="w-8 h-8 mx-auto text-green-600 mb-2" />
                        <p className="font-bold text-lg">Payment info submitted!</p>
                        <p className="text-sm">We will review your transaction and upgrade your account shortly.</p>
                    </div>
                )}

                {/* Current Status - Only if logged in */}
                {userId && user && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-12 max-w-3xl mx-auto">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Current Plan: <span className={`text-${currentPlan === 'FREE' ? 'gray' : 'blue'}-600`}>{currentPlan}</span></h3>
                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                    <span className="flex items-center gap-1">
                                        <Store className="w-4 h-4" /> Shops: <strong>{shopCount} / {limit === Infinity ? '∞' : limit}</strong>
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <MessageSquare className="w-4 h-4" /> SMS Balance: <strong>{user.smsBalance || 0}</strong>
                                    </span>
                                </div>
                            </div>
                            {isLimitReached && currentPlan !== 'TITANIUM' && (
                                <div className="bg-yellow-50 text-yellow-800 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4" />
                                    {error === 'limit_reached' ? 'Limit Reached! Upgrade now.' : 'You have reached your shop limit.'}
                                </div>
                            )}
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
                        {userId ? (
                            <Link href="/shops" className="mt-8 block w-full py-4 px-6 border border-transparent rounded-lg text-center font-bold bg-green-600 text-white hover:bg-green-700 shadow-md transition">
                                Go to Dashboard
                            </Link>
                        ) : (
                            <Link href="/register" className="mt-8 block w-full py-4 px-6 border border-transparent rounded-lg text-center font-bold bg-green-600 text-white hover:bg-green-700 shadow-md transition">
                                Get Started for Free
                            </Link>
                        )}
                    </div>
                </div>

                {/* SMS Pack Removed for Free App */}

                <div className="mt-12 text-center">
                    <Link href="/shops" className="text-blue-600 hover:text-blue-800 font-medium">
                        &larr; Back to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
