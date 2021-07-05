const curatedAuthors = require('../lib/curatedAuthors.js');
const imoen = require('imoen');
const _ = require('golgoth/lodash');
/**
 * Custom method to enhance a record before saving it to disk
 * @param {object} record Record as extracted from reddinx
 * @returns {object} Updated record
 **/
module.exports = async (record) => {
  // Remove "Maps" from tags
  record.tags = _.map(record.tags, (tag) => {
    return tag.replace(' Map', '');
  });

  // Mark as curated
  const authorName = _.get(record, 'author.name');
  record.score.isCurated = _.includes(curatedAuthors, authorName);

  // Fetch preview dimensions and lqip
  if (!_.has(record, 'displayPicture.width')) {
    const previewUrl = record.picture.preview;
    const { base64, width, height } = await imoen(previewUrl);
    if (!base64 || !width || !height) {
      console.info(record);
      return false;
    }
    record.displayPicture = {
      url: previewUrl,
      width,
      height,
      placeholder: base64,
    };
  }

  return record;
};
