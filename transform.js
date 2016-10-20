// action & transform is partial-applied highland function to enable lazy evaluation
const _ = require('highland')
const CSV = require('csv-parser')

// transforms
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

module.exports = {map: map, take: _.take, csv: csv, splitBy: splitBy, reduce: _.reduce}
