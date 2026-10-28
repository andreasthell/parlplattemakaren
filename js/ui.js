/* ---------- UI ---------- */
import{lum}from'./color.js';
import{PAL}from'./palette.js';
import{makeLayout}from'./shapes.js';
import{resetScaledCache,computeBg,compute}from'./image.js';
import{SAMPLES,sampleImage}from'./samples.js';
import{cv,geo,render,drawThumb}from'./render.js';
import{invalidatePrint,printPattern,downloadPattern}from'./print.js';
import{S,app,savePal,saveDone}from'./state.js';
import{$,fmt,cm}from'./util.js';
import{BUILD}from'./version.js';

function updateInfo(){
  const R=app.R,done=app.done,L=R.L,st=$('stats');
  const bead=S.mode==='bead',doneBy=new Map();let doneAll=0;
  if(done)R.out.forEach((p,i)=>{if(p>=0&&done[i]){doneBy.set(p,(doneBy.get(p)||0)+1);doneAll++}});
  st.innerHTML=bead?`<span><b>${fmt(doneAll)}</b>av ${fmt(R.total)} pärlor klara</span>`
    :`<span><b>${fmt(R.total)}</b>pärlor</span><span><b>${R.used.length}</b>färger</span><span><b>${cm(L.bw)}×${cm(L.bh)}</b>cm</span>`;
  $('legendHint').textContent=bead?'Tryck på en färg för att se var den ska sitta':'Tryck på en färg eller en pärla för att markera var den ska sitta';
  const it=$('items');it.innerHTML='';
  if(R.noColors){it.innerHTML='<p class="note">Välj minst en färg under Färger.</p>'}
  for(const u of R.used){const p=PAL[u.idx],b=document.createElement('button'),d=doneBy.get(u.idx)||0,fin=bead&&d===u.count;
    b.className='item'+(fin?' done':'');b.setAttribute('aria-pressed',S.hl===u.idx);
    b.innerHTML=`<span class="sw" style="background:${p.hex};color:${lum(p.rgb)>140?'#1A1F2E':'#fff'}">${u.sym}</span><span class="nm">${p.name}</span><span class="ct">${fin?'<span class="ok">✓ </span>':''}${bead?fmt(d)+'/'+fmt(u.count):fmt(u.count)}</span>`;
    b.onclick=()=>{S.hl=S.hl===u.idx?-1:u.idx;render();updateInfo()};it.appendChild(b)}
  const wmm=L.bw*parseFloat(S.bead);
  $('printInfo').textContent=wmm>190?`Mönstret är ${cm(L.bw)} cm brett och får inte plats på ett A4 på bredden. Bilden blir större än en sida.`:`Ritas i verklig storlek, ${cm(L.bw)}×${cm(L.bh)} cm.`;
}

let pending=false;
function update(){if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;compute();render();drawThumb();updateInfo();updatePegs();invalidatePrint();$('printBox').hidden=true})}

function buildPal(){const pal=$('pal');pal.innerHTML='';PAL.forEach((p,i)=>{const b=document.createElement('button');b.style.background=p.hex;b.title=p.name;b.setAttribute('aria-label',p.name);b.setAttribute('aria-pressed',S.enabled.has(i));
  b.onclick=()=>{S.enabled.has(i)?S.enabled.delete(i):S.enabled.add(i);b.setAttribute('aria-pressed',S.enabled.has(i));savePal();update()};pal.appendChild(b)})}
$('palAll').onclick=()=>{S.enabled=new Set(PAL.map((_,i)=>i));buildPal();savePal();update()};
$('palNone').onclick=()=>{S.enabled=new Set();buildPal();savePal();update()};

function seg(a,b,key,va,vb,after){const set=v=>{S[key]=v;$(a).setAttribute('aria-pressed',v===va);$(b).setAttribute('aria-pressed',v===vb);after&&after()};$(a).onclick=()=>set(va);$(b).onclick=()=>set(vb);return set}
seg('fitCover','fitContain','fit','cover','contain',update);
// pinnarnas mönster har tre val
const GRIDS={gSquare:'square',gOffset:'offset',gDiagonal:'diagonal'};
function setGrid(v){S.grid=v;for(const id in GRIDS)$(id).setAttribute('aria-pressed',GRIDS[id]===v);update()}
for(const id in GRIDS)$(id).onclick=()=>{setGrid(GRIDS[id]);$('preset').value=''};
seg('vBeads','vSym','view','beads','sym',render);

