import React, { useState, useEffect, useRef } from 'react';
import { Language, anatomicalData } from '../data/anatomicalData';

interface AudioNarrationProps {
  organId: string;
  language: Language;
  isVisible: boolean;
  currentZoom: number;
}

interface AudioState {
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
  currentAudio: string | null;
}

const AudioNarration: React.FC<AudioNarrationProps> = ({
  organId,
  language,
  isVisible,
  currentZoom
}) => {
  const [audioState, setAudioState] = useState<AudioState>({
    isPlaying: false,
    isLoading: false,
    error: null,
    currentAudio: null
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Clean up audio on component unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (speechSynthesisRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Stop audio when component becomes invisible
  useEffect(() => {
    if (!isVisible && audioState.isPlaying) {
      stopAudio();
    }
  }, [isVisible, audioState.isPlaying]);

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    if (speechSynthesisRef.current) {
      window.speechSynthesis.cancel();
    }

    setAudioState(prev => ({
      ...prev,
      isPlaying: false,
      currentAudio: null
    }));
  };

  const playAudioFile = async (audioUrl: string) => {
    try {
      setAudioState(prev => ({ ...prev, isLoading: true, error: null }));

      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onloadstart = () => {
        setAudioState(prev => ({ ...prev, isLoading: true }));
      };

      audio.oncanplaythrough = () => {
        setAudioState(prev => ({ ...prev, isLoading: false }));
      };

      audio.onplay = () => {
        setAudioState(prev => ({ 
          ...prev, 
          isPlaying: true, 
          currentAudio: audioUrl,
          isLoading: false 
        }));
      };

      audio.onended = () => {
        setAudioState(prev => ({ 
          ...prev, 
          isPlaying: false, 
          currentAudio: null 
        }));
      };

      audio.onerror = () => {
        setAudioState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: 'Failed to load audio file',
          isPlaying: false 
        }));
      };

      await audio.play();
    } catch (error) {
      console.error('Error playing audio file:', error);
      setAudioState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Audio playback failed',
        isPlaying: false 
      }));
    }
  };

  const playTextToSpeech = (text: string) => {
    try {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      speechSynthesisRef.current = utterance;

      // Set language and voice properties
      utterance.lang = language === 'fil' ? 'tl-PH' : 'en-US';
      utterance.rate = 0.8;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;

      utterance.onstart = () => {
        setAudioState(prev => ({ 
          ...prev, 
          isPlaying: true, 
          currentAudio: 'tts',
          error: null 
        }));
      };

      utterance.onend = () => {
        setAudioState(prev => ({ 
          ...prev, 
          isPlaying: false, 
          currentAudio: null 
        }));
      };

      utterance.onerror = () => {
        setAudioState(prev => ({ 
          ...prev, 
          isPlaying: false, 
          error: 'Speech synthesis failed' 
        }));
      };

      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Error with text-to-speech:', error);
      setAudioState(prev => ({ 
        ...prev, 
        error: 'Text-to-speech not supported',
        isPlaying: false 
      }));
    }
  };

  const handlePlayOverview = () => {
    if (audioState.isPlaying) {
      stopAudio();
      return;
    }

    const organData = anatomicalData[organId];
    if (!organData) return;

    // Try to play audio file first, fallback to TTS
    const audioUrl = organData.audioUrls?.[language];
    if (audioUrl) {
      playAudioFile(audioUrl);
    } else {
      // Fallback to text-to-speech
      const text = `${organData.name[language]}. ${organData.detailedDescription[language]}`;
      playTextToSpeech(text);
    }
  };

  const handlePlayFacts = () => {
    if (audioState.isPlaying) {
      stopAudio();
      return;
    }

    const organData = anatomicalData[organId];
    if (!organData) return;

    const facts = organData.facts[language];
    const factsText = `${language === 'en' ? 'Interesting facts about' : 'Mga kawili-wiling katotohanan tungkol sa'} ${organData.name[language]}: ${facts.join('. ')}.`;
    playTextToSpeech(factsText);
  };

  if (!isVisible || currentZoom < 2.0) {
    return null;
  }

  const organData = anatomicalData[organId];
  if (!organData) {
    return null;
  }

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: '12px',
        borderRadius: '8px',
        minWidth: '200px',
      }}
    >
      <div
        style={{
          color: 'white',
          fontSize: '12px',
          fontWeight: 'bold',
          marginBottom: '4px',
        }}
      >
        🎵 {language === 'en' ? 'Audio Guide' : 'Audio Guide'}
      </div>

      {/* Overview Button */}
      <button
        onClick={handlePlayOverview}
        data-ui-element="true"
        disabled={audioState.isLoading}
        style={{
          backgroundColor: audioState.isPlaying && audioState.currentAudio !== 'facts' 
            ? 'rgba(244, 67, 54, 0.9)' 
            : 'rgba(33, 150, 243, 0.9)',
          color: 'white',
          border: 'none',
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '11px',
          cursor: audioState.isLoading ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          opacity: audioState.isLoading ? 0.6 : 1,
        }}
      >
        {audioState.isLoading ? (
          <>🔄 {language === 'en' ? 'Loading...' : 'Naglo-load...'}</>
        ) : audioState.isPlaying && audioState.currentAudio !== 'facts' ? (
          <>⏹️ {language === 'en' ? 'Stop' : 'Tigil'}</>
        ) : (
          <>▶️ {language === 'en' ? 'Overview' : 'Buod'}</>
        )}
      </button>

      {/* Facts Button */}
      <button
        onClick={handlePlayFacts}
        data-ui-element="true"
        disabled={audioState.isLoading}
        style={{
          backgroundColor: audioState.isPlaying && audioState.currentAudio === 'facts'
            ? 'rgba(244, 67, 54, 0.9)' 
            : 'rgba(76, 175, 80, 0.9)',
          color: 'white',
          border: 'none',
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '11px',
          cursor: audioState.isLoading ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          opacity: audioState.isLoading ? 0.6 : 1,
        }}
      >
        {audioState.isPlaying && audioState.currentAudio === 'facts' ? (
          <>⏹️ {language === 'en' ? 'Stop Facts' : 'Tigil ang mga Katotohanan'}</>
        ) : (
          <>🧠 {language === 'en' ? 'Fun Facts' : 'Mga Katotohanan'}</>
        )}
      </button>

      {/* Error Message */}
      {audioState.error && (
        <div
          style={{
            color: '#ff6b6b',
            fontSize: '10px',
            marginTop: '4px',
          }}
        >
          {audioState.error}
        </div>
      )}

      {/* Playing Indicator */}
      {audioState.isPlaying && (
        <div
          style={{
            color: '#4caf50',
            fontSize: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <span style={{ animation: 'pulse 1s infinite' }}>🎵</span>
          {language === 'en' ? 'Playing...' : 'Tumutugtog...'}
        </div>
      )}
    </div>
  );
};

export default AudioNarration;
