const theme = require('norska/theme');
const {
  refinementList,
  toggleRefinement,
  sortBy,
} = require('norska/frontend/algolia/widgets');
const imageProxy = require('norska/frontend/imageProxy');
const helper = require('./_scripts/helper');

(async () => {
  const { indexName } = window.CONFIG.algolia;
  await theme.init({
    placeholder: 'Search for dungeon, dragon, world, anything!',
    hitName: 'map',
    widgets: [
      {
        type: refinementList,
        options: {
          container: '#tags',
          attribute: 'tags',
          sortBy: ['count:desc', 'name:asc'],
        },
      },
      {
        type: toggleRefinement,
        options: {
          container: '#curated',
          attribute: 'score.isCurated',
          templates: {
            labelText: 'Only curated authors:',
          },
        },
      },
      {
        type: sortBy,
        options: {
          container: '#sortBy',
          items: [
            { label: 'most recent', value: indexName },
            {
              label: 'most popular',
              value: `${indexName}_popularity`,
            },
          ],
        },
      },
    ],
    transforms: {
      preview(item) {
        const { width, height, placeholder, url } = item.displayPicture;
        const full = imageProxy(url);

        // If we have already downloaded the full version, we skip the placeholder
        // replacement
        // const isAlreadyLoaded = helper.isLoaded(item.objectID);
        // if (isAlreadyLoaded) {
        //   console.info("isLoaded")
        //   return {
        //     cssClass: '',
        //     placeholder: full,
        //   };
        // }
        return {
          cssClass: 'lazyload',
          placeholder,
          full,
          width,
          height,
        };
      },
    },
  });
})();
