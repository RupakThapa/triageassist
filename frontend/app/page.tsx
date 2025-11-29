'use client';

import { useState } from 'react';
import { RecordingScreen } from '../components/RecordingScreen';
import { apiService } from '../lib/api';

export default function Home() {
  const [visitId, setVisitId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleNewVisit = async () => {
    try {
      setIsCreating(true);
      const visit = await apiService.createVisit();
      setVisitId(visit.id);
    } catch (error) {
      console.error('Failed to create visit:', error);
      alert('Failed to create new visit. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleVisitComplete = () => {
    setVisitId(null);
  };

  if (!visitId) {
    return (
      <div className="flex justify-center items-center min-h-screen flex-col gap-6">
        <h1 className="text-4xl font-bold">TriageAssist</h1>
        <button
          onClick={handleNewVisit}
          disabled={isCreating}
          className={`px-8 py-4 text-lg text-white border-none rounded-lg ${
            isCreating ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 cursor-pointer'
          }`}
        >
          {isCreating ? 'Creating...' : 'New Visit'}
        </button>
      </div>
    );
  }

  return <RecordingScreen visitId={visitId} onComplete={handleVisitComplete} />;
}
