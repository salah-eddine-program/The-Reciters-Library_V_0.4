// عند تعديل أي ملف ثابت غيّر رقم الإصدار ليتحدّث التخزين المؤقت
const CACHE = 'quran-player-v4';
const SHELL = ['./', 'index.html', 'style.css', 'script.js', 'manifest.json', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', (e) => {
    e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (e) => {
    const req = e.request;
    if (req.method !== 'GET' || req.headers.has('range')) return;
    const url = new URL(req.url);
    // الصوت والـ API يبقيان على الشبكة دائماً
    if (url.pathname.endsWith('.mp3') || /mp3quran\.net|aladhan\.com/.test(url.hostname)) return;

    e.respondWith(caches.match(req).then((hit) => {
        const net = fetch(req).then((res) => {
            if (res.ok && (url.origin === location.origin || /cdnjs|cdn\.jsdelivr|fonts\.g/.test(url.hostname))) {
                const copy = res.clone();
                caches.open(CACHE).then((c) => c.put(req, copy));
            }
            return res;
        }).catch(() => hit);
        return hit || net;
    }));
});
