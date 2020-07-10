const _ = require('golgoth/lib/lodash');

module.exports = {
  $root: document.getElementById('hits'),
  __cache: {
    rowGap: null,
  },
  init() {
    const options = {
      childList: true,
      subtree: true,
    };
    new MutationObserver(() => {
      this.resizeAll();
    }).observe(this.$root, options);
  },
  resizeAll() {
    const nodes = [...this.$root.querySelectorAll('.js-masonryContent')];
    _.each(nodes, (node) => {
      this.resize(node);
    });
  },
  resize(node, userOptions = {}) {
    // By the time the method is called, the node might have been unmounted from
    // the DOM, so we cancel
    if (!node.parentNode) {
      return;
    }

    const options = {
      waitForImage: true,
      ...userOptions,
    };

    const rowGap = this.rowGap();
    const brickHeight = node.getBoundingClientRect().height + rowGap;
    const size = Math.ceil(brickHeight / rowGap);
    node.parentNode.style.gridRowEnd = `span ${size}`;

    if (options.waitForImage) {
      const image = node.querySelector('.js-masonryImage');
      image.onload = _.once(() => {
        this.resize(node, { waitForImage: false });
      });
    }
  },
  rowGap() {
    if (!this.__cache.rowGap) {
      const wrapper = document.querySelector('.ais-Hits-list');
      this.__cache.rowGap = parseInt(
        window.getComputedStyle(wrapper).getPropertyValue('grid-row-gap')
      );
    }
    return this.__cache.rowGap;
  },
};
