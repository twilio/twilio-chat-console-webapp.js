# twilio-chat-console-webapp.js
This repository contains example webapp with Twilio Programmable Chat client usage.
This webapp supports FCM pushes in browsers supporting FCM.

## FCM configuration
You will have to create the FCM credentials by yourself.

Also, you will need to create credentials in the [Twilio Console](https://www.twilio.com/console/chat/credentials) with created certificates and app identifiers and store it in `configuration.json` file. 

FCM configuration is provided to the web console app with help of `credentials.json` file:
1. You can get the Firebase configuration for the web app through Firebase Console
2. The configuration you got then should be stored in the `fcmConfig` -> `firebaseConfig` JSON object.
3. The `manifest.json` configuration should be saved in the `fcmConfig` -> `manifest` JSON object.

Keep in mind, that to send pushes you have to turn on the push features for your service instance via [Twilio Console](https://www.twilio.com/console/chat) 

## Console webapp
The app is served on localhost using [express.js app](app.js) on port `3000`. 
The app uses `ngrok` to expose the token provider to the internet - be careful with exposing your actual credentials and secrets to the internet.
It is possible to configure the `ngrok` to use predefined subdomain via `configuration.json` file:
```
{
  ...
  "ngrokSubdomain": "somengroksubdomain",
  ...
}
```
 
In the result, the app and all it's supporting files are available on `http://localhost:3000` and `https://<yourngroksudbomain>.ngrok.io`.
Additionally, `ngrok` exposes it's own status and inspect endpoint at `http://localhost:4040`. 
 
All JS and json files used in the project are served through the [app.js](app.js):
* `/` - main entry point for the app. 
* `/token` - token generator 
* `/chat-client-configuration.json` - Twilio Programmable Chat configuration. Used to set Chat Client options, configured in `configuration.json`:
```
  ...   
  "chatClient": {
    "options": {
      "logLevel": "info"
    }
  },
  ...
```

* `/firebase-configuration.json` - Firebase configuration used in FCM push registration
* `/manifest.json` - Firebase ServiceWorker configuration
* `/configuration` - exposes whole project configuration for debugging  


* `/firebase-messaging-sw.js` - Firebase ServiceWorker JavaScript
* `/firebase-config.js` - configuration for Firebase (same data as `/firebase-configuration.json`) exposed as JavaScript object. Used for ServiceWorker 
* `/firebase-support.js` - helper for working with Firebase, handles registration, pushes and showing alerts

* `/logging.js` - logging helper, prints the info, warn, error, debug and events in console

* `/twilio-chat.js` - main Twilio Programmable Chat package
* `/chat-client-helper.js` - helper for Chat client. Handles registration, events and push registration
* `/test.js` - test file, running right after client is fully initialized. Used for quick testing / proof-of-concept scripting 


## Token provider
Configuration for token provider is stored in the `configuration.json` file. The example with correct structure can be learned from [configuration.example.json](configuration.example.json).

`tokenGenerator` JSON array contains keys needed for token composition (`accountSid`, `signingKeySid`, `signingKeySecret` and `serviceSid` keys) and Credential SID for FCM you've created earlier (`fcm` key): 
```
{
  ...
  "tokenGenerator": {
    "accountSid": "ACxxx",
    "signingKeySid": "SKxxx",
    "signingKeySecret": "xxx",
    "serviceSid": "ISxxx",
    "fcm": "CRxxx"
  },
  ...
}
```

Token provider is served on `http://localhost:3000/token` or `https://<yourngroksubdomain>.ngrok.io/token`.

## Running the app
1. do the `npm install`
2. update the `credentials.json` with your information
3. run app with `npm start`
4. open the ngrok url printed in the console in your favorite browsers (keep in mind that FCM is supported in Chrome and Firefox only)

## TODO:
* FireBase ServiceWorkers
