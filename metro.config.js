const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Configuração para resolver problemas de sourcemap
config.transformer = {
  ...config.transformer,
  enableBabelRCLookup: false,
  enableBabelRuntime: false,
  minifierConfig: {
    // Melhorar performance web
    ecma: 6,
  },
};

// Resolver problemas de InternalBytecode.js
config.resolver = {
  ...config.resolver,
  sourceExts: [...config.resolver.sourceExts, "mjs"],
  platforms: ["ios", "android", "native", "web"],
};

// Configurações específicas para web
if (process.env.EXPO_PLATFORM === 'web') {
  config.resolver.alias = {
    ...config.resolver.alias,
    'react-native$': 'react-native-web',
  };
}

module.exports = config;
