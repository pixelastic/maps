const config = require('aberlaas/lib/configs/lintstaged.js');

// Stop linting all the json files
const jsonLintCommand = config['*.json'];
delete config['*.json'];

module.exports = {
  ...config,
  './*.json': jsonLintCommand,
};
