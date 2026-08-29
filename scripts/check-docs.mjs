import assert from 'node:assert/strict'
import { access, readFile } from 'node:fs/promises'

const root = new URL('../', import.meta.url)
const output = new URL('../site-dist/', import.meta.url)
const required = [
  'CHANGELOG.md',
  'COMPATIBILITY_CONTRACT.md',
  'LICENSE',
  'MIGRATION.md',
  'NOTICE',
  'README.md',
  'SECURITY.md',
  'THIRD_PARTY_LICENSES.md',
  'app.js',
  'examples/commonjs.cjs',
  'examples/esm.mjs',
  'index.html',
  'llms-full.txt',
  'llms.txt',
  'package-meta.json',
  'robots.txt',
  'sitemap.xml',
  'styles.css'
]
await Promise.all(required.map((file) => access(new URL(file, output))))

const html = await readFile(new URL('index.html', output), 'utf8')
assert.match(html, /@stackline\/once/)
assert.match(html, /Alexandro\.Net maintained compatibility/)
assert.match(html, /Node\.js 0\.10\.48/)
assert.match(html, /zero runtime dependencies/)
assert.match(html, /not affiliated with or endorsed by Isaac Z\. Schlueter/)
assert.match(html, /<link rel="canonical" href="https:\/\/alexandro\.net\/docs\/vanilla\/once\/">/)
assert.match(html, /\.\/llms-full\.txt/)
assert.doesNotMatch(html, /TODO|PLACEHOLDER/)

const robots = await readFile(new URL('robots.txt', output), 'utf8')
assert.match(robots, /User-agent: \*\nAllow: \/\n/)
assert.match(robots, /Sitemap: https:\/\/alexandro\.net\/docs\/vanilla\/once\/sitemap\.xml/)
const sitemap = await readFile(new URL('sitemap.xml', output), 'utf8')
const routes = [
  '',
  'README.md',
  'CHANGELOG.md',
  'COMPATIBILITY_CONTRACT.md',
  'MIGRATION.md',
  'SECURITY.md',
  'THIRD_PARTY_LICENSES.md',
  'LICENSE',
  'NOTICE',
  'examples/commonjs.cjs',
  'examples/esm.mjs',
  'llms.txt',
  'llms-full.txt'
]
for (const route of routes) {
  const location = `https://alexandro.net/docs/vanilla/once/${route}`
  assert.equal(sitemap.split(`<loc>${location}</loc>`).length - 1, 1, `${route || 'root'} route must occur exactly once`)
}
assert.equal((sitemap.match(/<url>/g) || []).length, routes.length)
assert.doesNotMatch(sitemap, /github(?:usercontent)?\.com|stackline-once|mirror/i)

const llms = await readFile(new URL('llms.txt', output), 'utf8')
const llmsFull = await readFile(new URL('llms-full.txt', output), 'utf8')
assert.match(llms, /@stackline\/once/)
assert.match(llms, /\.\/llms-full\.txt/)
assert.match(llmsFull, /Reserved wrapper state/)
assert.match(llmsFull, /Node\.js 0\.10\.48/)

for (const file of ['commonjs.cjs', 'esm.mjs']) {
  const source = await readFile(new URL(`examples/${file}`, root), 'utf8')
  const built = await readFile(new URL(`examples/${file}`, output), 'utf8')
  assert.equal(built, source, `${file} is stale`)
}

const metadata = JSON.parse(await readFile(new URL('package-meta.json', output), 'utf8'))
assert.deepEqual(metadata, {
  browserSyntax: 'ES5',
  name: '@stackline/once',
  productionDependencies: 0,
  runtimeFloor: 'Node.js 0.10.48',
  version: '1.0.0'
})

console.log('Static documentation inventory, canonical routes, examples, runtime boundary, attribution, and crawl files passed.')
