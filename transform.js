// action & transform is partial-applied highland function to enable lazy evaluation
const _ = require('highland')
const CSV = require('csv-parser')

// transforms
// file is a fileReadStream wrapped with highland
// every transform should return a function which returns a partial-applied highland function
function map (f) {
  return file => file.map(f)
}

function csv () {
  return file => _(file.pipe(CSV()))
}

function splitBy (sep) {
  return file => file.splitBy(sep)
}

function filter (f) {
  return file => file.filter(f)
}

module.exports = {map, csv, splitBy, filter}
