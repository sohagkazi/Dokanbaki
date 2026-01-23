'use client';

import { useState, useRef, useEffect } from 'react'; // Removed unused imports
import { Send, Bot, X, MessageCircle, User, Loader2, RefreshCw } from 'lucide-react';
import { useChat } from '@ai-sdk/react'; // Correct import for Next.js App Router

export function AiChatWidget() {
    const [isOpen, setIsOpen] = useState(false);

    // Explicitly handle errors
    const { messages, input, handleInputChange, handleSubmit, isLoading, error, reload } = useChat({
        api: '/api/chat',
        initialMessages: [
            {
                id: 'welcome',
                role: 'system',
                content: 'Hello! I am your Dokan Baki assistant. Ask me anything about your shop!',
                createdAt: new Date(),
            }
        ],
        onError: (err) => {
            console.error("Chat Error:", err);
            // Optional: Show toast or alert
        }
    });

    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen, isLoading]);

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 z-50 flex items-center justify-center group animate-in fade-in zoom-in"
            >
                <div className="relative">
                    <MessageCircle className="w-8 h-8" />
                    <span className="absolute top-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></span>
                </div>
                <span className="absolute right-full mr-3 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                    Chat with AI
                </span>
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 w-80 sm:w-96 h-[500px] max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">

            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white flex justify-between items-center shadow-md">
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
                        <Bot className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm">Assistant</h3>
                        <p className="text-[10px] text-blue-100 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                            Always Active
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setIsOpen(false)}
                    className="hover:bg-white/20 p-1.5 rounded-full transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 scroll-smooth" ref={scrollRef}>
                {messages.map((m) => (
                    <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                        <div className={`flex gap-2 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>

                            {/* Avatar */}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${m.role === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-white text-blue-600 border border-gray-100'
                                }`}>
                                {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                            </div>

                            {/* Bubble */}
                            <div className={`p-3 text-sm shadow-sm ${m.role === 'user'
                                ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm'
                                : 'bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-tl-sm'
                                }`}>
                                {m.content}
                            </div>
                        </div>
                    </div>
                ))}

                {/* Loading Indicator */}
                {isLoading && (
                    <div className="flex justify-start animate-in fade-in">
                        <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5 w-16">
                            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></span>
                            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-75"></span>
                            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-150"></span>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="flex flex-col items-center justify-center p-4 text-center">
                        <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg mb-2">
                            Failed to send message. Please try again.
                        </p>
                        <button
                            onClick={() => reload()}
                            className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-gray-800 transition"
                        >
                            <RefreshCw className="w-3 h-3" /> Retry
                        </button>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-gray-100">
                <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-full border border-gray-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all duration-200 shadow-sm">
                    <input
                        className="flex-1 bg-transparent px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none min-w-0"
                        value={input}
                        onChange={handleInputChange}
                        placeholder="Type a message..."
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input?.trim()}
                        className="bg-blue-600 w-9 h-9 text-white rounded-full flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 disabled:scale-95 transition-all duration-200 shadow-sm"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
                    </button>
                </div>
            </form>

        </div>
    );
}
