"use client";

import { Trash2, AlertTriangle, X } from "lucide-react";
import { deleteCustomerAction } from "@/app/actions";
import { useState, useEffect } from "react";

interface DeleteCustomerButtonProps {
    customerName: string;
}

export default function DeleteCustomerButton({ customerName }: DeleteCustomerButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Small delay to allow render before animation starts
            requestAnimationFrame(() => setIsAnimating(true));
        } else {
            setIsAnimating(false);
        }
    }, [isOpen]);

    const handleDelete = async () => {
        await deleteCustomerAction(customerName);
        setIsOpen(false);
    };

    const openModal = () => setIsOpen(true);
    const closeModal = () => {
        setIsAnimating(false);
        // Wait for animation to finish before unmounting
        setTimeout(() => setIsOpen(false), 300);
    };

    return (
        <>
            <button
                onClick={openModal}
                className="p-2.5 bg-red-50 text-red-600 rounded-full hover:bg-red-600 hover:text-white transition shadow-sm z-10"
                title="Delete Customer"
            >
                <Trash2 className="w-5 h-5" />
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isAnimating ? "opacity-100" : "opacity-0"}`}
                        onClick={closeModal}
                    />

                    {/* Modal Content */}
                    <div
                        className={`
                            relative bg-white text-center rounded-2xl shadow-xl w-full max-w-sm p-6 transform transition-all duration-500 ease-out
                            ${isAnimating ? "translate-y-0 opacity-100 scale-100" : "translate-y-[100%] opacity-0 scale-95"}
                        `}
                    >
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Customer?</h3>
                        <p className="text-gray-500 mb-6">
                            Are you sure you want to delete <span className="font-semibold text-gray-800">{customerName}</span>? This action cannot be undone.
                        </p>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2.5 rounded-lg border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 shadow-md shadow-red-200 transition"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
