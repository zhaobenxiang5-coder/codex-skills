export type StoryScene = {
  id: string;
  narration: string;
  durationInFrames: number;
  fontSize: number;
  colorImage: string;
  sketchImage: string;
  audio: string;
  typewriterAudio: string;
};

export type StoryVideoProps = {
  scenes: StoryScene[];
  style: 'story-color-sketch' | 'story-pencil' | string;
  paperColor: string;
  backgroundMusic?: string;
  backgroundMusicVolume: number;
};
