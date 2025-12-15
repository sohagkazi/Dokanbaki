import { getCurrentUserId } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CheckCircle, CreditCard, ArrowRight } from "lucide-react";
import Link from "next/link";
import { submitPaymentAction } from "../../actions";
import SSLPaymentButton from "@/components/ssl-payment-button";
import PiprapayPaymentButton from "@/components/piprapay-payment-button";
import MoynapayPaymentButton from "@/components/moynapay-payment-button";

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ plan?: string, billing?: string }> }) {
    const userId = await getCurrentUserId();
    if (!userId) redirect('/login');

    const { plan, billing } = await searchParams;

    if (!plan || !['PRO', 'PLATINUM', 'TITANIUM', 'SMS_PACK'].includes(plan)) {
        redirect('/subscription');
    }

    const plans = {
        'PRO': { name: 'Dokan Pro', price: billing === 'yearly' ? 1000 : 100 },
        'PLATINUM': { name: 'Dokan Platinum', price: billing === 'yearly' ? 2000 : 200 },
        'TITANIUM': { name: 'Dokan Titanium', price: billing === 'yearly' ? 5000 : 500 },
        'SMS_PACK': { name: '1000 SMS Pack', price: 1000 }
    };

    const selectedPlan = plans[plan as keyof typeof plans];
    const amount = selectedPlan.price;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-3xl mx-auto">
                <div className="mb-12 text-center">
                    <Link href="/subscription" className="text-blue-600 hover:underline mb-4 inline-block">&larr; Back to Plans</Link>
                    <h2 className="text-3xl font-extrabold text-gray-900">Checkout</h2>
                    <p className="mt-2 text-gray-500">Complete your payment to activate {selectedPlan.name}.</p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="p-8 bg-blue-600 text-white">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-2xl font-bold">{selectedPlan.name}</h3>
                                <p className="text-blue-100 mt-1">{billing === 'yearly' ? 'Yearly Billing' : 'Monthly Billing'}</p>
                            </div>
                            <div className="text-4xl font-extrabold">
                                ৳{amount}
                            </div>
                        </div>
                    </div>



                    <div className="p-8">
                        <div className="mb-8 border-b pb-8 border-gray-100">
                            <h4 className="text-lg font-bold text-gray-900 mb-4">Instant Payment (Recommended)</h4>
                            <SSLPaymentButton amount={amount} plan={plan as string} userId={userId} />
                            <PiprapayPaymentButton amount={amount} plan={plan as string} userId={userId} />
                            <MoynapayPaymentButton amount={amount} plan={plan as string} userId={userId} />
                        </div>

                        <div className="mb-8">
                            <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                <CreditCard className="w-5 h-5 mr-2" /> Payment Instructions
                            </h4>
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3 text-sm text-gray-700">
                                <p>Please Send Money (SenMoney/Cash In) to one of the following numbers:</p>
                                <ul className="list-disc pl-5 space-y-1 font-medium">
                                    <li><strong>bKash:</strong> 01700000000 (Personal)</li>
                                    <li><strong>Nagad:</strong> 01800000000 (Personal)</li>
                                    <li><strong>Rocket:</strong> 01900000000 (Personal)</li>
                                </ul>
                                <p className="text-xs text-gray-500 mt-2">* Use your Mobile Number as reference if possible.</p>
                            </div>
                        </div>

                        <form action={submitPaymentAction} className="space-y-6">
                            <input type="hidden" name="plan" value={plan} />
                            <input type="hidden" name="amount" value={amount} />

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                                <select name="method" required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 py-3 px-4 border">
                                    <option value="">Select Method</option>
                                    <option value="bKash">bKash</option>
                                    <option value="Nagad">Nagad</option>
                                    <option value="Rocket">Rocket</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Your Sender Number</label>
                                <input name="senderNumber" type="tel" required placeholder="017XXXXXXXX" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 py-3 px-4 border" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Transaction ID</label>
                                <input name="transactionId" type="text" required placeholder="e.g. 8XC29..." className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 py-3 px-4 border" />
                            </div>

                            <button type="submit" className="w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-lg shadow-sm text-lg font-bold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition transform hover:-translate-y-0.5">
                                Submit Payment Details <ArrowRight className="ml-2 w-5 h-5" />
                            </button>
                        </form>
                    </div>
                </div>

                <p className="text-center text-sm text-gray-400 mt-8">
                    Your subscription will be activated within 24 hours after verification.
                </p>
            </div>
        </div >
    );
}
