// Voice options for AI Influencer
export interface VoiceOption {
  id: number;
  label: string;
  value: string;
  voiceUrl: string;
}

export const INFLUENCER_VOICES: VoiceOption[] = [
  {
    id: 1,
    label: "Sultry",
    value: "voice1",
    voiceUrl: "/character-assets/voice/voice1.mp3",
  },
  {
    id: 2,
    label: "Sweet",
    value: "voice2",
    voiceUrl: "/character-assets/voice/voice2.mp3",
  },
  {
    id: 3,
    label: "Confident",
    value: "voice3",
    voiceUrl: "/character-assets/voice/voice3.mp3",
  },
];

