import { Lock } from "lucide-react";
import { adminLoginAction } from "@/app/actions";

export default function AdminLogin() {
    return (
        <div className="min-h-screen bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="text-center">
                    <Lock className="mx-auto h-12 w-12 text-red-600" />
                    <h2 className="mt-6 text-3xl font-extrabold text-white">Super Admin Access</h2>
                    <p className="mt-2 text-gray-400">Restricted Area</p>
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-gray-800 py-8 px-4 shadow rounded-lg sm:px-10 border border-gray-700">
                    <form action={adminLoginAction} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300">User ID</label>
                            <div className="mt-1">
                                <input
                                    name="userId"
                                    type="text"
                                    required
                                    className="appearance-none block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm placeholder-gray-500 bg-gray-700 text-white focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300">Password</label>
                            <div className="mt-1">
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    className="appearance-none block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm placeholder-gray-500 bg-gray-700 text-white focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                                Enter Panel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
