const CSV = require('csv-parser')
const through2 = require('through2')
const pumpify = require('pumpify')

function byCSV (archive) {
  var csv = archive.list({live: false}).pipe(through2.obj(function (entry, enc, cb) {
    var self = this
    var rs = archive.createFileReadStream(entry).pipe(CSV())
    rs.on('data', x => self.push(x))
    rs.on('finish', cb)
  }))

  return csv
}

module.exports = {csv: byCSV}
