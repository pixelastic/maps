const reddinx = require('reddinx');
const onEach = require('../lib/onEach.js');

(async () => {
  const subredditName = 'dndmaps';
  await reddinx.initial(subredditName, { onEach });
})();