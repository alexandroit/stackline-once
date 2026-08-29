import once from '@stackline/once'

const initialize = once((value) => ({ value }))
const first = initialize('ready')
const second = initialize('ignored')

if (first !== second || !initialize.called || initialize.value !== first) {
  throw new Error('once ESM example failed')
}

console.log('initialized once:', first.value)
