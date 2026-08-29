import once from '@stackline/once'
import deep from '@stackline/once/once.js'

const wrapped: once.OnceFunction<(value: string) => string> = once((value) => value)
const strict: once.StrictOnceFunction<(value: number) => number> = once.strict((value) => value)
const deepWrapped = deep((value: boolean) => !value)

const result: string = wrapped('ready')
const strictResult: number = strict(42)
const deepResult: boolean = deepWrapped(true)

void result
void strictResult
void deepResult
