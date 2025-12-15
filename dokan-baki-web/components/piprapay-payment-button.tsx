"use client";

import { useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";

interface PiprapayPaymentButtonProps {
    amount: number;
    plan: string;
    userId: string;
}

export default function PiprapayPaymentButton({ amount, plan, userId }: PiprapayPaymentButtonProps) {
    const [loading, setLoading] = useState(false);

    const handlePayment = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/payment/piprapay/init', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount, plan, userId })
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                alert('Payment initiation failed: ' + (data.error || 'Unknown error'));
                setLoading(false);
            }
        } catch (error) {
            console.error(error);
            alert('Something went wrong');
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-6 rounded-xl transition flex items-center justify-center gap-3 shadow-lg transform hover:-translate-y-1 mb-4"
        >
            {loading ? <Loader2 className="animate-spin w-6 h-6" /> : <CreditCard className="w-6 h-6" />}
            <span>Pay with Piprapay</span>
        </button>
    );
}
