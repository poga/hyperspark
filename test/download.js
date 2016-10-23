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
  tape('partition will download everything', function (t) {
    var downloaded = 0
    var drive2 = hyperdrive(memdb())
    var peer = drive2.createArchive(source.key, {sparse: true})
    peer.on('download', data => { downloaded += data.length })
    replicate(source, peer)

    var result = RDD(peer)

    var newArchive = drive2.createArchive()
    result.partition(x => x % 2, newArchive, (next) => {
      next
        .action(_.take(null), _.take(null))
        .toArray(x => {
          t.same(x.map(b => b.toString()), ['value\n1\n2\n3\n4\n5\n\nvalue\n6\n7\n8\n9\n10\n'])
          t.same(downloaded, 33)
          t.end()
        })
    })
  })

  tape('get only download requested file', function (t) {
    var downloaded = 0
    var drive2 = hyperdrive(memdb())
    var peer = drive2.createArchive(source.key, {sparse: true})
    peer.on('download', data => { downloaded += data.length })
    replicate(source, peer)

    var result = RDD(peer)
    result.get('test.csv')
      .action(_.take(null), _.take(null))
      .toArray(x => {
        t.same(x.map(b => b.toString()), ['value\n1\n2\n3\n4\n5\n'])
        t.same(downloaded, 16)
        t.end()
      })
  })

  tape('select only download requested file', function (t) {
    var downloaded = 0
    var drive2 = hyperdrive(memdb())
    var peer = drive2.createArchive(source.key, {sparse: true})
    peer.on('download', data => { downloaded += data.length })
    replicate(source, peer)

    var result = RDD(peer)
    result.select(x => x.name === 'test2.csv')
      .action(_.take(null), _.take(null))
      .toArray(x => {
        t.same(x.map(b => b.toString()), ['value\n6\n7\n8\n9\n10\n'])
        t.same(downloaded, 17)
        t.end()
      })
  })
})

function replicate (a, b) {
  var stream = a.replicate()
  stream.pipe(b.replicate()).pipe(stream)
}

