# Hyperspark

a [Spark](https://spark.apache.org/)-like Decentralized Data Processing Engine built on top of [Dat](dat-data.com)

**This is a work-in-progress. Any idea/suggestion is welcome**

HyperSpark allows us to:

* Reuse intermediate data.
* Minimize bandwidth usage.

## Example

Classic word-count example:

```js
const hyperdrive = require('hyperdrive')
const memdb = require('memdb')
var drive = hyperdrive(memdb())

const RDD = require('hyperspark')
// create a new hyperspark RDD point to a existing dat archive
var archive = drive.createArchive(<DAT-ARCHIVE-KEY>)
var result = RDD(null, archive, null, parsers.word)
  .transform(_.map(word => [word, 1]))
  .transform(_.reduce({}, (sum, x) => {
    if (!sum[x[0]]) sum[x[0]] = 0
    sum[x[0]] += x[1]
    return sum
  }))

// actual run
counts.action().toArray(res => {
  // res = [{bar: 2, baz: 1, foo: 1}]
})
```

## TODO

* [  ] implement it
