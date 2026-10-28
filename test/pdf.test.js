import{test}from'node:test';
import assert from'node:assert/strict';
import{jpegToPdf}from'../js/pdf.js';

const fakeJpeg=Uint8Array.from([0xFF,0xD8,0xFF,0xE0,1,2,3,0xFF,0xD9]);
const text=u8=>Buffer.from(u8).toString('latin1');

test('PDF:en har giltig xref som pekar på varje objekt',()=>{
  const pdf=text(jpegToPdf(fakeJpeg,{width:2481,height:2741,dpi:300}));
  assert.ok(pdf.startsWith('%PDF-1.4'));assert.ok(pdf.trimEnd().endsWith('%%EOF'));
  const xref=+pdf.match(/startxref\n(\d+)/)[1];
  assert.ok(pdf.startsWith('xref',xref));
  const offs=pdf.slice(xref).match(/(\d{10}) 00000 n/g).map(s=>+s.slice(0,10));
  assert.equal(offs.length,5);
  offs.forEach((o,i)=>assert.ok(pdf.startsWith(`${i+1} 0 obj`,o),`objekt ${i+1}`));
});

test('bilden bäddas in oförändrad med rätt längd',()=>{
  const pdf=text(jpegToPdf(fakeJpeg,{width:10,height:10,dpi:300}));
  assert.ok(pdf.includes(`/Length ${fakeJpeg.length} >>\nstream\n${text(fakeJpeg)}\nendstream`));
});

test('bilden får sin fysiska storlek på en A4-sida',()=>{
  // 2481 px i 300 dpi = 8,27 tum = 595,44 pt; 2741 px = 657,84 pt
  const pdf=text(jpegToPdf(fakeJpeg,{width:2481,height:2741,dpi:300}));
  assert.match(pdf,/\/MediaBox \[0 0 595.44 841.89\]/);
  assert.match(pdf,/q 595.44 0 0 657.84 0 184.05 cm \/Im0 Do Q/);
});

test('större bilder får en större sida',()=>{
  const pdf=text(jpegToPdf(fakeJpeg,{width:3600,height:4200,dpi:300}));
  assert.match(pdf,/\/MediaBox \[0 0 864 1008\]/);
});
