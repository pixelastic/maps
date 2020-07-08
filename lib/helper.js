const urlToFilepath = require('firost/lib/urlToFilepath');
const { URL } = require('url');
const path = require('path');
const _ = require('golgoth/lib/lodash');

module.exports = {
  /**
   * Returns a file path to save an api call
   * @param {string} baseUrl Url to call
   * @param {object} searchParameters Search parameters of the url
   * @returns {string} Path on disk
   **/
  cachePath(baseUrl, searchParameters = {}) {
    const url = new URL(baseUrl);
    url.search = new URLSearchParams(searchParameters);

    const cacheSuffix = urlToFilepath(url.toString(), { extension: 'json' });
    const cachePrefix = './tmp/cache';
    return path.resolve(cachePrefix, cacheSuffix);
  },
  dataPath(subreddit, year, month) {
    return path.resolve(
      `./data/reddit/${subreddit}/${year}`,
      _.padStart(month, 2, '0')
    );
  },
};
