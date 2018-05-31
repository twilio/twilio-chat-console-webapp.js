'use strict';

const Test = {
  log: null,
  client: null,

  init: function (log, client) {
    Test.log = log;
    Test.client = client;
    Test.log.info('Test', 'got to the test with client', Test.client);
  }
};
