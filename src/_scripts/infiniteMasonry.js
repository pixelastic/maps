const instantsearch = require('norska/frontend/algolia/instantsearch');
const transformHits = require('norska/frontend/algolia/transformHits');
const transforms = require('./transforms.js');
const templayed = require('templayed');
const { once } = require('lodash-es');
module.exports = {
  container: null,
  sentinel: null,
  hitTemplate: null,
  isLastPage: false,
  hitDisplayed: 0,
  hitSizes: {},
  scrollPosition: 0,
  rowGap: null,
  widget() {
    const connectInfiniteHits = instantsearch.connectors.connectInfiniteHits;
    return connectInfiniteHits((renderArgs, isFirstRender) => {
      const { hits, showMore, widgetParams } = renderArgs;

      // Keep in memory that we are on the last page, so we don't load more
      this.isLastPage = renderArgs.isLastPage;

      // Setup some variables for all the other calls
      if (isFirstRender) {
        this.firstRender(widgetParams);
      }

      // Update the content
      const newHits = hits.slice(this.hitDisplayed, hits.length);
      console.info(`${newHits.length} new hits`);
      const transformedHits = transformHits(newHits, transforms);
      const content = transformedHits.map(this.hitTemplate);
      this.container.innerHTML += content.join('\n');
      this.hitDisplayed += newHits.length;

      this.resizeAll();
      this.restoreScroll();

      if (isFirstRender) {
        this.observeEndOfPage(showMore);
      }
    });
  },
  firstRender(widgetParams) {
    this.container = document.querySelector(widgetParams.container);
    this.hitTemplate = templayed(widgetParams.templates.item);
    this.sentinel = document.getElementById('endOfPage');
  },
  observeEndOfPage(showMore) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || this.isLastPage) {
            return;
          }
          this.saveScroll();
          showMore();
        });
      },
      { rootMargin: '1000px' }
    );

    observer.observe(this.sentinel);
  },
  resizeAll() {
    const nodes = [...this.container.querySelectorAll('.js-masonryContent')];
    nodes.forEach((node) => {
      this.resize(node);
    });
  },
  resize(node, userOptions = {}) {
    const id = node.getAttribute('data-id');

    // Stop if no need to resize
    const isAlreadyResized = this.hitSizes[id];
    const hasNoParent = !node.parentNode;
    if (isAlreadyResized || hasNoParent) {
      return;
    }

    const options = {
      waitForImage: true,
      storeSize: false,
      ...userOptions,
    };

    const rowGap = this.getRowGap();
    const brickHeight = node.getBoundingClientRect().height + rowGap;
    const size = Math.ceil(brickHeight / rowGap);
    node.parentNode.style.gridRowEnd = `span ${size}`;

    if (options.waitForImage) {
      const image = node.querySelector('.js-masonryImage');
      image.onload = once(() => {
        this.resize(node, { waitForImage: false, storeSize: true });
      });
    }

    if (options.storeSize) {
      this.hitSizes[id] = size;
    }
  },
  getRowGap() {
    if (!this.rowGap) {
      this.rowGap = parseInt(
        window.getComputedStyle(this.container).getPropertyValue('grid-row-gap')
      );
    }
    return this.rowGap;
  },
  saveScroll() {
    this.scrollPosition =
      window.pageYOffset || document.documentElement.scrollTop;
  },
  restoreScroll() {
    setTimeout(() => {
      document.documentElement.scrollTop = this.scrollPosition;
      document.body.scrollTop = this.scrollPosition;
    }, 10);
  },
};
