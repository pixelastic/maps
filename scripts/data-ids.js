const postIds = require('../lib/postIds.js');
const pMap = require('golgoth/lib/pMap');

/**
 * Download the list of all post ids for each month and year
 **/
(async () => {
  const subreddit = 'dndmaps';
  const months = [12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
  const years = [2020, 2019, 2018, 2017];
  await pMap(
    years,
    async (year) => {
      await pMap(
        months,
        async (month) => {
          await postIds.fromMonth(subreddit, year, month);
        },
        { concurrency: 1 }
      );
    },
    { concurrency: 1 }
  );
})();