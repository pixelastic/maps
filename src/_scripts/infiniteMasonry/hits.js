const config = require('./config.js');
const resize = require('./resize.js');
const events = require('./events.js');
const transformHits = require('norska/frontend/algolia/transformHits');
const transforms = require('../transforms.js');
module.exports = {
  /**
   * Appends new hits to the existing list
   * @param {Array} hits List of hits
   **/
  append(hits) {
    const container = config.get('container');

    // Browsers have a limit to the number of rows. If we add more than this
    // limit, items will stack on top of each other. Chrome has a limit to 1000,
    // Firefox to 10.000. Just to be sure we'll stop adding items if we're
    // nearing 800 rows.
    const rowCount = resize.getSpanHeight(container);
    if (rowCount >= 800) {
      return;
    }

    const hitCount = config.get('hitCount');
    const newHits = hits.slice(hitCount, hits.length);
    const render = config.get('render');
    const transformedHits = transformHits(newHits, transforms);
    const ids = [];
    const html = transformedHits
      .map((hit) => {
        ids.push(hit.id);
        return render(hit);
      })
      .join('\n');

    container.innerHTML += html;

    // Add a sentinel at the bottom, to enable the infinite scroll
    this.addSentinel();

    config.set('hitCount', hitCount + newHits.length);
    resize(ids);
  },
  /**
   * Add a sentinel at the bottom of the list
   **/
  addSentinel() {
    const container = config.get('container');
    const sentinelId = 'masonrySentinel';

    // Re-use existing one, or create a new one
    let sentinel = document.getElementById(sentinelId);
    if (!sentinel) {
      sentinel = document.createElement('div');
      sentinel.style.gridRowEnd = 'span 1';
      sentinel.id = sentinelId;
    }

    // Add it, and wait for it to come into view
    // Note that we need to re-watch it each it we move it around
    container.appendChild(sentinel);
    events.onNodeVisible(sentinel, () => {
      this.__infiniteScrollCallback();
    });
  },
  /**
   * Register the callback to fire when we reach the bottom of the page
   * @param {Function} callback Function to call when bottom of page is reached
   **/
  onInfiniteScroll(callback) {
    this.__infiniteScrollCallback = callback;
  },
  __infiniteScrollCallback: () => {},
};