import React from 'react';
import {Composition,registerRoot,useCurrentFrame,useVideoConfig} from 'remotion';
import {sample,fps,durationSeconds,width,height} from './scene.mjs';
import {cameraTransform,pointsString} from './motion.mjs';
const art={background:'#10182a',accent:'#dac7e8',text:'#f1e9e0',title:'连续动画制作骨架',subtitle:'机制示例 · 非成片模板'};
const layers=[{depth:.25,r:6,opacity:.2},{depth:.55,r:11,opacity:.25},{depth:1,r:17,opacity:.3}];
function Scene(){
 const frame=useCurrentFrame(),{fps}=useVideoConfig(),s=sample(frame/fps);
 return <svg width={width} height={height} viewBox={'0 0 '+width+' '+height} style={{fontFamily:'"PingFang SC",sans-serif'}}>
  <defs><clipPath id="scene-window"><rect x="48" y="420" width="984" height="1120" rx="60"/></clipPath></defs>
  <rect width={width} height={height} fill={art.background}/>
  <g clipPath="url(#scene-window)">
   {layers.map((l,i)=><g key={i} opacity={l.opacity} transform={cameraTransform({x:540+(s.camera.x-540)*l.depth,y:960+(s.camera.y-960)*l.depth,zoom:1+(s.camera.zoom-1)*l.depth})}>
    {Array.from({length:12},(_,j)=><circle key={j} cx={130+(j%4)*270+s.drift*l.depth} cy={560+Math.floor(j/4)*350+i*45} r={l.r} fill={art.accent}/>)}
   </g>)}
   <g transform={cameraTransform(s.camera)}>
    <g transform={'translate('+s.object.x+' '+s.object.y+') rotate('+s.object.angle+')'}>
     <polygon points={pointsString(s.points)} fill={art.accent} stroke={art.text} strokeWidth={3}/>
     <circle cx="0" cy="0" r="25" fill={art.background}/>
    </g>
   </g>
  </g>
  <text x="540" y="230" textAnchor="middle" fontSize="66" fill={art.text}>{art.title}</text>
  <text x="540" y="320" textAnchor="middle" fontSize="28" fill={art.accent}>{art.subtitle}</text>
 </svg>;
}
registerRoot(()=> <Composition id="MotionStarter" component={Scene} width={width} height={height} fps={fps} durationInFrames={Math.round(durationSeconds*fps)}/>);
