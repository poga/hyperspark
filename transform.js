const _ = require('highland')
const CSV = require('csv-parser')

function map (f) {
  // first map map each file
  // second map map each line (or each data)
  return _.map(file => file.map(f))
}

// TODO: fix this, properly return only n item.
// (might require multiple file)
function fileTake (n) {
  return _.pipeline(_.map(file => file.take(n)))
}

function take (n) {
  return _.pipeline(_.take(n))
}

function csv () {
  return _.map(file => _(file.pipe(CSV())))
}

module.exports = {map: map, take: take, csv: csv, fileTake: fileTake}
