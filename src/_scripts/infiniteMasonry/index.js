const instantsearch = require('norska/frontend/algolia/instantsearch');
const config = require('./config.js');
const events = require('./events.js');
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

      // Setup some variables for all the other calls
      if (isFirstRender) {
        config.setStable(widgetParams);
        zoom.enable();
        events.onScrollBottomReached(() => {
          config.set('appendMode', true);
          showMore();
        });
      }

      if (config.get('appendMode')) {
        config.set('appendMode', false);
        hits.append(hitList);
      } else {
        config.clear();
        hits.replace(hitList);
      }
    });
  },
};
