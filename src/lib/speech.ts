// src/lib/speech.ts

/**
 * Trigger browser-native Speech Synthesis (TTS) for the specified language.
 */
export function speakText(text: string, locale: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    console.warn("Speech synthesis not supported in this browser environment.");
    return;
  }

  // Cancel any active speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);

  // Set correct voice language tag
  if (locale === 'hi') {
    utterance.lang = 'hi-IN';
  } else if (locale === 'mr') {
    utterance.lang = 'mr-IN';
  } else {
    utterance.lang = 'en-US';
  }

  // Attempt to load system voices and find a matching voice
  const voices = window.speechSynthesis.getVoices();
  const matchedVoice = voices.find(v => v.lang.startsWith(locale)) ||
                      voices.find(v => v.lang.startsWith(utterance.lang));
  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  window.speechSynthesis.speak(utterance);
}

/**
 * Configure user microphone and record audio.
 */
export async function startAudioRecording(
  onStop: (audioBlob: Blob) => void
): Promise<{ stop: () => void }> {
  if (typeof window === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error("Audio recording is not supported in this browser.");
  }

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const mediaRecorder = new MediaRecorder(stream);
  const chunks: Blob[] = [];

  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) {
      chunks.push(e.data);
    }
  };

  mediaRecorder.onstop = () => {
    const audioBlob = new Blob(chunks, { type: 'audio/webm' });
    onStop(audioBlob);
    // Stop all audio tracks to release the microphone
    stream.getTracks().forEach(track => track.stop());
  };

  mediaRecorder.start();

  return {
    stop: () => {
      if (mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
      }
    }
  };
}
