/* ---------- färgmatematik och färgmatchning ---------- */
const PI=Math.PI,D2R=PI/180;

export function rgb2lab(r,g,b){
  const f=c=>{c/=255;return c<=0.04045?c/12.92:Math.pow((c+0.055)/1.055,2.4)};
  const R=f(r),G=f(g),B=f(b);
  let x=(R*0.4124+G*0.3576+B*0.1805)/0.95047,y=(R*0.2126+G*0.7152+B*0.0722),z=(R*0.0193+G*0.1192+B*0.9505)/1.08883;
  const h=t=>t>0.008856?Math.cbrt(t):(7.787*t+16/116);
  x=h(x);y=h(y);z=h(z);return[116*y-16,500*(x-y),200*(y-z)];
}

// CIEDE2000 enligt Sharma, Wu & Dalal (2005), kL=kC=kH=1
export function de2000(p,q){
  const[L1,a1,b1]=p,[L2,a2,b2]=q;
  const C1=Math.hypot(a1,b1),C2=Math.hypot(a2,b2),Cb=(C1+C2)/2,Cb7=Cb**7;
  const G=0.5*(1-Math.sqrt(Cb7/(Cb7+6103515625)));
  const a1p=a1*(1+G),a2p=a2*(1+G),C1p=Math.hypot(a1p,b1),C2p=Math.hypot(a2p,b2);
  let h1=Math.atan2(b1,a1p);if(h1<0)h1+=2*PI;let h2=Math.atan2(b2,a2p);if(h2<0)h2+=2*PI;
  const dL=L2-L1,dC=C2p-C1p;let dh=0;
  if(C1p*C2p!==0){dh=h2-h1;if(dh>PI)dh-=2*PI;else if(dh<-PI)dh+=2*PI}
  const dH=2*Math.sqrt(C1p*C2p)*Math.sin(dh/2),Lb=(L1+L2)/2,Cbp=(C1p+C2p)/2;
  let hb;if(C1p*C2p===0)hb=h1+h2;else if(Math.abs(h1-h2)<=PI)hb=(h1+h2)/2;else if(h1+h2<2*PI)hb=(h1+h2+2*PI)/2;else hb=(h1+h2-2*PI)/2;
  const T=1-0.17*Math.cos(hb-30*D2R)+0.24*Math.cos(2*hb)+0.32*Math.cos(3*hb+6*D2R)-0.20*Math.cos(4*hb-63*D2R);
  const dT=30*D2R*Math.exp(-((((hb/D2R)-275)/25)**2)),Cbp7=Cbp**7,Rc=2*Math.sqrt(Cbp7/(Cbp7+6103515625));
  const Sl=1+0.015*(Lb-50)**2/Math.sqrt(20+(Lb-50)**2),Sc=1+0.045*Cbp,Sh=1+0.015*Cbp*T,Rt=-Math.sin(2*dT)*Rc;
  return Math.sqrt((dL/Sl)**2+(dC/Sc)**2+(dH/Sh)**2+Rt*(dC/Sc)*(dH/Sh));
}
export const de76=(p,q)=>Math.hypot(p[0]-q[0],p[1]-q[1],p[2]-q[2]);
export const clamp=v=>v<0?0:v>255?255:v;
export const lum=([r,g,b])=>(0.299*r+0.587*g+0.114*b);
export const shade=(rgb,k)=>`rgb(${rgb.map(c=>Math.round(c*k)).join(',')})`;

/* Matchar varje pärla mot de valda pärlfärgerna.
   rgb: Float32Array med N*3 värden, filled: Uint8Array med N flaggor, cells: plattans celler (right/down/nb),
   pal: hela paletten, E: sorterade index i pal som får användas.
   Returnerar asg (index i E per cell, -1 = tom) och dist (avstånd per cell till varje färg i E). */
export function quantize({rgb,filled,cells,pal,E,maxc,dither,despeckle}){
  const N=filled.length;
  // avstånd per cell till alla valda färger (cache på färg)
  const cache=new Map(),dist=new Array(N);
  const distFor=(r,g,b)=>{const key=(Math.round(r)<<16)|(Math.round(g)<<8)|Math.round(b);let d=cache.get(key);if(!d){const lab=rgb2lab(r,g,b);d=new Float32Array(E.length);for(let j=0;j<E.length;j++)d[j]=de2000(lab,pal[E[j]].lab);cache.set(key,d)}return d};
  for(let i=0;i<N;i++)if(filled[i])dist[i]=distFor(rgb[i*3],rgb[i*3+1],rgb[i*3+2]);
  const allow=new Uint8Array(E.length).fill(1);
  const nearest=d=>{let bj=-1,bd=1e9;for(let j=0;j<d.length;j++)if(allow[j]&&d[j]<bd){bd=d[j];bj=j}return bj};
  const counts=new Int32Array(E.length),asg=new Int16Array(N).fill(-1);
  for(let i=0;i<N;i++)if(filled[i]){asg[i]=nearest(dist[i]);counts[asg[i]]++}
  let usedN=counts.filter(c=>c>0).length;
  for(let j=0;j<E.length;j++)if(!counts[j])allow[j]=0;
  while(usedN>maxc){
    let mj=-1,mc=1e9;for(let j=0;j<E.length;j++)if(allow[j]&&counts[j]<mc){mc=counts[j];mj=j}
    allow[mj]=0;counts[mj]=0;usedN--;
    for(let i=0;i<N;i++)if(asg[i]===mj){asg[i]=nearest(dist[i]);counts[asg[i]]++}
  }
  if(dither){
    const work=Float32Array.from(rgb),dc=new Map();
    for(let i=0;i<N;i++){
      if(!filled[i])continue;
      const r=clamp(work[i*3]),g=clamp(work[i*3+1]),b=clamp(work[i*3+2]);
      const key=((r>>2)<<12)|((g>>2)<<6)|(b>>2);let j=dc.get(key);
      if(j===undefined){j=nearest(distFor(r,g,b));dc.set(key,j)}
      asg[i]=j;const pc=pal[E[j]].rgb,er=[r-pc[0],g-pc[1],b-pc[2]],c=cells[i];
      const push=(t,w)=>{if(t>=0&&filled[t]){work[t*3]+=er[0]*w;work[t*3+1]+=er[1]*w;work[t*3+2]+=er[2]*w}};
      push(c.right,7/16);for(const[t,w]of c.down)push(t,w/16);
    }
  }
  if(despeckle){
    const copy=Int16Array.from(asg);
    for(let i=0;i<N;i++){
      if(copy[i]<0)continue;const nb=cells[i].nb;let same=false,cnt=new Map(),filledN=0;
      for(const t of nb){if(copy[t]<0)continue;filledN++;if(copy[t]===copy[i]){same=true;break}cnt.set(copy[t],(cnt.get(copy[t])||0)+1)}
      if(same||filledN<Math.min(3,nb.length))continue;
      let bj=-1,bc=0;for(const[k,v]of cnt)if(v>bc||(v===bc&&dist[i][k]<dist[i][bj])){bc=v;bj=k}
      if(bj>=0)asg[i]=bj;
    }
  }
  return{asg,dist};
}
