importScripts('https://www.gstatic.com/firebasejs/4.1.3/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/4.1.3/firebase-messaging.js');
importScripts('firebase-config.js');

if (firebaseConfig) {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();
  console.log(`${new Date().toJSON()}  [firebase-messaging-sw.js] [INFO] initialized messaging`);

  messaging.setBackgroundMessageHandler(payload => {
    console.log(`${new Date().toJSON()}  [firebase-messaging-sw.js] [INFO] Received background message`, payload);
    return self.registration.showNotification('Twilio Chat JS', { icon: 'twilio-icon.png', body: payload.data.twi_body });
  });
} else {
  console.log(`${new Date().toJSON()}  [firebase-messaging-sw.js] [WARN] no configuration found`);
}
