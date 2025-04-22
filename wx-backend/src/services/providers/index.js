// Provider implementations
const githubProvider = require('./github.provider');
const jenkinsProvider = require('./jenkins.provider');
const gitlabProvider = require('./gitlab.provider');
const azureProvider = require('./azure.provider');

// Map of provider types to implementations
const providers = {
  'github': githubProvider,
  'gitlab': gitlabProvider,
  'jenkins': jenkinsProvider,
  'azure': azureProvider
};

// Get provider implementation by type
const getProvider = (type) => {
  if (!providers[type]) {
    throw new Error(`Unknown provider type: ${type}`);
  }
  return providers[type];
};

module.exports = {
  getProvider,
  providers
}; 