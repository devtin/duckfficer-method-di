/*!
 * duckfficer-method-di v1.0.0
 * (c) 2020-2021 Martin Rafael Gonzalez <tin@devtin.io>
 * MIT
 */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var pleasureDi = require('pleasure-di');
var path = require('path');
var startCase = require('lodash/startCase');
var deepListDir = require('deep-list-dir');
var events = require('events');
var duckfficerMethod = require('duckfficer-method');
var jsDirIntoJson = require('js-dir-into-json');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var path__default = /*#__PURE__*/_interopDefaultLegacy(path);
var startCase__default = /*#__PURE__*/_interopDefaultLegacy(startCase);

const upperCamelCase = (s) => {
  return startCase__default['default'](s).replace(/[\s]+/g, '')
};

class DuckfficerMethodError extends Error {
  constructor (message, errors) {
    super();
    this.errors = errors;
  }
}

const loadResource = ({ resourcesInstances, resourcesData, resourceName, container }) => {
  const resource = new events.EventEmitter();

  Object.entries(resourcesData[resourceName]).forEach(([methodName, method]) => {
    const duckfficerFn = duckfficerMethod.duckfficerMethod({
      ...method,
      handler: method.handler(container)
    });
    resource[methodName] = async (payload) => {
      const result = await duckfficerFn(payload);

      result.eventsEmitted.forEach(ev => resource.emit(ev.name, ev.payload));

      if (result.errorsThrown.length > 0) {
        throw new DuckfficerMethodError(`${result.errorsThrown.length} found in ${resourceName}.${methodName}`, result.errorsThrown)
      }

      return result.output
    };
  });

  resourcesInstances[resourceName] = resource;

  return resource
};

const getResolverFn = ({
  baseDir,
  resources
}) => {
  const resourcesData = {};
  const resourcesInstances = {};

  return (resourceName) => {
    if (!resources[resourceName]) {
      throw new Error(`Resource ${ resourceName } not found!`)
    }

    if (!resourcesData[resourceName]) {
      resourcesData[resourceName] = jsDirIntoJson.jsDirIntoJsonSync(path__default['default'].join(baseDir, resources[resourceName]));
    }

    return (container) => {
      if (resourcesInstances[resourceName]) {
        return resourcesInstances[resourceName]
      }
      return loadResource({ resourcesInstances, resourcesData, resources, resourceName, container })
    }
  }
};

const getLocalResources = (pathResolvers, {
  baseDir,
  methodsPath
}) => {
  const resolvers = {};

  Object.entries(pathResolvers).forEach(([resolverName, resolverPath]) => {
    const foundResources = {};
    const resolverPattern = path__default['default'].join(resolverPath, '**', methodsPath, '**', 'handler.js');

    const handlersPaths = deepListDir.deepListDirSync(baseDir, {
      pattern: [resolverPattern]
    });

    handlersPaths.forEach((handlerPath) => {
      const resourceName = upperCamelCase(path__default['default'].relative(baseDir, handlerPath).split('/')[1]+'-'+resolverName);
      foundResources[resourceName] = path__default['default'].relative(baseDir, handlerPath).split('/').slice(0, 2).concat(methodsPath).filter(Boolean).join('/');
    });

    resolvers[resolverName] = getResolverFn({
      resolverName,
      resources: foundResources,
      baseDir
    });
  });

  return resolvers
};

/**
 *
 * @param {Object} pathResolvers
 * @param {String} [baseDir=process.cwd()]
 * @param {String} [methodsPath=methods]
 * @return {Object} container
 */
const duckfficerMethodDi = (pathResolvers, {
  baseDir = process.cwd(),
  methodsPath = 'methods'
} = {}) => {
  return pleasureDi.pleasureDi(getLocalResources(pathResolvers, {
    baseDir,
    methodsPath
  }))
};

exports.duckfficerMethodDi = duckfficerMethodDi;
exports.getLocalResources = getLocalResources;
