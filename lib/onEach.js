const curatedAuthors = require('../lib/curatedAuthors.js');
const _ = require('golgoth/lodash');
/**
 * Custom method to enhance a record before saving it to disk
 * @param {object} record Record as extracted from reddinx
 * @returns {object} Updated record
 **/
module.exports = (record) => {
  // Remove "Maps" from tags
  record.tags = _.map(record.tags, (tag) => {
    return tag.replace(' Map', '');
  });

  // Mark as curated
  const authorName = _.get(record, 'author.name');
  record.score.isCurated = _.includes(curatedAuthors, authorName);

  return record;
};
