const _ = require('golgoth/lib/lodash');

module.exports = {
  $root: document.getElementById('hits'),
  init() {
    const options = {
      childList: true,
      subtree: true,
    };
    new MutationObserver((mutations) => {
      this.onMutation(mutations);
    }).observe(this.$root, options);
  },
  nodeToString(node) {
    const { tagName, className, id } = node;
    return `${tagName}.${className}#${id}`;
  },
  onMutation(mutations) {
    _.each(mutations, (mutation) => {
      // Update on the root should resize everything
      if (this.isRoot(mutation.target)) {
        this.resizeAll();
      }

      // Result added
      _.each(mutation.addedNodes, (node) => {
        this.resize(node);
      });
    });
  },
  isRoot(node) {
    return node === this.$root;
  },
  isHit(node) {
    return node.className === 'ais-Hits-item';
  },
  resizeAll() {
    const hits = [...this.$root.querySelectorAll('.ais-Hits-item')];
    _.chain(hits)
      .reverse()
      .each((hit) => {
        this.resize(hit);
      })
      .value();
  },
  resize(node) {
    if (!this.isHit(node)) {
      return;
    }
    const gridData = this.gridData();
    const content = node.querySelector('.js-hitContent');
    const height = content.getBoundingClientRect().height;
    const span = Math.ceil(height / (gridData.unit + gridData.gap));
    console.info(gridData);
    node.style.gridRowEnd = `span ${span}`;

    const image = node.querySelector('.js-hitPreview');
    image.onload = () => {
      this.resize(node);
    };
    image.onerror = () => {
      console.info('error');
      this.resize(node);
    };
  },
  __gridData: null,
  gridData() {
    if (this.__gridData) {
      return this.__gridData;
    }
    const wrapper = document.querySelector('.ais-Hits-list');
    const gap = parseInt(
      window.getComputedStyle(wrapper).getPropertyValue('grid-row-gap')
    );
    const unit = parseInt(
      window.getComputedStyle(wrapper).getPropertyValue('grid-auto-rows')
    );
    this.__gridData = { wrapper, gap, unit };
    return this.__gridData;
  },
};
