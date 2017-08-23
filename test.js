'use strict';

const Test = {
  log: null,
  client: null,
  accessManager: null,

  init: function(log, client, accessManager) {
    Test.log = log;
    Test.client = client;
    Test.accessManager = accessManager;
    Test.log.info('Test', 'got to the test with client', Test.client);
    Test.log.info('Test', 'got to the test with accessManager', Test.accessManager);

  }

};
