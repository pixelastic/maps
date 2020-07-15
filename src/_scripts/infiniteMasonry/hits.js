const config = require('./config.js');
const resize = require('./resize.js');
const transformHits = require('norska/frontend/algolia/transformHits');
const transforms = require('../transforms.js');
module.exports = {
  /**
   * Replaces all the hits with a new set
   * @param {Array} hits List of hits
   **/
  replace(hits) {
    const container = config.get('container');
    const render = config.get('render');
    const transformedHits = transformHits(hits, transforms);
    const content = transformedHits
      .map((hit) => {
        return render(hit);
      })
      .join('\n');

    container.innerHTML = content;

    config.set('hitCount', hits.length);
    resize.all();
  },
  /**
   * Appends new hits to the existing list
   * @param {Array} hits List of hits
   **/
  append(hits) {
    const container = config.get('container');
    const render = config.get('render');

    // Only add the new hits
    const hitCount = config.get('hitCount');
    const newHits = hits.slice(hitCount, hits.length);
    const transformedHits = transformHits(newHits, transforms);
    const content = transformedHits
      .map((hit) => {
        return render(hit);
      })
      .join('\n');

    container.innerHTML += content;

    config.set('hitCount', hitCount + newHits.length);
    resize.all();
  },
};
