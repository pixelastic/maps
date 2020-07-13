const indexing = require('algolia-indexing');
const firost = require('firost');
const pMap = require('golgoth/lib/pMap');
const dayjs = require('golgoth/lib/dayjs');
const config = require('../src/_data/config.js');

(async function () {
  const credentials = {
    appId: config.algolia.appId,
    apiKey: process.env.ALGOLIA_API_KEY,
    indexName: config.algolia.indexName,
  };
  const settings = {
    searchableAttributes: ['title', 'author.name'],
    attributesForFaceting: [
      'author.id',
      'author.name',
      'date',
      'dateAsDay',
      'tags',
      'misc.postHint',
      'score.comments',
      'score.downs',
      'score.isCurated',
      'score.ratio',
      'score.ups',
      'score.value',
    ],
    customRanking: [
      'desc(score.value)',
      'desc(score.isCurated)',
      'desc(score.ratio)',
      'desc(dateAsDay)',
      'desc(score.comments)',
    ],
    replicas: {
      popularity: {
        customRanking: [
          'desc(dateAsDay)',
          'desc(score.value)',
          'desc(score.ratio)',
          'desc(score.comments)',
        ],
      },
    },
  };

  indexing.verbose();
  indexing.config({
    batchMaxSize: 100,
  });

  const files = await firost.glob('./data/reddit/**/records/*.json');
  const records = await pMap(files, async (filepath) => {
    const record = await firost.readJson(filepath);
    // Clamp the date at the start of the day
    const dateAsDay = dayjs.unix(record.date).startOf('day').unix();
    record.dateAsDay = dateAsDay;
    return record;
  });
  await indexing.fullAtomic(credentials, records, settings);
})();
