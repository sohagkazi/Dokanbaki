import Link from "next/link";
import { getCurrentUserId } from "@/lib/auth";
import { getShopsByOwner, getUserById } from "@/lib/db";
import { Plus, Store, Check, LogOut, User, Crown } from "lucide-react";
import { createShopAction, selectShopAction, logoutAction } from "../actions";
import { redirect } from "next/navigation";

export default async function ShopsPage() {
    const userId = await getCurrentUserId();
    if (!userId) redirect('/login');

    const user = await getUserById(userId);
    let shops = await getShopsByOwner(userId);

    // BATCH LAZY GENERATE THEMES IF MISSING OR DEFAULT BLUE
    const shopsWithoutTheme = shops.filter(s => !s.theme || s.theme.primaryColor === '#2563eb');

    if (shopsWithoutTheme.length > 0) {
        // Dynamic import to avoid critical dependency cycle if any
        const { generateUserTheme } = await import("@/lib/ai");
        const { updateShop } = await import("@/lib/db");

        await Promise.all(shopsWithoutTheme.map(async (shop) => {
            try {
                const theme = await generateUserTheme(shop.name, 'retail');
                await updateShop(shop.id, { theme });
            } catch (e) {
                console.error(`Failed to batch generate theme for ${shop.name}`, e);
            }
        }));

        // Re-fetch to get updated themes
        shops = await getShopsByOwner(userId);
    }

    const maxShops = user?.subscriptionPlan === 'TITANIUM' ? Infinity : (
        user?.subscriptionPlan === 'PLATINUM' ? 10 :
            user?.subscriptionPlan === 'PRO' ? 3 : 1
    );
    const isLimitReached = shops.length >= maxShops;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <Store className="h-6 w-6 text-blue-600" />
                        <h1 className="text-xl font-bold text-gray-900">Dokan Baki</h1>
                    </div>
                    <div className="flex items-center space-x-4">

                        <Link href="/profile" className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition group" title="View Profile">
                            <div className="text-right hidden sm:block">
                                <span className="block text-sm font-bold text-gray-900 group-hover:text-blue-600">
                                    {user?.name || 'My Profile'}
                                </span>
                                <span className="text-xs text-blue-500 font-medium">Edit Info</span>
                            </div>
                            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white ring-2 ring-gray-100 group-hover:ring-blue-100 transition relative">
                                {user?.image ? (
                                    <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                        <User className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                                    </div>
                                )}
                            </div>
                        </Link>

                        <div className="h-6 w-px bg-gray-200 mx-2"></div>

                        <form action={logoutAction}>
                            <button className="text-sm text-red-600 hover:text-red-800 flex items-center">
                                <LogOut className="w-4 h-4 mr-1" /> Logout
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            <div className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-8 w-full">

                <h2 className="text-2xl font-bold text-gray-900 mb-6">Select a Shop</h2>

                {/* Shop List */}
                {/* Shop List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
                    {shops.map((shop: any) => {
                        const primaryColor = shop.theme?.primaryColor || '#2563eb';
                        const secondaryColor = shop.theme?.secondaryColor || '#eff6ff'; // Light blue default

                        return (
                            <div key={shop.id} className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between hover:shadow-xl hover:border-gray-200 transition-all duration-300 relative overflow-hidden"
                                style={{ borderColor: shop.theme ? `${primaryColor}20` : '' }}>

                                {/* Decorative background circle */}
                                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 rounded-full opacity-20 group-hover:scale-150 transition-transform duration-500"
                                    style={{ backgroundColor: primaryColor }}></div>

                                <div className="relative z-10">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg font-bold text-xl"
                                            style={{
                                                backgroundImage: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)`,
                                                boxShadow: `0 10px 15px -3px ${primaryColor}30`
                                            }}>
                                            {shop.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-opacity-80 transition-colors"
                                                style={{ color: shop.theme ? primaryColor : '' }}>
                                                {shop.name}
                                            </h3>
                                            <p className="text-sm text-gray-500 flex items-center gap-1">
                                                {shop.mobile ? shop.mobile : 'No contact info'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 relative z-10">
                                    <form action={selectShopAction.bind(null, shop.id)}>
                                        <button
                                            type="submit"
                                            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all transform active:scale-95"
                                            style={{
                                                backgroundColor: primaryColor,
                                                boxShadow: `0 10px 15px -3px ${primaryColor}40`
                                            }}
                                        >
                                            Manage Shop <Check className="ml-2 w-4 h-4" />
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )
                    })}

                    {shops.length === 0 && (
                        <div className="bg-white border border-gray-100 rounded-3xl p-10 flex flex-col items-center justify-center col-span-full text-center shadow-sm">
                            <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mb-6">
                                <Store className="w-10 h-10 text-blue-500" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No Shops Yet</h3>
                            <p className="text-gray-500 mb-6 max-w-sm">You haven't created any shops yet. Create your first digital shop to start tracking.</p>
                        </div>
                    )}
                </div>

                {/* Create New Shop Section */}
                <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                    <div className="p-8 md:p-10">
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center mb-2">
                                <span className="p-2 bg-blue-100 rounded-lg mr-3">
                                    <Plus className="w-5 h-5 text-blue-600" />
                                </span>
                                Create New Shop
                            </h2>
                            <div className="flex justify-between items-center ml-14">
                                <p className="text-gray-500">Add a new shop to your account.</p>
                                <span className="bg-gray-100 px-3 py-1 rounded-full text-xs font-bold text-gray-600 border border-gray-200">
                                    {shops.length} / ∞ Shops Used
                                </span>
                            </div>
                        </div>

                        <div className="max-w-xl">
                            <form action={createShopAction} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Shop Name</label>
                                    <input
                                        name="shopName"
                                        type="text"
                                        required
                                        className="block w-full border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all py-3 px-4 bg-gray-50 focus:bg-white"
                                        placeholder="e.g. Bhai Bhai Store"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Shop Mobile (Optional)</label>
                                    <input
                                        name="mobile"
                                        type="tel"
                                        className="block w-full border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all py-3 px-4 bg-gray-50 focus:bg-white"
                                        placeholder="017..."
                                    />
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        className="w-full sm:w-auto flex justify-center items-center py-4 px-8 border border-transparent rounded-full shadow-lg shadow-green-500/20 text-base font-bold text-white bg-green-600 hover:bg-green-700 hover:shadow-green-500/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all transform hover:-translate-y-1"
                                    >
                                        <Plus className="w-5 h-5 mr-2" /> Create Shop
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
