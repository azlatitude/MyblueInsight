const { withEntitlementsPlist } = require('@expo/config-plugins');

/**
 * Adds iCloud (CloudDocuments) entitlement so the app can read/write
 * files in its own iCloud Drive container automatically.
 */
module.exports = function withICloud(config) {
  return withEntitlementsPlist(config, (cfg) => {
    cfg.modResults['com.apple.developer.icloud-container-identifiers'] = [
      'iCloud.com.myblueinsight.app',
    ];
    cfg.modResults['com.apple.developer.ubiquity-container-identifiers'] = [
      'iCloud.com.myblueinsight.app',
    ];
    cfg.modResults['com.apple.developer.icloud-services'] = [
      'CloudDocuments',
    ];
    return cfg;
  });
};
