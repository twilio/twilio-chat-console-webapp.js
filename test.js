'use strict';

const Test = {
  log: null,
  client: null,
  accessManager: null,
  channel: null,
  lastMessage: null,

  init: function (log, client, accessManager) {
    console.log('Twilio Chat Client Version:', Twilio.Chat.Client.version);

    Test.log = log;
    Test.client = client;
    Test.accessManager = accessManager;
    Test.log.info('Test', 'got to the test with client', Test.client);
    Test.log.info('Test', 'got to the test with accessManager', Test.accessManager);
  },

  createChannel: function () {
    Test.client.createChannel().then(ch => {
      Test.channel = ch;
      ChatClientHelper.subscribeToAllChatChannelEvents(Test.channel);

      Test.channel.on('messageAdded', message => {
        Test.log.info('Test', 'MessageAdded event received and setting variable lastMessage');
        Test.lastMessage = message;
      });

      return Test.channel.join();
    });
  },

  sendMedia: function () {
    let mediaOpts = {contentType: "text/plain", media: "Hello"};
    return Test.channel.sendMessage(mediaOpts);
  },

  sendForm: function () {
    const formData = new FormData();
    formData.append("file", $('#mediaMessageFile')[0].files[0]);
    return Test.channel.sendMessage(formData);
  }
};
