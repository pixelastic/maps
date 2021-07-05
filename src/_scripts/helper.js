module.exports = {
  loaded: {},
  init() {
    // Listen to lazyload images, and store which one we already have processed
    document.addEventListener('lazyloaded', (event) => {
      const { target } = event;
      const objectId = target.dataset.recordId;
      this.loaded[objectId] = true;
    });
  },
  // Check if we have already loaded such an image
  isLoaded(objectId) {
    return !!this.loaded[objectId];
  },
};
