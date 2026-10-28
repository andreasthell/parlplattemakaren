import{test}from'node:test';
import assert from'node:assert/strict';
import{makeField,colorAt,randomPattern,PATTERN_NAMES}from'../js/pattern.js';

// förutsägbar slump för testerna
const seeded=seed=>()=>(seed=(seed*16807)%2147483647)/2147483647;

test('alla toningar ger värden mellan 0 och 1 över hela bilden',()=>{
  for(const type of Object.keys(PATTERN_NAMES))for(let s=1;s<20;s++){
    const f=makeField(type,seeded(s));
    for(let y=-1;y<=1;y+=0.1)for(let x=-1;x<=1;x+=0.1){const t=f(x,y);assert.ok(t>=0&&t<=1,`${type}: ${t}`)}
  }
});

test('färgen går från första till sista färgstoppet',()=>{
  const stops=[[0,0,0],[100,200,50],[255,255,255]];
  assert.deepEqual(colorAt(stops,0),[0,0,0]);
  assert.deepEqual(colorAt(stops,0.5),[100,200,50]);
  assert.deepEqual(colorAt(stops,1),[255,255,255]);
  assert.deepEqual(colorAt(stops,0.25),[50,100,25]);
});

test('mönstret använder bara de färger man har, 2 till 4 olika',()=>{
  const own=[[1,1,1],[2,2,2],[3,3,3],[4,4,4],[5,5,5],[6,6,6]];
  for(let s=1;s<200;s++){
    const p=randomPattern(own,seeded(s)),used=new Set(p.stops.map(String));
    assert.ok(used.size>=2&&used.size<=4,`${used.size} färger`);
    for(const c of p.stops)assert.ok(own.includes(c));
    if(p.type==='spiral')assert.equal(p.stops.at(-1),p.stops[0]);
  }
});

test('med en enda färg blir det en enfärgad platta',()=>{
  const p=randomPattern([[9,9,9]],seeded(3));
  assert.deepEqual(colorAt(p.stops,0.7),[9,9,9]);
});
