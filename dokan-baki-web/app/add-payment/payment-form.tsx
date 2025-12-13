'use client';

import { useState } from 'react';
import { Search, User, Phone, CheckCircle, DollarSign, X } from 'lucide-react';
import { savePaymentEntry } from '../actions';

interface Customer {
    name: string;
    phone: string;
    totalDue: number;
}

interface PaymentFormProps {
    customers: Customer[];
}

export default function PaymentForm({ customers }: PaymentFormProps) {
    const [query, setQuery] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

    const filteredCustomers = query.trim() === ''
        ? customers
        : customers.filter(c =>
            c.name.toLowerCase().includes(query.toLowerCase()) ||
            (c.phone && c.phone.includes(query))
        );

    const handleSelect = (customer: Customer) => {
        setSelectedCustomer(customer);
        setQuery('');
    };

    const clearSelection = () => {
        setSelectedCustomer(null);
        setQuery('');
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Header / Selection State */}
            <div className="p-6 bg-gradient-to-b from-green-50 to-white border-b border-gray-100">
                {!selectedCustomer ? (
                    <div className="space-y-4">
                        <label className="text-sm font-semibold text-gray-700 ml-1">Select Customer</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition shadow-sm"
                                placeholder="Search name or mobile..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-green-100 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="bg-green-100 p-2 rounded-full">
                                <User className="w-5 h-5 text-green-700" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800">{selectedCustomer.name}</h3>
                                <div className="flex items-center text-gray-500 text-xs mt-0.5">
                                    <Phone className="w-3 h-3 mr-1" />
                                    {selectedCustomer.phone || 'No Phone'}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={clearSelection}
                            className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition"
                            title="Clear Selection"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>

            {/* List or Form */}
            <div className="p-6">
                {!selectedCustomer ? (
                    <div className="max-h-[60vh] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                        {filteredCustomers.length === 0 ? (
                            <div className="text-center py-8 text-gray-400">
                                <p>No customers found.</p>
                            </div>
                        ) : (
                            filteredCustomers.map((customer, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSelect(customer)}
                                    className="w-full text-left p-3 rounded-lg hover:bg-green-50 hover:border-green-100 border border-transparent transition flex items-center justify-between group"
                                >
                                    <div>
                                        <p className="font-semibold text-gray-700 group-hover:text-green-800 transition">{customer.name}</p>
                                        <p className="text-xs text-gray-400 group-hover:text-green-600/70">{customer.phone}</p>
                                    </div>
                                    <div className={`text-sm font-medium px-2 py-1 rounded-md ${customer.totalDue > 0 ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                                        {customer.totalDue > 0 ? `Due: ৳ ${customer.totalDue}` : 'No Due'}
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                ) : (
                    <form action={savePaymentEntry} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <input type="hidden" name="customerName" value={selectedCustomer.name} />
                        <input type="hidden" name="mobileNumber" value={selectedCustomer.phone} />

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 ml-1">Payment Amount</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <DollarSign className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    name="amount"
                                    type="number"
                                    placeholder="0.00"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all font-mono text-lg"
                                    required
                                    autoFocus
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <span className="text-gray-400 text-sm font-medium">BDT</span>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 ml-1">
                                Current Due: <span className="font-semibold text-gray-700">৳ {selectedCustomer.totalDue.toLocaleString()}</span>
                            </p>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                        >
                            <CheckCircle className="w-5 h-5" />
                            Confirm Payment
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
