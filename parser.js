const CSV = require('csv-parser')
const through2 = require('through2')
const pumpify = require('pumpify')
const _ = require('highland')
const byline = require('byline')

function byCSV (archive) {
  var list = archive.list({live: false}).pipe(through2.obj(function (entry, enc, cb) {
    var self = this
    var rs = archive.createFileReadStream(entry).pipe(CSV())
    rs.on('data', x => self.push(x))
    rs.on('finish', cb)
  }))
  return list
}

function byWord (archive) {
  var list = archive.list({live: false}).pipe(through2.obj(function (entry, enc, cb) {
    var self = this
    var rs = byline(archive.createFileReadStream(entry))
    rs.on('data', line => line.toString().split(' ').forEach(w => self.push(w)))
    rs.on('finish', cb)
  }))

  return list
}

module.exports = {csv: byCSV, word: byWord}
