'use client';

import { FileTextIcon } from "lucide-react";

type Summary = {
    id: number;
    content: string;
    created_at: string;
};

type SummariesListProps = {
    summaries: Summary[];
    lastSummarizedAt: string | null;
};

export default function SummariesList({ summaries, lastSummarizedAt }: SummariesListProps) {
    return (
        <div className="w-full max-w-4xl mt-8 px-4">
            <h2 className="text-3xl font-bold text-gray-100 mb-2 flex items-center gap-2">
                <FileTextIcon size={28} />
                Summaries
            </h2>

            {/* Last summarized timestamp */}
            {lastSummarizedAt && (
                <p className="text-gray-500 text-sm mb-6">
                    Last summarized: {lastSummarizedAt}
                </p>
            )}

            {/* List of summaries */}
            {summaries.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                    {summaries.map((summary, index) => (
                        <div
                            key={summary.id}
                            className="bg-gray-900 border border-gray-700 rounded-2xl p-6 shadow hover:shadow-lg transition-all"
                        >
                            <h3 className="text-lg font-semibold text-blue-400 mb-2">
                                Summary {index + 1}
                            </h3>
                            <p className="text-gray-300 whitespace-pre-wrap leading-relaxed text-sm">
                                {summary.content}
                            </p>
                            <p className="text-gray-500 text-xs mt-4 text-right">
                                Created: {new Date(summary.created_at).toLocaleString()}
                            </p>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-gray-400 text-center mt-12">
                    No summaries yet. Submit feedback to get started!
                </div>
            )}
        </div>
    );
}
