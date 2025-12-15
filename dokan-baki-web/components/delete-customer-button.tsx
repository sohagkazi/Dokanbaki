"use client";

import { Trash2 } from "lucide-react";
import { deleteCustomerAction } from "@/app/actions";

interface DeleteCustomerButtonProps {
    customerName: string;
}

export default function DeleteCustomerButton({ customerName }: DeleteCustomerButtonProps) {
    const handleDelete = async () => {
        const isConfirmed = window.confirm(`Are you sure you want to delete ${customerName}? This will remove all their transaction history.`);
        if (isConfirmed) {
            await deleteCustomerAction(customerName);
        }
    };

    return (
        <button
            onClick={handleDelete}
            className="p-2.5 bg-red-50 text-red-600 rounded-full hover:bg-red-600 hover:text-white transition shadow-sm z-10"
            title="Delete Customer"
        >
            <Trash2 className="w-5 h-5" />
        </button>
    );
}
