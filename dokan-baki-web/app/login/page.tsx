import Link from "next/link";
import Image from "next/image";
import { Phone, Lock, LogIn, BookOpen, ArrowLeft } from "lucide-react";
import { loginUserAction } from "../actions";
import { SubmitButton } from "@/components/submit-button";

export default async function Login(props: { searchParams: Promise<{ error?: string }> }) {
    const searchParams = await props.searchParams;
    const error = searchParams?.error;

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
                    <p className="mt-2 text-gray-600">Log in to your account</p>
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow rounded-lg sm:px-10 border border-gray-100">

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                            <div className="flex">
                                <div className="ml-3">
                                    <p className="text-sm text-red-700">
                                        Invalid Mobile Number or Password. Please try again.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <form action={loginUserAction} className="space-y-6">

                        {/* Mobile or Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Mobile Number or Email</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Phone className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    name="mobile"
                                    type="text"
                                    required
                                    className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-3 focus:ring-blue-500 focus:border-blue-500 border"
                                    placeholder="017... or email@example.com"
                                />
                            </div>
                        </div>

                        {/* PIN */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    className="appearance-none block w-full px-3 py-3 pl-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="Enter your password"
                                />
                            </div>
                            <div className="flex items-center justify-end mt-2">
                                <Link
                                    href="/forgot-password"
                                    className="text-sm font-medium text-blue-600 hover:text-blue-500"
                                >
                                    Forgot Password?
                                </Link>
                            </div>
                        </div>

                        <div>
                            <SubmitButton />
                        </div>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">New here?</span>
                            </div>
                        </div>

                        <div className="mt-6">
                            <Link
                                href="/register"
                                className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                            >
                                Create new user account
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
