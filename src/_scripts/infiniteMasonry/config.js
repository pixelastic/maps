const { get, set } = require('lodash-es');
const hogan = require('hogan.js');
module.exports = {
  __stable: {},
  __runtime: {},
  /**
   * Returns a config value
   * @param {string} key Key to read
   * @returns {*} Value of the key
   **/
  get(key) {
    return get(this, `__stable.${key}`) || get(this, `__runtime.${key}`);
  },
  /**
   * Sets a runtime confif value
   * @param {string} key Key to set
   * @param {*} value Value to set to the key
   **/
  set(key, value) {
    set(this, `__runtime.${key}`, value);
  },
  /**
   * Clears the runtime config
   **/
  clear() {
    this.__runtime = {
      hitCount: 0,
      appendMode: false,
    };
  },
  /**
   * Save the config options that won't change for the whole session
   * @param {object} widgetParams Initial configuration passed to the widget
   */
  setStable(widgetParams) {
    const container = document.querySelector(widgetParams.container);
    const gapHeight = parseInt(
      window.getComputedStyle(container).getPropertyValue('grid-row-gap')
    );
    const rowHeight = parseInt(
      window.getComputedStyle(container).getPropertyValue('grid-auto-rows')
    );

    const template = hogan.compile(widgetParams.templates.item);
    const render = template.render.bind(template);

    const heights = {};
    const intervals = {};

    this.__stable = {
      container,
      gapHeight,
      rowHeight,
      render,
      heights,
      intervals,
    };

    this.clear();
  },
};
