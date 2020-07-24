const reddinx = require('reddinx');
const curatedAuthors = require('../lib/curatedAuthors.js');
const _ = require('golgoth/lib/lodash');

(async () => {
  const subredditName = 'dndmaps';
  await reddinx.initial(subredditName, {
    onEach(record) {
      // Remove "Maps" from tags
      record.tags = _.map(record.tags, (tag) => {
        return tag.replace(' Map', '');
      });

      // Mark as curated
      const authorName = _.get(record, 'author.name');
      record.score.isCurated = _.includes(curatedAuthors, authorName);

      return record;
    },
  });
})();
