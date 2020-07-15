const mediumZoom = require('medium-zoom').default;
const config = require('./config.js');
module.exports = {
  /**
   * Allow clicking on images for zooming them
   * Listen to clicks on the main container, and when a click is on an image,
   * attempt to zoom it
   **/
  enable() {
    const container = config.get('container');
    container.addEventListener('click', (event) => {
      const { target } = event;
      const isImage = target.tagName === 'IMG';
      const isLoaded = target.complete;
      const isAlreadySetup = target.hasZoomSetup;
      if (!isImage || !isLoaded || isAlreadySetup) {
        return;
      }

      mediumZoom(target, {
        background: null,
      });
      target.hasZoomSetup = true;
    });
  },
};
