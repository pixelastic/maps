const indexing = require('algolia-indexing');
const readJson = require('firost/lib/readJson');
const glob = require('firost/lib/glob');
const consoleError = require('firost/lib/consoleError');
const pMap = require('golgoth/lib/pMap');
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
      'score.isCurated',
      'author.name',
      'tags',
      'misc.postHint',
    ],
    customRanking: ['desc(date.day)', 'desc(score.value)', 'desc(score.ratio)'],
    replicas: {
      popularity: {
        customRanking: [
          'desc(score.value)',
          'desc(score.ratio)',
          'desc(date.day)',
        ],
      },
    },
  };

  indexing.verbose();
  indexing.config({
    batchMaxSize: 100,
  });

  try {
    const files = await glob('./data/**/*.json');
    const records = await pMap(files, readJson);
    await indexing.fullAtomic(credentials, records, settings);
  } catch (err) {
    consoleError(err.message);
    process.exit(1);
  }
})();
