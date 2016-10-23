const RDD = require('..')
const hyperdrive = require('hyperdrive')
const memdb = require('memdb')
const tape = require('tape')
const fs = require('fs')
const tf = require('../transform')
const a = require('../action')
const _ = require('highland')

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

  var newArchive = drive2.createArchive()

  tape('partition', function (t) {
    result.partition(x => x % 2, newArchive, (next) => {
      next
        .action(_.take(null), _.take(null))
        .toArray(x => {
          t.same(x.map(b => b.toString()), ['1\n3\n5\n7\n9', '2\n4\n6\n8\n10'])
          t.end()
        })
    })
  })
})

function replicate (a, b) {
  var stream = a.replicate()
  stream.pipe(b.replicate()).pipe(stream)
}

