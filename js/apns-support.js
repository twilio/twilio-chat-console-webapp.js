'use strict';

/*
 * Currently APN Web Push format is not supported by Twilio Notify.
 * To test push arrival - please use following push payload via any of APN push testing tools:
 * {
 *    "aps": {
 *        "alert": {
 *            "body": "your message goes here"
 *        },
 *        "url-args": [],
 *    }
 * }
 */

const ApnsSupport = {
  log: null,
  permissionData: null,
  chatClientInstance: null,

  init: function(log) {
    ApnsSupport.log = log;
    return $.getJSON('website.json', function(websiteJson) {
      if (websiteJson) {
        if ('safari' in window && 'pushNotification' in window.safari) {
          ApnsSupport.permissionData =
            window.safari.pushNotification.permission(websiteJson.websitePushID);
        }
      } else {
        log.error('ApnsSupport.init', 'no apns.js imported');
      }
    });
  },

  registerForPushCallback: function(log, chatClientInstance) {
    if (ApnsSupport.permissionData) {
      ApnsSupport.checkRemotePermission(ApnsSupport.permissionData);
      ApnsSupport.chatClientInstance = chatClientInstance;
    } else {
      log.error('ApnsSupport.registerForPushCallback', 'no permission data available');
    }
  },

  checkRemotePermission: function(permissionData) {
    return $.getJSON('website.json', function(websiteJson) {
      ApnsSupport.permissionData = permissionData;
      if (ApnsSupport.permissionData.permission === 'default') {
        ApnsSupport.log.info('ApnsSupport.checkRemotePermission', 'requestion permissions', ApnsSupport.permissionData);
        // This is a new web service URL and its validity is unknown.
        window.safari.pushNotification.requestPermission(
          websiteJson.webServiceURL, // The web service URL.
          websiteJson.websitePushID,     // The Website Push ID.
          {}, // Data that you choose to send to your server to help you identify the user.
          ApnsSupport.checkRemotePermission         // The callback function.
        );
      }
      else if (ApnsSupport.permissionData.permission === 'denied') {
        ApnsSupport.log.error(
          'ApnsSupport.checkRemotePermission',
          'notification permission denied',
          ApnsSupport.permissionData);
      }
      else if (permissionData.permission === 'granted') {
        ApnsSupport.log.info(
          'ApnsSupport.checkRemotePermission',
          'notification permission granted',
          ApnsSupport.permissionData);

        ApnsSupport.chatClientInstance.setPushRegistrationId('apn', ApnsSupport.permissionData.deviceToken);
        // firebase.messaging().onMessage(payload => {
        //   log.info('FirebaseSupport.registerForPushCallback', 'push received', payload);
        //   if (chatClientInstance) {
        //     chatClientInstance.handlePushNotification(payload);
        //   }
        // });

      }
    });
  }
};
