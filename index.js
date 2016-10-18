const _ = require('highland')
const parsers = require('./parser')
const flatten = require('flatten')

// a RDD with a binding to existed hyperdrive will expose an stream to provide data on demand
//
// every RDD should be content addressable
function RDD (parent, archive, transform, parser) {
  if (!(this instanceof RDD)) return new RDD(parent, archive, transform, parser)

  this._transform = transform
  this._parent = parent
  this._archive = archive
  this._parser = parser || parsers.csv
}

// do action
RDD.prototype.action = function (action) {
  var streams = flatten(this._applyTransform()).concat([action]).filter(x => x)
  // console.log(streams)
  var pipeline = _.pipeline.apply(this, streams)

  return this._values().pipe(pipeline)
}

RDD.prototype.transform = function (transform) {
  return new RDD(this, null, transform)
}

RDD.prototype._applyTransform = function () {
  if (this._parent) {
    return [this._parent._applyTransform(), this._transform]
  }

  return [this._transform]
}

RDD.prototype._values = function () {
  if (this._parent) {
    return this._parent._values()
  }

  return _(this._parser(this._archive))
}

module.exports = RDD
