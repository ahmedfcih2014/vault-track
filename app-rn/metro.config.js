const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "..");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [monorepoRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];
config.resolver.disableHierarchicalLookup = true;
config.resolver.extraNodeModules = {
  "@vault-track/shared": path.resolve(monorepoRoot, "packages/shared/src"),
  // Pin expo-router to the app workspace so @expo/cli typed-routes and Metro resolve the same copy.
  "expo-router": path.resolve(projectRoot, "node_modules/expo-router"),
};

// expo-sqlite web: bundle wa-sqlite.wasm and enable SharedArrayBuffer in dev server.
config.resolver.assetExts.push("wasm");

config.server.enhanceMiddleware = (middleware) => {
  return (req, res, next) => {
    res.setHeader("Cross-Origin-Embedder-Policy", "credentialless");
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    middleware(req, res, next);
  };
};

module.exports = config;
