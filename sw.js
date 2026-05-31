const CACHE = 'habit-tracker-v1';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(self.clients.claim());
});

// 通知をスケジュールするためのアラームチェック
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SCHEDULE_NOTIFICATIONS') {
    // メインスレッドからの通知スケジュール更新
  }
});

// 定期的に通知タイミングをチェック（fetch経由でキープアライブ）
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(clients => {
      if (clients.length > 0) {
        clients[0].focus();
      } else {
        self.clients.openWindow('./');
      }
    })
  );
});

// バックグラウンド同期で通知チェック
self.addEventListener('periodicsync', e => {
  if (e.tag === 'check-notifications') {
    e.waitUntil(checkAndNotify());
  }
});

async function checkAndNotify() {
  const cache = await caches.open(CACHE);
  const resp = await cache.match('notification-times');
  if (!resp) return;
  const { times, message } = await resp.json();
  const now = new Date();
  const hhmm = now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0');
  if (times.includes(hhmm)) {
    await self.registration.showNotification('習慣トラッカー', {
      body: message || '今日の習慣を記録しましょう！',
      icon: './icon.png',
      badge: './icon.png',
      tag: 'habit-reminder-' + hhmm,
      renotify: true,
    });
  }
}
