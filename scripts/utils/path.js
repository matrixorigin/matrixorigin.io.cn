import { isAbsolute, join } from 'node:path'

/**
 * Resolve the absolute path of the argument.
 * @param {string} path
 * @returns {string} The absolute file path.
 */
export function resolveAbsPath(path) {
  if (isAbsolute(path)) return path

  return join(process.cwd(), path)
}
