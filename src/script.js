const theme = require('norska/theme');
const {
  refinementList,
  toggleRefinement,
  sortBy,
} = require('norska/frontend/algolia/widgets');
const lazyloadHelper = require('norska/frontend/algolia/lazyload');

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
      img(item) {
        const originUrl = item.picture.url;
        const options = {
          imoen: item.picture,
          uuid: item.objectID,
          cacheBusting: false,
          cloudinary: [
            'pixelastic-maps2', // This is a paid plan, 60 credits
            'pixelastic-mercator',
            'pixelastic-ptolemy',
            'pixelastic-eratosthenes',
          ],
        };
        const img = lazyloadHelper.attributes(originUrl, options);

        return img;
      },
    },
  });

  // Add archive notice banner before hits
  const hitsContainer = document.getElementById('hits');
  if (hitsContainer) {
    const banner = document.createElement('div');
    banner.id = 'archiveNotice';
    banner.setAttribute('role', 'alert');
    banner.innerHTML =
      '<strong>Archive Notice:</strong> This project has been archived. The underlying Reddit API is no longer available, so data updates have been discontinued. The data displayed is frozen as of December 12, 2022.';
    hitsContainer.parentNode.insertBefore(banner, hitsContainer);
  }
})();
