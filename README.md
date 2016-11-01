# Hyperspark

a [Spark](https://spark.apache.org/)-like decentralized data processing platform built on top of [Dat](dat-data.com)

**This is a work-in-progress. Any idea/suggestion is welcome**

HyperSpark allows us to:

* Reuse intermediate data.
* Minimize bandwidth usage.

## Synopsis

define RDD on dat with [dat-transform](https://github.com/poga/dat-transform)

word-counting:

```js
const hyperdrive = require('hyperdrive')
const memdb = require('memdb')
const {RDD, kv} = require('dat-transform')

var drive = hyperdrive(memdb())
var archive = drive.createArchive(<DAT-ARCHIVE-KEY>)

// define transforms
var result = RDD(archive)
  .splitBy(/[\n\s]/)
  .filter(x => x !== '')
  .map(word => kv(word, 1))

// actual run(action)
result.reduceByKey((x, y) => x + y)
  .toArray(res => {
    console.log(res) // [{bar: 2, baz: 1, foo: 1}]
  })
```

## TODO

* [  ] implement it
