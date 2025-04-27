'use client';

import { useState, useEffect } from "react";
import FeedbackForm from "./components/FeedbackForm";
import SummariesList from "./components/SummariesList";
import TrustBanner from "./components/TrustBanner";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';

type Summary = {
  id: number;
  content: string;
  created_at: string;
};

export default function Home() {
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [lastSummarizedAt, setLastSummarizedAt] = useState<string | null>(null);

  const handleGetSummaries = async () => {
    try {
      const response = await fetch(`${BASE_URL}/summaries`);
      const data: Summary[] = await response.json();
      setSummaries(data);
      if (data.length > 0) {
        setLastSummarizedAt(new Date(data[0].created_at).toLocaleString());
      }
    } catch (error) {
      console.error('Error fetching summaries:', error);
    }
  };

  useEffect(() => {
    handleGetSummaries();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-950 gap-8">
      <TrustBanner />
      <FeedbackForm onSummariesUpdate={handleGetSummaries} />
      <SummariesList summaries={summaries} lastSummarizedAt={lastSummarizedAt} />
    </div>
  );
}
