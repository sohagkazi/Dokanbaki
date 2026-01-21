import Link from "next/link";
import Image from "next/image";
import { getTransactions, getShopById } from "@/lib/db";
import { getCurrentShopId } from "@/lib/auth";
import { Plus, Minus, FileText, ArrowRight, TrendingUp, Users, CheckCircle, Shield, BookOpen, Bell, BarChart, ChevronRight, Play, Star, Crown } from "lucide-react";
import DashboardHeader from "@/components/dashboard-header";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const shopId = await getCurrentShopId();

  // DASHBOARD VIEW (Logged In)
  if (shopId) {
    const shop = await getShopById(shopId);
    const transactions = await getTransactions(shopId);

    // Calculate Stats
    const customerBalances = new Map<string, number>();

    transactions.forEach((t: any) => {
      const current = customerBalances.get(t.customerName) || 0;
      if (t.type === 'DUE') {
        customerBalances.set(t.customerName, current + t.amount);
      } else {
        customerBalances.set(t.customerName, current - t.amount);
      }
    });

    const totalDue = Array.from(customerBalances.values())
      .filter(balance => balance > 0)
      .reduce((sum, balance) => sum + balance, 0);

    const today = new Date().toISOString().split('T')[0];
    const todaysCollection = transactions
      .filter((t: any) => t.type === 'PAYMENT' && t.date === today)
      .reduce((sum: number, t: any) => sum + t.amount, 0);

    const newCustomers = new Set(transactions.map((t: any) => t.customerName)).size;

    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans pb-24">

        {/* Header */}
        <DashboardHeader shopName={shop?.name || 'My Shop'} shopImage={shop?.image} />

        <main className="px-4 -mt-8 relative z-10">

          {/* Main Stats Card */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 mb-8 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <TrendingUp className="w-32 h-32 transform -rotate-12 translate-x-8 -translate-y-8" />
            </div>

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-2">
                <span className="text-blue-200 font-medium text-xs uppercase tracking-wider bg-white/10 px-2 py-1 rounded-lg">Total Outstanding</span>
                <div className="bg-white/20 p-1.5 rounded-full backdrop-blur-md">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
              </div>

              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-extrabold tracking-tight">৳ {totalDue.toLocaleString()}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
                <div>
                  <p className="text-blue-200 text-xs font-medium mb-1">Today's Collection</p>
                  <p className="text-white font-bold text-lg">+ ৳ {todaysCollection.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-blue-200 text-xs font-medium mb-1">Active Customers</p>
                  <p className="text-white font-bold text-lg">{newCustomers}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions - Primary */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <Link href="/add-due" className="group relative overflow-hidden bg-white p-5 rounded-2xl shadow-sm hover:shadow-lg border border-red-100/50 hover:border-red-200 transition-all duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-50/50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110 duration-500"></div>
              <div className="relative z-10">
                <div className="bg-gradient-to-br from-red-100 to-red-50 w-12 h-12 rounded-xl flex items-center justify-center text-red-600 mb-4 shadow-inner">
                  <Minus className="w-6 h-6" strokeWidth={2.5} />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">Add Due</h3>
                <p className="text-red-500 text-xs font-medium mt-1">Given to Customer</p>
              </div>
            </Link>

            <Link href="/add-payment" className="group relative overflow-hidden bg-white p-5 rounded-2xl shadow-sm hover:shadow-lg border border-green-100/50 hover:border-green-200 transition-all duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 bg-green-50/50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110 duration-500"></div>
              <div className="relative z-10">
                <div className="bg-gradient-to-br from-green-100 to-green-50 w-12 h-12 rounded-xl flex items-center justify-center text-green-600 mb-4 shadow-inner">
                  <Plus className="w-6 h-6" strokeWidth={2.5} />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">Add Payment</h3>
                <p className="text-green-500 text-xs font-medium mt-1">Received Cash</p>
              </div>
            </Link>
          </div>

          {/* Secondary Actions */}
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 px-1">Menu</h3>
          <div className="grid grid-cols-3 gap-3 mb-8">
            <Link href="/customers" className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100/50 text-center hover:bg-gray-50 hover:shadow-md transition-all duration-200 flex flex-col items-center">
              <div className="bg-blue-50 w-10 h-10 rounded-full flex items-center justify-center text-blue-600 mb-2">
                <Users className="w-5 h-5" />
              </div>
              <p className="text-sm font-bold text-gray-700">Customers</p>
            </Link>
            <Link href="/due-list" className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100/50 text-center hover:bg-gray-50 hover:shadow-md transition-all duration-200 flex flex-col items-center">
              <div className="bg-orange-50 w-10 h-10 rounded-full flex items-center justify-center text-orange-600 mb-2">
                <FileText className="w-5 h-5" />
              </div>
              <p className="text-sm font-bold text-gray-700">Due List</p>
            </Link>
            <Link href="/payment-list" className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100/50 text-center hover:bg-gray-50 hover:shadow-md transition-all duration-200 flex flex-col items-center">
              <div className="bg-purple-50 w-10 h-10 rounded-full flex items-center justify-center text-purple-600 mb-2">
                <FileText className="w-5 h-5" />
              </div>
              <p className="text-sm font-bold text-gray-700">Payment List</p>
            </Link>

          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100/50 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
              <h3 className="font-bold text-gray-800 text-lg">Recent Activity</h3>
              <Link href="/customers" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center bg-blue-50 px-3 py-1.5 rounded-full transition-colors">
                View All <ArrowRight className="w-3 h-3 ml-1" />
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {transactions.length === 0 ? (
                <div className="p-10 text-center text-gray-400">
                  <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-300">
                    <FileText className="w-8 h-8" />
                  </div>
                  <p className="font-medium text-gray-500">No transactions yet.</p>
                  <p className="text-xs mt-1">Add your first due or payment.</p>
                </div>
              ) : (
                transactions.slice().reverse().slice(0, 5).map((tx: any) => (
                  <div key={tx.id} className="px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white ${tx.type === 'PAYMENT' ? 'bg-green-600' : 'bg-red-500'}`}>
                        {tx.customerName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{tx.customerName}</p>
                        <p className="text-xs text-gray-500">{tx.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-base ${tx.type === 'PAYMENT' ? 'text-green-600' : 'text-red-500'}`}>
                        {tx.type === 'PAYMENT' ? '+' : '-'} ৳ {tx.amount.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                        {tx.type === 'PAYMENT' ? 'RECEIVED' : 'GIVEN'}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </main>
      </div>
    );
  }

  // LANDING PAGE (Guest)
  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">
      {/* Navbar */}
      <nav className="relative z-50 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0 border-b sm:border-none border-gray-100">
        <Link href="/" className="text-xl font-bold text-blue-600 flex items-center gap-2">
          <span>Dokan Baki</span>
        </Link>
        <div className="flex items-center space-x-6">

          <Link href="/login" className="text-gray-600 hover:text-blue-600 font-medium">Login</Link>
          <Link href="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full font-bold transition shadow-lg shadow-blue-500/30">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 w-full overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-16 sm:pb-24 text-center">
          <div className="w-full max-w-4xl mx-auto relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] sm:text-xs font-bold uppercase tracking-wide mb-6">
              <Star className="w-3 h-3 fill-blue-700" /> New: WhatsApp Reminders
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.1] mb-6">
              Digital Khata for <br className="hidden sm:block" /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Smart Shopkeepers</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-500 mb-8 leading-relaxed max-w-2xl mx-auto font-medium">
              Stop losing money to unrecorded dues. Track every penny, manage customers, and collect faster.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto">
              <Link href="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl shadow-blue-500/30 transition transform hover:-translate-y-1 w-full sm:w-auto flex justify-center items-center">
                Get Started Free
              </Link>
              <Link href="/login" className="bg-gray-50 hover:bg-gray-100 text-gray-800 px-8 py-4 rounded-full font-bold text-lg transition flex items-center justify-center gap-2 border border-gray-200 w-full sm:w-auto">
                <Play className="w-5 h-5 fill-gray-800" /> Demo Video
              </Link>
            </div>
            <p className="mt-6 text-sm text-gray-400 font-medium flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" /> No credit card required
              <span className="hidden sm:inline">•</span>
              <CheckCircle className="w-4 h-4 text-green-500 sm:hidden" /> Free forever plan
            </p>
          </div>

        </div>

        {/* Features Grid */}
        <div className="bg-gray-50 py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-4">Everything you need</h2>
              <p className="text-base sm:text-lg text-gray-500">Replace your paper khata with a smart, secure, and automated digital ledger.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {[
                { icon: BookOpen, color: 'blue', title: 'Digital Ledger', desc: 'Record daily transactions instantly. Keep track of every Baki.' },
                { icon: Bell, color: 'green', title: 'Payment Reminders', desc: 'Send automatic SMS or WhatsApp reminders to customers.' },
                { icon: Shield, color: 'purple', title: '100% Secure', desc: 'Your data is encrypted and backed up daily. Never lose data.' },
                { icon: BarChart, color: 'orange', title: 'Business Reports', desc: 'View daily, weekly, and monthly reports of your profit.' }
              ].map((feature, idx) => (
                <div key={idx} className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
                  <div className={`w-12 h-12 bg-${feature.color}-50 rounded-xl flex items-center justify-center text-${feature.color}-600 mb-4 sm:mb-6`}>
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-lg sm:text-xl text-gray-900 mb-2 sm:mb-3">{feature.title}</h3>
                  <p className="text-sm sm:text-base text-gray-500 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="py-16 sm:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-black">How it works</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8 text-center relative">
              <div className="absolute top-12 left-0 w-full h-0.5 bg-gray-100 hidden md:block -z-10"></div>

              {[
                { step: 1, title: 'Create Account', desc: 'Sign up in seconds.' },
                { step: 2, title: 'Add Customers', desc: 'Add profiles for customers.' },
                { step: 3, title: 'Record Data', desc: 'Log dues and payments.' }
              ].map((item, idx) => (
                <div key={idx} className="bg-white pt-4 relative">
                  {idx !== 2 && <div className="md:hidden absolute bottom-[-1rem] left-1/2 transform -translate-x-1/2 text-gray-300">
                    <ChevronRight className="w-6 h-6 rotate-90" />
                  </div>}
                  <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 sm:mb-6 shadow-lg shadow-blue-200 ring-4 ring-white">
                    {item.step}
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-black">{item.title}</h3>
                  <p className="text-black px-4 sm:px-8 text-sm sm:text-base">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-50 py-8 sm:py-12 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-700">Dokan Baki</span>
          </div>
          <div className="text-center md:text-right">
            &copy; {new Date().getFullYear()} Dokan Baki. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
