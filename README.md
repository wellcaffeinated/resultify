# resultify

Use the RUST-inspired Result pattern in javascript.

## Motivation

Consider this:

```js
// fetch from some db
let item
try {
  const db = await connect('somedb://localhost')
  const text = await db.fetch(query)
  item = JSON.parse(text)
} catch (e) {
  // hmm did i fail to connect? or did i not find it? Or... did it fail to parse json
}
return item
```

Maybe you could do this...

```js
// fetch from some db
let db
let item
try {
  db = await connect('somedb://localhost')
} catch (e) {
  throw new DbConnectionError('Could not connect to database')
}
let text
try {
  text = await db.fetch(query)
  if (!text) {
    throw new NotFound()
  }
} catch (e) {
  throw new DataRetrievalError('Failed to retrieve entry from database')
}
try {
  return JSON.parse(text)
} catch (e) {
  throw new MalformedDataError('Data is corrupted')
}
```

Try this instead:

```js
const connectToDb = resultify(connect)
const retrieve = resultify((db, query) => db?.fetch(query))
const parseJson = resultify(o => JSON.parse(o))

const conn = await connectToDb('somedb://localhost')
if (conn.failed){
  throw new DbConnectionError('Could not connect to database')
}
const record = await retrieve(conn.value, query)
if (record.failed){
  throw new DataRetrievalError('Failed to retrieve entry from database')
}
if (!record.value){
  throw new NotFound()
}
const json = parseJson(record.value)
if (json.failed){
  throw new MalformedDataError('Data is corrupted')
}
return json.value
```

## Install

```sh
npm install @wellcaffeinated/resultify
```

## Use

```js
import { resultify } from '@wellcaffeinated/resultify'

const divide = (a, b) => {
  if (b === 0){ throw new Error('Can not divide by zero!')  }
  return a / b
}

const divideAsResult = resultify(divide)

const result = divideAsResult(1, 2)
console.log(result.value) // => 0.5

const failed = divideAsResult(1, 0)
console.log(result.error.message) // => "Error: Can not divide by zero!"
```

It can handle async functions too.

```js
const someSketchyFunction = () => {
  if (Math.random() > 0.5){
    return Promise.resolve('it worked')
  } else {
    return Promise.reject(new Error('it failed'))
  }
}

const fn = resultify(someSketchyFunction)
const result = await fn()

if (result.ok){
  console.log('Everything is fine')
}

if (result.failed){
  console.log('Something went wrong')
}
```

## Use results directly

You can use `ok` and `fail` directly if you like.

```js
import { ok, fail, isOk, isFailed } from '@wellcaffeinated/resultify'

class Point {
  constructor(x, y){
    this.x = x
    this.y = y
  }
}

const parseCoords = (coordsText) => {
  const parts = coordsText?.split(',')
  if (!parts || parts.length !== 2){ return fail('Malformed input) }
  const x = parseFloat(parts[0])
  const y = parseFloat(parts[1])
  if (isNaN(x) || isNaN(y)){ return fail('Input does not contain numbers') }
  return ok(new Point(x, y))
}

const res = parseCoords('3,4')
let point
if (res.failed){
  point = new Point(0, 0) // default
} else {
  point = res.value
}
```

## API

`resultify(fn)` - convert a sync or async function to return a result

`resultify(promise)` - convert a promise to an async result

`ok(value)` - create an OK result with value

`fail(errorOrString)` - create a FAILED result with specified error or generic error from specified string

`isResult(thing)` - determine if this thing is a result type

`isOk(thing)` - determine if this thing is an ok result (if unsure of type)

`isFailed(thing)` - determine if this thing is a failed result (if unsure of type)

## Alternatives

- [No-Try](https://github.com/Coly010/no-try)
- [resultify](https://github.com/Raynos/resultify) (For node.js style callbacks)
