const config = require('./config.js');
const events = require('./events.js');
module.exports = {
  /**
   * Resize all the bricks in the wall
   **/
  all() {
    const container = config.get('container');
    const nodes = [...container.querySelectorAll('.js-masonryContent')];
    nodes.forEach((node) => {
      const id = node.id;
      this.one(id);
    });
  },
  /**
   * Resizes a specific brick
   * Note that we pass the brick id and not the brick DOM node directly as DOM
   * nodes can appear and disappear between the execution of the methods and its
   * callback. Identifiying elements by their ids make sure we can find them
   * again.
   * @param {string} id Unique id of the brick in the DOM
   * @param {object} userOptions
   *  {boolean} userOptions.waitForImage If set to true, resize again when image
   *  are loaded. Default true (set to false in recursive calls)
   *  {boolean} userOptions.saveHeight Save the computed height in cache.
   *  Default to false, set to true once all images are loaded
   **/
  one(id, userOptions = {}) {
    const node = document.getElementById(id);
    const image = node.querySelector('.js-masonryImage');
    const options = {
      waitForImage: true,
      saveHeight: false,
      removePlaceholder: false,
      ...userOptions,
    };

    if (image && options.removePlaceholder) {
      image.style.height = 'auto';
    }

    // Resize the height to match the grid rows
    const spanHeight = this.getSpanHeight(id);
    node.parentNode.style.gridRowEnd = `span ${spanHeight}`;
    setTimeout(() => {
      // node.style.height = '100%';
    }, 100);

    // Save the height in cache so next calls are faster
    if (options.saveHeight) {
      config.set(`heights.${id}`, spanHeight);
    }

    // Wait for image to load, and re-resize afterwards
    if (image && options.waitForImage) {
      // Resize as soon as we have some dimensions
      events.onImageStartDownloading(image, id, () => {
        this.one(id, { waitForImage: false, removePlaceholder: true });
      });
      // Fully resize and save the height when image is ready
      events.onImageFinishDownloading(image, () => {
        this.one(id, {
          waitForImage: false,
          removePlaceholder: true,
          saveHeight: true,
        });
      });
    }
  },
  /**
   * Returns the height of a brick in span units
   * @param {string} id Unique id of the brick
   * @returns {number} Number of units it spans
   **/
  getSpanHeight(id) {
    // Read the value from cache if the brick height has already been set
    const cachedHeight = config.get(`heights.${id}`);
    if (cachedHeight) {
      return cachedHeight;
    }

    const gapHeight = config.get('gapHeight');
    const node = document.getElementById(id);
    const brickHeight = node.getBoundingClientRect().height + gapHeight;
    return Math.ceil(brickHeight / gapHeight);
  },
};
