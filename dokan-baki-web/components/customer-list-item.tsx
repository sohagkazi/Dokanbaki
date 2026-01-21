"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Save, X } from "lucide-react";
import DeleteCustomerButton from "./delete-customer-button";

interface CustomerListItemProps {
    shopId: string;
    customer: {
        id: string;
        name: string;
        phone?: string;
        due: number;
    };
}

export default function CustomerListItem({ shopId, customer }: CustomerListItemProps) {
    const router = useRouter();
    const [isAdding, setIsAdding] = useState(false);
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);

    const [paramType, setParamType] = useState<'DUE' | 'PAYMENT'>('DUE');

    async function handleSave() {
        if (!amount || isNaN(Number(amount))) return;
        setLoading(true);

        try {
            const res = await fetch('/api/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    shopId: shopId,
                    customerName: customer.name,
                    amount: Number(amount),
                    type: paramType,
                    date: new Date().toISOString().split('T')[0],
                    mobileNumber: customer.phone
                })
            });

            if (res.ok) {
                setAmount("");
                setIsAdding(false);
                router.refresh(); // Refresh server data
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="px-6 py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition">
            <div className="flex justify-between items-center">
                <Link href={`/customer/${encodeURIComponent(customer.name)}`} className="flex-1 block focus:outline-none">
                    <div>
                        <p className="font-semibold text-gray-800 hover:text-blue-600 transition">{customer.name}</p>
                        <p className="text-sm text-gray-500">{customer.phone}</p>
                    </div>
                </Link>

                <div className="text-right flex items-center gap-4 pl-4">
                    <div className="flex flex-col items-end min-w-[80px]">
                        <p className="text-sm text-gray-500">Due</p>
                        <p className={`font-bold ${customer.due > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            ৳ {customer.due.toLocaleString()}
                        </p>
                    </div>

                    {!isAdding && (
                        <div className="flex gap-2">
                            <button
                                onClick={() => { setIsAdding(true); setParamType('DUE'); }}
                                className="bg-red-50 text-red-600 px-3 py-1.5 rounded-full text-xs font-bold hover:bg-red-100 transition border border-red-100"
                            >
                                + Due
                            </button>
                            <button
                                onClick={() => { setIsAdding(true); setParamType('PAYMENT'); }}
                                className="bg-green-50 text-green-600 px-3 py-1.5 rounded-full text-xs font-bold hover:bg-green-100 transition border border-green-100"
                            >
                                + Pay
                            </button>
                        </div>
                    )}

                    <DeleteCustomerButton customerName={customer.name} />
                </div>
            </div>

            {/* Inline Add Box */}
            {isAdding && (
                <div className="mt-3 flex items-center justify-end gap-2 animate-in slide-in-from-top-2 duration-200">
                    <span className={`text-sm font-medium ${paramType === 'DUE' ? 'text-red-600' : 'text-green-600'}`}>
                        Add {paramType === 'DUE' ? 'Due' : 'Payment'}:
                    </span>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Amount"
                        className="border border-gray-300 rounded px-2 py-1 w-24 text-sm focus:outline-none focus:border-blue-500"
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                    />
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="bg-blue-600 text-white p-1.5 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setIsAdding(false)}
                        className="bg-gray-200 text-gray-600 p-1.5 rounded hover:bg-gray-300"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
}
