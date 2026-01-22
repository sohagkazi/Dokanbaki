import { Bell, Search, LogOut, Crown, User } from 'lucide-react';
import Link from 'next/link';
import { exitShopAction } from '@/app/actions';

interface DashboardHeaderProps {
    shopName: string;
    shopImage?: string;
}

export default function DashboardHeader({ shopName, shopImage }: DashboardHeaderProps) {
    return (
        <header className="bg-blue-600 text-white pt-safe-top pb-12 rounded-b-[2rem] shadow-lg relative z-0">
            <div className="px-6 py-4 flex justify-between items-center">
                <Link href="/profile" className="flex items-center gap-3">
                    <div className="bg-white/20 p-1 rounded-full backdrop-blur-sm border border-white/30">
                        {shopImage ? (
                            <img src={shopImage} alt="Shop" className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-white/90 text-blue-600 flex items-center justify-center font-bold text-lg">
                                {shopName.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div>
                        <p className="text-blue-100 text-xs font-medium uppercase tracking-wider">Welcome Back</p>
                        <h1 className="text-xl font-bold leading-tight">{shopName}</h1>
                    </div>
                </Link>

                <div className="flex gap-3">
                    <Link href="/notifications" className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition backdrop-blur-md relative" title="Notifications">
                        <Bell className="w-5 h-5 text-white" />
                        {/* We could fetch count here, but for simplicity let's just show the link */}
                        {/* Advanced: Component that fetches count */}
                    </Link>

                    <Link href="/profile" className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition backdrop-blur-md" title="Profile">
                        <User className="w-5 h-5 text-white" />
                    </Link>

                    <Link href="/search" className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition backdrop-blur-md">
                        <Search className="w-5 h-5 text-white" />
                    </Link>
                    <form action={exitShopAction}>
                        <button type="submit" className="bg-white/20 p-2 rounded-full hover:bg-red-500/20 hover:text-red-100 transition backdrop-blur-md text-white/90" title="Exit Shop">
                            <LogOut className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            </div>
        </header>
    );
}
