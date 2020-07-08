const records = require('../lib/records.js');
const pMap = require('golgoth/lib/pMap');

/**
 * Download all the records for a given month and year
 **/
(async () => {
  process.setMaxListeners(Infinity);
  const subreddit = 'dndmaps';
  const months = [12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
  const years = [2020, 2019, 2018, 2017];
  // await records.fromMonth(subreddit, 2020, 1);
  // return;
  await pMap(
    years,
    async (year) => {
      await pMap(
        months,
        async (month) => {
          await records.fromMonth(subreddit, year, month);
        },
        { concurrency: 5 }
      );
    },
    { concurrency: 5 }
  );
})();
