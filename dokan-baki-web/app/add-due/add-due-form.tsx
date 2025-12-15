'use client';

import { useState } from 'react';
import Link from "next/link";
import { User, Phone, DollarSign, Calendar, Save, ShoppingBag } from "lucide-react";
import { saveDueEntry } from "../actions";

interface Customer {
    name: string;
    phone?: string;
}

export default function AddDueForm({ customers, prefillName }: { customers: Customer[], prefillName?: string }) {
    const [mobile, setMobile] = useState('');

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        const customer = customers.find(c => c.name === name);
        if (customer && customer.phone) {
            setMobile(customer.phone);
        }
    };

    return (
        <form action={saveDueEntry} className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 space-y-6">

            {/* Customer Name */}
            <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1">Customer Name</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        name="customerName"
                        type="text"
                        list="customer-list"
                        defaultValue={prefillName}
                        onChange={handleNameChange}
                        placeholder="e.g. Rahim Store"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all placeholder:text-gray-400"
                        required
                        autoComplete="off"
                    />
                    <datalist id="customer-list">
                        {customers.map((c, i) => (
                            <option key={i} value={c.name} />
                        ))}
                    </datalist>
                </div>
            </div>

            {/* Mobile Number */}
            <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1">Mobile Number</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        name="mobileNumber"
                        type="tel"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        placeholder="017..."
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all placeholder:text-gray-400"
                        required
                    />
                </div>
            </div>

            {/* Product Name */}
            <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1">Product Name (Optional)</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <ShoppingBag className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        name="productName"
                        type="text"
                        placeholder="e.g. Rice, Oil, etc."
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all placeholder:text-gray-400"
                    />
                </div>
            </div>

            {/* Due Amount */}
            <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1">Due Amount</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <DollarSign className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        name="amount"
                        type="number"
                        placeholder="0.00"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all placeholder:text-gray-400 font-mono text-lg"
                        required
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-400 text-sm font-medium">BDT</span>
                    </div>
                </div>
            </div>

            {/* Date */}
            <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1">Date</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        name="date"
                        type="date"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all text-gray-600"
                        required
                        defaultValue={new Date().toISOString().split('T')[0]}
                    />
                </div>
            </div>
            {/* Expected Payment Date */}
            <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1">Expected Payment Date (Optional)</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        name="dueDate"
                        type="date"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all text-gray-600"
                        placeholder="Select date"
                    />
                    <p className="text-xs text-gray-500 mt-1 ml-1">We will auto-remind the customer if not paid by this date.</p>
                </div>
            </div>

            <div className="pt-4 flex gap-3">
                <Link href="/" className="flex-1 py-3.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 text-center transition">
                    Cancel
                </Link>
                <button
                    type="submit"
                    className="flex-[2] bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                >
                    <Save className="w-5 h-5" />
                    Save Entry
                </button>
            </div>
        </form>
    );
}
