const readJson = require('firost/readJson');
const writeJson = require('firost/writeJson');
const glob = require('firost/glob');
const pMap = require('golgoth/pMap');
const onEach = require('../lib/onEach.js');
const spinner = require('firost/spinner');

// Update all local .json files by applying onEach again on them.
// This is useful when, for example, updating the list of all curated authors
// and having it retro-actively mark previous posts as curated
(async () => {
  const files = await glob('./data/**/*.json');
  const max = files.length;
  const progress = spinner.start(max);
  await pMap(files, async (filepath) => {
    const currentData = await readJson(filepath);
    const newData = onEach(currentData);
    await writeJson(newData, filepath);
    progress.tick();
  });
  progress.success('All files updated');
})();
