const got = require('golgoth/lib/got');
const _ = require('golgoth/lib/lodash');
const pMap = require('golgoth/lib/pMap');
const KeyvFile = require('keyv-file').KeyvFile;
const gotCache = new KeyvFile({
  filename: './tmp/gotCache.json',
});

module.exports = {
  async fromIds(subreddit, postIds) {
    const url = `https://www.reddit.com/r/${subreddit}/api/info.json`;
    // API can only fetch posts 100 at a time
    const chunks = _.chunk(postIds, 100);

    const allPosts = await pMap(chunks, async (chunk) => {
      const response = await got(url, {
        cache: gotCache,
        responseType: 'json',
        searchParams: {
          id: this.fullnamify(chunk),
        },
      });
      return _.get(response, 'body.data.children', []);
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
