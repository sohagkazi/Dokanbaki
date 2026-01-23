import { Bell, Search, LogOut, Crown, User } from 'lucide-react';
import Link from 'next/link';
import { exitShopAction } from '@/app/actions';
import { ThemeConfig } from '@/lib/types';

interface DashboardHeaderProps {
    shopName: string;
    shopImage?: string;
    theme?: ThemeConfig;
}

export default function DashboardHeader({ shopName, shopImage, theme }: DashboardHeaderProps) {
    const accentColor = theme?.primaryColor || '#2563eb';

    return (
        <header className="bg-gray-900 text-white pt-safe-top pb-12 rounded-b-[2.5rem] shadow-2xl relative z-0 overflow-hidden">

            {/* Dynamic Glow Effect based on Shop Color */}
            <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none"
                style={{
                    background: `radial-gradient(circle at 50% 0%, ${accentColor}, transparent 70%)`
                }}></div>

            <div className="px-6 py-4 flex justify-between items-center relative z-10">
                <Link href="/profile" className="flex items-center gap-3 group">
                    <div className="p-[2px] rounded-full" style={{ background: `linear-gradient(135deg, ${accentColor}, #ffffff)` }}>
                        <div className="bg-gray-900 p-0.5 rounded-full">
                            {shopImage ? (
                                <img src={shopImage} alt="Shop" className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg text-white"
                                    style={{ backgroundColor: accentColor }}>
                                    {shopName.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                    </div>
                    <div>
                        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest group-hover:text-gray-200 transition">Welcome Back</p>
                        <h1 className="text-xl font-bold leading-tight flex items-center gap-2">
                            {shopName}
                        </h1>
                    </div>
                </Link>

                <div className="flex gap-3">
                    <Link href="/notifications" className="bg-gray-800/50 p-2.5 rounded-2xl hover:bg-gray-700 transition backdrop-blur-md border border-gray-700 hover:border-gray-500" title="Notifications">
                        <Bell className="w-5 h-5 text-gray-300" />
                    </Link>

                    <Link href="/profile" className="bg-gray-800/50 p-2.5 rounded-2xl hover:bg-gray-700 transition backdrop-blur-md border border-gray-700 hover:border-gray-500" title="Profile">
                        <User className="w-5 h-5 text-gray-300" />
                    </Link>

                    <form action={exitShopAction}>
                        <button type="submit" className="bg-red-500/10 p-2.5 rounded-2xl hover:bg-red-500/20 text-red-400 hover:text-red-300 transition backdrop-blur-md border border-red-500/20 hover:border-red-500/40" title="Exit Shop">
                            <LogOut className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            </div>
        </header>
    );
}
