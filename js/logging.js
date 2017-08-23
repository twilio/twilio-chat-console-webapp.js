'use strict';

const log = {
  event: function(eventScope, eventName, obj) {
    console.log(`${new Date()} [${eventScope}] [EVENT ${eventName}]`, obj);
  },
  info: function(eventScope, text, obj) {
    console.log(`${new Date()} [${eventScope}] [INFO] ${text}`, obj);
  },
  error: function(eventScope, text, obj) {
    console.error(`${new Date()} [${eventScope}] [ERROR] ${text}`, obj);
  },
  warn: function(eventScope, text, obj) {
    console.warn(`${new Date()} [${eventScope}] [WARN] ${text}`, obj);
  }
};
