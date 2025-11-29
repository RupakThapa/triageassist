/**
 * Recording Screen Component
 * Main interface for recording and processing triage sessions
 */

'use client';

import { useState, useEffect } from 'react';
import { useDeepgram } from '../hooks/useDeepgram';
import { LiveTranscript } from './LiveTranscript';
import { AudioPlayer } from './AudioPlayer';
import { TriageForm } from './TriageForm';
import { apiService } from '../lib/api';
import { subscribeToVisit } from '../lib/supabase';
import { VisitRecord, VisitData, VisitStatus } from '../types';

interface RecordingScreenProps {
  visitId: string;
  onComplete?: () => void;
}

export function RecordingScreen({ visitId, onComplete }: RecordingScreenProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [visit, setVisit] = useState<VisitRecord | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<VisitData>>();

  const { transcript, startRecording, stopRecording } = useDeepgram({
    onError: (error) => {
      console.error('Deepgram error:', error);
    },
  });

  useEffect(() => {
    const unsubscribe = subscribeToVisit(visitId, (updatedVisit) => {
      setVisit(updatedVisit);

      if (updatedVisit.status === 'review' && updatedVisit.visit_summary) {
        setIsProcessing(false);
        setShowForm(true);
        setFormData({
          visit_summary: updatedVisit.visit_summary,
          vitals: updatedVisit.vitals,
          medications: updatedVisit.medications || [],
          consult_notes: updatedVisit.consult_notes,
        });
      }
    });

    apiService.getVisit(visitId).then(setVisit);

    return unsubscribe;
  }, [visitId]);

  const handleStartRecording = async () => {
    try {
      await startRecording();
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Failed to start recording. Please check microphone permissions.');
    }
  };

  const handleStopRecording = async () => {
    try {
      setIsRecording(false);
      setIsProcessing(true);
      
      const audioBlob = await stopRecording();
      // Pass the live transcript along with the audio
      await apiService.uploadAudio(visitId, audioBlob, transcript);
    } catch (error) {
      console.error('Failed to stop recording:', error);
      alert('Failed to upload recording. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleFormSubmit = async (data: VisitData) => {
    try {
      await apiService.updateVisit(visitId, {
        ...data,
        status: 'completed' as VisitStatus,
      });
      
      alert('Visit saved successfully!');
      onComplete?.();
    } catch (error) {
      console.error('Failed to save visit:', error);
      alert('Failed to save visit. Please try again.');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="mb-6 text-3xl font-bold">New Visit</h1>

      {!showForm && (
        <div className="mb-6 text-center">
          <button
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            disabled={isProcessing}
            className={`px-8 py-4 text-lg text-white border-none rounded-lg flex items-center gap-3 mx-auto ${
              isRecording ? 'bg-red-600 animate-pulse' : 'bg-green-600'
            } ${isProcessing ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
          >
            {isRecording ? (
              <>
                <span>●</span> Stop & Analyze
              </>
            ) : (
              <>
                <span>🎤</span> Start Recording
              </>
            )}
          </button>
        </div>
      )}

      {isRecording && (
        <div className="mb-6">
          <h2 className="mb-3 text-2xl">Live Transcript</h2>
          <LiveTranscript transcript={transcript} isVisible={isRecording} />
        </div>
      )}

      {isProcessing && (
        <div className="text-center p-10 bg-gray-100 rounded-lg mb-6">
          <div className="inline-block w-10 h-10 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mb-4" />
          <p className="text-lg text-gray-600">Processing Clinical Data...</p>
        </div>
      )}

      {visit?.audio_url && (
        <div className="mb-6">
          <h2 className="mb-3 text-2xl">Recording</h2>
          <AudioPlayer audioUrl={visit.audio_url} />
        </div>
      )}

      {/* Show raw transcript if available */}
      {visit?.raw_transcript && (
        <div className="mb-6">
          <h2 className="mb-3 text-2xl">Transcript</h2>
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
            <p className="whitespace-pre-wrap text-gray-700">{visit.raw_transcript}</p>
          </div>
        </div>
      )}

      {showForm && formData && (
        <div>
          <h2 className="mb-6 text-2xl">Review & Edit</h2>
          <TriageForm initialData={formData} onSubmit={handleFormSubmit} />
        </div>
      )}
    </div>
  );
}

