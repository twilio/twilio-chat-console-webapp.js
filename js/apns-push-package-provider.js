'use strict';

const fs = require('fs');
const pushLib = require('safari-push-notifications');

const ApnsPushPackageProvider = {
  certificates: {
    cert: function(certFilename) {
      return fs.readFileSync(certFilename, { encoding: 'utf-8' });
    },
    key: function(keyFilename) {
      return fs.readFileSync(keyFilename, { encoding: 'utf-8' });
    },
    intermediate: function(intermediateFilename) {
      return fs.readFileSync(intermediateFilename, { encoding: 'utf-8' });
    },
  },
  websiteJson: function(websiteJsonConfiguration) {
    return pushLib.websiteJSON(
      websiteJsonConfiguration.websiteName, // websiteName
      websiteJsonConfiguration.websitePushID, // websitePushID
      websiteJsonConfiguration.allowedDomains, // allowedDomains
      websiteJsonConfiguration.urlFormatString, // urlFormatString
      websiteJsonConfiguration.authenticationToken, // authenticationToken (zeroFilled to fit 16 chars)
      websiteJsonConfiguration.webServiceURL // webServiceURL (Must be https!)
    );
  },
  pushPackage: function(websiteJsonConfiguration, iconSetFolder,
                        certPemFilename, keyPemFilename, intermediatePemFilename) {
    return pushLib.generatePackage(
      ApnsPushPackageProvider.websiteJson(websiteJsonConfiguration), // The object from before / your own website.json object
      iconSetFolder, // Folder containing the iconset
      ApnsPushPackageProvider.certificates.cert(certPemFilename), // Certificate
      ApnsPushPackageProvider.certificates.key(keyPemFilename), // Private Key
      ApnsPushPackageProvider.certificates.intermediate(intermediatePemFilename) // Intermediate certificate
    );
  }
};

module.exports = ApnsPushPackageProvider;
