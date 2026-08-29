import once = require('../../once')

function calculate (this: { base: number }, left: number, right: number): number {
  return this.base + left + right
}

const wrapped = once(calculate)
const result: number = wrapped.call({ base: 1 }, 2, 3)
const called: boolean = wrapped.called
const value: number | undefined = wrapped.value

const strict = once.strict(calculate)
const error: string = strict.onceError

once.proto()
const prototypeWrapped = calculate.once()
const prototypeStrict = calculate.onceStrict()

void result
void called
void value
void error
void prototypeWrapped
void prototypeStrict
