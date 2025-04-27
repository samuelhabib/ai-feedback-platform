'use client';

import { useState } from "react";
import { toast } from "react-hot-toast";
import { LockIcon, UploadIcon, FileTextIcon } from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';

type FeedbackFormProps = {
    onSummariesUpdate: () => Promise<void>; // callback to refresh summaries when needed
};

type Feedback = {
    id: number;
    content: string;
    created_at: string;
    summarized: boolean;
};

export default function FeedbackForm({ onSummariesUpdate }: FeedbackFormProps) {
    const [feedbackText, setFeedbackText] = useState('');
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const [loadingSummarize, setLoadingSummarize] = useState(false);
    const [loadingSummaries, setLoadingSummaries] = useState(false);

    const handleSubmit = async () => {
        if (!feedbackText.trim()) {
            toast.error('Please write some feedback.');
            return;
        }

        setLoadingSubmit(true);
        try {
            const response = await fetch(`${BASE_URL}/submit`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ feedback: feedbackText }),
            });

            if (response.ok) {
                toast.success('Feedback submitted securely!');
                setFeedbackText('');
                await onSummariesUpdate();
            } else {
                toast.error('Failed to submit feedback.');
            }
        } catch (error) {
            console.error('Error submitting feedback:', error);
            toast.error('Error submitting feedback.');
        } finally {
            setLoadingSubmit(false);
        }
    };

    const handleSummarize = async () => {
        setLoadingSummarize(true);
        try {
            const feedbackResponse = await fetch(`${BASE_URL}/feedback`);
            const feedbacks: Feedback[] = await feedbackResponse.json();

            const unsummarizedCount = feedbacks.filter(f => !f.summarized).length;

            if (unsummarizedCount >= 10) {
                const summarizeResponse = await fetch(`${BASE_URL}/summarize`);
                if (summarizeResponse.ok) {
                    toast.success('Feedback summarized successfully!');
                    await onSummariesUpdate();
                } else {
                    toast.error('Failed to summarize feedback.');
                }
            } else {
                toast('Not enough feedback to summarize yet.');
            }
        } catch (error) {
            console.error('Error summarizing feedback:', error);
            toast.error('Error summarizing feedback.');
        } finally {
            setLoadingSummarize(false);
        }
    };

    const handleGetSummaries = async () => {
        setLoadingSummaries(true);
        try {
            await onSummariesUpdate();
            toast.success('Summaries refreshed!');
        } catch (error) {
            console.error('Error refreshing summaries:', error);
            toast.error('Error refreshing summaries.');
        } finally {
            setLoadingSummaries(false);
        }
    };

    return (
        <div className="bg-gray-900/60 backdrop-blur-md border border-gray-700 rounded-2xl shadow-xl p-8 w-full max-w-3xl flex flex-col items-center gap-6">
            <div className="flex items-center gap-2">
                <LockIcon size={24} className="text-blue-400" />
                <h1 className="text-3xl font-bold text-gray-100">Submit Secure Feedback</h1>
            </div>

            <textarea
                className={`w-full max-w-3xl h-52 md:h-60 p-4 border border-gray-700 rounded-xl resize-none text-gray-100 bg-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-opacity duration-300 ${loadingSubmit ? 'opacity-80' : 'opacity-100'}`}
                placeholder="Write your feedback here..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
            />

            <div className="flex gap-4 flex-wrap justify-center">
                <button
                    onClick={handleSubmit}
                    disabled={loadingSubmit}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 text-sm rounded-xl disabled:opacity-50 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
                >
                    {loadingSubmit ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Submitting</span>
                        </>
                    ) : (
                        <>
                            <UploadIcon size={18} />
                            <span>Submit Feedback</span>
                        </>
                    )}
                </button>

                <button
                    onClick={handleSummarize}
                    disabled={loadingSummarize}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 text-sm rounded-xl disabled:opacity-50 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
                >
                    {loadingSummarize ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Summarizing</span>
                        </>
                    ) : (
                        <>
                            <FileTextIcon size={18} />
                            <span>Summarize</span>
                        </>
                    )}
                </button>

                <button
                    onClick={handleGetSummaries}
                    disabled={loadingSummaries}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 text-sm rounded-xl disabled:opacity-50 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
                >
                    {loadingSummaries ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Refreshing</span>
                        </>
                    ) : (
                        <>
                            <FileTextIcon size={18} />
                            <span>Get Summaries</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
