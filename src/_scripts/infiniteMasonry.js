const instantsearch = require('norska/frontend/algolia/instantsearch');
const transformHits = require('norska/frontend/algolia/transformHits');
const transforms = require('./transforms.js');
const hogan = require('hogan.js');
const { get, set } = require('lodash-es');
const mediumZoom = require('medium-zoom').default;
module.exports = {
  debugId: 't3_davzu4',
  /**
   * Save the config options that won't change for the whole session
   * @param {object} widgetConfig Initial configuration passed to the widget
   **/
  setStableConfig(widgetConfig) {
    const container = document.querySelector(widgetConfig.container);
    const gapHeight = parseInt(
      window.getComputedStyle(container).getPropertyValue('grid-row-gap')
    );

    const template = hogan.compile(widgetConfig.templates.item);
    const render = template.render.bind(template);

    const sentinel = document.getElementById('endOfPage');

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
  },
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
      isLastPage: false,
      appendMode: false,
    };
  },
  __stableConfig: {},
  /**
   * Return the InstantSearch widget
   * @returns {object} InstantSearch widget
   **/
  widget() {
    const connectInfiniteHits = instantsearch.connectors.connectInfiniteHits;
    return connectInfiniteHits((renderArgs, isFirstRender) => {
      const { hits, _showMore, widgetParams } = renderArgs;

      // Setup some variables for all the other calls
      if (isFirstRender) {
        this.setStableConfig(widgetParams);
      }

      this.config('appendMode')
        ? this.appendHits(hits)
        : this.replaceHits(hits);

      // Keep in memory that we are on the last page, so we don't load more
      // this.config('isLastPage', renderArgs.isLastPage);

      // Update the content
      // if (this.isShowingMore) {
      //   // Should add the element into another list, offscreen
      //   // and wait for image onload before adding to the main list
      //   const newHits = hits.slice(this.hitDisplayed, hits.length);
      //   const transformedHits = transformHits(newHits, transforms);
      //   const content = transformedHits.map((hit) => {
      //     return this.hitRender(hit);
      //   });
      //   this.container.innerHTML += content.join('\n');
      //   this.hitDisplayed += newHits.length;
      //   this.resizeAll();
      //   this.afterShowMore();
      // } else {
      // }

      // if (isFirstRender) {
      //   this.observeEndOfPage(showMore);
      // }
    });
  },
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

    this.debug(id, `${id}: ${spanHeight}`);

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
  debug(id, input) {
    const node = this.node(id);
    const debugNode = node.querySelector('.js-masonryDebug');
    if (!debugNode) {
      return;
    }
    debugNode.innerHTML = input;
  },
  observeEndOfPage(showMore) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || this.isLastPage) {
            return;
          }
          this.beforeShowMore();
          showMore();
        });
      },
      { rootMargin: '1000px' }
    );

    observer.observe(this.sentinel);
  },
  console(id, output) {
    if (id !== this.debugId) {
      return;
    }
    console.info(output);
  },
  node(id) {
    return document.getElementById(id);
  },
};
