const RDD = require('..')
const hyperdrive = require('hyperdrive')
const memdb = require('memdb')
const tape = require('tape')
const fs = require('fs')
const _ = require('../transform')

var drive = hyperdrive(memdb())
var source = drive.createArchive()

fs.createReadStream('test/words.txt').pipe(source.createFileWriteStream('words.txt'))

source.finalize(() => {
  var drive2 = hyperdrive(memdb())
  var peer = drive2.createArchive(source.key, {sparse: true})
  replicate(source, peer)

  var result = RDD(peer)
    .transform(_.splitBy(/[\n\s]/))
    .transform(_.map(word => kv(word, 1)))

  var reducer = (sum, x) => {
    if (x.k === '') return sum
    if (!sum[x.k]) sum[x.k] = 0
    sum[x.k] += x.v
    return sum
  }

  tape('word count', function (t) {
    result.action(_.fileTake(null), _.reduce({}, reducer))
      .toArray(res => {
        t.same(res, [{bar: 2, baz: 1, foo: 1}])
        t.end()
      })
  })
})

function replicate (a, b) {
  var stream = a.replicate()
  stream.pipe(b.replicate()).pipe(stream)
}

function kv (k, v) {
  return {k: k, v: v}
}
