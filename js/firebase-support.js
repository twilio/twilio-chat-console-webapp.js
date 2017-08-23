'use strict';

const FirebaseSupport = {
  init: function(log) {
    return $.getJSON('firebase-configuration.json', function(firebaseConfiguration) {
      if (firebase) {
        firebase.initializeApp(firebaseConfiguration);
        if ('serviceWorker' in navigator) {
          window.addEventListener('load', function() {
            navigator.serviceWorker.register('firebase-messaging-sw.js').then(function(registration) {
              firebase.messaging().useServiceWorker(registration);
              log.info('FirebaseSupport.init', 'ServiceWorker registration successful with scope: ', registration.scope);
            }, function(err) {
              log.error('FirebaseSupport.init', 'ServiceWorker registration failed: ', err);
            });
          });
        }
        return firebase.messaging();
      }
      log.error('FirebaseSupport.init', 'no firebase.js imported');
      return null;
    });
  },

  registerForPushCallback: function(log, chatClientInstance) {
    if (firebase && firebase.messaging()) {
      firebase.messaging().requestPermission().then(() => {
        log.info('FirebaseSupport.registerForPushCallback', 'permission request successful');
        firebase.messaging().getToken().then((fcmToken) => {
          log.info('FirebaseSupport.registerForPushCallback', 'got fcm token', fcmToken);
          chatClientInstance.setPushRegistrationId('fcm', fcmToken);
          firebase.messaging().onMessage(payload => {
            log.info('FirebaseSupport.registerForPushCallback', 'push received', payload);
            if (chatClientInstance) {
              chatClientInstance.handlePushNotification(payload);
            }
          });
        }).catch((err) => {
          log.error('FirebaseSupport.registerForPushCallback', 'can\'t get token', err);
        });
      }).catch((err) => {
        log.error('FirebaseSupport.registerForPushCallback', 'can\'t request permission', err);
      });
    } else {
      log.error('FirebaseSupport.registerForPushCallback', 'no firebase.js imported');
    }
  }
};
