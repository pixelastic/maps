const lazyload = require('norska/frontend/lazyload');
const algolia = require('norska/frontend/algolia');
const {
  configure,
  hits,
  sortBy,
  searchBox,
} = require('norska/frontend/algolia/widgets');
const credentials = window.CONFIG.algolia;
const transforms = require('./_scripts/transforms.js');
const masonry = require('./_scripts/masonry.js');

const widgets = [
  /**
   * Main configuration
   **/
  {
    type: configure,
    options: {
      hitsPerPage: 80,
    },
  },
  /**
   * Searchbar
   **/
  {
    type: searchBox,
    options: {
      container: '#searchbox',
      placeholder: 'Search for any map',
      autofocus: true,
      showReset: false,
      showSubmit: false,
      showLoadingIndicator: false,
    },
  },
  /**
   * Hits
   **/
  {
    type: hits,
    options: {
      container: '#hits',
      templates: {
        item: document.getElementById('hitTemplate').value,
        empty: document.getElementById('emptyTemplate').value,
      },
    },
  },
  /**
   * Sorting
   **/
  {
    type: sortBy,
    options: {
      container: '#sortBy',
      items: [
        { label: 'by date', value: credentials.indexName },
        {
          label: 'by popularity',
          value: `${credentials.indexName}_popularity`,
        },
      ],
    },
  },
];

masonry.init();

algolia
  .init(credentials)
  .setWidgets(widgets)
  .setTransforms(transforms)
  .onSearch((query) => {
    if (!query) {
      masonry.resizeAll();
    }
  })
  // .onDisplay((hit) => {
  //   masonry.fit(hit);
  // })
  .start();

lazyload.init();
