#!/usr/bin/env node

const { build, ts, tsconfig, dirname, glob, log } = require("estrella")

build({
  entry: "index.ts",
  outfile: "index.js",
  onEnd(config) {
    const dtsFilesOutdir = dirname(config.outfile)
    generateTypeDefs(tsconfig(config), config.entry, dtsFilesOutdir)
  },
  minify: false,
})

function generateTypeDefs(tsconfig, entryfiles, outdir) {
  const filenames = Array.from(
    new Set(
      (Array.isArray(entryfiles) ? entryfiles : [entryfiles])
      .concat(tsconfig.include || []))).filter(v => v)
  log.info("Generating type declaration files for", filenames.join(", "))
  const compilerOptions = {
    ...tsconfig.compilerOptions,
    moduleResolution: undefined,
    declaration: true,
    outDir: outdir,
  }
  const program = ts.ts.createProgram(filenames, compilerOptions)
  const targetSourceFile = undefined
  const writeFile = undefined
  const cancellationToken = undefined
  const emitOnlyDtsFiles = true
  program.emit(targetSourceFile, writeFile, cancellationToken, emitOnlyDtsFiles)
  log.info("Wrote", glob(outdir + "/*.d.ts").join(", "))
}
