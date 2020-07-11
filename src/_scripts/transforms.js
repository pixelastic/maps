const cloudinary = require('norska/frontend/cloudinary');
const proxy = require('norska/frontend/cloudinary/proxy');
cloudinary.init(window.CONFIG.cloudinary);
const lazyloadAttributes = require('norska/frontend/lazyload/attributes');

module.exports = {
  preview(item) {
    const previewUrl =
      item.picture.preview || 'https://placekitten.com/408/287';
    const options = { width: 600, placeholder: { width: 200 } };
    return lazyloadAttributes(previewUrl, options);
  },
  zoomedPicture(item) {
    const options = { width: 1024 };
    return proxy(item.picture.full, options);
  },
};
