'use strict';

const express = require('express');
const config = require('./configuration.json');
const TokenProvider = require('./js/token-provider');
const ApnsPushPackageProvider = require('./js/apns-push-package-provider');
const bodyParser = require('body-parser');
const http = require('http');
const https = require('https');
const fs = require('fs');


const app = express();

app.set('json spaces', 2);
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use('/twilio-icon.png', express.static(__dirname + '/assets/twilio-icon.png'));
app.use('/firebase-messaging-sw.js', express.static(__dirname + '/js/firebase-messaging-sw.js'));
app.use('/firebase-support.js', express.static(__dirname + '/js/firebase-support.js'));
app.use('/apns-support.js', express.static(__dirname + '/js/apns-support.js'));
// "js": "/../twilio-chat.js/dist/twilio-chat.js",
// "js": "/../twilio-chat.js/dist/@twilio/twilio-chat.js",
// "js": "/node_modules/twilio-chat/dist/twilio-chat.js",
// "js": "/node_modules/@twilio/twilio-chat/dist/@twilio/twilio-chat.js",

app.use('/twilio-chat.js', express.static(__dirname + config.chatClient.js));
app.use('/test.js', express.static(__dirname + '/test.js'));
app.use('/logging.js', express.static(__dirname + '/js/logging.js'));
app.use('/chat-client-helper.js', express.static(__dirname + '/js/chat-client-helper.js'));

app.get('/firebase-configuration.json', function(req, res) {
  if (config.fcmConfig && config.fcmConfig.firebaseConfig) {
    res.json(config.fcmConfig.firebaseConfig);
  } else {
    res.json({});
  }
});

app.get('/firebase-config.js', function(req, res) {
  if (config.fcmConfig && config.fcmConfig.firebaseConfig) {
    res.send('const firebaseConfig = ' + JSON.stringify(config.fcmConfig.firebaseConfig));
  } else {
    res.send('const firebaseConfig;');
  }
});

app.get('/manifest.json', function(req, res) {
  if (config.fcmConfig && config.fcmConfig.manifest) {
    res.json(config.fcmConfig.manifest);
  } else {
    res.json({});
  }
});


let apnsConfig = config.apnsConfig;
if (apnsConfig && apnsConfig.websiteJson && apnsConfig.websiteJson.webServiceURL && apnsConfig.websiteJson.websitePushID) {
  let apnsWebsiteJson = apnsConfig.websiteJson;
  app.get('/website.json', function(req, res) {
    res.json(apnsWebsiteJson);
  });

  if (apnsConfig.pushPackageProvider) {
    let pushPackageProviderConfig = apnsConfig.pushPackageProvider;
    if (pushPackageProviderConfig.certificatesPaths) {
      let pushPakcageCertificates = pushPackageProviderConfig.certificatesPaths;
      app.post(`${pushPackageProviderConfig.webServiceURLRelative}/v1/pushPackages/${apnsWebsiteJson.websitePushID}`,
        function(req, res) {
          ApnsPushPackageProvider.pushPackage(
            apnsConfig.websiteJson,
            `${__dirname}/${pushPackageProviderConfig.iconsetPath}`,
            `${__dirname}/${pushPakcageCertificates.certificate}`,
            `${__dirname}/${pushPakcageCertificates.key}`,
            `${__dirname}/${pushPakcageCertificates.intermediate}`)
            .pipe(res);
        });
    }
    if (pushPackageProviderConfig.webServiceURLRelative) {
      app.post(
        `${pushPackageProviderConfig.webServiceURLRelative}/v1/devices/:deviceToken/registrations/${apnsWebsiteJson.websitePushID}`,
        function(req, res) {
          console.log('Got new POST request to ' +
            `${pushPackageProviderConfig.webServiceURLRelative}/v1/devices/${req.param.deviceToken}/registrations/${apnsWebsiteJson.websitePushID}`,
            {
              headers: req.headers,
              body: req.body
            });
          res.json({ message: 'ok' });
        });

      app.delete(
        `${pushPackageProviderConfig.webServiceURLRelative}/v1/devices/:deviceToken/registrations/${apnsWebsiteJson.websitePushID}`,
        function(req, res) {
          res.json({ message: 'ok' });
        });

      app.post(`${pushPackageProviderConfig.webServiceURLRelative}/v1/log`, function(req, res) {
        console.error(
          `Got new APNS log request`, req.body);
        res.json({ message: 'ok' });
      });
    }
  }
}

app.get('/chat-client-configuration.json', function(req, res) {
  if (config.chatClient) {
    res.json(config.chatClient);
  } else {
    res.json({});
  }
});

app.get('/configuration', function(req, res) {
  if (config) {
    res.json(config);
  } else {
    res.json({});
  }
});

app.get('/token', function(req, res) {
  if (req.query.identity) {
    res.send(TokenProvider.getToken(req.query.identity, req.query.pushChannel));
  } else {
    throw new Error('no `identity` query parameter is provided');
  }
});

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});


http.createServer(app).listen(3000, () => {
  console.log('HTTP Server is running on port 3000');
});

if (config.express && config.express.certificates) {
  const credentials = {
    key: fs.readFileSync(config.express.certificates.key, 'utf8'),
    cert: fs.readFileSync(config.express.certificates.crt, 'utf8')
  };

  https.createServer(credentials, app).listen(3001, () => {
    console.log('HTTPS Server is running on port 3001');
  })
}