'use strict';

const express = require('express');
const config = require('./configuration.json');
const TokenProvider = require('./js/token-provider');
const bodyParser = require('body-parser');
const http = require('http');
const ngrok = require('ngrok');
const app = express();

app.set('json spaces', 2);
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use('/twilio-icon.png', express.static(__dirname + '/assets/twilio-icon.png'));
app.use('/firebase-messaging-sw.js', express.static(__dirname + '/js/firebase-messaging-sw.js'));
app.use('/firebase-support.js', express.static(__dirname + '/js/firebase-support.js'));

if (config.chatClient.js) {
  app.use('/twilio-chat.js', express.static(__dirname + config.chatClient.js));
} else {
  app.use('/twilio-chat.js', express.static(__dirname + '/node_modules/twilio-chat/dist/twilio-chat.js'));
}
app.use('/test.js', express.static(__dirname + '/js/test.js'));
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
  var ngrokOptions = {
    proto: 'http',
    addr: 3000
  };

  if (config.ngrokSubdomain) {
    ngrokOptions.subdomain = config.ngrokSubdomain
  }

  ngrok.once('connect', function(url) {
    console.log('ngrok url is ' + url);
  });
  ngrok.connect(ngrokOptions);

});