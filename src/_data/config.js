const isProduction = process.env.NODE_ENV === 'production';
const norskaConfig = require('../../norska.config.js');
const siteConfig = require('./site.json');
const baseUrl = isProduction ? siteConfig.defaultUrl : 'http://127.0.0.1:8083/';
module.exports = {
  isProduction,
  baseUrl,
  cloudinary: norskaConfig.cloudinary,
  algolia: {
    appId: 'O3F8QXYK6R',
    apiKey: 'fc6f75fa8bec521693bb35881a46af18',
    indexName: 'gamemaster_maps',
  },
};
