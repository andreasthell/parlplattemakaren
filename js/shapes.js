/* ---------- plattformer ---------- */
const PI=Math.PI;

export const SHAPE_NAMES={rect:'Fyrkant',round:'Rund',hex:'Sexkant',star6:'Stjärna',heart:'Hjärta'};

function inPoly(x,y,pts){let ins=false;for(let i=0,j=pts.length-1;i<pts.length;j=i++){const[xi,yi]=pts[i],[xj,yj]=pts[j];if(((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi))ins=!ins}return ins}
const polyAt=(n,r0,r1,start)=>{const p=[];for(let i=0;i<n*2;i++){const a=start+i*PI/n,r=i%2?r1:r0;p.push([Math.cos(a)*r,Math.sin(a)*r])}return p};
const STAR6=polyAt(6,1,1/Math.sqrt(3),-PI/2);
const HEX=[0,1,2,3,4,5].map(i=>[Math.cos(i*PI/3),Math.sin(i*PI/3)]);
const TEST={
  round:(x,y)=>x*x+y*y<=1,
  hex:(x,y)=>inPoly(x,y,HEX),
  star6:(x,y)=>inPoly(x,y,STAR6),
};
/* Litet hjärta, uppmätt hjärtplatta (foto): kvadraten (7×7) och lobernas tre inre rader sitter i det
   diagonala rutnätet, de yttre piggarna i bågar. Koordinater (u,v) i pärlsteg längs rutnätets axlar,
   kvadraten är 0..6; här vänster lob, den högra är spegelbilden (v,u). */
const HEART_ARCS=[[-5.82,3.55],[-5.82,2.51],[-5.61,1.48],[-5.50,4.40],[-5.05,3.00],[-4.97,5.32],[-4.93,0.67],[-4.75,3.98],
  [-4.75,1.98],[-4.05,5.85],[-4.02,4.73],[-4.00,1.23],[-3.97,0.15],[-3.89,3.48],[-3.88,2.47]];
function heartPoints(){
  const pts=[];
  for(let u=0;u<7;u++)for(let v=0;v<7;v++)pts.push([u,v]);
  const lobe=[...HEART_ARCS];
  for(let d=1;d<=3;d++)for(let v=0;v<7;v++)lobe.push([-d,v]);
  for(const[u,v]of lobe)pts.push([u,v],[v,u]);
  return pts.map(([u,v])=>[(u-v)*Math.SQRT1_2,(u+v)*Math.SQRT1_2]);
}
/* Stort hjärta, uppmätt från en bild rakt uppifrån: kvadraten 17×17 med spetsen i (0,0), u uppåt vänster
   och v uppåt höger. Varje lob har tre hela rader i rutnätet, en fjärde med 6 + 6 och 88 piggar i bågar
   (medelvärde av vänster lob och speglad höger lob). 289 + 151 + 151 = 591 piggar. */
const BIG_HEART_ARCS=[
  [19.83,7.49],[19.84,8.51],[19.96,6.28],[19.99,9.73],[20.69,6.98],[20.70,9.02],[20.90,10.29],[20.91,5.70],
  [20.96,4.52],[20.97,8.00],[20.97,11.47],[21.01,12.58],[21.02,1.30],[21.02,2.36],[21.02,3.43],[21.02,14.70],
  [21.03,13.65],[21.03,15.75],[21.04,0.24],[21.57,9.51],[21.58,6.50],[21.80,5.16],[21.80,10.83],[21.91,3.96],
  [21.91,12.06],[21.93,7.48],[21.93,8.52],[21.98,2.80],[21.98,13.22],[22.01,1.68],[22.02,14.33],[22.03,0.58],
  [22.05,15.41],[22.44,5.99],[22.45,10.00],[22.67,4.64],[22.69,11.36],[22.82,3.40],[22.82,12.62],[22.83,6.96],
  [22.83,9.04],[22.90,13.79],[22.92,2.21],[22.97,8.00],[22.98,1.06],[22.98,14.94],[23.30,5.49],[23.31,10.50],
  [23.58,11.87],[23.59,4.13],[23.72,6.46],[23.74,9.54],[23.75,2.85],[23.75,13.14],[23.84,1.65],[23.87,14.35],
  [23.95,7.48],[23.96,8.53],[24.19,11.00],[24.20,4.99],[24.45,3.63],[24.45,12.36],[24.60,10.05],[24.64,2.32],
  [24.64,5.95],[24.64,13.67],[24.89,6.95],[24.89,9.05],[24.99,8.00],[25.03,4.49],[25.05,11.51],[25.31,3.12],
  [25.34,12.89],[25.48,5.43],[25.48,10.57],[25.81,6.44],[25.81,9.55],[25.90,4.01],[25.91,12.01],[25.96,7.46],
  [25.96,8.50],[26.36,4.94],[26.38,11.08],[26.72,10.09],[26.73,5.93],[26.92,6.97],[26.93,9.03],[26.98,8.02]
];
function bigHeartPoints(){
  const pts=[];
  for(let u=0;u<17;u++)for(let v=0;v<17;v++)pts.push([u,v]);
  const lobe=[...BIG_HEART_ARCS];
  for(let u=17;u<20;u++)for(let v=0;v<17;v++)lobe.push([u,v]);
  for(const v of[0,1,2,3,4,5,11,12,13,14,15,16])lobe.push([20,v]);
  for(const[u,v]of lobe)pts.push([u,v],[v,u]);
  return pts.map(([u,v])=>[(v-u)*Math.SQRT1_2,-(u+v)*Math.SQRT1_2]);
}
// runda plattor har piggarna i ringar runt mitten: ring r har 6·r piggar jämnt fördelade
function ringPoints(R,test){
  const pts=[[0,0]],half=R+0.5;
  for(let r=1;r<=R;r++)for(let k=0;k<6*r;k++){const a=2*PI*k/(6*r),x=r*Math.cos(a),y=r*Math.sin(a);if(test(x/half,y/half))pts.push([x,y])}
  return pts;
}
// plattor som inte är rutnät: grannar efter avstånd, och felspridningen går till grannar senare i läsordningen
function pointLayout(pts,info){
  const cells=pts.map(([x,y])=>({x,y})).sort((a,b)=>a.y-b.y||a.x-b.x);
  const near=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y)<=1.3;
  cells.forEach((c,i)=>{c.row=i;c.right=-1;c.nb=[];c.down=[]});
  for(let i=0;i<cells.length;i++)for(let j=i+1;j<cells.length;j++)if(near(cells[i],cells[j])){cells[i].nb.push(j);cells[j].nb.push(i);cells[i].down.push(j)}
  for(const c of cells)c.down=c.down.map(j=>[j,16/c.down.length]);
  let minX=1e9,maxX=-1e9,minY=1e9,maxY=-1e9;
  for(const c of cells){minX=Math.min(minX,c.x);maxX=Math.max(maxX,c.x);minY=Math.min(minY,c.y);maxY=Math.max(maxY,c.y)}
  return{cells,offset:false,minX,maxX,minY,maxY,bw:maxX-minX+1,bh:maxY-minY+1,rect:false,info};
}

