'use client';

import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { speakInstruction, stopSpeech, isSpeaking } from '@/lib/audioService';
import { SupportedLanguage } from '@/lib/types';

interface AudioVoiceButtonProps {
  textToSpeak: string;
  language?: SupportedLanguage;
  label?: string;
  className?: string;
}

export const AudioVoiceButton: React.FC<AudioVoiceButtonProps> = ({
  textToSpeak,
  language = 'en',
  label = 'Listen',
  className = '',
}) => {
  const [speaking, setSpeaking] = useState(false);

  const toggleSpeak = () => {
    if (speaking || isSpeaking()) {
      stopSpeech();
      setSpeaking(false);
    } else {
      setSpeaking(true);
      speakInstruction(
        textToSpeak,
        language,
        () => setSpeaking(true),
        () => setSpeaking(false)
      );
    }
  };

  return (
    <button
      type="button"
      onClick={toggleSpeak}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition select-none active:scale-95 cursor-pointer ${
        speaking
          ? 'bg-orange-600 text-white shadow-md ring-2 ring-orange-300 animate-pulse'
          : 'bg-orange-50 hover:bg-orange-100 text-orange-950 border border-orange-200'
      } ${className}`}
      id="btn-voice-instruction"
      aria-label="Listen to spoken instructions"
    >
      {speaking ? (
        <>
          <VolumeX className="w-4 h-4" />
          <span>Stop voice</span>
        </>
      ) : (
        <>
          <Volume2 className="w-4 h-4 text-orange-600" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
};
