# Hyperspark

Hyperspark is a decentralized data processing tool for [Dat](http://dat-data.com). Inspired by [Spark](https://spark.apache.org/)

Basically, it's just a fancy wrapper around [Dat Archive](datproject.org)

**This is a work-in-progress. Any idea/suggestion is welcome**

### Goal

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
const hs = require('hyperspark')
var rdd = hs(<DAT-ARCHIVE-KEY>)

// define transforms
var result = rdd
  .splitBy(/[\n\s]/)
  .filter(x => x !== '')
  .map(word => kv(word, 1))

// actual run(action)
result.reduceByKey((x, y) => x + y)
  .toArray(res => {
    console.log(res) // [{bar: 2, baz: 1, foo: 1}]
  })
```

## Related Modules

* RDD-style data transformation with js. [dat-transform](https://github.com/poga/dat-transform)
* Analyze data inside dat archive with RDD-style API. [dat-ipynb](https://github.com/poga/dat-ipynb-demo), using [nel](https://github.com/poga/nel)
* Convert iPython Notebook to Markdown. [ipynb2md](https://github.com/poga/ipynb2md)
* Attach file to markdown with dat. [markdown-attachment-p2p](https://github.com/poga/markdown-attachment-p2p)
