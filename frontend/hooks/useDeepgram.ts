/**
 * Hook for Deepgram WebSocket live transcription
 */

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { config } from '../lib/config';

interface UseDeepgramOptions {
  onTranscript?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: Error) => void;
}

export function useDeepgram({ onTranscript, onError }: UseDeepgramOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [transcript, setTranscript] = useState('');
  const websocketRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      // Reset transcript
      setTranscript('');
      
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Create MediaRecorder for local buffer
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(100); // Collect data every 100ms

      // Create AudioContext for streaming to Deepgram
      const audioContext = new AudioContext({ sampleRate: 16000 });
      const source = audioContext.createMediaStreamSource(stream);
      
      // Create Deepgram WebSocket connection with proper encoding settings
      const wsUrl = `wss://api.deepgram.com/v1/listen?model=nova-2-medical&language=en-US&punctuate=true&diarize=true&interim_results=true&encoding=linear16&sample_rate=16000&channels=1`;
      
      console.log('Connecting to Deepgram...');
      console.log('API Key present:', !!config.deepgramApiKey);
      
      const ws = new WebSocket(wsUrl, ['token', config.deepgramApiKey]);

      websocketRef.current = ws;

      ws.onopen = () => {
        console.log('Deepgram WebSocket connected!');
        setIsConnected(true);
      };

      ws.onclose = (event) => {
        console.log('Deepgram WebSocket closed:', event.code, event.reason);
        setIsConnected(false);
      };

      ws.onmessage = (event) => {
        try {
          const transcriptData = JSON.parse(event.data);
          const transcriptText = transcriptData.channel?.alternatives?.[0]?.transcript || '';
          const isFinal = transcriptData.is_final || false;

          if (transcriptText) {
            setTranscript((prev) => {
              if (isFinal) {
                return prev + transcriptText + ' ';
              }
              // For interim results, replace last interim with new one
              return prev;
            });

            onTranscript?.(transcriptText, isFinal);
          }
        } catch (error) {
          console.error('Error parsing Deepgram message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('Deepgram WebSocket error:', error);
        onError?.(new Error('Deepgram connection error'));
      };

      // Use ScriptProcessor to capture and send PCM audio
      const processor = audioContext.createScriptProcessor(4096, 1, 1);

      processor.onaudioprocess = (e) => {
        if (ws.readyState === WebSocket.OPEN) {
          const inputData = e.inputBuffer.getChannelData(0);
          const pcmData = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            pcmData[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768));
          }
          ws.send(pcmData.buffer);
        }
      };

      source.connect(processor);
      processor.connect(audioContext.destination);
    } catch (error) {
      console.error('Error starting recording:', error);
      onError?.(error as Error);
    }
  }, [onTranscript, onError]);

  const stopRecording = useCallback(async () => {
    // Close WebSocket
    if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
      websocketRef.current.close();
      websocketRef.current = null;
    }

    setIsConnected(false);

    // Get audio blob - set up handler BEFORE calling stop
    return new Promise<Blob>((resolve) => {
      const mediaRecorder = mediaRecorderRef.current;
      
      if (!mediaRecorder || mediaRecorder.state === 'inactive') {
        // Already stopped or never started - return what we have
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        resolve(audioBlob);
        return;
      }

      // Set up handler BEFORE stopping
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        resolve(audioBlob);
      };

      // Now stop the recorder
      mediaRecorder.stop();
    });
  }, []);

  useEffect(() => {
    return () => {
      if (websocketRef.current) {
        websocketRef.current.close();
      }
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  return {
    isConnected,
    transcript,
    startRecording,
    stopRecording,
  };
}

