import Link from "next/link";
import { ArrowLeft, MessageSquare, Send } from "lucide-react";
import { sendManualMessage } from "../actions";
import { getCurrentShopId } from "@/lib/auth";
import { redirect } from "next/navigation";

interface PageProps {
    searchParams: Promise<{ name?: string, mobile?: string }>;
}

export default async function SendMessage({ searchParams }: PageProps) {
    const shopId = await getCurrentShopId();
    if (!shopId) redirect('/login');

    const params = await searchParams;
    const name = params.name ? decodeURIComponent(params.name) : '';
    const mobile = params.mobile || '';

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
            {/* Header with Gradient */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 pb-20 pt-8 px-4 shadow-md">
                <div className="max-w-md mx-auto">
                    <Link href="/customers" className="inline-flex items-center text-white/80 hover:text-white transition mb-6">
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back to Customers
                    </Link>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                        <MessageSquare className="w-8 h-8" /> Send Message
                    </h1>
                    <p className="text-blue-100 mt-2">Send a manual SMS/WhatsApp to your customer.</p>
                </div>
            </div>

            <main className="max-w-md mx-auto px-4 -mt-10 relative z-10">
                <form action={sendManualMessage} className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 space-y-6">

                    <div>
                        <label className="text-sm font-semibold text-gray-700 ml-1">To</label>
                        <div className="mt-1 p-3 bg-gray-50 rounded-xl border border-gray-100">
                            <p className="font-bold text-gray-900">{name || 'Unknown List'}</p>
                            <p className="text-sm text-gray-500">{mobile || 'No Mobile'}</p>
                            <input type="hidden" name="customerName" value={name} />
                            <input type="hidden" name="mobile" value={mobile} />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-gray-700 ml-1">Message</label>
                        <textarea
                            name="message"
                            rows={5}
                            required
                            placeholder="Type your message here..."
                            className="mt-1 w-full p-4 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-gray-400 text-gray-700"
                        ></textarea>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                        >
                            <Send className="w-5 h-5" />
                            Send Message
                        </button>
                    </div>

                </form>
            </main>
        </div>
    );
}
