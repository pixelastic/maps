const reddinx = require('reddinx');

(async () => {
  const subredditName = 'dndmaps';
  await reddinx.initial(subredditName);
})();
