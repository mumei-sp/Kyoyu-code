const chokidar = require("chokidar")
const Fs = require("fs")
const path = require("path")
const mime = require("mime")
const io = require("socket.io-client")

class Watcher {
  maxSize = 10 // maxSize in KB
  unsupportedFileTypesRegex = /^(audio)|(video)|(image)/

  excludedFilePattern = [
    // Excluded files Glob Pattern
    "**/node_modules/**",
    "**/.git",
    "**/.vscode",
  ]

  constructor(_config) {
    this.path = process.cwd() // Current directory
    this.watcher = undefined

    this.initSockets()
  }

  initSockets() {
    this.socket = io.connect("http://localhost:3000/watcher")

    this.socket.on("connect", () => {
      console.log("Connected with id: " + this.socket.id)
    })
  }

  getExcludedFilesRegex() {
    const regexPatterns = []
    const Minimatch = require("minimatch").Minimatch

    for (const excludePattern of excludedPatterns) {
      const minimatch = new Minimatch(excludePattern, { dot: true })
      let regex = "" + minimatch.makeRe()
      // Remove leading and trailing slashes from the regex string
      regex = regex.replace("/^", "")
      regex = regex.replace("$/", "")
      regexPatterns.push(regex)
    }

    return new RegExp(regexPatterns.join("|")) // Combine the regex patterns into a single regular expression
  }

  watch() {
    this.watcher = chokidar.watch(this.path, {
      ignoreInitial: true,
      ignored: this.getExcludedFilesRegex(),
      ignorePermissionErrors: true,
    })

    // Dir event handlers
    this.watcher.on("addDir", (_path) => {})

    this.watcher.on("unlinkDir", (_path) => {})

    // File event handlers
    this.watcher.on("add", (_path) => {
      const relativePath = _path.replace(this.path, ".")
      const type = mime.getType(_path)

      Fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error("Error while getting file stats:", err)
          return
        }

        let isReadable = true
        if (
          stats.size / 1024 > this.maxSize ||
          (type && type.match(unsupportedFileTypesRegex))
        ) {
          isReadable = false
        }
        let fileProps = {
          name: path.basename(_path),
          type,
          isReadable,
          relativePath,
        }

        Fs.readFile(_path, (error, data) => {
          if (error) {
            console.error("Error while reading file:", error)
            return
          }
          this.fileProps.connect = data.toString()
          this.socket.emit("create-file", fileProps)
        })
      })
    })

    this.watcher.on("change", (_path) => {
      Fs.readFile(_path, (error, data) => {
        this.socket.emit("update-file", data.toString())
      })
    })

    this.watcher.on("unlink", (_path) => {
      this.socket.emit("delete-file", _path)
    })

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
