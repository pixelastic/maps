const { spinner, glob, readJson, writeJson } = require('firost');
const { pMap } = require('golgoth');
const imoen = require('imoen');

(async () => {
  // We go through all the posts, and for each post we get the dimensions and
  // lqip of the preview and save it in the record under displayPicture

  const posts = await glob('./data/dndmaps/**/*.json');
  const progress = spinner(posts.length);

  await pMap(
    posts,
    async (filepath) => {
      const data = await readJson(filepath);
      progress.tick(data.title);
      if (data.displayPicture) {
        return;
      }
      const previewUrl = data.picture.preview;

      try {
        const { base64, width, height } = await imoen(previewUrl);
        data.displayPicture = {
          url: previewUrl,
          width,
          height,
          placeholder: base64,
        };
        await writeJson(data, filepath);
      } catch (err) {
        console.info({ filepath, previewUrl, err });
        return;
      }
    },
    { concurrency: 100 }
  );
  progress.success('All done');
})();
