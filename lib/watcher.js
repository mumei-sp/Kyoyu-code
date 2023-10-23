const chokidar = require("chokidar")
const Fs = require("fs")

class Watcher {
  constructor(_config) {
    this.path = "." // Current directory
    this.watcher = undefined
  }

  watch() {
    this.watcher = chokidar.watch(this.path, {
      ignoreInitial: true,
      ignored: /node_modules/,
      ignorePermissionErrors: true,
    })

    // Dir event handlers
    this.watcher.on("addDir", (_path) => {})

    this.watcher.on("unlinkDir", (_path) => {})

    // File event handlers
    this.watcher.on("add", (_path) => {
      Fs.readFile(_path, (error, data) => {})
    })

    this.watcher.on("change", (_path) => {
      Fs.readFile(_path, (error, data) => {})
    })

    this.watcher.on("unlink", (_path) => {})

    console.log(`Watching ${this.path} for changes...`)
  }

  stop() {
    if (this.watcher) {
      this.watcher.close()

      console.log(`Watching stopped.`)
    }
  }
}

module.exports = Watcher
