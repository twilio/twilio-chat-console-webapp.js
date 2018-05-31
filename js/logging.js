'use strict';

const log = {
  event: function(eventScope, eventName, obj) {
    console.log(`${new Date().toJSON()} [${eventScope}] [EVENT ${eventName}]`, obj);
  },
  info: function(eventScope, text, obj) {
    console.log(`${new Date().toJSON()} [${eventScope}] [INFO] ${text}`, obj);
  },
  error: function(eventScope, text, obj) {
    console.error(`${new Date().toJSON()} [${eventScope}] [ERROR] ${text}`, obj);
  },
  warn: function(eventScope, text, obj) {
    console.warn(`${new Date().toJSON()} [${eventScope}] [WARN] ${text}`, obj);
  }
};
