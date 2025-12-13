'use client';

import { useState } from 'react';
import { Search, User, Phone, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface CustomerDue {
    name: string;
    phone: string;
    totalDue: number;
}

interface SearchClientProps {
    customers: CustomerDue[];
}

export default function SearchClient({ customers }: SearchClientProps) {
    const [query, setQuery] = useState('');

    const filteredCustomers = query.trim() === ''
        ? []
        : customers.filter(c =>
            c.name.toLowerCase().includes(query.toLowerCase()) ||
            (c.phone && c.phone.includes(query))
        );

    return (
        <div className="space-y-6">
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-4 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm shadow-sm"
                    placeholder="Search by name or mobile number..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    autoFocus
                />
            </div>

            {query.trim() !== '' && (
                <div className="space-y-4">
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                        Results ({filteredCustomers.length})
                    </h2>

                    {filteredCustomers.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            No customers found matching "{query}"
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
                            {filteredCustomers.map((customer, idx) => (
                                <Link
                                    href={`/customer/${encodeURIComponent(customer.name)}`}
                                    key={idx}
                                    className="p-4 flex items-center justify-between hover:bg-gray-50 transition block"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="bg-cyan-50 p-2 rounded-full">
                                            <User className="w-5 h-5 text-cyan-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800">{customer.name}</p>
                                            <div className="flex items-center text-xs text-gray-500 mt-0.5">
                                                <Phone className="w-3 h-3 mr-1" />
                                                {customer.phone || 'No match'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`font-bold ${customer.totalDue > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                            {customer.totalDue > 0 ? 'Due' : 'Paid'} ৳ {Math.abs(customer.totalDue).toLocaleString()}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {query.trim() === '' && (
                <div className="text-center py-12 text-gray-400">
                    <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>Start typing to search for customers...</p>
                </div>
            )}
        </div>
    );
}
