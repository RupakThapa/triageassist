/**
 * Live Transcript Component
 * Displays real-time transcription from Deepgram
 */

'use client';

interface LiveTranscriptProps {
  transcript: string;
  isVisible: boolean;
}

export function LiveTranscript({ transcript, isVisible }: LiveTranscriptProps) {
  if (!isVisible) {
    return null;
  }

  return (
    <div
      className="p-5 bg-gray-100 rounded-lg min-h-[200px] max-h-[400px] overflow-y-auto text-base leading-relaxed text-gray-800 transition-opacity duration-300"
    >
      {transcript || (
        <span className="text-gray-500 italic">Waiting for audio...</span>
      )}
    </div>
  );
}

