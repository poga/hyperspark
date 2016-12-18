const hyperdrive = require('hyperdrive')
const memdb = require('memdb')
const {RDD} = require('dat-transform')
const swarm = require('hyperdiscovery')

module.exports = function (key) {
  var drive = hyperdrive(memdb())
  var archive = drive.createArchive(key, {sparse: true})
  swarm(archive)
  return RDD(archive)
}

