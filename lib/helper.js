const urlToFilepath = require('firost/lib/urlToFilepath');
const path = require('path');
const _ = require('golgoth/lib/lodash');
const objectHash = require('node-object-hash')().hash;

module.exports = {
  /**
   * Returns a file path to save an api call
   * @param {string} baseUrl Url to call
   * @param {object} searchParameters Search parameters of the url
   * @returns {string} Path on disk
   **/
  cachePath(baseUrl, searchParameters = {}) {
    const prefix = './tmp/cache';
    const basename = urlToFilepath(baseUrl);
    const hash = objectHash(searchParameters);
    return path.resolve(prefix, basename, `${hash}.json`);
  },
  dataPath(subreddit, year, month) {
    return path.resolve(
      `./data/reddit/${subreddit}/${year}`,
      _.padStart(month, 2, '0')
    );
  },
};
