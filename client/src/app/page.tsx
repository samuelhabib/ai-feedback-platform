'use client';

import { useState } from "react";
import { toast } from 'react-hot-toast';

// Setup dynamic backend URL
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';

type Summary = {
  id: number;
  content: string;
  created_at: string;
};

export default function Home() {
  const [feedbackText, setFeedbackText] = useState('');
  const [summaries, setSummaries] = useState<string[]>([]);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [loadingSummarize, setLoadingSummarize] = useState(false);
  const [loadingSummaries, setLoadingSummaries] = useState(false);

  const handleSubmit = async () => {
    setLoadingSubmit(true);
    try {
      const response = await fetch(`${BASE_URL}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback: feedbackText }),
      });

      if (response.ok) {
        toast.success('Feedback submitted successfully!');
        setFeedbackText('');
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
      const response = await fetch(`${BASE_URL}/summarize`);

      if (response.ok) {
        toast.success('Feedback summarized successfully!');
      } else {
        toast('No new feedback to summarize.');
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
      const response = await fetch(`${BASE_URL}/summaries`);
      const data: Summary[] = await response.json();
      if (data.length === 0) {
        toast('No summaries yet.');
      } else {
        toast.success('Summaries loaded!');
      }
      setSummaries(data.map((summary) => summary.content));
    } catch (error) {
      console.error('Error fetching summaries:', error);
      toast.error('Error fetching summaries.');
    } finally {
      setLoadingSummaries(false);
    }
  };


  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-50 dark:bg-gray-900 gap-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4">Submit Feedback</h1>
      <textarea
        className="w-full max-w-md h-40 p-4 border border-gray-300 dark:border-gray-700 rounded-lg resize-none text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800"
        placeholder="Write your feedback here..."
        value={feedbackText}
        onChange={(e) => setFeedbackText(e.target.value)}
      />
      <div className="flex gap-4 flex-wrap justify-center">
        <button
          onClick={handleSubmit}
          disabled={loadingSubmit}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg disabled:opacity-50"
        >
          {loadingSubmit ? 'Submitting...' : 'Submit Feedback'}
        </button>

        <button
          onClick={handleSummarize}
          disabled={loadingSummarize}
          className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-6 rounded-lg disabled:opacity-50"
        >
          {loadingSummarize ? 'Summarizing...' : 'Summarize'}
        </button>

        <button
          onClick={handleGetSummaries}
          disabled={loadingSummaries}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg disabled:opacity-50"
        >
          {loadingSummaries ? 'Loading Summaries...' : 'Get Summaries'}
        </button>
      </div>

      {summaries.length > 0 ? (
        <div className="mt-8 w-full max-w-2xl">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">Summaries:</h2>
          <ul className="space-y-4">
            {summaries.map((summary, idx) => (
              <li key={idx} className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                {summary}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-8 text-gray-500 dark:text-gray-400">No summaries yet. Submit feedback to get started!</p>
      )}
    </div>
  );
}
