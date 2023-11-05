import { readFile, writeFile } from 'node:fs/promises'
import { basename, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import autocorrect from 'autocorrect-node'
import chalk from 'chalk'
import * as Diff from 'diff'
import fg from 'fast-glob'
import parseArgs from 'minimist'
import YAML from 'yaml'

import { resolveAbsPath } from './utils/path.js'

const SEVERITY = {
  ERROR: 1,
  WARNING: 2
}

const __dirname = dirname(fileURLToPath(import.meta.url))

const configFile = await readFile(join(__dirname, '../.autocorrectrc'), 'utf8')

const config = YAML.parse(configFile)

autocorrect.loadConfig(JSON.stringify(config))

const argv = parseArgs(
  process.argv.slice(2)
)

// console.log(argv)

const { _: paths, fix = false } = argv

const DEFAULT_PATHS = ['./docs/MatrixOne/**/*.md']

const pathStream = fg.stream(paths.length ? paths : DEFAULT_PATHS)

/** Autocorrect concurrent tasks */
const autocorrectTasks = []

/** File count */
let fileCount = 0
/** Error count */
let warningCount = 0
/** Warning count */
let errorCount = 0

for await (const entry of pathStream) {
  const absPath = resolveAbsPath(entry)
  // console.log({ entry, absPath })
  autocorrectTasks.push(
    readFile(absPath, { encoding: 'utf8' }).then(async (fileContent) => {
      fileCount++

      const filename = basename(absPath)
      // console.log({ filename, len: fileContent.length })
      const lintResult = autocorrect.lintFor(fileContent, filename)

      for (const {
        l: line,
        c: column,
        new: newStr,
        old: oldStr,
        severity
      } of lintResult.lines) {
        if (severity === SEVERITY.ERROR) {
          errorCount++
        } else if (severity === SEVERITY.WARNING) {
          warningCount++
        }

        const level = severity === SEVERITY.ERROR ? 'error' : 'warning'
        console.log(
          (level === 'error'
            ? chalk.bgRedBright('Error')
            : chalk.bgYellowBright('Warning')) +
            chalk(` ${absPath}:${line}:${column}`)
        )

        // fmt - green for additions, red for deletions
        const diff = Diff.diffChars(oldStr, newStr)
        /** old line */
        const oldLine =
          chalk.redBright('-') +
          diff
            .filter(({ added }) => !added)
            .reduce((out, { removed, value }) => {
              const seg = removed
                ? chalk.bgRedBright(value)
                : chalk.redBright(value)

              return out + seg
            }, '')
        /** new line */
        const newLine =
          chalk.greenBright('+') +
          diff
            .filter(({ removed }) => !removed)
            .reduce((out, { added, value }) => {
              const seg = added
                ? chalk.bgGreenBright(value)
                : chalk.greenBright(value)

              return out + seg
            }, '')

        console.log(oldLine)
        console.log(newLine)

        console.log('\n')
      }

      if (fix) {
        const fixedContent = autocorrect.formatFor(fileContent, filename)
        await writeFile(absPath, fixedContent)
      }
    })
  )
}

await Promise.all(autocorrectTasks)

if (errorCount || warningCount) {
  console.log(
    chalk.bgRedBright('FAILED') +
    chalk.redBright(` - ${fileCount} files checked, found: `) +
    chalk.redBright(`Error: ${errorCount}`) +
      chalk(', ') +
      chalk.yellowBright(`Warning: ${warningCount}\n`)
  )
} else {
  console.log(
    chalk.bgGreenBright('PASSED') +
    chalk.greenBright(` - ${fileCount} files checked. `) +
    chalk.greenBright('No error or warning found.\n')
  )
}

// exit with error code 1 if there are errors
if (!fix && errorCount) {
  process.exit(1)
}
