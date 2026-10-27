import{test}from'node:test';
import assert from'node:assert/strict';
import{makeLayout}from'../js/shapes.js';

const layout=(shape,size,grid='offset',rw=29,rh=29)=>makeLayout({shape,size,rw,rh,grid});
const SIZES=[9,15,29,45,61];

test('fyrkant har bredd × höjd pärlor oavsett pinnmönster',()=>{
  for(const[rw,rh]of[[5,5],[29,29],[40,14],[120,120]])for(const grid of['offset','square']){
    const L=layout('rect',29,grid,rw,rh);
    assert.equal(L.cells.length,rw*rh);
    assert.equal(L.bw,rw);assert.equal(L.bh,rh);
  }
});

test('sexkant med förskjutna rader ger centrerade hexagontal 3n(n+1)+1',()=>{
  for(const D of SIZES){const n=(D-1)/2;assert.equal(layout('hex',D).cells.length,3*n*(n+1)+1,`storlek ${D}`)}
});

test('sexuddig stjärna med förskjutna rader ger stjärntal 6n(n−1)+1',()=>{
  const star=k=>{for(let n=1;n<100;n++)if(6*n*(n-1)+1===k)return true;return false};
  for(const D of SIZES){const k=layout('star6',D).cells.length;assert.ok(star(k),`storlek ${D}: ${k}`)}
});

// Antal pärlor per form och storlek (9, 15, 29, 45, 61 tvärs över), låsta från originalversionen
const COUNTS={
  'round/offset':[73,211,769,1843,3403],'round/square':[69,177,665,1597,2941],
  'hex/offset':[61,169,631,1519,2791],'hex/square':[47,147,545,1319,2429],
  'star6/offset':[37,121,433,1093,1837],'star6/square':[37,95,373,895,1631],
  'star5/offset':[34,88,344,826,1503],'star5/square':[33,80,299,710,1312],
  'heart/offset':[69,188,701,1678,3069],'heart/square':[58,163,608,1450,2666],
};
for(const[key,want]of Object.entries(COUNTS)){
  const[shape,grid]=key.split('/');
  test(`antal pärlor: ${shape}, ${grid==='offset'?'förskjutna':'raka'} rader`,()=>{
    assert.deepEqual(SIZES.map(D=>layout(shape,D,grid).cells.length),want);
  });
}

test('pärlornas mittpunkter ryms inom angiven storlek',()=>{
  // formen testas mot radien D/2+0,05, så avståndet mellan yttersta mittpunkterna är högst D+0,1
  for(const shape of['round','hex','star6','star5','heart'])for(const grid of['offset','square'])for(const D of SIZES){
    const L=layout(shape,D,grid);
    assert.ok(L.maxX-L.minX<=D+0.1&&L.maxY-L.minY<=D+0.1,`${shape}/${grid}/${D}: ${L.bw}×${L.bh}`);
  }
});

test('rund, sexkant och stjärnor är spegelsymmetriska i sidled',()=>{
  for(const shape of['round','hex','star6','star5','heart'])for(const grid of['offset','square'])for(const D of SIZES){
    const L=layout(shape,D,grid),mid=(L.minX+L.maxX)/2;
    const set=new Set(L.cells.map(c=>c.row+':'+(c.x-mid)));
    for(const c of L.cells)assert.ok(set.has(c.row+':'+(mid-c.x)),`${shape}/${grid}/${D}`);
  }
});

test('grannar är ömsesidiga och högst 6 (förskjutna) eller 4 (raka)',()=>{
  for(const shape of['round','hex','star6','heart'])for(const grid of['offset','square']){
    const L=layout(shape,29,grid),max=grid==='offset'?6:4;
    L.cells.forEach((c,i)=>{
      assert.ok(c.nb.length<=max);
      for(const j of c.nb)assert.ok(L.cells[j].nb.includes(i),`${shape}/${grid}: ${i}↔${j}`);
    });
  }
});

test('samma inställningar ger samma layout från cachen',()=>{
  const a=layout('round',29),b=layout('round',29);
  assert.equal(a,b);
  assert.notEqual(layout('round',31),a);
});
