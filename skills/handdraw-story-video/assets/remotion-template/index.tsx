import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {HanddrawStory} from './HandDraw';
import type {StoryVideoProps} from './types';

const defaults: StoryVideoProps = {
  style: 'story-color-sketch',
  paperColor: '#FCFBF7',
  backgroundMusicVolume: 0.45,
  scenes: [
    {
      id: 'scene-001',
      narration: '这是一个手绘故事示例。',
      durationInFrames: 150,
      fontSize: 52,
      colorImage: 'placeholder/color.png',
      sketchImage: 'placeholder/sketch.png',
      audio: 'placeholder/voice.wav',
      typewriterAudio: 'placeholder/typewriter.wav',
    },
  ],
};

const Root: React.FC = () => (
  <Composition
    id="HanddrawStory"
    component={HanddrawStory}
    width={1080}
    height={1440}
    fps={30}
    durationInFrames={150}
    defaultProps={defaults}
    calculateMetadata={({props}) => ({
      durationInFrames: Math.max(
        1,
        (props as StoryVideoProps).scenes.reduce(
          (total, scene) => total + scene.durationInFrames,
          0,
        ),
      ),
    })}
  />
);

registerRoot(Root);
