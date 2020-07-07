const dayjs = require('golgoth/lib/dayjs');
const got = require('golgoth/lib/got');
const urlToFilepath = require('firost/lib/urlToFilepath');
const { URL } = require('url');
const path = require('path');
const exist = require('firost/lib/exist');
const readJson = require('firost/lib/readJson');
const writeJson = require('firost/lib/writeJson');
const _ = require('golgoth/lib/lodash');
const spinner = require('firost/lib/spinner');

module.exports = {
  async getIdsFromMonth(subreddit, year, month) {
    const startOfMonth = dayjs().year(year).month(month).startOf('month');
    const endOfMonth = startOfMonth.endOf('month');
    const posts = await this.posts(
      subreddit,
      startOfMonth.unix(),
      endOfMonth.unix()
    );

    const postIds = _.map(posts, 'id');
    const idsPath = path.resolve(
      `./data/${year}`,
      _.padStart(month, 2, '0'),
      'ids.json'
    );
    await writeJson(postIds, idsPath);
  },
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
    const cachePath = this.cachePath(url, searchParams);
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
  cachePath(baseUrl, searchParameters = {}) {
    const url = new URL(baseUrl);
    url.search = new URLSearchParams(searchParameters);

    const cacheSuffix = urlToFilepath(url.toString(), { extension: 'json' });
    const cachePrefix = './tmp/cache';
    return path.resolve(cachePrefix, cacheSuffix);
  },
};
