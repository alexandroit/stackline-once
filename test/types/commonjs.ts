import once = require('@stackline/once')
import deep = require('@stackline/once/once.js')

const wrapped = once((value: string): { value: string } => ({ value }))
const first: { value: string } = wrapped('ready')
const cached: { value: string } | undefined = wrapped.value
const deepWrapped = deep((value: number) => value + 1)

void first
void cached
void deepWrapped
