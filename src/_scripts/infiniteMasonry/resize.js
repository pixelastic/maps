const config = require('./config.js');
const events = require('./events.js');

/**
 * Resizes a specific brick
 * Note that we pass the brick id and not the brick DOM node directly as DOM
 * nodes can appear and disappear between the execution of the methods and its
 * callback. Identifiying elements by their ids make sure we can find them
 * again.
 * @param {string|Array} idOrIds Id of the brick in the DOM, or array of ids
 * @param {object} userOptions
 * {boolean} userOptions.waitForImage If set to true, resize again when image
 * are loaded. Default true (set to false in recursive calls)
 * {boolean} userOptions.saveHeight Save the computed height in cache.
 * Default to false, set to true once all images are loaded
 */
const resize = (idOrIds, userOptions = {}) => {
  // Recursively apply to each id if passed as an array
  if (Array.isArray(idOrIds)) {
    idOrIds.forEach((id) => {
      resize(id);
    });
    return;
  }

  const id = idOrIds;

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

  // Read the value from cache if the brick height has already been set
  let spanHeight = config.get(`heights.${id}`);
  if (!spanHeight) {
    spanHeight = resize.getSpanHeight(node);
  }

  // Resize the height to match the grid rows
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
      resize(id, { waitForImage: false, removePlaceholder: true });
    });
    // Fully resize and save the height when image is ready
    events.onImageFinishDownloading(image, () => {
      resize(id, {
        waitForImage: false,
        removePlaceholder: true,
        saveHeight: true,
      });
    });
  }
};

/**
 * Returns the height of a brick in span units
 * @param {object} node Node to size
 * @returns {number} Number of units it spans
 **/
resize.getSpanHeight = (node) => {
  const gapHeight = config.get('gapHeight');
  const rowHeight = config.get('rowHeight');
  const innerHeight = node.getBoundingClientRect().height;

  const brickHeight = innerHeight + gapHeight;
  const trackHeight = rowHeight + gapHeight;

  return Math.ceil(brickHeight / trackHeight);
};
module.exports = resize;
