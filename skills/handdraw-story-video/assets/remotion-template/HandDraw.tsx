import React, {useEffect, useMemo, useState} from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  continueRender,
  delayRender,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import type {StoryScene, StoryVideoProps} from './types';

const clamp = (value: number, low: number, high: number) =>
  Math.max(low, Math.min(high, value));

const FontGate: React.FC = () => {
  const [handle] = useState(() => delayRender('Loading bundled Chinese handwriting font'));
  useEffect(() => {
    let cancelled = false;
    const font = new FontFace(
      'StoryHand',
      `url(${staticFile('fonts/MaShanZheng-Regular.ttf')}) format('truetype')`,
    );
    font
      .load()
      .then((loaded) => {
        if (!cancelled) (document.fonts as unknown as {add: (font: FontFace) => void}).add(loaded);
      })
      .finally(() => continueRender(handle));
    return () => {
      cancelled = true;
    };
  }, [handle]);
  return null;
};

const StoryPage: React.FC<{
  scene: StoryScene;
  paperColor: string;
}> = ({scene, paperColor}) => {
  const frame = useCurrentFrame();
  const cleanText = scene.narration.replace(/\s+/g, '');
  const typeStart = 5;
  const typeDuration = clamp(Math.ceil(cleanText.length * 1.55), 24, 46);
  const visibleCharacters = Math.ceil(
    interpolate(frame, [typeStart, typeStart + typeDuration], [0, cleanText.length], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),
  );
  const typedText = cleanText.slice(0, visibleCharacters);
  const drawStart = 10;
  const drawEnd = Math.min(scene.durationInFrames - 34, drawStart + 60);
  const colorStart = Math.max(drawStart + 34, drawEnd - 7);
  const colorOpacity = interpolate(frame, [colorStart, colorStart + 22], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const pageCut = interpolate(
    frame,
    [scene.durationInFrames - 4, scene.durationInFrames - 1],
    [0, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );
  const clipId = `reveal-${scene.id}`;
  const regions = useMemo(
    () => [
      {y: 250, height: 320},
      {y: 510, height: 340},
      {y: 790, height: 350},
      {y: 1070, height: 370},
    ],
    [],
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: paperColor,
        overflow: 'hidden',
        color: '#1d1b18',
      }}
    >
      <svg
        width="1080"
        height="1440"
        viewBox="0 0 1080 1440"
        style={{position: 'absolute', inset: 0, zIndex: 1}}
      >
        <defs>
          <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
            {regions.map((region, index) => {
              const start = drawStart + index * 9;
              const end = Math.max(start + 12, drawEnd - (regions.length - index - 1) * 3);
              const progress = interpolate(frame, [start, end], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              });
              const width = 1080 * progress;
              const x = index % 2 === 0 ? 0 : 1080 - width;
              return (
                <rect
                  key={`${scene.id}-${index}`}
                  x={x}
                  y={region.y}
                  width={width}
                  height={region.height}
                  rx="120"
                />
              );
            })}
          </clipPath>
        </defs>
        <image
          href={staticFile(scene.sketchImage)}
          x="0"
          y="0"
          width="1080"
          height="1440"
          preserveAspectRatio="xMidYMid meet"
          clipPath={`url(#${clipId})`}
        />
      </svg>

      <Img
        src={staticFile(scene.colorImage)}
        style={{
          position: 'absolute',
          inset: 0,
          width: 1080,
          height: 1440,
          objectFit: 'contain',
          opacity: colorOpacity,
          zIndex: 2,
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: 90,
          right: 90,
          top: 62,
          maxHeight: 268,
          zIndex: 4,
          fontFamily: 'StoryHand, STKaiti, KaiTi, serif',
          fontSize: scene.fontSize,
          lineHeight: 1.42,
          letterSpacing: 1.2,
          whiteSpace: 'pre-wrap',
          textShadow: `0 0 1px ${paperColor}`,
        }}
      >
        {typedText}
      </div>

      <Sequence from={4} layout="none">
        <Audio src={staticFile(scene.audio)} />
      </Sequence>
      <Audio src={staticFile(scene.typewriterAudio)} volume={0.85} />

      <AbsoluteFill
        style={{
          backgroundColor: paperColor,
          opacity: pageCut,
          zIndex: 8,
        }}
      />
    </AbsoluteFill>
  );
};

export const HanddrawStory: React.FC<StoryVideoProps> = ({
  scenes,
  paperColor,
  backgroundMusic,
  backgroundMusicVolume,
}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const fadeIn = interpolate(frame, [0, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const fadeOut = interpolate(
    frame,
    [Math.max(0, durationInFrames - 45), durationInFrames - 1],
    [1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );
  const musicVolume = backgroundMusicVolume * Math.min(fadeIn, fadeOut);
  let cursor = 0;
  return (
    <AbsoluteFill style={{backgroundColor: paperColor}}>
      <FontGate />
      {backgroundMusic ? (
        <Audio src={staticFile(backgroundMusic)} loop volume={musicVolume} />
      ) : null}
      {scenes.map((scene) => {
        const from = cursor;
        cursor += scene.durationInFrames;
        return (
          <Sequence
            key={scene.id}
            from={from}
            durationInFrames={scene.durationInFrames}
            premountFor={15}
          >
            <StoryPage scene={scene} paperColor={paperColor} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
