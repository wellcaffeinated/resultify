import { resultify, ok, fail, isOk, isFailed } from './index'

describe('resultify', () => {
  const good = (n) => n
  const bad = () => { throw new Error('Some Error') }
  const eventuallyGood = (n) => Promise.resolve(n)
  const eventuallyBad = () => Promise.reject(new Error('Some Error'))

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
    const eventuallyOk = resultify(eventuallyGood)
    expect(eventuallyOk(4)).resolves.toEqual(ok(4))
    const eventuallyFails = resultify(eventuallyBad)
    expect(eventuallyFails()).resolves.toEqual(fail('Some Error'))
  })

  test('converts promises into async results', async () => {
    const resultOk = await resultify(eventuallyGood(4))
    expect(resultOk).toEqual(ok(4))
    const resultFail = await resultify(eventuallyBad())
    expect(resultFail).toEqual(fail('Some Error'))
  })

  test('identifies ok/fail results', () => {
    expect(isOk(ok(4))).toBe(true)
    expect(isFailed(ok(4))).toBe(false)
    expect(isOk(fail('some message'))).toBe(false)
    expect(isFailed(fail('some message'))).toBe(true)
  })
})
