const lazyload = require('norska/frontend/lazyload');
const algolia = require('norska/frontend/algolia');
const {
  configure,
  refinementList,
  searchBox,
  toggleRefinement,
  sortBy,
} = require('norska/frontend/algolia/widgets');
const credentials = window.CONFIG.algolia;
const infiniteMasonry = require('./_scripts/infiniteMasonry');

const widgets = [
  /**
   * Main configuration
   **/
  {
    type: configure,
    options: {
      hitsPerPage: 5,
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
  {
    type: toggleRefinement,
    options: {
      container: '#curated',
      attribute: 'score.isCurated',
      templates: {
        labelText: 'Only curated authors',
      },
    },
  },
  {
    type: refinementList,
    options: {
      container: '#tags',
      attribute: 'tags',
      sortBy: ['count:desc', 'name:asc'],
    },
  },
  // Maybe do an index sort:
  // - byDate
  // - byPopularity
  /**
   * Hits
   **/
  {
    type: infiniteMasonry.widget(),
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

algolia.init(credentials).setWidgets(widgets).start();

lazyload.init();
