const cloudinary = require('norska/frontend/cloudinary');
cloudinary.init(window.CONFIG.cloudinary);
const lazyloadAttributes = require('norska/frontend/lazyload/attributes');

module.exports = {
  preview(item) {
    const previewUrl = item.picture.preview || 'ERROR';
    const options = { width: 600, placeholder: { width: 200 } };
    return lazyloadAttributes(previewUrl, options);
  },
};
