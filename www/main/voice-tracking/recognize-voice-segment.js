const prodConfig = require('../../../config.prod.json');

const blobToBase64 = (audioBlob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const { result } = reader;

      if (typeof result !== 'string') {
        reject(new Error('Unable to read voice segment'));
        return;
      }

      const base64Audio = result.split(',')[1];

      if (!base64Audio) {
        reject(new Error('Unable to encode voice segment'));
        return;
      }

      resolve(base64Audio);
    };

    reader.onerror = () => {
      reject(reader.error || new Error('Unable to read voice segment'));
    };

    reader.readAsDataURL(audioBlob);
  });

const recognizeVoiceSegment = async (audioBlob) => {
  if (!prodConfig.AUDIO_TRANSCRIPT_API || !prodConfig.AUDIO_TRANSCRIPT_API_KEY) {
    return {
      type: 'recognizer-unavailable',
    };
  }

  try {
    const audioData = await blobToBase64(audioBlob);

    const response = await fetch(prodConfig.AUDIO_TRANSCRIPT_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audioData,
        apiKey: prodConfig.AUDIO_TRANSCRIPT_API_KEY,
      }),
    });

    if (!response.ok) {
      return {
        type: 'recognition-error',
      };
    }

    const data = await response.json();

    if (data.status !== 'success' || !data.transcriptInitials?.ascii) {
      return {
        type: 'recognition-miss',
      };
    }

    return {
      type: 'recognition-success',
      initials: data.transcriptInitials.ascii,
    };
  } catch (error) {
    return {
      type: 'recognition-error',
    };
  }
};

export default recognizeVoiceSegment;
