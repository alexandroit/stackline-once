import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const temporary = await mkdtemp(path.join(os.tmpdir(), 'stackline-once-sbom-'))
const consumer = path.join(temporary, 'consumer')

function run (arguments_, cwd = root) {
  return execFileSync(npm, arguments_, {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, NO_UPDATE_NOTIFIER: '1' },
    stdio: ['ignore', 'pipe', 'pipe']
  })
}

try {
  await mkdir(consumer)
  const output = run(['pack', '--silent', '--json', '--ignore-scripts', '--pack-destination', temporary]).trim()
  const start = output.lastIndexOf('\n[')
  const packed = JSON.parse(start === -1 ? output : output.slice(start + 1))
  const archive = path.join(temporary, packed[0].filename)
  await writeFile(path.join(consumer, 'package.json'), `${JSON.stringify({
    name: 'stackline-once-sbom-consumer',
    version: '0.0.0',
    private: true,
    dependencies: { '@stackline/once': `file:${archive}` }
  }, null, 2)}\n`)
  run(['install', '--ignore-scripts', '--omit=dev', '--no-audit', '--no-fund'], consumer)

  const tree = JSON.parse(run(['ls', '--omit=dev', '--all', '--json'], consumer))
  assert.equal(tree.problems, undefined)
  assert.deepEqual(tree.dependencies['@stackline/once'].dependencies, undefined)

  const sbom = JSON.parse(run(['sbom', '--omit=dev', '--sbom-format=cyclonedx'], consumer))
  const reference = '@stackline/once@1.0.1'
  const component = sbom.components.find((entry) => entry['bom-ref'] === reference)
  assert.ok(component, `SBOM must contain ${reference}`)
  const edge = sbom.dependencies.find((entry) => entry.ref === reference)
  assert.ok(edge, `SBOM must contain an edge for ${reference}`)
  assert.deepEqual(edge.dependsOn, [])
  console.log('Packed CycloneDX model confirms the zero-dependency production graph.')
} finally {
  await rm(temporary, { force: true, recursive: true })
}
