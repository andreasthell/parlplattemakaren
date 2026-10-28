import{test}from'node:test';
import assert from'node:assert/strict';
import{placement}from'../js/image.js';
import{S}from'../js/state.js';

const board={bw:29,bh:29};

test('bilden är centrerad utan flytt',()=>{
  Object.assign(S,{fit:'cover',zoom:1,panX:0,panY:0});
  const p=placement(board,800,500);
  assert.ok(Math.abs(p.ox+(p.dw-29)/2)<1e-9&&Math.abs(p.oy)<1e-9);
});

test('båda reglagen flyttar bilden, även i den riktning där bilden passar exakt',()=>{
  for(const[iw,ih]of[[800,500],[500,800],[600,600]])for(const fit of['cover','contain']){
    Object.assign(S,{fit,zoom:1,panX:0,panY:0});const p0=placement(board,iw,ih);
    S.panX=0.5;const px=placement(board,iw,ih);
    S.panY=0.5;const pxy=placement(board,iw,ih);
    assert.ok(px.ox>p0.ox,`sidled ${iw}×${ih} ${fit}`);
    assert.ok(pxy.oy>px.oy,`höjdled efter sidled ${iw}×${ih} ${fit}`);
    assert.equal(pxy.ox,px.ox);
  }
});

test('en bild som sticker ut kan flyttas så att kanten hamnar vid plattans kant',()=>{
  Object.assign(S,{fit:'cover',zoom:1,panX:1,panY:0});
  const p=placement(board,1600,500);// 4 plattor bred
  assert.ok(Math.abs(p.ox)<1e-9);// vänsterkanten vid plattans vänsterkant
  S.panX=-1;assert.ok(Math.abs(placement(board,1600,500).ox+p.dw-29)<1e-9);
});
