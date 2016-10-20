const _ = require('highland')

function reduceByKey (f) {
  return _.reduce({}, (sum, x) => {
    if (!sum[x.k]) {
      sum[x.k] = x.v
    } else {
      sum[x.k] = f(sum[x.k], x.v)
    }
    return sum
  })
}

module.exports = {
  take: _.take,
  reduce: _.reduce,
  reduceByKey
}
