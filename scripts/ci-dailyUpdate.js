const onCircle = require('on-circle');
const dayjs = require('golgoth/lib/dayjs');
const run = require('firost/lib/run');

(async () => {
  await onCircle.run(
    async ({ success, gitChangedFiles, gitCommitAll, gitPush }) => {
      await run('yarn run data:incremental');

      if (!(await gitChangedFiles())) {
        success('No files changed, we stop early');
      }

      // Commit changes
      const currentDate = dayjs.utc().format('YYYY-MM-DD');
      const commitMessage = `chore(ci): Daily update (${currentDate})`;
      await gitCommitAll(commitMessage);

      // And push
      await gitPush();

      // Re-index into Algolia
      await run('yarn run data:indexing');

      success('Daily data indexed');
    }
  );
})();
