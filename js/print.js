/* ---------- utskrift med pHYs (DPI) ---------- */
import{lum,shade}from'./color.js';
import{PAL}from'./palette.js';
import{SHAPE_NAMES}from'./shapes.js';
import{S,app}from'./state.js';
import{$,tok,fmt,cm}from'./util.js';

const BEAD_NAMES={'2.5':'Mini 2,5 mm','5':'Midi 5 mm','10':'Maxi 10 mm'};

const CRC=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0}return t})();
function crc32(u8){let c=0xFFFFFFFF;for(let i=0;i<u8.length;i++)c=CRC[(c^u8[i])&255]^(c>>>8);return(c^0xFFFFFFFF)>>>0}
function addPhys(buf,dpi){
  const src=new Uint8Array(buf),ppm=Math.round(dpi/0.0254),chunk=new Uint8Array(21),dv=new DataView(chunk.buffer);
  dv.setUint32(0,9);chunk.set([112,72,89,115],4);dv.setUint32(8,ppm);dv.setUint32(12,ppm);chunk[16]=1;
  dv.setUint32(17,crc32(chunk.subarray(4,17)));
  const out=new Uint8Array(src.length+21);out.set(src.subarray(0,33));out.set(chunk,33);out.set(src.subarray(33),54);return out;
}
let lastUrl=null;
export function makePrint(){
  const R=app.R,L=R.L,mm=parseFloat(S.bead);let dpi=300;
  const layoutFor=dpi=>{const P=mm/25.4*dpi,m=dpi/2.54,colW=dpi*2.1,W=Math.max(Math.round(dpi*8.27),Math.round(L.bw*P+2*m)),cols=Math.max(1,Math.floor((W-2*m)/colW)),rows=Math.ceil(R.used.length/cols),
    titleH=dpi*0.62,scaleH=dpi*0.5,legendH=dpi*0.35+rows*dpi*0.25,H=Math.round(m+titleH+L.bh*P+dpi*0.2+scaleH+legendH+m);return{P,m,colW,W,H,cols,titleH,scaleH}};
  let g=layoutFor(dpi);if(g.W*g.H>60e6){dpi=Math.floor(dpi*Math.sqrt(60e6/(g.W*g.H)));g=layoutFor(dpi)}
  const{P,m,colW,W,H,cols,titleH,scaleH}=g,u=dpi/300;
  const c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');
  const body=tok('--f-body'),disp=tok('--f-display');
  x.fillStyle='#FFFFFF';x.fillRect(0,0,W,H);x.fillStyle='#1A1F2E';x.textBaseline='alphabetic';
  x.font=`600 ${Math.round(56*u)}px ${disp}`;x.fillText(`Pärlmönster · ${SHAPE_NAMES[S.shape]}`,m,m+56*u);
  x.font=`${Math.round(34*u)}px ${body}`;x.fillStyle='#5B6478';
  x.fillText(`${BEAD_NAMES[S.bead]} · ${fmt(R.total)} pärlor · ${R.used.length} färger · ${cm(L.bw)} × ${cm(L.bh)} cm · skriv ut i 100 %`,m,m+112*u);
  const top=m+titleH;
  x.textAlign='center';x.textBaseline='middle';x.font=`700 ${Math.round(P*0.5)}px ${body}`;
  L.cells.forEach((cc,i)=>{const cx=m+(cc.x-L.minX+0.5)*P,cy=top+(cc.y-L.minY+0.5)*P,p=R.out[i];
    if(p<0){x.fillStyle='#C9CED8';x.beginPath();x.arc(cx,cy,P*0.12,0,7);x.fill();return}
    const col=PAL[p];x.fillStyle=col.hex;x.beginPath();x.arc(cx,cy,P*0.45,0,7);x.fill();
    x.lineWidth=Math.max(1,2*u);x.strokeStyle=shade(col.rgb,0.6);x.stroke();
    x.fillStyle=lum(col.rgb)>140?'#1A1F2E':'#FFFFFF';x.fillText(R.symOf.get(p),cx,cy+P*0.03)});
  if(L.rect&&S.plate>0){x.strokeStyle='#2747D6';x.lineWidth=4*u;x.setLineDash([18*u,12*u]);
    for(let k=S.plate;k<S.rw;k+=S.plate){x.beginPath();x.moveTo(m+k*P,top);x.lineTo(m+k*P,top+S.rh*P);x.stroke()}
    for(let k=S.plate;k<S.rh;k+=S.plate){x.beginPath();x.moveTo(m,top+k*P);x.lineTo(m+S.rw*P,top+k*P);x.stroke()}x.setLineDash([])}
  // linjal 5 cm
  const sy=top+L.bh*P+dpi*0.25,mmPx=dpi/25.4;x.strokeStyle='#1A1F2E';x.lineWidth=3*u;x.textAlign='left';
  x.beginPath();x.moveTo(m,sy);x.lineTo(m+50*mmPx,sy);x.stroke();
  for(let k=0;k<=50;k++){const len=k%10===0?30*u:k%5===0?20*u:11*u;x.beginPath();x.moveTo(m+k*mmPx,sy);x.lineTo(m+k*mmPx,sy+len);x.lineWidth=(k%10?1.5:3)*u;x.stroke()}
  x.fillStyle='#1A1F2E';x.font=`${Math.round(30*u)}px ${body}`;x.textBaseline='middle';x.fillText('5 cm – mät efter utskrift',m+50*mmPx+24*u,sy+12*u);
  // plocklista
  let ly=sy+scaleH;x.font=`600 ${Math.round(40*u)}px ${disp}`;x.fillText('Plocklista',m,ly);ly+=dpi*0.2;
  R.used.forEach((it,k)=>{const col=PAL[it.idx],cx=m+(k%cols)*colW,cy=ly+Math.floor(k/cols)*dpi*0.25,r=28*u;
    x.fillStyle=col.hex;x.beginPath();x.arc(cx+r,cy,r,0,7);x.fill();x.lineWidth=2*u;x.strokeStyle=shade(col.rgb,0.6);x.stroke();
    x.textAlign='center';x.fillStyle=lum(col.rgb)>140?'#1A1F2E':'#FFFFFF';x.font=`700 ${Math.round(28*u)}px ${body}`;x.fillText(it.sym,cx+r,cy+2*u);
    x.textAlign='left';x.fillStyle='#1A1F2E';x.font=`${Math.round(32*u)}px ${body}`;x.fillText(col.name,cx+2*r+18*u,cy);
    x.textAlign='right';x.font=`700 ${Math.round(32*u)}px ${body}`;x.fillText(fmt(it.count),cx+colW-50*u,cy);x.textAlign='left'});
  c.toBlob(async b=>{const buf=await b.arrayBuffer(),blob=new Blob([addPhys(buf,dpi)],{type:'image/png'});
    if(lastUrl)URL.revokeObjectURL(lastUrl);lastUrl=URL.createObjectURL(blob);$('printImg').src=lastUrl;$('printBox').hidden=false;
    const warn=$('printWarn');const wmm=L.bw*mm;warn.hidden=wmm<=190;warn.textContent=`Mönstret är ${cm(L.bw)} cm brett. Skriv ut på A3 eller dela upp det på flera plattor.`;
    $('printBox').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'})},'image/png');
}
