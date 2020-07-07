const reddit = require('../lib/reddit.js');
const pMap = require('golgoth/lib/pMap');
(async () => {
  const months = [12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
  const years = [2020, 2019, 2018, 2017];
  await pMap(
    years,
    async (year) => {
      await pMap(
        months,
        async (month) => {
          await reddit.getIdsFromMonth('dndmaps', year, month);
        },
        { concurrency: 1 }
      );
    },
    { concurrency: 1 }
  );
})();
