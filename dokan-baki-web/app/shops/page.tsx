import Link from "next/link";
import { getCurrentUserId } from "@/lib/auth";
import { getShopsByOwner, getUserById } from "@/lib/db";
import { Plus, Store, Check, LogOut, User } from "lucide-react";
import { createShopAction, selectShopAction, logoutAction } from "../actions";
import { redirect } from "next/navigation";

export default async function ShopsPage() {
    const userId = await getCurrentUserId();
    if (!userId) redirect('/login');

    const user = await getUserById(userId);
    const shops = await getShopsByOwner(userId);

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
                        <Link href="/user-profile/edit" className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition group" title="Edit Profile">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
                    {shops.map(shop => (
                        <div key={shop.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col justify-between hover:shadow-md transition">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">{shop.name}</h3>
                                <p className="text-sm text-gray-500 mt-1">{shop.mobile ? `Contact: ${shop.mobile}` : 'No contact info'}</p>
                            </div>
                            <div className="mt-4">
                                <form action={selectShopAction.bind(null, shop.id)}>
                                    <button
                                        type="submit"
                                        className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        Manage Shop <Check className="ml-2 w-4 h-4" />
                                    </button>
                                </form>
                            </div>
                        </div>
                    ))}

                    {shops.length === 0 && (
                        <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-6 flex items-center justify-center col-span-full">
                            <p className="text-yellow-700">You haven't created any shops yet. Create one below!</p>
                        </div>
                    )}
                </div>

                {/* Create New Shop Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center">
                            <Plus className="w-5 h-5 mr-2 text-blue-500" /> Create New Shop
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">Add a new shop to your account.</p>
                    </div>

                    <form action={createShopAction} className="space-y-4 max-w-md">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Shop Name</label>
                            <input
                                name="shopName"
                                type="text"
                                required
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border py-2 px-3"
                                placeholder="e.g. Bhai Bhai Store"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Shop Mobile (Optional)</label>
                            <input
                                name="mobile"
                                type="tel"
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border py-2 px-3"
                                placeholder="017..."
                            />
                        </div>

                        <div className="pt-2">
                            <div>
                                <button
                                    type="submit"
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                >
                                    <Plus className="w-4 h-4 mr-2" /> Add Shop
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

            </div>
        </div>
    );
}
