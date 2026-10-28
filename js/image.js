/* ---------- bildbehandling ---------- */
import{rgb2lab,de76,clamp,quantize}from'./color.js';
import{PAL,SYMS}from'./palette.js';
import{makeLayout}from'./shapes.js';
import{S,app,loadDone}from'./state.js';

const PI=Math.PI;

/* ---------- bildhantering ---------- */
let scaledCache={src:null,w:0,c:null};
export function resetScaledCache(){scaledCache={src:null}}
function scaledSource(img,targetW){
  const iw=img.naturalWidth||img.width;
  if(iw<=targetW*2)return img;
  if(scaledCache.src===img&&scaledCache.w===targetW)return scaledCache.c;
  let cur=img,w=iw,h=img.naturalHeight||img.height;
  while(w>targetW*2){w=Math.max(1,Math.round(w/2));h=Math.max(1,Math.round(h/2));const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.imageSmoothingQuality='high';x.drawImage(cur,0,0,w,h);cur=c}
  scaledCache={src:img,w:targetW,c:cur};return cur;
}
export function placement(L,iw,ih){
  const s=(S.fit==='cover'?Math.max(L.bw/iw,L.bh/ih):Math.min(L.bw/iw,L.bh/ih))*S.zoom;
  // flytta lika långt som bilden sticker utanför plattan, men minst en halv platta åt varje håll,
  // så att båda reglagen fungerar även när bilden passar exakt i den ena riktningen
  const dw=iw*s,dh=ih*s,rx=Math.max(Math.abs(L.bw-dw),L.bw)/2,ry=Math.max(Math.abs(L.bh-dh),L.bh)/2;
  return{dw,dh,ox:(L.bw-dw)/2+S.panX*rx,oy:(L.bh-dh)/2+S.panY*ry};
}
let bgLab=null;
export function computeBg(){
  const c=document.createElement('canvas');c.width=c.height=32;const x=c.getContext('2d');x.drawImage(S.img,0,0,32,32);
  const d=x.getImageData(0,0,32,32).data;let r=0,g=0,b=0,n=0;
  for(const[px,py]of[[0,0],[31,0],[0,31],[31,31],[1,1],[30,1],[1,30],[30,30]]){const i=(py*32+px)*4;if(d[i+3]>128){r+=d[i];g+=d[i+1];b+=d[i+2];n++}}
  bgLab=n?rgb2lab(r/n,g/n,b/n):null;
}

/* ---------- huvudberäkning ---------- */
export function compute(){
  const L=makeLayout(S),cells=L.cells,N=cells.length,RES=8;
  const W=Math.ceil(L.bw*RES),H=Math.ceil(L.bh*RES);
  const wc=document.createElement('canvas');wc.width=W;wc.height=H;const wx=wc.getContext('2d',{willReadFrequently:true});
  wx.imageSmoothingEnabled=true;wx.imageSmoothingQuality='high';
  const iw=S.img.naturalWidth||S.img.width,ih=S.img.naturalHeight||S.img.height,p=placement(L,iw,ih);
  wx.drawImage(scaledSource(S.img,Math.round(p.dw*RES)),p.ox*RES,p.oy*RES,p.dw*RES,p.dh*RES);
  const data=wx.getImageData(0,0,W,H).data,rad=Math.round(RES*0.36);
  const rgb=new Float32Array(N*3),filled=new Uint8Array(N);
  const cf=(259*(S.contrast*1.6+255))/(255*(259-S.contrast*1.6)),br=S.bright*1.3,sf=1+S.sat/100;
  for(let i=0;i<N;i++){
    const c=cells[i],cx=Math.round((c.x-L.minX+0.5)*RES),cy=Math.round((c.y-L.minY+0.5)*RES);
    let sr=0,sg=0,sb=0,sa=0,n=0;
    for(let y=cy-rad;y<cy+rad;y++){if(y<0||y>=H)continue;for(let x=cx-rad;x<cx+rad;x++){if(x<0||x>=W)continue;const k=(y*W+x)*4,a=data[k+3];sr+=data[k]*a;sg+=data[k+1]*a;sb+=data[k+2]*a;sa+=a;n++}}
    if(!n||sa/(n*255)<0.5)continue;
    let r=sr/sa,g=sg/sa,b=sb/sa;
    if(S.bg&&bgLab&&de76(rgb2lab(r,g,b),bgLab)<S.bgTol)continue;
    r=cf*(r-128)+128+br;g=cf*(g-128)+128+br;b=cf*(b-128)+128+br;
    const l=0.299*r+0.587*g+0.114*b;r=l+(r-l)*sf;g=l+(g-l)*sf;b=l+(b-l)*sf;
    rgb[i*3]=clamp(r);rgb[i*3+1]=clamp(g);rgb[i*3+2]=clamp(b);filled[i]=1;
  }
  const E=[...S.enabled].sort((a,b)=>a-b),out=new Int16Array(N).fill(-1);
  if(!E.length){app.R={L,out,used:[],total:0,noColors:true};return}
  const{asg}=quantize({rgb,filled,cells,pal:PAL,E,maxc:S.maxc,dither:S.dither,despeckle:S.despeckle});
  const fc=new Map();let total=0;
  for(let i=0;i<N;i++)if(asg[i]>=0){out[i]=E[asg[i]];fc.set(out[i],(fc.get(out[i])||0)+1);total++}
  const used=[...fc].sort((a,b)=>b[1]-a[1]).map(([idx,count],k)=>({idx,count,sym:SYMS[k%SYMS.length]}));
  const symOf=new Map(used.map(u=>[u.idx,u.sym]));
  if(!used.some(u=>u.idx===S.hl))S.hl=-1;
  app.R={L,out,used,symOf,total};
  loadDone();
}
