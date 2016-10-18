const CSV = require('csv-parser')
const through2 = require('through2')
const pumpify = require('pumpify')
const _ = require('highland')

function byCSV (archive) {
  console.log('csv parser')
  return archive.list({live: false}).pipe(through2.obj(function (entry, enc, cb) {
    var self = this
    var rs = archive.createFileReadStream(entry).pipe(CSV())
    rs.on('data', x => self.push(x))
    rs.on('finish', cb)
  }))
}

function byWord (archive) {
  return archive.list({live: false}).pipe(through2.obj(function (entry, enc, cb) {
    var self = this
    var rs = _(archive.createFileReadStream(entry)).splitBy(/[\s\n]/)
    rs.on('data', x => {console.log(x); self.push(x)})
    rs.on('finish', cb)
  }))
}

module.exports = {csv: byCSV, word: byWord}
