/* ---------- ritning ---------- */
import{lum,shade}from'./color.js';
import{PAL}from'./palette.js';
import{makeLayout}from'./shapes.js';
import{placement}from'./image.js';
import{S,app}from'./state.js';
import{$,tok}from'./util.js';

const PI=Math.PI;
export const cv=$('cv');
// geometrin från senaste ritningen, används för att träffa pärlor vid klick
export let geo=null;

export function render(){
  const R=app.R,done=app.done;
  if(!R)return;const L=R.L,box=$('boardBox');
  const pad=L.rect?24:6,availW=box.clientWidth-36-pad;
  let cell;
  if(S.mode==='bead'){const fit=Math.min(availW/L.bw,Math.max(200,window.innerHeight-150)/L.bh);cell=Math.max(6,Math.min(90,fit*S.bz))}
  else cell=Math.max(4,Math.min(30,availW/L.bw,(window.innerHeight*0.78)/L.bh));
  const w=Math.round(L.bw*cell+pad),h=Math.round(L.bh*cell+pad);
  const dpr=Math.min(window.devicePixelRatio||1,Math.sqrt(14e6/(w*h))); // iPad Safari tål inte för stora canvas
  cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);cv.style.width=w+'px';cv.style.height=h+'px';
  const x=cv.getContext('2d');x.setTransform(dpr,0,0,dpr,0,0);x.clearRect(0,0,w,h);
  geo={cell,pad,w};
  const peg=tok('--peg'),ink=tok('--muted'),boardC=tok('--board'),inkC=tok('--ink');
  // plattans bakgrund
  x.fillStyle=boardC;
  for(const c of L.cells){const cx=pad+(c.x-L.minX+0.5)*cell,cy=pad+(c.y-L.minY+0.5)*cell;x.beginPath();x.arc(cx,cy,cell*0.62,0,7);x.fill()}
  const sym=S.view==='sym'&&cell>=11;
  x.textAlign='center';x.textBaseline='middle';x.font=`700 ${Math.round(cell*0.52)}px ${tok('--f-body')}`;
  L.cells.forEach((c,i)=>{
    const cx=pad+(c.x-L.minX+0.5)*cell,cy=pad+(c.y-L.minY+0.5)*cell,p=R.out[i];
    if(p<0){x.fillStyle=peg;x.beginPath();x.arc(cx,cy,Math.max(1,cell*0.13),0,7);x.fill();return}
    const col=PAL[p],isDone=S.mode==='bead'&&done&&done[i];
    x.globalAlpha=(S.hl>=0&&S.hl!==p)?0.13:isDone?0.3:1;
    x.fillStyle=col.hex;x.beginPath();x.arc(cx,cy,cell*0.46,0,7);x.fill();
    if(sym){x.fillStyle=lum(col.rgb)>140?'#1A1F2E':'#FFFFFF';x.fillText(R.symOf.get(p),cx,cy+cell*0.03)}
    else if(cell>=6){x.fillStyle=shade(col.rgb,0.62);x.beginPath();x.arc(cx,cy,cell*0.17,0,7);x.fill();
      if(cell>=10){x.strokeStyle='rgba(255,255,255,.35)';x.lineWidth=Math.max(1,cell*0.06);x.beginPath();x.arc(cx,cy,cell*0.32,1.15*PI,1.6*PI);x.stroke()}}
    if(isDone&&!(S.hl>=0&&S.hl!==p)){x.globalAlpha=1;x.strokeStyle=inkC;x.lineWidth=Math.max(1.5,cell*0.09);x.lineCap='round';x.lineJoin='round';
      x.beginPath();x.moveTo(cx-cell*0.2,cy);x.lineTo(cx-cell*0.05,cy+cell*0.16);x.lineTo(cx+cell*0.22,cy-cell*0.18);x.stroke()}
    x.globalAlpha=1;
  });
  if(L.rect){
    x.fillStyle=ink;x.font=`11px ${tok('--f-body')}`;
    for(let c=0;c<S.rw;c++){const n=c+1;if(n===1||n%5===0)x.fillText(n,pad+(c+0.5)*cell,pad/2)}
    for(let r=0;r<S.rh;r++){const n=r+1;if(n===1||n%5===0)x.fillText(n,pad/2,pad+(r+0.5)*cell)}
    if(S.plate>0){x.strokeStyle=tok('--accent');x.lineWidth=2;x.setLineDash([6,4]);
      for(let c=S.plate;c<S.rw;c+=S.plate){x.beginPath();x.moveTo(pad+c*cell,pad);x.lineTo(pad+c*cell,pad+S.rh*cell);x.stroke()}
      for(let r=S.plate;r<S.rh;r+=S.plate){x.beginPath();x.moveTo(pad,pad+r*cell);x.lineTo(pad+S.rw*cell,pad+r*cell);x.stroke()}
      x.setLineDash([])}
  }
}
export function drawThumb(){
  const R=app.R;
  const t=$('thumb'),x=t.getContext('2d'),L=R?R.L:makeLayout(S);const S2=168;
  x.clearRect(0,0,S2,S2);
  const sc=Math.min(S2/L.bw,S2/L.bh),offX=(S2-L.bw*sc)/2,offY=(S2-L.bh*sc)/2;
  const iw=S.img.naturalWidth||S.img.width,ih=S.img.naturalHeight||S.img.height,p=placement(L,iw,ih);
  x.save();x.beginPath();x.rect(0,0,S2,S2);x.clip();
  x.drawImage(S.img,offX+p.ox*sc,offY+p.oy*sc,p.dw*sc,p.dh*sc);x.restore();
  const o=document.createElement('canvas');o.width=o.height=S2;const ox=o.getContext('2d');
  ox.fillStyle='rgba(16,19,27,.62)';ox.fillRect(0,0,S2,S2);ox.globalCompositeOperation='destination-out';
  for(const c of L.cells){ox.beginPath();ox.arc(offX+(c.x-L.minX+0.5)*sc,offY+(c.y-L.minY+0.5)*sc,sc*0.75,0,7);ox.fill()}
  x.drawImage(o,0,0);
}
