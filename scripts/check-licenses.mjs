import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const metadata = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'))
assert.equal(metadata.license, 'ISC')
assert.equal(metadata.dependencies, undefined)

const license = await readFile(new URL('../LICENSE', import.meta.url), 'utf8')
assert.match(license, /2012-2022 Isaac Z\. Schlueter and Contributors/)
assert.match(license, /2026 Stackline Maintainers/)
assert.match(license, /Permission to use, copy, modify/)

const notice = await readFile(new URL('../NOTICE', import.meta.url), 'utf8')
assert.match(notice, /once@1\.4\.0/)
assert.match(notice, /wrappy@1\.0\.2/)
assert.match(notice, /not\s+affiliated with or endorsed/)

const inventory = await readFile(new URL('../THIRD_PARTY_LICENSES.md', import.meta.url), 'utf8')
assert.match(inventory, /once@1\.4\.0/)
assert.match(inventory, /dd31e51b051eeb4c9df26bcea2f9155c4e41efd2/)
assert.match(inventory, /wrappy@1\.0\.2/)
assert.match(inventory, /License: ISC/)

console.log('ISC provenance and zero-dependency production license inventory passed.')
