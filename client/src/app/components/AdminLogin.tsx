'use client';

import { useState } from "react";
import { toast } from "react-hot-toast";
import { LockIcon } from "lucide-react";

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123'; // fallback

type AdminLoginProps = {
    onLoginSuccess: () => void;
};

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
    const [passwordInput, setPasswordInput] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = () => {
        setLoading(true);

        setTimeout(() => { // fake loading animation
            if (passwordInput === ADMIN_PASSWORD) {
                toast.success('Admin login successful!');
                onLoginSuccess();
            } else {
                toast.error('Incorrect password.');
            }
            setLoading(false);
        }, 700);
    };

    return (
        <div className="bg-gray-900/60 backdrop-blur-md border border-gray-700 rounded-2xl shadow-xl p-6 w-full max-w-md flex flex-col items-center gap-6 mt-12">
            <div className="flex items-center gap-2">
                <LockIcon size={24} className="text-yellow-400" />
                <h2 className="text-2xl font-bold text-gray-100">Admin Login</h2>
            </div>

            <input
                type="password"
                className="w-full p-3 rounded-lg border border-gray-700 bg-gray-800 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="Enter Admin Password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
            />

            <button
                onClick={handleLogin}
                disabled={loading}
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 text-sm rounded-xl disabled:opacity-50 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
            >
                {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                    "Login"
                )}
            </button>
        </div>
    );
}
