import {phase,lerp,morphPoints} from './motion.mjs';
export const fps=30,durationSeconds=10,width=1080,height=1920;
export const timing={move:[1.5,3.5],reveal:[3.5,7]};
const original=[[-160,-100],[160,-100],[160,100],[-160,100]];
const reshaped=[[-150,-70],[180,-115],[150,70],[-180,115]];
export function sample(seconds,events=timing){
 const move=phase(seconds,...events.move),reveal=phase(seconds,...events.reveal);
 return {
  points:morphPoints(original,reshaped,move),
  object:{x:lerp(400,670,move),y:lerp(920,820,move),angle:lerp(0,-12,move)},
  camera:{x:lerp(540,630,reveal),y:lerp(960,890,reveal),zoom:lerp(1,1.3,reveal),angle:0},
  drift:Math.sin(seconds*.65)*9
 };
}
