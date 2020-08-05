const lazyloadAttributes = require('norska/frontend/lazyload/attributes');

module.exports = {
  preview(item) {
    const previewUrl = item.picture.preview;
    const options = { width: 600, placeholder: { width: 200 } };
    return lazyloadAttributes(previewUrl, options);
  },
};
