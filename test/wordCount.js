const RDD = require('..')
const hyperdrive = require('hyperdrive')
const memdb = require('memdb')
const tape = require('tape')
const fs = require('fs')
const tf = require('../transform')
const a = require('../action')

var drive = hyperdrive(memdb())
var source = drive.createArchive()

fs.createReadStream('test/words.txt').pipe(source.createFileWriteStream('words.txt'))

source.finalize(() => {
  var drive2 = hyperdrive(memdb())
  var peer = drive2.createArchive(source.key, {sparse: true})
  replicate(source, peer)

  var result = RDD(peer)
    .transform(tf.splitBy(/[\n\s]/))
    .transform(tf.filter(x => x !== ''))
    .transform(tf.map(word => kv(word, 1)))

  tape('word count', function (t) {
    result.action(a.take(null), a.reduceByKey((x, y) => x + y))
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
