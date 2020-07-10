const got = require('golgoth/lib/got');
const _ = require('golgoth/lib/lodash');
const pMap = require('golgoth/lib/pMap');
const helper = require('./helper.js');
const exist = require('firost/lib/exist');
const readJson = require('firost/lib/readJson');
const writeJson = require('firost/lib/writeJson');

module.exports = {
  async fromIds(subreddit, postIds) {
    const url = `https://www.reddit.com/r/${subreddit}/api/info.json`;
    // API can only fetch posts 100 at a time
    const chunks = _.chunk(postIds, 100);

    const allPosts = await pMap(chunks, async (chunk) => {
      const searchParams = {
        id: this.fullnamify(chunk),
      };

      // Return cached version
      const cachePath = helper.cachePath(url, searchParams);
      if (await exist(cachePath)) {
        return await readJson(cachePath);
      }

      const response = await got(url, {
        responseType: 'json',
        searchParams,
      });
      const postData = _.get(response, 'body.data.children', []);
      await writeJson(postData, cachePath);
      return postData;
    });

    return _.flatten(allPosts);
  },

  /**
   * Replaces all post partial ids from their fullnames
   * @param {Array} postIds List of post ids
   * @returns {Array} List of post fullnames
   **/
  fullnamify(postIds) {
    return _.chain(postIds)
      .map((postId) => `t3_${postId}`)
      .join(',')
      .value();
  },
};
