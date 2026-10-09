// Offline cache for the stand-alone site: pages network-first, CDN scripts and fonts cache-first
const CACHE='fever-20261010023330';
const CORE=['./','./index.html','./apple-touch-icon.png','./icon-512.png','./manifest.webmanifest'];
self.addEventListener('install',e=>{ self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).catch(()=>{})); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE&&k.startsWith('fever-')).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch',e=>{
  const req=e.request; if(req.method!=='GET') return;
  const u=new URL(req.url);
  if(u.pathname.endsWith('version.json')) return;
  // voice clips never change within a build: serve them from the cache
  if(u.origin===location.origin&&u.pathname.includes('/voice/')){ e.respondWith(caches.match(req).then(r=>r||fetch(req).then(res=>{ if(res.ok){ const cp=res.clone(); caches.open('fvoice').then(c=>c.put(req,cp)); } return res; }))); return; }
  if(u.origin===location.origin){
    e.respondWith(fetch(req).then(r=>{ if(r.ok){ const cp=r.clone(); caches.open(CACHE).then(c=>c.put(req,cp)); } return r; })
      .catch(()=>caches.match(req,{ignoreSearch:true}).then(r=>r||caches.match('./index.html'))));
  }else{
    e.respondWith(caches.match(req).then(r=>r||fetch(req).then(res=>{ const cp=res.clone(); caches.open(CACHE).then(c=>c.put(req,cp)); return res; })));
  }
});
