'use strict';

const ChatClientHelper = {
  client: null,
  channel: null,
  lastMessage: null,
  accessManager: null,
  pushChannel: null,
  log: null,

  login: function(log, identity, pushChannel, registerForPushCallback) {
    ChatClientHelper.log = log;
    ChatClientHelper.pushChannel = pushChannel;
    ChatClientHelper.identity = identity;

    return $.getJSON('chat-client-configuration.json')
      .then((chatClientConfig) => {
        return ChatClientHelper.getToken(identity, pushChannel).then(function(data) {
          log.info('ChatClientHelper', 'got chat token', data);
          return Twilio.Chat.Client.create(data, chatClientConfig.options || {})
            .then((chatClient) => {
              ChatClientHelper.client = chatClient;
              ChatClientHelper.accessManager = new Twilio.AccessManager(data);

              ChatClientHelper.accessManager.on('tokenUpdated', am => {
                ChatClientHelper.client.updateToken(am.token).catch(error => {
                  log('Error while updating token', error.message);
                });

              });
              ChatClientHelper.accessManager.on('tokenExpired', ChatClientHelper.updateToken);

              ChatClientHelper.client.on('pushNotification', push => {
                if (push.body)
                  ChatClientHelper.showWebApiNotification(push.body);
              });
              ChatClientHelper.subscribeToAllAccessManagerEvents(log, ChatClientHelper.accessManager);
              ChatClientHelper.subscribeToAllChatClientEvents(log, ChatClientHelper.client);
              if (registerForPushCallback) {
                registerForPushCallback(log, ChatClientHelper.client);
              }
              return ChatClientHelper.client;
            });
        }, function(err) {
          log.error('login', 'can\'t get token', err);
        });
      });
  },

  updateToken: function () {
    return ChatClientHelper.getToken(ChatClientHelper.identity, ChatClientHelper.pushChannel).then(token => {
      log('Token retrieved from server:', token);
      ChatClientHelper.accessManager.updateToken(token);
    });
  },

  sendMediaMessageWithFormData: function(channelSid, formData) {
    return ChatClientHelper.client.getChannelBySid(channelSid)
      .then((channel) => channel.sendMessage(formData));
  },

  getToken: function(identity, pushChannel) {
    return $.ajax({
      url: '/token?identity=' + identity + '&pushChannel=' + pushChannel,
    }).then(data => {
      return data;
    });
  },

  subscribeToAllAccessManagerEvents: function(log, accessManager) {
    accessManager.on('tokenUpdated', obj => log.event('ChatClientHelper.accessManager', 'tokenUpdated', obj));
    accessManager.on('tokenExpired', obj => log.event('ChatClientHelper.accessManager', 'tokenExpired', obj));
  },

  subscribeToAllChatClientEvents: function(log, chatClient) {
    chatClient.on('userSubscribed', obj => log.event('ChatClientHelper.client', 'userSubscribed', obj));
    chatClient.on('userUpdated', obj => log.event('ChatClientHelper.client', 'userUpdated', obj));
    chatClient.on('userUnsubscribed', obj => log.event('ChatClientHelper.client', 'userUnsubscribed', obj));
    chatClient.on('channelAdded', obj => log.event('ChatClientHelper.client', 'channelAdded', obj));
    chatClient.on('channelRemoved', obj => log.event('ChatClientHelper.client', 'channelRemoved', obj));
    chatClient.on('channelInvited', obj => log.event('ChatClientHelper.client', 'channelInvited', obj));
    chatClient.on('channelJoined', obj => log.event('ChatClientHelper.client', 'channelJoined', obj));
    chatClient.on('channelLeft', obj => log.event('ChatClientHelper.client', 'channelLeft', obj));
    chatClient.on('channelUpdated', obj => log.event('ChatClientHelper.client', 'channelUpdated', obj));
    chatClient.on('memberJoined', obj => log.event('ChatClientHelper.client', 'memberJoined', obj));
    chatClient.on('memberLeft', obj => log.event('ChatClientHelper.client', 'memberLeft', obj));
    chatClient.on('memberUpdated', obj => log.event('ChatClientHelper.client', 'memberUpdated', obj));
    chatClient.on('messageAdded', obj => log.event('ChatClientHelper.client', 'messageAdded', obj));
    chatClient.on('messageUpdated', obj => log.event('ChatClientHelper.client', 'messageUpdated', obj));
    chatClient.on('messageRemoved', obj => log.event('ChatClientHelper.client', 'messageRemoved', obj));
    chatClient.on('typingStarted', obj => log.event('ChatClientHelper.client', 'typingStarted', obj));
    chatClient.on('typingEnded', obj => log.event('ChatClientHelper.client', 'typingEnded', obj));
    chatClient.on('connectionStateChanged', obj => log.event('ChatClientHelper.client', 'connectionStateChanged', obj));
    chatClient.on('pushNotification', obj => log.event('ChatClientHelper.client', 'onPushNotification', obj));
  },

  subscribeToAllChatChannelEvents: function (log, channel) {
    channel.on('memberJoined', obj => log.event('ChatClientHelper.channel.' + channel.sid, 'memberJoined', obj));
    channel.on('memberLeft', obj => log.event('ChatClientHelper.channel.' + channel.sid, 'memberLeft', obj));
    channel.on('memberUpdated', obj => log.event('ChatClientHelper.channel.' + channel.sid, 'memberUpdated', obj));
    channel.on('messageAdded', obj => log.event('ChatClientHelper.channel.' + channel.sid, 'messageAdded', obj));
    channel.on('messageRemoved', obj => log.event('ChatClientHelper.channel.' + channel.sid, 'messageRemoved', obj));
    channel.on('messageUpdated', obj => log.event('ChatClientHelper.channel.' + channel.sid, 'messageUpdated', obj));
    channel.on('typingEnded', obj => log.event('ChatClientHelper.channel.' + channel.sid, 'typingEnded', obj));
    channel.on('typingStarted', obj => log.event('ChatClientHelper.channel.' + channel.sid, 'typingStarted', obj));
    channel.on('updated', obj => log.event('ChatClientHelper.channel.' + channel.sid, 'updated', obj));
  },

  showWebApiNotification: function(body) {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('Twilio Chat JS', { icon: 'twilio-icon.png', body: body });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission(function(permission) {
          if (!('permission' in Notification)) {
            Notification.permission = permission;
          }
          if (permission === 'granted') {
            new Notification('Twilio Chat JS', { icon: 'twilio-icon.png', body: body });
          }
        });
      }
    }
  },

  createChannel: function() {
    ChatClientHelper.client.createChannel().then(ch => {
      ChatClientHelper.channel = ch;
      ChatClientHelper.subscribeToAllChatChannelEvents(ChatClientHelper.log, ChatClientHelper.channel);

      ChatClientHelper.channel.on('messageAdded', message => {
        ChatClientHelper.log.info('ChatClientHelper', 'MessageAdded event received and setting variable lastMessage');
        ChatClientHelper.lastMessage = message;
      });

      return ChatClientHelper.channel.join();
    });
  },

  sendMedia: function() {
    let mediaOpts = {contentType: "text/plain", media: "Hello"};
    return ChatClientHelper.channel.sendMessage(mediaOpts);
  },

  sendForm: function() {
    const formData = new FormData();
    formData.append("file", $('#mediaMessageFile')[0].files[0]);
    return ChatClientHelper.channel.sendMessage(formData);
  }
};
