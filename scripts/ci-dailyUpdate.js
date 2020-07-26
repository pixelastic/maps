const onCircle = require('on-circle');
const dayjs = require('golgoth/lib/dayjs');
const run = require('firost/lib/run');

(async () => {
  await onCircle.run(async ({ gitChangedFiles, gitCommitAll, gitPush }) => {
    await run('yarn run data:incremental');

    if (!(await gitChangedFiles())) {
      console.info('No files changed, we stop early');
      return true;
    }

    // Commit changes
    const currentDate = dayjs.utc().format('YYYY-MM-DD');
    const commitMessage = `chore(ci): Daily update (${currentDate})`;
    await gitCommitAll(commitMessage);

    // And push
    await gitPush();

    // Re-index into Algolia
    await run('yarn run data:indexing');

    console.info('All steps run correctly');
    return true;
  });
})();
