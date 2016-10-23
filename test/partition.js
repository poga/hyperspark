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

  tape('partition', function (t) {
    var newArchive = drive2.createArchive()
    result.partition(x => x % 2, newArchive, (next) => {
      next
        .action(_.take(null), _.take(null))
        .toArray(x => {
          t.same(x.map(b => b.toString()), ['1\n3\n5\n7\n9', '2\n4\n6\n8\n10'])
          t.end()
        })
    })
  })

  tape('get', function (t) {
    var newArchive = drive2.createArchive()
    result.partition(x => x % 2, newArchive, (next) => {
      next
        .get('0')
        .action(_.take(null), _.take(null))
        .toArray(x => {
          t.same(x.map(b => b.toString()), ['2\n4\n6\n8\n10'])
          t.end()
        })
    })
  })

  tape('select', function (t) {
    var newArchive = drive2.createArchive()
    result.partition(x => x % 3, newArchive, (next) => {
      next
        .select(x => parseInt(x.name) < 2) // x % 3 < 2
        .action(_.take(null), _.take(null))
        .toArray(x => {
          t.same(x.map(b => b.toString()), ['1\n4\n7\n10', '3\n6\n9'])
          t.end()
        })
    })
  })

  tape('get only works on RDD before transform', function (t) {
    t.throws(() => {
      result.get('test.csv')
    })
    t.end()
  })

  tape('select only works on RDD before transform', function (t) {
    t.throws(() => {
      result.select(x => x.name === 'test.csv')
    })
    t.end()
  })
})

function replicate (a, b) {
  var stream = a.replicate()
  stream.pipe(b.replicate()).pipe(stream)
}

