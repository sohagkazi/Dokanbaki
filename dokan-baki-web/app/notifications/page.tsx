

import { Bell, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getCurrentShopId } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getShopNotifications } from "@/lib/db";
import { NotificationList } from "./notification-list";

export default async function NotificationsPage() {
    const shopId = await getCurrentShopId();
    if (!shopId) redirect('/');

    const notifications = await getShopNotifications(shopId);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-3">
                    <Link href="/" className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </Link>
                    <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Bell className="w-5 h-5 text-blue-600" /> Notifications
                    </h1>
                </div>
            </div>

            <div className="flex-1 max-w-md mx-auto w-full p-4">
                <NotificationList initialNotifications={notifications} />
            </div>
        </div>
    );
}
