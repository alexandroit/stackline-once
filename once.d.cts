declare function once<F extends once.AnyFunction>(fn: F): once.OnceFunction<F>

declare namespace once {
  type AnyFunction = (this: any, ...args: any[]) => any

  type OnceFunction<F extends AnyFunction> = F & {
    called: boolean
    value?: ReturnType<F>
  }

  type StrictOnceFunction<F extends AnyFunction> = OnceFunction<F> & {
    onceError: string
  }

  function strict<F extends AnyFunction>(fn: F): StrictOnceFunction<F>
  function proto(): void
}

declare global {
  interface Function {
    once<F extends once.AnyFunction>(this: F): once.OnceFunction<F>
    onceStrict<F extends once.AnyFunction>(this: F): once.StrictOnceFunction<F>
  }
}

export = once
