const CACHE_NAME = "ai-effects-studio-v1";
const APP_SHELL = ["/zh-CN/studio", "/pwa-icon.svg", "/favicon.ico"];
const OFFLINE_HTML = `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>AI 效果工坊</title>
    <style>
      body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #f8f4ea; color: #171510; font-family: system-ui, sans-serif; }
      main { max-width: 28rem; padding: 2rem; text-align: center; }
      h1 { font-size: 1.5rem; margin: 0 0 .75rem; }
      p { line-height: 1.7; color: rgba(23, 21, 16, .64); }
    </style>
  </head>
  <body>
    <main>
      <h1>当前离线</h1>
      <p>已保存的页面可以继续查看。需要生成、上传或支付时，请重新连接网络。</p>
    </main>
  </body>
</html>`;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .catch(() => undefined),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(
        () =>
          caches.match("/zh-CN/studio") ||
          new Response(OFFLINE_HTML, {
            headers: { "Content-Type": "text/html; charset=utf-8" },
          }),
      ),
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(
      (cached) =>
        cached ||
        fetch(event.request).then((response) => {
          if (!response || response.status !== 200 || response.type === "opaque") {
            return response;
          }

          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, copy).catch(() => undefined);
          });

          return response;
        }),
    ).catch(
      () =>
        new Response("", {
          status: 503,
          statusText: "Offline",
        }),
    ),
  );
});
