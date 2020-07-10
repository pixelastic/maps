const _ = require('golgoth/lib/lodash');
const postIds = require('../lib/postIds.js');
const posts = require('../lib/posts.js');
const helper = require('./helper.js');
const path = require('path');
const writeJson = require('firost/lib/writeJson');
const pMap = require('golgoth/lib/pMap');
const spinner = require('firost/lib/spinner');
const emptyDir = require('firost/lib/emptyDir');

module.exports = {
  /**
   * Returns the records ids from a given month
   * @param {string} subreddit Name of the subreddit
   * @param {number} year Year to check
   * @param {number} month Month to check
   * @returns {Array} List of records
   **/
  async fromMonth(subreddit, year, month) {
    const recordDirectory = path.resolve(
      helper.dataPath(subreddit, year, month),
      'records/'
    );

    const ids = await postIds.fromMonth(subreddit, year, month);
    const allPosts = await posts.fromIds(subreddit, ids);
    const allRecords = _.chain(allPosts)
      .map((post) => {
        return this.fromPost(post);
      })
      .compact()
      .value();

    await emptyDir(recordDirectory);

    const progress = spinner(allRecords.length);
    await pMap(
      allRecords,
      async (record) => {
        const recordId = record.id;
        progress.tick(`Saving files to disk ${recordId}`);
        const recordPath = path.resolve(recordDirectory, `${recordId}.json`);
        await writeJson(record, recordPath);
      },
      { concurrency: 100 }
    );
    progress.success('All files saved');
  },
  /**
   * Converts a post into a record
   * @param {object} post Reddit post
   * @returns {object} Record for Algolia
   */
  fromPost(post) {
    const data = _.get(post, 'data');
    if (this.isDeleted(data)) {
      return null;
    }

    const id = `t3_${data.id}`;
    const title = _.get(data, 'title');
    const url = `https://www.reddit.com${data.permalink}`;
    const date = _.get(data, 'created');
    const subredditName = _.get(data, 'subreddit');
    const subredditId = _.get(data, 'subreddit_id');
    const authorName = _.get(data, 'author');
    const authorId = _.get(data, 'author_fullname');

    const tags = _.chain(data)
      .get('link_flair_text')
      .replace(' Map', '')
      .castArray()
      .compact()
      .value();

    const pictureThumbnail = data.thumbnail;
    const pictureFull = this.pictureFull(data.preview);
    const picturePreview = this.picturePreview(data.preview, 600);
    if (!picturePreview) {
      return null;
    }

    const scoreComments = data.num_comments;
    const scoreUps = data.ups;
    const scoreDowns = data.downs;
    const scoreRatio = data.upvote_ratio;
    const scoreValue = data.score;

    const miscPostHint = data.post_hint;

    return {
      id,
      title,
      url,
      tags,
      date,
      subreddit: {
        name: subredditName,
        id: subredditId,
      },
      author: {
        name: authorName,
        id: authorId,
      },
      picture: {
        thumbnail: pictureThumbnail,
        full: pictureFull,
        preview: picturePreview,
      },
      score: {
        comments: scoreComments,
        ups: scoreUps,
        downs: scoreDowns,
        ratio: scoreRatio,
        value: scoreValue,
      },
      misc: {
        postHint: miscPostHint,
      },
    };
  },
  /**
   * Check if a given post is deleted
   * See https://www.reddit.com/r/redditdev/comments/7hfnew/there_is_currently_no_efficient_way_to_tell_if_a/
   * for various ways of telling if a post is deleted
   * @param {object} data Post data
   * @returns {boolean} True if post is deleted
   **/
  isDeleted(data) {
    const isDeleted = data.selftext === '[deleted]';
    return isDeleted;
  },
  /**
   * Returns a preview url from a given post
   * @param {object} previews Preview object
   * @param {number} minWidth Minimum width
   * @returns {string} Url of the preview, or the source if no preview found
   **/
  picturePreview(previews, minWidth) {
    const firstImg = _.get(previews, 'images[0]', false);
    if (!firstImg) {
      return false;
    }

    return _.chain(firstImg)
      .get('resolutions', [])
      .sortBy('width')
      .find((resolution) => {
        return resolution.width >= minWidth;
      })
      .get('url')
      .replace(/&amp;/g, '&')
      .value();
  },
  /**
   * Returns a picture url from a given post
   * @param {object} previews Preview object
   * @returns {string} Url of picture
   */
  pictureFull(previews) {
    const firstImg = _.get(previews, 'images[0]', false);
    if (!firstImg) {
      return false;
    }
    return _.chain(firstImg).get('source.url').replace(/&amp;/g, '&').value();
  },
};
