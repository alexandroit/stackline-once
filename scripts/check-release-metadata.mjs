import assert from 'node:assert/strict'
import { access, readFile } from 'node:fs/promises'

const metadata = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'))
const decision = JSON.parse(await readFile(new URL('../decision.json', import.meta.url), 'utf8'))

assert.equal(metadata.name, '@stackline/once')
assert.equal(metadata.version, '1.0.0')
assert.equal(metadata.license, 'ISC')
assert.equal(metadata.engines.node, '>=0.10.0')
assert.equal(metadata.repository.url, 'git+https://github.com/alexandroit/stackline-once.git')
assert.equal(metadata.homepage, 'https://alexandro.net/docs/vanilla/once/')
assert.equal(metadata.publishConfig.access, 'public')
assert.equal(decision.package, 'once')
assert.equal(decision.target, metadata.name)
assert.equal(decision.targetVersion, metadata.version)
assert.equal(decision.decision, 'GO')
assert.equal(decision.canonicalState, 'BUILDING')
assert.equal(decision.reasonCode, 'UNPUBLISHED_TAGGED_API_FIX_WITH_BOUNDED_LEGACY_CJS_SURFACE_AND_TWO_QUALIFIED_DIRECT_ADOPTION_PATHS')
assert.equal(decision.publication.npmPublished, false)
assert.equal(decision.publication.githubRepositoryCreated, false)
assert.equal(decision.publication.outreachCreated, false)

await Promise.all(metadata.files.map((filename) => access(new URL(`../${filename}`, import.meta.url))))
console.log('Frozen GO decision, unpublished state, metadata, and package inventory passed.')
