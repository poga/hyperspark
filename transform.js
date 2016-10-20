const _ = require('highland')
const CSV = require('csv-parser')

// actions
// action is a stream which will consume all transformation
function fileTake (n) {
  return _.pipeline(_.map(file => _.take(n)(file)))
}

function take (n) {
  return _.pipeline(_.take(n))
}

// transforms
// transform is partial-applied highland function to enable lazy evaluation
function map (f) {
  // first map map each file
  // second map map each line (or each data)
  return _.map(file => file.map(f))
}

function csv () {
  return _.map(file => _(file.pipe(CSV())))
}

function splitBy (sep) {
  return _.map(file => file.splitBy(sep))
}

module.exports = {map: map, take: take, csv: csv, fileTake: fileTake, splitBy: splitBy}
