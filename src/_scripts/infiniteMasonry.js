const instantsearch = require('norska/frontend/algolia/instantsearch');
const transformHits = require('norska/frontend/algolia/transformHits');
const transforms = require('./transforms.js');
const hogan = require('hogan.js');
const { get, set } = require('lodash-es');
const mediumZoom = require('medium-zoom').default;
module.exports = {
  /**
   * Return the InstantSearch widget
   * @returns {object} InstantSearch widget
   **/
  widget() {
    const connectInfiniteHits = instantsearch.connectors.connectInfiniteHits;
    return connectInfiniteHits((renderArgs, isFirstRender) => {
      const { hits, showMore, widgetParams } = renderArgs;

      // Setup some variables for all the other calls
      if (isFirstRender) {
        this.setStableConfig({ widgetParams, showMore });
      }

      if (this.config('appendMode')) {
        this.config('appendMode', false);
        this.appendHits(hits);
      } else {
        this.clearConfig();
        this.replaceHits(hits);
      }

      this.config('appendMode');

      // Keep in memory that we are on the last page, so we don't load more
      // this.config('isLastPage', renderArgs.isLastPage);

      // Update the content
      // if (this.isShowingMore) {
      // } else {
      // }

      // if (isFirstRender) {
      //   this.observeEndOfPage(showMore);
      // }
    });
  },
  /**
   * Save the config options that won't change for the whole session
   * @param {object} options Options passed for configuration
   * @param {object} options.widgetParams Initial configuration passed to the widget
   * @param {Function} options.showMore Method to call to load more data
   */
  setStableConfig({ widgetParams, showMore }) {
    const container = document.querySelector(widgetParams.container);
    const gapHeight = parseInt(
      window.getComputedStyle(container).getPropertyValue('grid-row-gap')
    );

    const sentinel = this.node('sentinel');

    const template = hogan.compile(widgetParams.templates.item);
    const render = template.render.bind(template);

    const heights = {};
    const intervals = {};

    this.__stableConfig = {
      container,
      gapHeight,
      render,
      sentinel,
      heights,
      intervals,
    };

    this.enableZoom();
    this.onScrollBottomReached(() => {
      this.config('appendMode', true);
      showMore();
    });
  },
  /**
   * Appends new hits to the existing list
   * @param {Array} hits List of hits
   **/
  appendHits(hits) {
    const container = this.config('container');
    const render = this.config('render');

    // Only add the new hits
    const hitCount = this.config('hitCount');
    const newHits = hits.slice(hitCount, hits.length);
    const transformedHits = transformHits(newHits, transforms);
    const content = transformedHits
      .map((hit) => {
        return render(hit);
      })
      .join('\n');

    container.innerHTML += content;

    this.config('hitCount', hitCount + newHits.length);
    this.resizeAll();
  },
  onScrollBottomReached(callback) {
    const sentinel = this.config('sentinel');
    const observer = new IntersectionObserver((entries) => {
      const isVisible = entries[0].isIntersecting;
      if (!isVisible) {
        return;
      }
      callback();
    });

    observer.observe(sentinel);
  },
  /**
   * Allow clicking on images for zooming them
   * Listen to clicks on the main container, and when a click is on an image,
   * attempt to zoom it
   **/
  enableZoom() {
    const container = this.config('container');
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
  /**
   * Getter/Setter of the config
   * @param {string} key Config key. If no value is set, will return the value
   * @param {*} value Value to set to the config key
   * @returns {*} Value of the key or undefined
   **/
  config(key, value) {
    // Setting the key
    if (key && value !== undefined) {
      set(this, `__config.${key}`, value);
      return;
    }

    // Reading the key
    return get(this, `__stableConfig.${key}`) || get(this, `__config.${key}`);
  },
  __config: {},
  /**
   * Clears the runtime config
   **/
  clearConfig() {
    this.__config = {
      hitCount: null,
      appendMode: false,
    };
  },
  __stableConfig: {},
  /**
   * Replaces all the hits with a new set
   * @param {Array} hits List of hits
   **/
  replaceHits(hits) {
    const render = this.config('render');
    const container = this.config('container');
    const transformedHits = transformHits(hits, transforms);
    const content = transformedHits
      .map((hit) => {
        return render(hit);
      })
      .join('\n');

    container.innerHTML = content;

    this.config('hitCount', hits.length);
    this.resizeAll();
  },
  /**
   * Resize all the bricks in the wall
   **/
  resizeAll() {
    const container = this.config('container');
    const nodes = [...container.querySelectorAll('.js-masonryContent')];
    nodes.forEach((node) => {
      const id = node.id;
      this.resize(id);
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
  resize(id, userOptions = {}) {
    const node = this.node(id);
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

    // Save the height in cache so next calls are faster
    if (options.saveHeight) {
      this.config(`heights.${id}`, spanHeight);
    }

    // Wait for image to load, and re-resize afterwards
    if (image && options.waitForImage) {
      // Resize as soon as we have some dimensions
      this.onImageStartDownloading(image, id, () => {
        this.resize(id, { waitForImage: false, removePlaceholder: true });
      });
      // Fully resize and save the height when image is ready
      this.onImageFinishDownloading(image, () => {
        this.resize(id, {
          waitForImage: false,
          removePlaceholder: true,
          saveHeight: true,
        });
      });
    }
  },
  /**
   * Fires a callback as soon as the brick image starts downloading
   * Note: There is no such event, so we fake it by checking its .naturalHeight
   * value periodically trough a setInterval
   * @param {object} image Image tag to check
   * @param {string} id Unique id of the brick the image is attached to
   * @param {Function} callback Method to call once the download starts
   **/
  onImageStartDownloading(image, id, callback) {
    // To avoid creating multiple intervals, we check if one is already set
    const cachedInterval = this.config(`intervals.${id}`);
    if (cachedInterval) {
      return;
    }

    // We check for the image naturalHeight periodically and stop once it's set
    const interval = setInterval(() => {
      const height = image.naturalHeight;
      if (!height) {
        return;
      }
      clearInterval(interval);
      callback(height);
    }, 100);
    this.config(`intervals.${id}`, interval);
  },
  /**
   * Fires a callback once an image is downloaded
   * Note: Due to the lazyloading of images using a placeholder, this method
   * might fire twice on the same element. It shouldn't be an issue as it will
   * just resize the element to the same size it already was
   * @param {object} image Image tag to check
   * @param {Function} callback Method to call once the image is downloaded
   **/
  onImageFinishDownloading(image, callback) {
    image.addEventListener('load', () => {
      callback();
    });
  },
  /**
   * Returns the height of a brick in span units
   * @param {string} id Unique id of the brick
   * @returns {number} Number of units it spans
   **/
  getSpanHeight(id) {
    // Read the value from cache if the brick height has already been set
    const cachedHeight = this.config(`heights.${id}`);
    if (cachedHeight) {
      return cachedHeight;
    }

    const gapHeight = this.config('gapHeight');
    const node = this.node(id);
    const brickHeight = node.getBoundingClientRect().height + gapHeight;
    return Math.ceil(brickHeight / gapHeight);
  },
  node(id) {
    return document.getElementById(id);
  },
};
