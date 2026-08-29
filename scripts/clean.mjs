import { rm } from 'node:fs/promises'

await Promise.all([
  rm(new URL('../coverage/', import.meta.url), { force: true, recursive: true }),
  rm(new URL('../release-candidate/', import.meta.url), { force: true, recursive: true }),
  rm(new URL('../site-dist/', import.meta.url), { force: true, recursive: true })
])

console.log('Cleaned generated package, coverage, artifact, and documentation output.')
