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
    .transform(_.map(word => [word, 1]))
    .transform(_.reduce({}, (sum, x) => {
      if (!sum[x[0]]) sum[x[0]] = 0
      sum[x[0]] += x[1]
      return sum
    }))

  tape('word count', function (t) {
    result.action(_.fileTake(null), _.take(null))
      .toArray(res => {
        console.log(res.toString())
        t.same(res, [{bar: 2, baz: 1, foo: 1}])
        t.end()
      })
  })
})

function replicate (a, b) {
  var stream = a.replicate()
  stream.pipe(b.replicate()).pipe(stream)
}
