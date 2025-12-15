"use client";

import { Check, Bell } from "lucide-react";
import { useState } from "react";
import { markNotificationReadAction } from "@/app/actions";

// Define locally since we might not have access to shared types easily in client component without strict monorepo setup
interface Notification {
    id: string;
    message: string;
    type: string;
    date: string;
    isRead: boolean;
}

export function NotificationList({ initialNotifications }: { initialNotifications: Notification[] }) {
    const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

    const handleMarkRead = async (id: string) => {
        // Optimistic update
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        await markNotificationReadAction(id);
    };

    if (notifications.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bell className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">No Notifications</h3>
                <p className="text-gray-500 mt-1">You're all caught up!</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {notifications.map((notification) => (
                <div
                    key={notification.id}
                    className={`bg-white p-4 rounded-xl border transition-all ${notification.isRead
                            ? "border-gray-100 opacity-75"
                            : "border-blue-100 shadow-md shadow-blue-50 relative overflow-hidden"
                        }`}
                >
                    {!notification.isRead && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                    )}
                    <div className="flex gap-4">
                        <div className={`mt-1 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${notification.type === 'DUE_ALERT' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'
                            }`}>
                            <Bell className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <p className={`text-sm ${notification.isRead ? 'text-gray-600' : 'text-gray-900 font-semibold'}`}>
                                {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                {new Date(notification.date).toLocaleDateString()} • {new Date(notification.date).toLocaleTimeString()}
                            </p>
                        </div>
                        {!notification.isRead && (
                            <button
                                onClick={() => handleMarkRead(notification.id)}
                                className="self-start p-2 text-blue-600 hover:bg-blue-50 rounded-full transition"
                                title="Mark as read"
                            >
                                <Check className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
