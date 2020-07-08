const helper = require('./helper.js');
const dayjs = require('golgoth/lib/dayjs');
const got = require('golgoth/lib/got');
const path = require('path');
const exist = require('firost/lib/exist');
const readJson = require('firost/lib/readJson');
const writeJson = require('firost/lib/writeJson');
const _ = require('golgoth/lib/lodash');
const spinner = require('firost/lib/spinner');

module.exports = {
  /**
   * Returns the post ids from a given month
   * @param {string} subreddit Name of the subreddit
   * @param {number} year Year to check
   * @param {number} month Month to check
   * @returns {Array} List of ids
   **/
  async fromMonth(subreddit, year, month) {
    const idsPath = path.resolve(
      helper.dataPath(subreddit, year, month),
      'ids.json'
    );
    if (await exist(idsPath)) {
      return await readJson(idsPath);
    }

    const startOfMonth = dayjs().year(year).month(month).startOf('month');
    const endOfMonth = startOfMonth.endOf('month');
    const posts = await this.posts(
      subreddit,
      startOfMonth.unix(),
      endOfMonth.unix()
    );

    const postIds = _.map(posts, 'id');
    await writeJson(postIds, idsPath);
    return postIds;
  },
  /**
   * Returns all posts on a specific subreddit between two dates.
   * Takes care of recursively calling the API until the full list is obtained
   * @param {string} subreddit Name of the subreddit
   * @param {number} startDate Start date, as a unix timestamp
   * @param {number} endDate End date, as a unix timestamp
   * @param {object} progress Spinner passed to child calls
   * @returns {Array} List of posts
   **/
  async posts(subreddit, startDate, endDate, progress) {
    // Start a spinner, or update it
    if (!progress) {
      progress = spinner();
    }
    progress.tick(dayjs.unix(startDate).format('YYYY-MM-DD'));

    const posts = await this.rawPosts(subreddit, startDate, endDate);
    // Stop recursion if no posts found
    if (_.isEmpty(posts)) {
      progress.success('Done');
      return posts;
    }

    // Check for posts after the last one
    const lastPostDate = _.chain(posts).last().get('created_utc').value();
    const nextPosts = await this.posts(
      subreddit,
      lastPostDate,
      endDate,
      progress
    );
    return _.concat(posts, nextPosts);
  },
  /**
   * Calls pushshift API to get the list of all posts on a specific subreddit
   * between two dates.
   * Uses a cache on disk to limit queries.
   * Note that the API can only return 100 items at a time
   * @param {string} subreddit Name of the subreddit
   * @param {number} startDate Start date, as a unix timestamp
   * @param {number} endDate End date, as a unix timestamp
   * @returns {Array} List of posts
   **/
  async rawPosts(subreddit, startDate, endDate) {
    const url = 'https://api.pushshift.io/reddit/search/submission/';
    const searchParams = {
      subreddit,
      sort: 'asc',
      sort_type: 'created_utc',
      after: startDate,
      before: endDate,
      size: 1000,
    };

    // Return cached version
    const cachePath = helper.cachePath(url, searchParams);
    if (await exist(cachePath)) {
      return await readJson(cachePath);
    }

    const { body } = await got(url, {
      responseType: 'json',
      searchParams,
    });
    const rawPosts = body.data;
    await writeJson(rawPosts, cachePath);
    return rawPosts;
  },
};
