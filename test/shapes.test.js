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

test('grannar är ömsesidiga och högst 6 (förskjutna) eller 4 (raka, diagonala)',()=>{
  for(const shape of['round','hex','star6','heart'])for(const grid of['offset','square','diagonal']){
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

const rowCounts=L=>{const m=new Map();for(const c of L.cells)m.set(c.row,(m.get(c.row)||0)+1);return[...m.keys()].sort((a,b)=>a-b).map(k=>m.get(k))};

test('diagonala grannar ligger ett pärlsteg bort snett ovanför och under',()=>{
  const L=layout('heart',15,'diagonal');
  for(const c of L.cells)for(const j of c.nb){const o=L.cells[j];
    assert.ok(Math.abs(Math.hypot(o.x-c.x,o.y-c.y)-1)<1e-9);assert.equal(Math.abs(o.row-c.row),1)}
});

// Hamas plattor (midi), räknade från foton av plattorna
test('Hama liten sexkant: storlek 15 ger 169 piggar, 8 till 15 per rad',()=>{
  assert.deepEqual(rowCounts(layout('hex',15)),[8,9,10,11,12,13,14,15,14,13,12,11,10,9,8]);
});
test('Hama liten stjärna: storlek 19 ger 181 piggar, uddar på 5 rader och 16 i bredaste raden',()=>{
  const L=layout('star6',19);
  assert.equal(L.cells.length,181);
  assert.deepEqual(rowCounts(L),[1,2,3,4,5,16,15,14,13,12,11,12,13,14,15,16,5,4,3,2,1]);
});
test('Hama litet hjärta: diagonalt, 49 i kvadraten och 30 i varje lob',()=>{
  const L=layout('heart',15,'diagonal'),r=rowCounts(L);
  assert.equal(L.cells.length,109);
  assert.equal(r.length,17);
  // 1 till 10 från spetsen och 11 i raden ovanför, 2 + 2 piggar högst upp
  assert.deepEqual(r.slice(-11),[11,10,9,8,7,6,5,4,3,2,1]);
  assert.equal(r[0],4);
});
test('diagonala hjärtan är spegelsymmetriska i alla storlekar',()=>{
  for(const D of[9,15,22,29,45,61]){
    const L=layout('heart',D,'diagonal'),set=new Set(L.cells.map(c=>c.row+':'+Math.round(c.x*1000)));
    for(const c of L.cells)assert.ok(set.has(c.row+':'+Math.round(-c.x*1000)),`storlek ${D}`);
  }
});
test('Hama stor rund: storlek 28 ger 29 i den bredaste raden',()=>{
  assert.equal(Math.max(...rowCounts(layout('round',28))),29);
});
