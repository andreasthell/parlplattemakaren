/* ---------- slumpade toningsmönster ---------- */
const TAU=2*Math.PI;
const frac=v=>v-Math.floor(v);
const clamp01=v=>v<0?0:v>1?1:v;

export const PATTERN_NAMES={linear:'Rak toning',radial:'Cirkel',spiral:'Spiral',waves:'Vågor'};

/* Var i toningen punkten (x,y) ligger, 0..1. x och y går från -1 till 1 över bilden. */
export function makeField(type,rand=Math.random){
  if(type==='linear'){const a=rand()*TAU,c=Math.cos(a),s=Math.sin(a);
    return(x,y)=>clamp01((x*c+y*s)/Math.SQRT2*0.5+0.5)}
  if(type==='radial'){const cx=(rand()-0.5)*0.6,cy=(rand()-0.5)*0.6;
    return(x,y)=>clamp01(Math.hypot(x-cx,y-cy)/1.6)}
  if(type==='spiral'){const turns=0.6+rand()*1.2,dir=rand()<0.5?1:-1,a0=rand();
    return(x,y)=>frac(dir*Math.atan2(y,x)/TAU+a0+Math.hypot(x,y)*turns)}
  // vågor: två korsande sinusvågor
  const w=()=>({fx:(rand()-0.5)*8,fy:(rand()-0.5)*8,p:rand()*TAU}),w1=w(),w2=w();
  return(x,y)=>0.5+0.25*(Math.sin(w1.fx*x+w1.fy*y+w1.p)+Math.sin(w2.fx*x+w2.fy*y+w2.p));
}

/* Färg vid t (0..1) mellan jämnt utspridda färgstopp, som [r,g,b]. */
export function colorAt(stops,t){
  if(stops.length===1)return stops[0];
  const p=clamp01(t)*(stops.length-1),i=Math.min(stops.length-2,Math.floor(p)),f=p-i;
  return stops[i].map((c,k)=>c+(stops[i+1][k]-c)*f);
}

/* Väljer 2–4 av färgerna (rgb-listor) och en sorts toning. */
export function randomPattern(colors,rand=Math.random){
  const pool=[...colors],picked=[];
  const n=Math.min(pool.length,2+Math.floor(rand()*3));
  while(picked.length<n)picked.push(pool.splice(Math.floor(rand()*pool.length),1)[0]);
  const types=Object.keys(PATTERN_NAMES),type=types[Math.floor(rand()*types.length)];
  // spiralen går runt, så sista färgen måste gå tillbaka till den första
  const stops=type==='spiral'&&picked.length>1?[...picked,picked[0]]:picked;
  return{type,name:PATTERN_NAMES[type],stops,field:makeField(type,rand)};
}

export function drawPattern(p,size=480){
  const c=document.createElement('canvas');c.width=c.height=size;const x=c.getContext('2d');
  const img=x.createImageData(size,size),d=img.data;
  for(let j=0;j<size;j++)for(let i=0;i<size;i++){
    const col=colorAt(p.stops,p.field(i/(size-1)*2-1,j/(size-1)*2-1)),k=(j*size+i)*4;
    d[k]=col[0];d[k+1]=col[1];d[k+2]=col[2];d[k+3]=255;
  }
  x.putImageData(img,0,0);return c;
}
