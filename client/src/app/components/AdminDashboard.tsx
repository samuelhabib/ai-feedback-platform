'use client';

import { useState } from "react";
import { toast } from "react-hot-toast";
import { ShieldCheckIcon, FileLockIcon } from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';

type AdminDashboardProps = {
    onSummariesUpdate: () => Promise<void>;
};

export default function AdminDashboard({ onSummariesUpdate }: AdminDashboardProps) {
    const [loadingForceSummarize, setLoadingForceSummarize] = useState(false);

    const handleForceSummarize = async () => {
        setLoadingForceSummarize(true);
        try {
            const response = await fetch(`${BASE_URL}/summarize-force`);
            if (response.ok) {
                toast.success('Forced summarization completed!', { style: { background: '#1a1a1a', color: '#00FFAB' } });
                await onSummariesUpdate();
            } else {
                toast.error('Failed to force summarize.', { style: { background: '#1a1a1a', color: '#FF6B6B' } });
            }
        } catch (error) {
            console.error('Error forcing summarize:', error);
            toast.error('Error forcing summarize.', { style: { background: '#1a1a1a', color: '#FF6B6B' } });
        } finally {
            setLoadingForceSummarize(false);
        }
    };

    return (
        <div className="bg-gray-900/60 backdrop-blur-md border border-gray-700 rounded-2xl shadow-xl p-6 w-full max-w-3xl flex flex-col items-center gap-6 mt-12">
            <div className="flex items-center gap-2">
                <ShieldCheckIcon size={24} className="text-red-400" />
                <h2 className="text-2xl font-bold text-gray-100">Admin Dashboard</h2>
            </div>

            <p className="text-gray-400 text-sm text-center">
                Admins can force summarization even when there are fewer than 10 feedbacks.
            </p>

            <button
                onClick={handleForceSummarize}
                disabled={loadingForceSummarize}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 text-sm rounded-xl disabled:opacity-50 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
            >
                {loadingForceSummarize ? (
                    <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Summarizing...</span>
                    </>
                ) : (
                    <>
                        <FileLockIcon size={18} />
                        <span>Force Summarize</span>
                    </>
                )}
            </button>
        </div>
    );
}
