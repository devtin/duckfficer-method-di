/*!
 * duckfficer-method-di v1.0.0
 * (c) 2020-2021 Martin Rafael Gonzalez <tin@devtin.io>
 * MIT
 */
import { pleasureDi } from 'pleasure-di';
import path from 'path';
import startCase from 'lodash/startCase';
import { deepListDirSync } from 'deep-list-dir';
import { EventEmitter } from 'events';
import { duckfficerMethod } from 'duckfficer-method';
import { jsDirIntoJsonSync } from 'js-dir-into-json';

const upperCamelCase = (s) => {
  return startCase(s).replace(/[\s]+/g, '')
};

class DuckfficerMethodError extends Error {
  constructor (message, errors) {
    super();
    this.errors = errors;
  }
}

const loadResource = ({ resourcesInstances, resourcesData, resourceName, container }) => {
  const resource = new EventEmitter();

  Object.entries(resourcesData[resourceName]).forEach(([methodName, method]) => {
    const duckfficerFn = duckfficerMethod({
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
      resourcesData[resourceName] = jsDirIntoJsonSync(path.join(baseDir, resources[resourceName]));
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
    const resolverPattern = path.join(resolverPath, '**', methodsPath, '**', 'handler.js');

    const handlersPaths = deepListDirSync(baseDir, {
      pattern: [resolverPattern]
    });

    handlersPaths.forEach((handlerPath) => {
      const resourceName = upperCamelCase(path.relative(baseDir, handlerPath).split('/')[1]+'-'+resolverName);
      foundResources[resourceName] = path.relative(baseDir, handlerPath).split('/').slice(0, 2).concat(methodsPath).filter(Boolean).join('/');
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
  return pleasureDi(getLocalResources(pathResolvers, {
    baseDir,
    methodsPath
  }))
};

export { duckfficerMethodDi, getLocalResources };
