import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'

const root = new URL('../', import.meta.url)
const output = new URL('../site-dist/', import.meta.url)
const metadata = JSON.parse(await readFile(new URL('package.json', root), 'utf8'))

await rm(output, { force: true, recursive: true })
await mkdir(output, { recursive: true })
await mkdir(new URL('examples/', output), { recursive: true })

for (const file of [
  'CHANGELOG.md',
  'COMPATIBILITY_CONTRACT.md',
  'LICENSE',
  'MIGRATION.md',
  'NOTICE',
  'README.md',
  'SECURITY.md',
  'THIRD_PARTY_LICENSES.md'
]) await cp(new URL(file, root), new URL(file, output))

for (const file of ['commonjs.cjs', 'esm.mjs']) {
  await cp(new URL(`examples/${file}`, root), new URL(`examples/${file}`, output))
}

for (const file of ['app.js', 'index.html', 'llms.txt', 'llms-full.txt', 'robots.txt', 'sitemap.xml', 'styles.css']) {
  await cp(new URL(`docs-site/${file}`, root), new URL(file, output))
}

await writeFile(new URL('package-meta.json', output), `${JSON.stringify({
  browserSyntax: 'ES5',
  name: metadata.name,
  productionDependencies: 0,
  runtimeFloor: 'Node.js 0.10.48',
  version: metadata.version
}, null, 2)}\n`)

console.log('Built static public documentation into site-dist/.')
