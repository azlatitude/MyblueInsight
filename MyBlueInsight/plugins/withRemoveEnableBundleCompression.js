const { withAppBuildGradle } = require('expo/config-plugins');

module.exports = function withRemoveEnableBundleCompression(config) {
  return withAppBuildGradle(config, (config) => {
    if (config.modResults.contents) {
      config.modResults.contents = config.modResults.contents.replace(
        /\s*enableBundleCompression\s*=.*\n/g,
        '\n'
      );
    }
    return config;
  });
};
