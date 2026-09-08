import { useStoreState } from 'easy-peasy';

const VoiceTrackingController = () => {
  const enabled = useStoreState((state) => state.voiceTracking.enabled);

  if (!enabled) {
    return null;
  }

  // Microphone lifecycle comes next.

  return null;
};

export default VoiceTrackingController;
