var once = require('@stackline/once')

var initialize = once(function initialize (value) {
  return { value: value }
})

var first = initialize('ready')
var second = initialize('ignored')

if (first !== second || !initialize.called || initialize.value !== first) {
  throw new Error('once CommonJS example failed')
}

console.log('initialized once:', first.value)
