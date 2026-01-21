"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, X } from "lucide-react";

interface Props {
    customerName: string;
    customerPhone?: string; // Optional
    shopId: string;
}

export default function CustomerTransactionActions({ customerName, customerPhone, shopId }: Props) {
    const router = useRouter();
    const [isAdding, setIsAdding] = useState(false);
    const [paramType, setParamType] = useState<'DUE' | 'PAYMENT'>('DUE');
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSave() {
        if (!amount || isNaN(Number(amount))) return;
        setLoading(true);

        try {
            const res = await fetch('/api/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    shopId,
                    customerName,
                    amount: Number(amount),
                    type: paramType,
                    date: new Date().toISOString().split('T')[0],
                    mobileNumber: customerPhone
                })
            });

            if (res.ok) {
                setAmount("");
                setIsAdding(false);
                router.refresh();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    if (isAdding) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className={`text-lg font-bold ${paramType === 'DUE' ? 'text-red-600' : 'text-green-600'}`}>
                        Add New {paramType === 'DUE' ? 'Due' : 'Payment'}
                    </h3>
                    <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex gap-3">
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Enter Amount"
                        className="flex-1 text-lg border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                    />
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold transition flex items-center gap-2 disabled:opacity-50"
                    >
                        <Save className="w-5 h-5" />
                        Save
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-3">
            <button
                onClick={() => { setIsAdding(true); setParamType('DUE'); }}
                className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 py-3 rounded-lg font-bold text-center border border-red-200 transition"
            >
                + Add Due
            </button>
            <button
                onClick={() => { setIsAdding(true); setParamType('PAYMENT'); }}
                className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 py-3 rounded-lg font-bold text-center border border-green-200 transition"
            >
                + Add Payment
            </button>
        </div>
    );
}
