import{test}from'node:test';
import assert from'node:assert/strict';
import{readFileSync,readdirSync}from'node:fs';

const root=new URL('../',import.meta.url);
const sw=readFileSync(new URL('sw.js',root),'utf8');
const assets=new Set(JSON.parse(sw.match(/const ASSETS=(\[[\s\S]*?\]);/)[1].replace(/'/g,'"').replace(/,\s*\]/,']')));
const files=dir=>readdirSync(new URL(dir+'/',root)).map(f=>dir+'/'+f);

test('service workern sparar alla filer som sidan behöver offline',()=>{
  const need=['./','index.html','manifest.webmanifest',...files('css'),...files('js'),...files('icons'),
    ...files('fonts').filter(f=>f.endsWith('.woff2'))];
  for(const f of need)assert.ok(assets.has(f),`${f} saknas i ASSETS i sw.js`);
  for(const f of assets)assert.ok(need.includes(f),`${f} i sw.js finns inte`);
});

test('manifestets ikoner finns',()=>{
  const m=JSON.parse(readFileSync(new URL('manifest.webmanifest',root),'utf8'));
  for(const i of m.icons)assert.ok(assets.has(i.src),i.src);
});
