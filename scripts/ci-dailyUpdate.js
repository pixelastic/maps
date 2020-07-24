const onCircle = require('on-circle');
const dayjs = require('golgoth/lib/dayjs');
const run = require('firost/lib/run');

(async () => {
  await onCircle.run(
    async ({ gitChangedFiles, gitCommitAll, gitPush, success }) => {
      await run('yarn run data:incremental');

      if (!(await gitChangedFiles())) {
        success('No files changes, we stop early');
      }

      // Commit changes
      const currentDate = dayjs.utc().format('YYYY-MM-DD');
      const commitMessage = `chore(ci): Daily update (${currentDate})`;
      await gitCommitAll(commitMessage);

      // And push
      await gitPush();

      // Re-index into Algolia
      await run('yarn run data:indexing');

      success('All steps run correctly');
    }
  );
})();
