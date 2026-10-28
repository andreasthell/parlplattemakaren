/* ---------- delat tillstånd ---------- */
import{PAL}from'./palette.js';
import{layoutKey}from'./shapes.js';

export const S={img:null,shape:'round',size:29,rw:29,rh:29,plate:29,grid:'rings',board:null,bead:'5',fit:'cover',zoom:1,panX:0,panY:0,
  maxc:12,enabled:new Set(PAL.map((_,i)=>i)),bright:0,contrast:0,sat:0,despeckle:true,dither:false,bg:false,bgTol:14,view:'beads',hl:-1,mode:'edit',bz:1};
try{const saved=JSON.parse(localStorage.getItem('pp-enabled')||'null');if(Array.isArray(saved)&&saved.length){S.enabled=new Set(PAL.map((p,i)=>saved.includes(p.code)?i:-1).filter(i=>i>=0))}}catch(e){}

// R: senaste resultatet, done: vilka pärlor som är klara i pärlläget
export const app={R:null,done:null,doneKey:''};

export function savePal(){try{localStorage.setItem('pp-enabled',JSON.stringify([...S.enabled].map(i=>PAL[i].code)))}catch(e){}}

export function loadDone(){
  const R=app.R;
  let h=2166136261;for(const v of R.out)h=Math.imul(h^(v+2),16777619);
  const key=layoutKey(S)+'|'+(h>>>0).toString(36);
  if(key===app.doneKey&&app.done&&app.done.length===R.out.length)return;
  app.doneKey=key;app.done=new Uint8Array(R.out.length);
  try{const s=JSON.parse(localStorage.getItem('pp-done')||'null');if(s&&s.key===key)for(const i of s.idx)if(i<app.done.length&&R.out[i]>=0)app.done[i]=1}catch(e){}
}
export function saveDone(){try{const idx=[];app.done.forEach((v,i)=>{if(v)idx.push(i)});localStorage.setItem('pp-done',JSON.stringify({key:app.doneKey,idx}))}catch(e){}}
