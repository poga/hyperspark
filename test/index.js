const RDD = require('..')
const hyperdrive = require('hyperdrive')
const memdb = require('memdb')
const tape = require('tape')
const fs = require('fs')
const tf = require('../transform')
const a = require('../action')

var drive = hyperdrive(memdb())
var source = drive.createArchive()

fs.createReadStream('test/test.csv').pipe(source.createFileWriteStream('test.csv'))
fs.createReadStream('test/test2.csv').pipe(source.createFileWriteStream('test2.csv'))

source.finalize(() => {
  var drive2 = hyperdrive(memdb())
  var peer = drive2.createArchive(source.key, {sparse: true})
  replicate(source, peer)

  var result = RDD(peer)
    .transform(tf.csv())
    .transform(tf.map(row => parseInt(row['value'], 10)))
    .transform(tf.map(x => x * 2))
    .transform(tf.map(x => x + 1))

  tape('take 1', function (t) {
    result.action(a.take(1), a.take(1))
      .toArray(res => {
        t.same(res, [3])
        t.end()
      })
  })

  tape('take all', function (t) {
    result.action(a.take(null), a.take(null))
      .sortBy((a, b) => { return a - b })
      .toArray(res => {
        t.same(res, [3, 5, 7, 9, 11, 13, 15, 17, 19, 21])
        t.end()
      })
  })
})

function replicate (a, b) {
  var stream = a.replicate()
  stream.pipe(b.replicate()).pipe(stream)
}
