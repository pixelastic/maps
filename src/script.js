const theme = require('norska/theme');
const {
  refinementList,
  toggleRefinement,
  sortBy,
} = require('norska/frontend/algolia/widgets');
const lazyloadAttributes = require('norska/frontend/lazyload/attributes');

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
        const previewUrl = item.picture.preview;
        const options = { width: 600, placeholder: { width: 200 } };
        return lazyloadAttributes(previewUrl, options);
      },
    },
  });
})();
