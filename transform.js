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
  return _.pipeline(_.map(file => _.take(n)(file)))
}

function take (n) {
  return _.pipeline(_.take(n))
}

function csv () {
  return _.map(file => _(file.pipe(CSV())))
}

function splitBy (sep) {
  return _.map(file => file.splitBy(sep))
}

module.exports = {map: map, take: take, csv: csv, fileTake: fileTake, splitBy: splitBy}
