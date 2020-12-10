const onCircle = require('on-circle');
const dayjs = require('golgoth/dayjs');
const run = require('firost/run');
const consoleInfo = require('firost/consoleInfo');
const _ = require('golgoth/lodash');

(async () => {
  await onCircle.run(
    async ({ success, gitChangedFiles, gitCommitAll, gitPush }) => {
      await run('yarn run data:incremental');

      const changedFiles = await gitChangedFiles();
      if (_.isEmpty(changedFiles)) {
        success('No files changed, we stop early');
      }

      // Commit changes
      const currentDate = dayjs.utc().format('YYYY-MM-DD');
      const commitMessage = `chore(ci): Daily update (${currentDate})`;
      await gitCommitAll(commitMessage);
      consoleInfo(`${changedFiles.length} files changed`);

      // And push
      await gitPush();
      consoleInfo('Changes pushed to the repo');

      // Re-index into Algolia
      await run('yarn run data:indexing');

      success('Daily data updated');
    }
  );
})();
