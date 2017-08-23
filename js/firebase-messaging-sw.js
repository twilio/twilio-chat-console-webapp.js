importScripts('https://www.gstatic.com/firebasejs/4.1.3/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/4.1.3/firebase-messaging.js');
importScripts('firebase-config.js');

if (firebaseConfig) {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();
  console.log(`${new Date()} [firebase-messaging-sw.js] [INFO] initialized messaging`);

  messaging.setBackgroundMessageHandler(payload => {
    console.log(`${new Date()} [firebase-messaging-sw.js] [INFO] Received background message`, payload);
    clients.matchAll().then(clients => {
      clients.forEach(client => {
        return client.postMessage(payload);
      });
    });
  });
} else {
  console.log(`${new Date()} [firebase-messaging-sw.js] [WARN] no configuration found`);
}