export const layoutKey=({shape,size,rw,rh,grid,heart})=>[shape,size,rw,rh,grid].join('|')+(shape==='heart'&&heart==='large'?'|large':'');

/* Bygger plattans pinnar. p: {shape,size,rw,rh,grid}. Senaste resultatet sparas och återanvänds. */
let lastKey='',last=null;
export function makeLayout(p){
  const key=layoutKey(p);
  if(key===lastKey)return last;lastKey=key;
  if(p.shape==='heart')return last=pointLayout(p.heart==='large'?bigHeartPoints():heartPoints(),'');
  if(p.grid==='rings'&&p.shape!=='rect'){const R=Math.max(1,Math.round((p.size-1)/2));
    return last=pointLayout(ringPoints(R,TEST[p.shape]),`${R} ringar runt mitten`)}
  const cells=[];let offset=false;
  if(p.shape==='rect'){for(let r=0;r<p.rh;r++)for(let c=0;c<p.rw;c++)cells.push({x:c,y:r,row:r})}
  else{
    const D=p.size,half=D/2+0.05,test=TEST[p.shape];offset=p.grid==='offset';
    if(!offset){for(let r=0;r<D;r++)for(let c=0;c<D;c++){const x=c-(D-1)/2,y=r-(D-1)/2;if(test(x/half,y/half))cells.push({x,y,row:r})}}
    else{const h=Math.sqrt(3)/2,Rr=Math.floor(half/h)+1,base=D%2?0:0.5,K=Math.ceil(half)+1;
      for(let r=-Rr;r<=Rr;r++){const sh=(r&1)?0.5:0;for(let k=-K;k<=K;k++){const x=k+sh+base,y=r*h;if(test(x/half,y/half))cells.push({x,y,row:r+Rr})}}}
  }
  let minX=1e9,maxX=-1e9,minY=1e9,maxY=-1e9;
  for(const c of cells){minX=Math.min(minX,c.x);maxX=Math.max(maxX,c.x);minY=Math.min(minY,c.y);maxY=Math.max(maxY,c.y)}
  const hash=new Map(),hk=(row,x)=>row*100000+Math.round(x*2)+50000;
  cells.forEach((c,i)=>hash.set(hk(c.row,c.x),i));
  const get=(row,x)=>{const v=hash.get(hk(row,x));return v===undefined?-1:v};
  for(const c of cells){
    c.right=get(c.row,c.x+1);
    c.down=offset?[[get(c.row+1,c.x-0.5),4],[get(c.row+1,c.x+0.5),5]]:[[get(c.row+1,c.x-1),3],[get(c.row+1,c.x),5],[get(c.row+1,c.x+1),1]];
    const nb=offset?[get(c.row,c.x-1),c.right,get(c.row-1,c.x-0.5),get(c.row-1,c.x+0.5),get(c.row+1,c.x-0.5),get(c.row+1,c.x+0.5)]
                   :[get(c.row,c.x-1),c.right,get(c.row-1,c.x),get(c.row+1,c.x)];
    c.nb=nb.filter(v=>v>=0);
  }
  last={cells,offset,minX,maxX,minY,maxY,bw:maxX-minX+1,bh:maxY-minY+1,rect:p.shape==='rect'};
  return last;
}
