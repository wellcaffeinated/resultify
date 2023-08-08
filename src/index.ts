export const SymbolResult = Symbol('Result')

function isPromise(thing: any): thing is Promise<any> {
  return thing && typeof thing.then === 'function'
}

export type ResultOk<R> = {
  value: R,
  ok: true,
  failed: false,
  [SymbolResult]: true
}
export type ResultError<E extends Error> = {
  error: E,
  ok: false,
  failed: true,
  [SymbolResult]: true
}
export type Result<R, E extends Error> = ResultOk<R> | ResultError<E>

export function isResult<R, E extends Error>(thing: any): thing is Result<R, E> {
  return thing && thing[SymbolResult] === true
}

export function isOk<R>(thing: any): thing is ResultOk<R> {
  return isResult(thing) && thing.ok
}

export function isFailed<E extends Error>(thing: any): thing is ResultError<E> {
  return isResult(thing) && thing.failed
}

export function ok<R>(v: R | ResultOk<R>): ResultOk<R> {
  let value = v
  if (isResult(value)) {
    if (isFailed(value)) {
      throw new Error('Cannot wrap a failed result as ok')
    }
    value = value.value
  }
  return { value, ok: true, failed: false, [SymbolResult]: true }
}

export function fail<E extends Error>(error: E): ResultError<E>
export function fail(error: string): ResultError<Error>
export function fail(error: any) {
  if (typeof error === 'string') {
    return fail(new Error(error))
  }
  return { error, ok: false, failed: true, [SymbolResult]: true }
}

export interface Fn<R> {
  (...a: any[]): R
}

export interface ResultFn<R, E extends Error> {
  (...a: any[]): Result<R, E>
}

export interface FnAsync<R> {
  (...a: any[]): Promise<R>
}

export interface ResultFnAsync<R, E extends Error> {
  (...a: any[]): Promise<Result<R, E>>
}

export function resultify<R, E extends Error>(fn: FnAsync<R>): ResultFnAsync<R, E>
export function resultify<R, E extends Error>(fn: Fn<R>): ResultFn<R, E>
export function resultify<R>(fn: Fn<R> | FnAsync<R>) {
  return function(...args: any[]) {
    try {
      const value = fn(...args)
      if (isPromise(value)) {
        return value.then(ok).catch(fail)
      }
      return ok(value)
    } catch (e){
      return fail(e)
    }
  }
}

