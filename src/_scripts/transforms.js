const cloudinary = require('norska/frontend/cloudinary');
cloudinary.init(window.CONFIG.cloudinary);
const lazyloadAttributes = require('norska/frontend/lazyload/attributes');

module.exports = {
  preview(item) {
    const firstNameLetter = item.author.name[0];
    if (firstNameLetter !== 'M') {
      return false;
    }
    const previewUrl =
      item.picture.preview || 'https://placekitten.com/408/287';
    const options = { width: 600, placeholder: { width: 200 } };
    return lazyloadAttributes(previewUrl, options);
  },
};
