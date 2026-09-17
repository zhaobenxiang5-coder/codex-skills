import assert from 'node:assert/strict';
import {phase,smooth,morphPoints,cameraTransform} from '../assets/remotion-starter/motion.mjs';
import {sample,timing} from '../assets/remotion-starter/scene.mjs';
assert.equal(phase(-1,1,2),0);assert.equal(phase(3,1,2),1);
assert.throws(()=>phase(0,2,2));
let prev=-1;
for(let n=0;n<=1000;n++){const x=smooth(n/1000);assert.ok(x>=prev&&x>=0&&x<=1);prev=x;}
const a=[[0,0],[2,0],[2,2]],b=[[1,1],[3,1],[3,3]];
assert.deepEqual(morphPoints(a,b,0),a);assert.deepEqual(morphPoints(a,b,1),b);
assert.throws(()=>morphPoints(a,b.slice(1),.5));
assert.throws(()=>cameraTransform({x:0,y:0,zoom:0}));
assert.ok(cameraTransform({x:540,y:960,zoom:1}).includes('translate(540 960)'));
for(let f=0;f<300;f++){
 const s=sample(f/30);assert.deepEqual(s,sample(f/30));
 assert.ok(s.camera.zoom>0&&s.points.flat().every(Number.isFinite));
}
const eps=1e-5;
for(const knot of Object.values(timing).flat()){
 const left=sample(knot-eps),mid=sample(knot),right=sample(knot+eps);
 for(const prop of ['x','y','angle']){
  const v1=(mid.object[prop]-left.object[prop])/eps,v2=(right.object[prop]-mid.object[prop])/eps;
  assert.ok(Math.abs(v1-v2)<.02,'object velocity continuity at stop');
 }
 for(const prop of ['x','y','zoom']){
  const v1=(mid.camera[prop]-left.camera[prop])/eps,v2=(right.camera[prop]-mid.camera[prop])/eps;
  assert.ok(Math.abs(v1-v2)<.02,'camera velocity continuity at stop');
 }
}
const retimed={move:[2,4],reveal:[4,8]};
assert.deepEqual(sample(1,retimed).points,sample(0).points);
assert.deepEqual(sample(10,retimed).points,sample(10).points);
console.log('PASS: endpoints, monotonic easing, topology guards, deterministic seek, event seams, local retiming');
