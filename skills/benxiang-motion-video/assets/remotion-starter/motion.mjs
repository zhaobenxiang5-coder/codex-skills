export const clamp01 = x => Math.max(0,Math.min(1,x));
export const lerp = (a,b,p) => a+(b-a)*p;
export const smooth = x => {const p=clamp01(x);return p*p*p*(p*(p*6-15)+10);};
export function phase(seconds,start,end,easing=smooth){
 if(![seconds,start,end].every(Number.isFinite)||end<=start)throw Error('Invalid event interval');
 return easing(clamp01((seconds-start)/(end-start)));
}
export function morphPoints(from,to,p){
 if(from.length!==to.length||from.length<3)throw Error('Corresponding vertices required');
 if([...from,...to].some(v=>v.length!==2||!v.every(Number.isFinite)))throw Error('Invalid vertex');
 return from.map((v,i)=>v.map((n,j)=>lerp(n,to[i][j],clamp01(p))));
}
export const pointsString=points=>points.map(p=>p.join(',')).join(' ');
export function cameraTransform({x,y,zoom,angle=0},center=[540,960]){
 if(![x,y,zoom,angle,...center].every(Number.isFinite)||zoom<=0)throw Error('Invalid camera');
 return 'translate('+center.join(' ')+') scale('+zoom+') rotate('+(-angle)+') translate('+(-x)+' '+(-y)+')';
}
