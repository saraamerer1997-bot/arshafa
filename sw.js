// أرشفة — Service Worker بسيط حتى يتثبت النظام كتطبيق ويفتح أسرع
// البيانات (Supabase) ما تنحفظ هنا أبداً، تنجلب دائماً من الإنترنت
const CACHE = 'arshafa-v8';
const SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  // فقط ملفات النظام نفسه؛ أي طلب ثاني (قاعدة البيانات، الصور، المكتبات) يروح للإنترنت مباشرة
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  // الشبكة أولاً حتى أي تحديث يوصل فوراً، والنسخة المحفوظة إذا انقطع النت
  e.respondWith(
    fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
  );
});
