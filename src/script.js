const lazyload = require('norska/frontend/lazyload');
const algolia = require('norska/frontend/algolia');
const {
  configure,
  refinementList,
  searchBox,
  sortBy,
  stats,
  toggleRefinement,
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
      hitsPerPage: 40,
    },
  },
  /**
   * Searchbar
   **/
  {
    type: searchBox,
    options: {
      container: '#searchbox',
      placeholder: 'Search for dungeon, dragon, world, anything!',
      autofocus: true,
      showReset: false,
      showSubmit: false,
      showLoadingIndicator: false,
    },
  },
  {
    type: stats,
    options: {
      container: '#stats',
      templates: {
        text(options) {
          const poweredByUrl =
            'https://www.algolia.com/?utm_source=instantsearch.js&utm_medium=website&utm_content=gamemaster.pixelastic.com/maps&utm_campaign=poweredby';
          const suffix = `thanks to <a class="bold hover_underline pointer" href="${poweredByUrl}" target="_blank">Algolia</a>`;
          const { query, nbHits } = options;
          if (!query) {
            return `${nbHits} maps indexed, ${suffix}`;
          }
          return `${nbHits} maps found, ${suffix}`;
        },
      },
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
    type: refinementList,
    options: {
      container: '#tags',
      attribute: 'tags',
      sortBy: ['count:desc', 'name:asc'],
    },
  },
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
        { label: 'most recent', value: credentials.indexName },
        {
          label: 'most popular',
          value: `${credentials.indexName}_popularity`,
        },
      ],
    },
  },
];

algolia.init(credentials).setWidgets(widgets).start();

lazyload.init();
