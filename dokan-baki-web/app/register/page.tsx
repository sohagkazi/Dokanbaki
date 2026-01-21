import Link from "next/link";
import Image from "next/image";
import { User, Phone, Lock, ArrowRight, BookOpen, ArrowLeft, Mail } from "lucide-react";
import { registerUserAction } from "../actions";

// ... imports
import { AlertCircle } from "lucide-react";

export default async function Register({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
    const params = await searchParams; // Await the promise in Next.js 15+
    const error = params.error;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans relative">


            <div className="absolute top-0 left-0 w-full px-6 py-6 sm:px-8">
                <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition font-medium">
                    <ArrowLeft className="w-5 h-5" />
                    Back to Home
                </Link>
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold text-blue-600 tracking-tight">Dokan Baki</h1>
                    <p className="mt-2 text-gray-600">Create your user account</p>
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow rounded-lg sm:px-10 border border-gray-100">

                    {error === 'user_exists' && (
                        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md flex items-center gap-2 text-sm">
                            <AlertCircle className="w-5 h-5" />
                            <p>This mobile number is already registered.</p>
                        </div>
                    )}
                    {error === 'email_exists' && (
                        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md flex items-center gap-2 text-sm">
                            <AlertCircle className="w-5 h-5" />
                            <p>This email is already registered.</p>
                        </div>
                    )}
                    {error === 'weak_password' && (
                        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md flex items-center gap-2 text-sm">
                            <AlertCircle className="w-5 h-5" />
                            <p>Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.</p>
                        </div>
                    )}
                    {error === 'registration_failed' && (
                        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md flex items-center gap-2 text-sm">
                            <AlertCircle className="w-5 h-5" />
                            <p>Registration failed. Please try again.</p>
                        </div>
                    )}

                    <form action={registerUserAction} className="space-y-6">

                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Your Name</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    name="name"
                                    type="text"
                                    required
                                    className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-3 focus:ring-blue-500 focus:border-blue-500 border"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email Address (Optional)</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Phone className="h-5 w-5 text-gray-400" />
                                    {/* Using Phone icon for now or switch to Mail icon if available */}
                                </div>
                                <input
                                    name="email"
                                    type="email"
                                    className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-3 focus:ring-blue-500 focus:border-blue-500 border"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        {/* Mobile */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Phone className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    name="mobile"
                                    type="tel"
                                    required
                                    className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-3 focus:ring-blue-500 focus:border-blue-500 border"
                                    placeholder="017..."
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Set a Password</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-3 focus:ring-blue-500 focus:border-blue-500 border"
                                    placeholder="Strong@123"
                                />
                            </div>
                            <p className="mt-1 text-xs text-gray-500">Must be 8+ chars, uppercase, lowercase, number, special char.</p>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
                            >
                                Create Account <ArrowRight className="ml-2 w-4 h-4" />
                            </button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Already have an account?</span>
                            </div>
                        </div>

                        <div className="mt-6">
                            <Link
                                href="/login"
                                className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                            >
                                Log in
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
