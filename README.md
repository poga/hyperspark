# Hyperspark

Hyperspark is a decentralized data processing tool for [Dat](http://dat-data.com). Inspired by [Spark](https://spark.apache.org/)

**This is a work-in-progress. Any idea/suggestion is welcome**

[![Standard - JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

### Key Features

* Reuse intermediate data.
* Minimize bandwidth usage.
* Share computation power.

## How to use

#### Data owner

It's simple! Just share your data with dat: `dat .`

#### Data Scientist

Define your ideas with [transforms and actions](https://github.com/poga/dat-transform) without worrying about fetching and storing data.

#### Computation Provider

Run transformations defined by researchers. Cache and share intermediate data so everyone can re-use the knowledge without having their own computation cluster.

---

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
