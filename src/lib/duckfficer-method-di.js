import { pleasureDi } from 'pleasure-di'
import { getLocalResources } from './get-local-resources.js'


/**
 *
 * @param {Object} pathResolvers
 * @param {String} [baseDir=process.cwd()]
 * @param {String} [methodsPath=methods]
 * @return {Object} container
 */
export const duckfficerMethodDi = (pathResolvers, {
  baseDir = process.cwd(),
  methodsPath = 'methods'
} = {}) => {
  return pleasureDi(getLocalResources(pathResolvers, {
    baseDir,
    methodsPath
  }))
}
