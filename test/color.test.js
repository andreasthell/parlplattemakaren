import{test}from'node:test';
import assert from'node:assert/strict';
import{rgb2lab,de2000,quantize}from'../js/color.js';
import{PAL}from'../js/palette.js';

// Testdata från G. Sharma, W. Wu, E. N. Dalal, "The CIEDE2000 color-difference formula:
// Implementation notes, supplementary test data, and mathematical observations" (2005), tabell 1.
const SHARMA=[
  [[50.0000,2.6772,-79.7751],[50.0000,0.0000,-82.7485],2.0425],
  [[50.0000,3.1571,-77.2803],[50.0000,0.0000,-82.7485],2.8615],
  [[50.0000,2.8361,-74.0200],[50.0000,0.0000,-82.7485],3.4412],
  [[50.0000,-1.3802,-84.2814],[50.0000,0.0000,-82.7485],1.0000],
  [[50.0000,-1.1848,-84.8006],[50.0000,0.0000,-82.7485],1.0000],
  [[50.0000,-0.9009,-85.5211],[50.0000,0.0000,-82.7485],1.0000],
  [[50.0000,0.0000,0.0000],[50.0000,-1.0000,2.0000],2.3669],
  [[50.0000,-1.0000,2.0000],[50.0000,0.0000,0.0000],2.3669],
  [[50.0000,2.4900,-0.0010],[50.0000,-2.4900,0.0009],7.1792],
  [[50.0000,2.4900,-0.0010],[50.0000,-2.4900,0.0010],7.1792],
  [[50.0000,2.4900,-0.0010],[50.0000,-2.4900,0.0011],7.2195],
  [[50.0000,2.4900,-0.0010],[50.0000,-2.4900,0.0012],7.2195],
  [[50.0000,-0.0010,2.4900],[50.0000,0.0009,-2.4900],4.8045],
  [[50.0000,-0.0010,2.4900],[50.0000,0.0010,-2.4900],4.8045],
  [[50.0000,-0.0010,2.4900],[50.0000,0.0011,-2.4900],4.7461],
  [[50.0000,2.5000,0.0000],[50.0000,0.0000,-2.5000],4.3065],
  [[50.0000,2.5000,0.0000],[73.0000,25.0000,-18.0000],27.1492],
  [[50.0000,2.5000,0.0000],[61.0000,-5.0000,29.0000],22.8977],
  [[50.0000,2.5000,0.0000],[56.0000,-27.0000,-3.0000],31.9030],
  [[50.0000,2.5000,0.0000],[58.0000,24.0000,15.0000],19.4535],
  [[50.0000,2.5000,0.0000],[50.0000,3.1736,0.5854],1.0000],
  [[50.0000,2.5000,0.0000],[50.0000,3.2972,0.0000],1.0000],
  [[50.0000,2.5000,0.0000],[50.0000,1.8634,0.5757],1.0000],
  [[50.0000,2.5000,0.0000],[50.0000,3.2592,0.3350],1.0000],
  [[60.2574,-34.0099,36.2677],[60.4626,-34.1751,39.4387],1.2644],
  [[63.0109,-31.0961,-5.8663],[62.8187,-29.7946,-4.0864],1.2630],
  [[61.2901,3.7196,-5.3901],[61.4292,2.2480,-4.9620],1.8731],
  [[35.0831,-44.1164,3.7933],[35.0232,-40.0716,1.5901],1.8645],
  [[22.7233,20.0904,-46.6940],[23.0331,14.9730,-42.5619],2.0373],
  [[36.4612,47.8580,18.3852],[36.2715,50.5065,21.2231],1.4146],
  [[90.8027,-2.0831,1.4410],[91.1528,-1.6435,0.0447],1.4441],
  [[90.9257,-0.5406,-0.9208],[88.6381,-0.8985,-0.7239],1.5381],
  [[6.7747,-0.2908,-2.4247],[5.8714,-0.0985,-2.2286],0.6377],
  [[2.0776,0.0795,-1.1350],[0.9033,-0.0636,-0.5514],0.9082],
];

test('CIEDE2000 stämmer med Sharmas 34 testpar på fyra decimaler',()=>{
  SHARMA.forEach(([p,q,want],i)=>{
    const got=de2000(p,q);
    assert.ok(Math.abs(got-want)<5e-5,`par ${i+1}: fick ${got.toFixed(4)}, väntade ${want}`);
  });
});

test('CIEDE2000 är symmetrisk och noll för samma färg',()=>{
  for(const[p,q]of SHARMA){
    assert.ok(Math.abs(de2000(p,q)-de2000(q,p))<1e-9);
    assert.equal(de2000(p,p),0);
  }
});

test('rgb2lab ger kända värden för sRGB (D65)',()=>{
  // matrisen har fyra decimaler, så resultatet kan avvika några hundradelar från referensvärdena
  const near=(got,want,tol=0.05)=>got.forEach((v,i)=>assert.ok(Math.abs(v-want[i])<tol,`${got} ≠ ${want}`));
  near(rgb2lab(255,255,255),[100,0,0]);
  near(rgb2lab(0,0,0),[0,0,0]);
  near(rgb2lab(255,0,0),[53.24,80.09,67.20]);
  near(rgb2lab(0,255,0),[87.73,-86.18,83.18]);
  near(rgb2lab(0,0,255),[32.30,79.19,-107.86]);
  near(rgb2lab(128,128,128),[53.59,0,0]);
});

test('varje pärlfärg matchas mot sig själv',()=>{
  const E=PAL.map((_,i)=>i),N=PAL.length;
  const rgb=Float32Array.from(PAL.flatMap(p=>p.rgb)),filled=new Uint8Array(N).fill(1);
  const cells=PAL.map(()=>({right:-1,down:[],nb:[]}));
  const{asg}=quantize({rgb,filled,cells,pal:PAL,E,maxc:N,dither:false,despeckle:false});
  assert.deepEqual([...asg],E);
});

test('färgantalet begränsas till maxc och ovanligaste färgen försvinner först',()=>{
  // tre röda, två blå, en gul
  const idx=c=>PAL.findIndex(p=>p.code===c),red=idx('05'),blue=idx('09'),yellow=idx('03');
  const order=[red,red,red,blue,blue,yellow];
  const rgb=Float32Array.from(order.flatMap(i=>PAL[i].rgb)),filled=new Uint8Array(order.length).fill(1);
  const cells=order.map(()=>({right:-1,down:[],nb:[]}));
  const E=[yellow,red,blue].sort((a,b)=>a-b);
  const{asg}=quantize({rgb,filled,cells,pal:PAL,E,maxc:2,dither:false,despeckle:false});
  const used=new Set([...asg].map(j=>E[j]));
  assert.equal(used.size,2);
  assert.ok(!used.has(yellow));
});

test('tomma celler får ingen färg',()=>{
  const rgb=new Float32Array(6),filled=Uint8Array.from([1,0]);
  const cells=[{right:-1,down:[],nb:[]},{right:-1,down:[],nb:[]}];
  const{asg}=quantize({rgb,filled,cells,pal:PAL,E:[0,13],maxc:2,dither:false,despeckle:false});
  assert.equal(asg[1],-1);
  assert.equal(asg[0],1); // svart pixel → Svart
});
