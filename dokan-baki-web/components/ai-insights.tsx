'use client';

import { Lightbulb, AlertTriangle, TrendingUp, CheckCircle, BrainCircuit } from "lucide-react";
import { useEffect, useState } from "react";

export default function AIInsights({ transactions, customers }: { transactions: any[], customers: any[] }) {
    const [tips, setTips] = useState<any[]>([]);

    useEffect(() => {
        // "AI" Logic to generate insights
        const newTips = [];

        // 1. High Risk Customers
        const highRisk = customers.filter(c => c.totalDue > 5000);
        if (highRisk.length > 0) {
            newTips.push({
                type: 'warning',
                icon: AlertTriangle,
                text: `${highRisk.length} customers have over ৳ 5,000 due. Consider sending reminders.`,
                color: 'text-amber-600 bg-amber-50 border-amber-200'
            });
        }

        // 2. Collection Streak
        const today = new Date().toISOString().split('T')[0];
        const todaysCollection = transactions
            .filter((t: any) => t.type === 'PAYMENT' && t.date === today)
            .reduce((sum: number, t: any) => sum + t.amount, 0);

        if (todaysCollection > 0) {
            newTips.push({
                type: 'success',
                icon: TrendingUp,
                text: `Great job! You collected ৳ ${todaysCollection.toLocaleString()} today.`,
                color: 'text-green-600 bg-green-50 border-green-200'
            });
        }

        // 3. Inactive Customers (Simple check)
        // (skipped for now as we need complex date logic)

        // 4. General Tip
        if (newTips.length === 0) {
            newTips.push({
                type: 'info',
                icon: Lightbulb,
                text: "AI Tip: Regular reminders increase collection rates by 40%.",
                color: 'text-blue-600 bg-blue-50 border-blue-200'
            });
        }

        setTips(newTips);
    }, [transactions, customers]);

    if (tips.length === 0) return null;

    return (
        <div className="mb-6 space-y-3">
            <div className="flex items-center gap-2 mb-2 px-1">
                <BrainCircuit className="w-4 h-4 text-purple-600" />
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">AI Insights</h3>
            </div>

            <div className="grid gap-3">
                {tips.map((tip, idx) => (
                    <div key={idx} className={`p-4 rounded-xl border flex items-start gap-3 ${tip.color}`}>
                        <div className="mt-0.5">
                            <tip.icon className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-medium text-sm">{tip.text}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
