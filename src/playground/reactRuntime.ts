import reactDomClientSource from '../../node_modules/react-dom/cjs/react-dom-client.production.js?raw'
import reactDomSource from '../../node_modules/react-dom/cjs/react-dom.production.js?raw'
import reactSource from '../../node_modules/react/cjs/react.production.js?raw'
import schedulerSource from '../../node_modules/scheduler/cjs/scheduler.production.js?raw'

/**
 * A script that exposes `React` and `ReactDOM` (including `createRoot`) as
 * globals inside the preview frame. The production CommonJS builds are wired
 * together with a tiny `require` so the preview works offline and without a CDN.
 */
const modules: Record<string, string> = {
  react: reactSource,
  scheduler: schedulerSource,
  'react-dom': reactDomSource,
  'react-dom/client': reactDomClientSource,
}

const moduleFactories = Object.entries(modules)
  .map(
    ([name, source]) =>
      `${JSON.stringify(name)}: function (module, exports, require) {\n${source}\n}`,
  )
  .join(',\n')

export const reactRuntime = `(function () {
  var factories = {
${moduleFactories}
  };
  var cache = {};
  function require(name) {
    if (!cache[name]) {
      var module = (cache[name] = { exports: {} });
      factories[name](module, module.exports, require);
    }
    return cache[name].exports;
  }
  window.React = require('react');
  window.ReactDOM = Object.assign({}, require('react-dom'), require('react-dom/client'));
})();`
