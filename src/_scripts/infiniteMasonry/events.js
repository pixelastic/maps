const config = require('./config.js');
const { after } = require('lodash-es');
module.exports = {
  onScrollBottomReached(callback) {
    const sentinel = config.get('sentinel');
    const observer = new IntersectionObserver(
      after(2, (entries) => {
        const isVisible = entries[0].isIntersecting;
        if (!isVisible) {
          return;
        }
        callback();
      })
    );

    observer.observe(sentinel);
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
    const cachedInterval = config.get(`intervals.${id}`);
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
    config.set(`intervals.${id}`, interval);
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
};
