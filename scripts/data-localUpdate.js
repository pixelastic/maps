const { spinner, glob, readJson, writeJson } = require('firost');
const { _, pMap } = require('golgoth');
const imoen = require('imoen');

(async () => {
  // We go through all the posts, and for each post we get the dimensions and
  // lqip of the preview and save it in the record under displayPicture

  const posts = _.slice(await glob('./data/dndmaps/**/*.json'), 0, 10);
  const progress = spinner(posts.length);

  await pMap(
    posts,
    async (filepath) => {
      const data = await readJson(filepath);
      progress.tick(data.title);
      const previewUrl = data.picture.preview;
      const { base64, width, height } = await imoen(previewUrl);
      data.displayPicture = {
        url: previewUrl,
        width,
        height,
        placeholder: base64,
      };
      await writeJson(data, filepath);
    },
    { concurrency: 100 }
  );
  progress.success('All done');
})();
