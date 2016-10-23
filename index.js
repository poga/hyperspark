const through2 = require('through2')
const _ = require('highland')

function RDD (archive, parent, transform) {
  if (!(this instanceof RDD)) return new RDD(archive, parent, transform)

  this._archive = archive
  this._parent = parent
  this._transform = transform // transform is a stream, which will be applied to each file
  this._selector = all
}

RDD.prototype.partition = function (f, outArchive, cb) {
  var partitions = {}

  this
    .action(_.take(null), _.map(x => { return {p: f(x), v: x} }))
    .each(x => getPartition(x.p).write(`${x.v}`))
    .done(endPartitions)

  function getPartition (key) {
    if (!partitions[key]) {
      partitions[key] = _.pipeline(
        _.intersperse('\n'),
        outArchive.createFileWriteStream(`${key}`)
      )
    }
    return partitions[key]
  }

  function endPartitions () {
    Object.keys(partitions).forEach(k => partitions[k].end())
    outArchive.finalize(() => { cb(new RDD(outArchive)) })
  }
}

RDD.prototype.get = function (filename) {
  if (this._transform) throw new Error('Cannot get file after transformation')

  this._selector = x => x.name === filename
  return this
}

RDD.prototype.select = function (selector) {
  if (this._transform) throw new Error('Cannot select files after transformation')

  this._selector = selector
  return this
}

RDD.prototype.transform = function (transform) {
  return new RDD(this._archive, this, transform)
}

// do action
// evaluation transformation chain. Then apply a transform to each file, then apply a transform to flattened data
RDD.prototype.action = function (fileAction, totalAction) {
  return this._applyTransform()
    .pipe(mapToFilePipe(fileAction))
    .flatten()
    .pipe(pipe(totalAction))
}

// build a transformation chain without evaluating it
RDD.prototype._applyTransform = function () {
  if (this._parent) {
    return mapToFile(this._transform)(this._parent._applyTransform())
  }

  return this._eachFile(this._selector)
}

// eachFile returns a stream of stream, each inner stream is a fileReadStream
// all stream is wrapped with highland
RDD.prototype._eachFile = function (filter) {
  var archive = this._archive
  return _(archive.list({live: false}).pipe(through2.obj(function (entry, enc, cb) {
    if (filter(entry)) this.push(_(archive.createFileReadStream(entry)))
    cb()
  })))
}

module.exports = RDD

function mapToFilePipe (action) {
  return pipe(_.map(file => action(file)))
}

function pipe (action) {
  return _.pipeline(action)
}

function mapToFile (transform) {
  return _.map(file => transform(file))
}

function all (x) {
  return true
}
