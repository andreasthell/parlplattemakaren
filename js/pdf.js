/* ---------- minimal PDF med en JPEG-bild i verklig storlek ---------- */
// Används på iPad i hemskärmsläget, där window.print() inte fungerar men en PDF kan skrivas ut i 100 %.
const A4=[595.28,841.89]; // punkter (1/72 tum)

/* jpeg: JPEG-filens byte, width/height: bildens storlek i pixlar, dpi: pixlar per tum.
   Sidan är A4, eller större om bilden inte får plats; bilden ligger i övre vänstra hörnet. */
export function jpegToPdf(jpeg,{width,height,dpi}){
  const pt=v=>+(v/dpi*72).toFixed(2),iw=pt(width),ih=pt(height);
  const pw=Math.max(A4[0],iw),ph=Math.max(A4[1],ih);
  const enc=new TextEncoder(),parts=[],offsets=[];let len=0;
  const add=b=>{if(typeof b==='string')b=enc.encode(b);parts.push(b);len+=b.length};
  const obj=(n,body)=>{offsets[n]=len;add(`${n} 0 obj\n`);body();add('\nendobj\n')};
  const content=`q ${iw} 0 0 ${ih} 0 ${+(ph-ih).toFixed(2)} cm /Im0 Do Q`;
  add('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
  obj(1,()=>add('<< /Type /Catalog /Pages 2 0 R >>'));
  obj(2,()=>add('<< /Type /Pages /Kids [3 0 R] /Count 1 >>'));
  obj(3,()=>add(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pw} ${ph}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`));
  obj(4,()=>{add(`<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`);add(jpeg);add('\nendstream')});
  obj(5,()=>add(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`));
  const xref=len;
  add(`xref\n0 6\n0000000000 65535 f \n${offsets.slice(1).map(o=>String(o).padStart(10,'0')+' 00000 n \n').join('')}`);
  add(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
  const out=new Uint8Array(len);let o=0;for(const p of parts){out.set(p,o);o+=p.length}
  return out;
}
