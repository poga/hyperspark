// action & transform is partial-applied highland function to enable lazy evaluation
const _ = require('highland')
const CSV = require('csv-parser')

// transforms
// file is a fileReadStream wrapped with highland
function map (f) {
  return file => file.map(f)
}

function csv () {
  return file => _(file.pipe(CSV()))
}

function splitBy (sep) {
  return file => file.splitBy(sep)
}

module.exports = {map: map, take: _.take, csv: csv, splitBy: splitBy, reduce: _.reduce}
