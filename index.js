const parsers = require('./parser')

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
  action = action || noop
  return action(this._applyTransform())
}

RDD.prototype.transform = function (transform) {
  return new RDD(this, null, transform)
}

RDD.prototype._applyTransform = function () {
  if (this._parent) {
    return this._transform(this._parent._applyTransform())
  }

  if (this._transform) {
    return this._transform(this._values())
  }

  return this._values()
}

RDD.prototype._values = function () {
  if (this._parent) {
    return this._parent._values()
  }

  return this._parser(this._archive)
}

module.exports = RDD

function noop (x) {
  return x
}
