/* Service worker: sparar hela sidan vid installation så att den fungerar offline.
   VERSION byts mot commit-SHA vid publicering, så varje ny version laddas ner på nytt. */
const VERSION='dev';
const CACHE='parlplatta-'+VERSION;
const ASSETS=[
  './',
  'index.html',
  'manifest.webmanifest',
  'css/style.css',
  'css/fonts.css',
  'js/color.js',
  'js/image.js',
  'js/palette.js',
  'js/pattern.js',
  'js/pdf.js',
  'js/print.js',
  'js/render.js',
  'js/samples.js',
  'js/shapes.js',
  'js/state.js',
  'js/ui.js',
  'js/util.js',
  'js/version.js',
  'fonts/atkinson-hyperlegible-400-latin.woff2',
  'fonts/atkinson-hyperlegible-400-latin-ext.woff2',
  'fonts/atkinson-hyperlegible-700-latin.woff2',
  'fonts/atkinson-hyperlegible-700-latin-ext.woff2',
  'fonts/fredoka-latin.woff2',
  'fonts/fredoka-latin-ext.woff2',
  'icons/icon.svg',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-512.png',
  'icons/apple-touch-icon.png',
];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS.map(u=>new Request(u,{cache:'reload'})))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('parlplatta-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET'||new URL(req.url).origin!==location.origin)return;
  const nav=req.mode==='navigate';
  // cachen först; utan träff nätet, och offline faller sidnavigeringar tillbaka på index.html
  e.respondWith(caches.open(CACHE).then(async c=>{
    const hit=await c.match(req,{ignoreSearch:nav});if(hit)return hit;
    try{return await fetch(req)}catch(err){const page=nav&&await c.match('index.html');if(page)return page;throw err}
  }));
});
