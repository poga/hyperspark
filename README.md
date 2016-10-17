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

const spark = require('hyperspark')
const hs = spark(drive)
// create a new hyperspark RDD point to a existing dat archive
var rdd = hs.RDD(<DAT-ARCHIVE-KEY>)
var counts = rdd.flatMap(line => line.split(' '))
                .map(word => [word, 1])
                .reduceByKey((a, b) => a + b)

// actual run
console.log(counts.collect())
```

## TODO

* [  ] implement it
