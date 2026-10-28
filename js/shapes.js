/* ---------- plattformer ---------- */
const PI=Math.PI;

export const SHAPE_NAMES={rect:'Fyrkant',round:'Rund',hex:'Sexkant',star6:'Stjärna (6 uddar)',star5:'Stjärna (5 uddar)',heart:'Hjärta'};

function inPoly(x,y,pts){let ins=false;for(let i=0,j=pts.length-1;i<pts.length;j=i++){const[xi,yi]=pts[i],[xj,yj]=pts[j];if(((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi))ins=!ins}return ins}
const polyAt=(n,r0,r1,start)=>{const p=[];for(let i=0;i<n*2;i++){const a=start+i*PI/n,r=i%2?r1:r0;p.push([Math.cos(a)*r,Math.sin(a)*r])}return p};
const STAR6=polyAt(6,1,1/Math.sqrt(3),-PI/2),STAR5=polyAt(5,1,0.5,-PI/2);
const HEX=[0,1,2,3,4,5].map(i=>[Math.cos(i*PI/3),Math.sin(i*PI/3)]);
const TEST={
  round:(x,y)=>x*x+y*y<=1,
  hex:(x,y)=>inPoly(x,y,HEX),
  star6:(x,y)=>inPoly(x,y,STAR6),
  star5:(x,y)=>inPoly(x,y*1.05-0.05,STAR5),
  heart:(x,y)=>{const hx=x*1.14,hy=-y*1.125+0.125,a=hx*hx+hy*hy-1;return a*a*a-hx*hx*hy*hy*hy<=0}
};
// På diagonala plattor följer hjärtats nedre kanter rutnätet (45°): ett V med två runda lober.
// Formen är anpassad efter Hamas lilla hjärtplatta (storlek 15).
const TEST_DIAGONAL={
  heart:(x,y)=>{x=Math.abs(x);return(y>=-0.12&&x<=1-y)||((x-0.5)**2+(y+0.12)**2<=0.52*0.52)}
};

export const layoutKey=({shape,size,rw,rh,grid})=>[shape,size,rw,rh,grid].join('|');

/* Bygger plattans pinnar. p: {shape,size,rw,rh,grid}. Senaste resultatet sparas och återanvänds. */
let lastKey='',last=null;
export function makeLayout(p){
  const key=layoutKey(p);
  if(key===lastKey)return last;lastKey=key;
  const cells=[];let offset=false;
  if(p.shape==='rect'){for(let r=0;r<p.rh;r++)for(let c=0;c<p.rw;c++)cells.push({x:c,y:r,row:r})}
  else{
    const D=p.size,half=D/2+0.05,diagonal=p.grid==='diagonal',test=(diagonal&&TEST_DIAGONAL[p.shape])||TEST[p.shape];
    // diagonala och förskjutna rader har halvt steg mellan raderna, så grannarna hittas på samma sätt
    offset=p.grid==='offset'||diagonal;
    if(diagonal){
      // kvadratiskt rutnät vridet 45°: rader med √½ mellanrum, √2 mellan pinnarna i raden, varannan rad förskjuten
      const h=Math.SQRT1_2,Rr=Math.ceil(half/h)+1,K=Math.ceil(half/(2*h))+1;
      for(let r=-Rr;r<=Rr;r++){const sh=(r&1)?h:0;for(let k=-K;k<=K;k++){const x=k*2*h+sh,y=r*h;if(test(x/half,y/half))cells.push({x,y,row:r+Rr})}}
    }
    else if(!offset){for(let r=0;r<D;r++)for(let c=0;c<D;c++){const x=c-(D-1)/2,y=r-(D-1)/2;if(test(x/half,y/half))cells.push({x,y,row:r})}}
    else{const h=Math.sqrt(3)/2,Rr=Math.floor(half/h)+1,base=D%2?0:0.5,K=Math.ceil(half)+1;
      for(let r=-Rr;r<=Rr;r++){const sh=(r&1)?0.5:0;for(let k=-K;k<=K;k++){const x=k+sh+base,y=r*h;if(test(x/half,y/half))cells.push({x,y,row:r+Rr})}}}
  }
  let minX=1e9,maxX=-1e9,minY=1e9,maxY=-1e9;
  for(const c of cells){minX=Math.min(minX,c.x);maxX=Math.max(maxX,c.x);minY=Math.min(minY,c.y);maxY=Math.max(maxY,c.y)}
  const hash=new Map(),hk=(row,x)=>row*100000+Math.round(x*2)+50000;
  cells.forEach((c,i)=>hash.set(hk(c.row,c.x),i));
  const get=(row,x)=>{const v=hash.get(hk(row,x));return v===undefined?-1:v};
  // avståndet i sidled till grannen i raden ovanför/under, och till nästa pinne i samma rad
  const dx=p.grid==='diagonal'?Math.SQRT1_2:0.5,step=2*dx;
  for(const c of cells){
    c.right=get(c.row,c.x+step);
    c.down=offset?[[get(c.row+1,c.x-dx),4],[get(c.row+1,c.x+dx),5]]:[[get(c.row+1,c.x-1),3],[get(c.row+1,c.x),5],[get(c.row+1,c.x+1),1]];
    // på diagonala plattor ligger pinnen bredvid i samma rad längre bort än grannarna snett ovanför och under
    const nb=offset?[...(p.grid==='diagonal'?[]:[get(c.row,c.x-step),c.right]),get(c.row-1,c.x-dx),get(c.row-1,c.x+dx),get(c.row+1,c.x-dx),get(c.row+1,c.x+dx)]
                   :[get(c.row,c.x-1),c.right,get(c.row-1,c.x),get(c.row+1,c.x)];
    c.nb=nb.filter(v=>v>=0);
  }
  last={cells,offset,minX,maxX,minY,maxY,bw:maxX-minX+1,bh:maxY-minY+1,rect:p.shape==='rect'};
  return last;
}
