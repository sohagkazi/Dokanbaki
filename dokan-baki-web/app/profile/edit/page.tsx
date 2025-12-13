
import Link from "next/link";
import { ArrowLeft, Save, User, MapPin, Store, Phone } from "lucide-react";
import { getCurrentShopId } from "@/lib/auth";
import { getShopById } from "@/lib/db";
import { redirect } from "next/navigation";
import { updateShopProfile } from "../../actions";
import ImageUpload from "@/components/image-upload";

export const dynamic = 'force-dynamic';

export default async function EditProfile() {
    const shopId = await getCurrentShopId();
    if (!shopId) redirect('/login');

    const shop = await getShopById(shopId);
    if (!shop) redirect('/login');

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 pb-20 pt-8 px-4 shadow-md">
                <div className="max-w-md mx-auto">
                    <Link href="/profile" className="inline-flex items-center text-white/80 hover:text-white transition mb-6">
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Cancel
                    </Link>
                    <h1 className="text-3xl font-bold text-white">Edit Profile</h1>
                    <p className="text-blue-100 mt-2">Update your shop information.</p>
                </div>
            </div>

            <main className="max-w-md mx-auto px-4 -mt-10 relative z-10 pb-10">
                <form action={updateShopProfile} className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 space-y-6">

                    {/* Owner Name */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 ml-1">Owner Name</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                name="ownerName"
                                type="text"
                                defaultValue={shop.ownerName || ''}
                                placeholder="Your Name"
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                            />
                        </div>
                    </div>

                    {/* Shop Name */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 ml-1">Shop Name</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Store className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                name="shopName"
                                type="text"
                                defaultValue={shop.name || ''}
                                placeholder="Shop Name"
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                            />
                        </div>
                    </div>

                    {/* Shop Mobile */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 ml-1">Shop Mobile</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Phone className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                name="mobile"
                                type="text"
                                defaultValue={shop.mobile || ''}
                                placeholder="Shop Mobile Number"
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                            />
                        </div>
                    </div>

                    {/* Address */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 ml-1">Shop Address</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MapPin className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                name="address"
                                type="text"
                                defaultValue={shop.address || ''}
                                placeholder="Shop Address"
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                            />
                        </div>
                    </div>

                    {/* Profile Image Upload */}
                    <div className="space-y-2">
                        <ImageUpload defaultValue={shop.image} />
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                        >
                            <Save className="w-5 h-5" />
                            Save Changes
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}
