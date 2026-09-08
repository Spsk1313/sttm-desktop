import { useEffect, useRef } from 'react';
import { useStoreActions, useStoreState } from 'easy-peasy';

import { SilenceDetector, createAudioAnalyser } from '../navigator/search/components/silence';

const VoiceTrackingController = () => {
  const enabled = useStoreState((state) => state.voiceTracking.enabled);

  const setEnabled = useStoreActions((actions) => actions.voiceTracking.setEnabled);

  const mediaStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const silenceDetectorRef = useRef(null);
  const recordingChunksRef = useRef([]);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    let cancelled = false;

    const stopRecorder = () => {
      const recorder = mediaRecorderRef.current;

      if (recorder && recorder.state !== 'inactive') {
        recorder.stop();
      }
    };

    const startSegment = () => {
      const stream = mediaStreamRef.current;

      if (!stream || cancelled) {
        return;
      }

      recordingChunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordingChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        if (cancelled) {
          return;
        }

        const chunks = recordingChunksRef.current;

        if (chunks.length > 0) {
          const audioBlob = new Blob(chunks, {
            type: recorder.mimeType,
          });

          // eslint-disable-next-line no-console
          console.log('Voice segment captured:', {
            size: audioBlob.size,
            type: audioBlob.type,
          });
        }

        startSegment();
      };

      recorder.start();

      silenceDetectorRef.current.start();
    };

    const startMicrophone = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        mediaStreamRef.current = stream;

        const { audioContext, analyser } = createAudioAnalyser(stream);

        audioContextRef.current = audioContext;

        silenceDetectorRef.current = new SilenceDetector(
          analyser,
          {
            onSilenceDetected: stopRecorder,
          },
          {
            threshold: 0.03,
            durationMs: 1500,
          },
        );

        startSegment();
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Unable to start voice following microphone:', error);

        setEnabled(false);
      }
    };

    startMicrophone();

    return () => {
      cancelled = true;

      if (silenceDetectorRef.current) {
        silenceDetectorRef.current.destroy();
        silenceDetectorRef.current = null;
      }

      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }

      mediaRecorderRef.current = null;
      recordingChunksRef.current = [];

      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }

      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());

        mediaStreamRef.current = null;
      }
    };
  }, [enabled, setEnabled]);

  return null;
};

export default VoiceTrackingController;
