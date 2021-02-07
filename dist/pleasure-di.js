/*!
 * duckfficer-method-di v1.0.0
 * (c) 2020-2021 Martin Rafael Gonzalez <tin@devtin.io>
 * MIT
 */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const each = (arr, cb) => {
  for (let i = 0; i < arr.length; i++) {
    if (cb(arr[i], i) === false) {
      break
    }
  }
};

/**
 * @typedef {Function} Resolved
 * @param {Object} container
 * @return {Object}
 */

/**
 * @typedef {Function} Resolver
 * @param {String} containerName
 * @return {Resolved}
 */

/**
 *
 * @param {Object} resolvers - resolvers map
 * @return {{}|*}
 */

const pleasureDi = (resolvers) => {
  const availableContainers = Object.keys(resolvers);
  const containerMayExist = (containerNameRequested) => {
    let mayExist = false;
    each(availableContainers, (containerNameRegistered) => {
      const containerNameMatcher = new RegExp(`${containerNameRegistered}$`);
      if (containerNameMatcher.test(containerNameRequested)) {
        mayExist = containerNameRegistered;
        return false
      }
    });
    return mayExist
  };


  const container = new Proxy({}, {
    get (target, path) {
      const matchingContainer = containerMayExist(path);
      if (!matchingContainer) {
        throw new Error(`No suffixed container name registered matching ${path}`)
      }

      const resolver = resolvers[matchingContainer](path);

      if (!resolver) {
        throw new Error(`Resource ${path} not found`)
      }

      return resolver(container)
    }
  });

  return container
};

exports.pleasureDi = pleasureDi;