function syncShapeUI(){
  document.querySelectorAll('[data-shape]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.shape===S.shape));
  const rect=S.shape==='rect';$('rectOpts').hidden=!rect;$('shapeOpts').hidden=rect;$('gridRow').hidden=rect;$('gridNote').hidden=rect;
}
document.querySelectorAll('[data-shape]').forEach(b=>b.onclick=()=>{S.shape=b.dataset.shape;$('preset').value='';
  if(S.shape==='heart')setGrid('diagonal');else if(S.shape!=='rect')setGrid('offset');
  syncShapeUI();update()});

// Hamas plattor (midi), uppmätta från foton: storleken är den som ger samma pinnar som plattan
const PRESETS={
  rect:{shape:'rect',rw:29,rh:29,plate:29},
  round:{shape:'round',size:29,grid:'offset'},
  hex:{shape:'hex',size:15,grid:'offset'},
  star6:{shape:'star6',size:19,grid:'offset'},
  heart:{shape:'heart',size:15,grid:'diagonal'},
};
$('preset').onchange=e=>{const p=PRESETS[e.target.value];if(!p)return;
  Object.assign(S,p,{bead:'5'});$('bead').value='5';
  if(p.shape==='rect'){$('rw').value=p.rw;$('rh').value=p.rh;$('plate').value=p.plate}
  else{$('size').value=p.size;$('sizeV').textContent=p.size;setGrid(p.grid)}
  syncShapeUI();update()};
$('size').addEventListener('input',()=>$('preset').value='');
for(const id of['rw','rh','plate'])$(id).addEventListener('change',()=>$('preset').value='');

// antal piggar, så att man kan jämföra med sin platta
function updatePegs(){
  const L=makeLayout(S),rows=new Map();for(const c of L.cells)rows.set(c.row,(rows.get(c.row)||0)+1);
  $('pegInfo').textContent=`${fmt(L.cells.length)} piggar i ${rows.size} rader, ${Math.max(...rows.values())} i den bredaste raden`;
}

function slider(id,key,f=v=>v,label=v=>v){const el=$(id),out=$(id+'V');const h=()=>{S[key]=f(+el.value);if(out)out.textContent=label(+el.value);update()};el.oninput=h;if(out)out.textContent=label(+el.value)}
slider('zoom','zoom',v=>v/100,v=>v+' %');slider('panX','panX',v=>v/100);slider('panY','panY',v=>v/100);
slider('size','size');slider('maxc','maxc');slider('bright','bright');slider('contrast','contrast');slider('sat','sat');slider('bgTol','bgTol');
function num(id,key,min,max){const el=$(id);el.onchange=()=>{let v=Math.round(+el.value||0);v=Math.min(max,Math.max(min,v));el.value=v;S[key]=v;update()}}
num('rw','rw',5,120);num('rh','rh',5,120);num('plate','plate',0,120);
$('bead').onchange=e=>{S.bead=e.target.value;update()};
$('despeckle').onchange=e=>{S.despeckle=e.target.checked;update()};
$('dither').onchange=e=>{S.dither=e.target.checked;update()};
$('bg').onchange=e=>{S.bg=e.target.checked;$('bgTolRow').hidden=!S.bg;update()};
$('print').onclick=printPattern;
$('download').onclick=downloadPattern;

function setImage(img,name,sample=null){S.img=img;$('imgName').textContent=name;resetScaledCache();computeBg();
  document.querySelectorAll('[data-sample]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.sample===sample));
  S.zoom=1;S.panX=S.panY=0;$('zoom').value=100;$('zoomV').textContent='100 %';$('panX').value=0;$('panY').value=0;update()}
function loadFile(f){if(!f||!f.type.startsWith('image/'))return;const url=URL.createObjectURL(f),im=new Image();
  im.onload=()=>setImage(im,f.name||'Inklistrad bild');im.onerror=()=>{$('imgName').textContent='Bilden gick inte att läsa. Prova en PNG eller JPG.'};im.src=url}
$('file').onchange=e=>loadFile(e.target.files[0]);
const drop=$('drop');
['dragenter','dragover'].forEach(ev=>drop.addEventListener(ev,e=>{e.preventDefault();drop.classList.add('over')}));
['dragleave','drop'].forEach(ev=>drop.addEventListener(ev,e=>{e.preventDefault();drop.classList.remove('over')}));
const urlHint=()=>{$('imgName').textContent='Länkar kan inte hämtas här. Högerklicka på bilden på webbsidan, välj Kopiera bild och klistra in med Ctrl+V.'};
drop.addEventListener('drop',e=>{const f=e.dataTransfer.files[0];if(f)return loadFile(f);if(/^https?:/i.test(e.dataTransfer.getData('text/uri-list')||e.dataTransfer.getData('text/plain')||''))urlHint()});
document.addEventListener('paste',e=>{const items=[...(e.clipboardData?.items||[])],it=items.find(i=>i.type.startsWith('image/'));if(it)return loadFile(it.getAsFile());const t=e.clipboardData?.getData('text/plain')||'';if(/^https?:\/\/\S+$/i.test(t.trim())&&!/^(INPUT|TEXTAREA)$/.test(document.activeElement?.tagName))urlHint()});
function buildSamples(){const box=$('samples');
  for(const sm of SAMPLES){const b=document.createElement('button'),t=document.createElement('canvas'),im=document.createElement('img');
    t.width=t.height=96;t.getContext('2d').drawImage(sampleImage(sm.id),0,0,96,96);im.src=t.toDataURL();im.alt='';
    b.dataset.sample=sm.id;b.title=sm.name;b.setAttribute('aria-label','Exempel: '+sm.name);b.appendChild(im);
    b.onclick=()=>setImage(sampleImage(sm.id),'Exempel: '+sm.name,sm.id);box.appendChild(b)}}

cv.addEventListener('click',e=>{const R=app.R;if(!R||!geo)return;const r=cv.getBoundingClientRect(),k=geo.w/r.width,mx=(e.clientX-r.left)*k,my=(e.clientY-r.top)*k,L=R.L;
  let bi=-1,bd=1e9;L.cells.forEach((c,i)=>{const dx=geo.pad+(c.x-L.minX+0.5)*geo.cell-mx,dy=geo.pad+(c.y-L.minY+0.5)*geo.cell-my,d=dx*dx+dy*dy;if(d<bd){bd=d;bi=i}});
  if(bi<0||bd>geo.cell*geo.cell)return;const p=R.out[bi];
  if(S.mode==='bead'){if(p<0)return;if(S.hl===p){app.done[bi]^=1;saveDone()}else S.hl=p}
  else S.hl=(p<0||S.hl===p)?-1:p;
  render();updateInfo()});

let wake=null;
async function keepAwake(){try{if('wakeLock' in navigator){wake=await navigator.wakeLock.request('screen')}}catch(e){wake=null}}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&S.mode==='bead'&&(!wake||wake.released))keepAwake()});
function setMode(m){S.mode=m;S.bz=1;document.body.classList.toggle('beading',m==='bead');
  if(m==='bead')keepAwake();else if(wake){wake.release().catch(()=>{});wake=null}
  render();updateInfo();window.scrollTo(0,0)}
