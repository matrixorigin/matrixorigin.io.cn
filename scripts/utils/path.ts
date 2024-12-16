import { isAbsolute, join } from 'node:path'

/**
 * Resolve the absolute path of the argument.
 * @returns The absolute file path.
 */
export function resolveAbsPath(path: string): string {
  if (isAbsolute(path)) return path

  return join(process.cwd(), path)
}
