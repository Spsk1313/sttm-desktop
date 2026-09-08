import React from 'react';
import { useStoreActions, useStoreState } from 'easy-peasy';

const VoiceTrackingToolbarItem = () => {
  const enabled = useStoreState((state) => state.voiceTracking.enabled);

  const setEnabled = useStoreActions((actions) => actions.voiceTracking.setEnabled);

  return (
    <div
      id="tool-voice-tracking"
      className={`toolbar-item ${enabled ? 'voice-tracking-active' : ''}`}
      title={enabled ? 'Stop Voice Following' : 'Start Voice Following'}
      onClick={() => setEnabled(!enabled)}
    ></div>
  );
};

export default VoiceTrackingToolbarItem;