$('startBead').onclick=()=>setMode('bead');
$('exitBead').onclick=()=>setMode('edit');
$('zIn').onclick=()=>{S.bz=Math.min(4,S.bz*1.4);render()};
$('zOut').onclick=()=>{S.bz=Math.max(1,S.bz/1.4);render()};
let resetArmed=false;
$('resetDone').onclick=e=>{const b=e.currentTarget;
  if(!resetArmed){resetArmed=true;b.textContent='Tryck igen för att börja om';setTimeout(()=>{resetArmed=false;b.textContent='Börja om'},3000);return}
  resetArmed=false;b.textContent='Börja om';app.done.fill(0);saveDone();render();updateInfo()};

new ResizeObserver(()=>render()).observe($('boardBox'));
matchMedia('(prefers-color-scheme: dark)').addEventListener('change',render);
new MutationObserver(render).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
document.fonts&&document.fonts.ready.then(render);

buildPal();buildSamples();syncShapeUI();setImage(sampleImage('sun'),'Exempel: Solen','sun');

// byggnummer, så att man kan se vilken version som körs
$('build').textContent=BUILD.number==='dev'?'Utvecklingsversion'
  :`Version ${BUILD.number} · ${new Date(BUILD.date+'T12:00:00Z').toLocaleDateString('sv-SE',{day:'numeric',month:'short',year:'numeric'})} · ${BUILD.sha}`;

if('serviceWorker' in navigator){
  // när en ny version tar över visas en knapp för att ladda om; inte vid allra första installationen
  const hadController=!!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener('controllerchange',()=>{if(hadController)$('updated').hidden=false});
  $('reload').onclick=()=>location.reload();
  navigator.serviceWorker.register('sw.js').catch(()=>{});
}
