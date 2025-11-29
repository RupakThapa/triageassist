/**
 * Audio Player Component
 * Plays the recorded audio from Supabase Storage
 */

'use client';

interface AudioPlayerProps {
  audioUrl: string | null;
}

export function AudioPlayer({ audioUrl }: AudioPlayerProps) {
  if (!audioUrl) {
    return null;
  }

  return (
    <div className="mb-5">
      <audio
        controls
        src={audioUrl}
        className="w-full max-w-2xl"
      >
        Your browser does not support the audio element.
      </audio>
    </div>
  );
}

