import { resultify, ok, fail, isOk, isFailed } from './index'

describe('resultify', () => {
  const good = (n) => n
  const bad = () => { throw new Error('Some Error') }
  
  test('converts regular function into result function', () => {
    const goodr = resultify(good)
    expect(goodr(3)).toMatchObject({
      ok: true,
      failed: false,
      value: 3
    })
  })

  test('converts functions that throw into result functions', () => {
    const badr = resultify(bad)
    expect(badr(4)).toMatchObject({
      ok: false,
      failed: true,
      error: new Error('Some Error')
    })
  })

  test('converts async functions correctly', () => {
    const eventuallyOk = resultify((n) => Promise.resolve(n))
    expect(eventuallyOk(4)).resolves.toEqual(ok(4))
    const eventuallyFails = resultify(() => Promise.reject(new Error('some error')))
    expect(eventuallyFails()).resolves.toEqual(fail('some error'))
  })

  test('identifies ok/fail results', () => {
    expect(isOk(ok(4))).toBe(true)
    expect(isFailed(ok(4))).toBe(false)
    expect(isOk(fail('some message'))).toBe(false)
    expect(isFailed(fail('some message'))).toBe(true)
  })
})
