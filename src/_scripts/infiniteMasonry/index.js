const instantsearch = require('norska/frontend/algolia/instantsearch');
const config = require('./config.js');
const zoom = require('./zoom.js');
const hits = require('./hits.js');
module.exports = {
  /**
   * Return the InstantSearch widget
   * @returns {object} InstantSearch widget
   **/
  widget() {
    const connectInfiniteHits = instantsearch.connectors.connectInfiniteHits;
    return connectInfiniteHits((renderArgs, isFirstRender) => {
      const { hits: hitList, showMore, widgetParams } = renderArgs;

      // Init the widget
      if (isFirstRender) {
        config.setStable(widgetParams);
        zoom.enable();
        hits.onInfiniteScroll(() => {
          this.setAppendMode(true);
          showMore();
        });
        return;
      }

      // Clear all runtime config, unless we're triggering the infinite scroll
      if (!this.isAppendMode()) {
        config.clear();
      }
      this.setAppendMode(false);

      hits.append(hitList);
    });
  },
  setAppendMode(value) {
    config.set('appendMode', value);
  },
  isAppendMode() {
    return config.get('appendMode');
  },
};