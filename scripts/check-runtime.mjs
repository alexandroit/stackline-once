import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx'
const versions = [
  '0.10.48',
  '4.9.1',
  '6.17.1',
  '8.17.0',
  '10.24.1',
  '12.22.12',
  '14.15.1',
  '16.20.2',
  '18.20.8',
  '20.20.2',
  '22.22.0',
  '24.7.0',
  '26.0.0'
]

for (const version of versions) {
  execFileSync(npx, ['--yes', `--package=node@${version}`, 'node', 'test/runtime-compat.cjs'], {
    cwd: root,
    env: { ...process.env, NO_UPDATE_NOTIFIER: '1' },
    stdio: 'inherit'
  })
}

execFileSync(process.execPath, ['test/runtime-compat.cjs'], { cwd: root, stdio: 'inherit' })
