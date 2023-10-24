const Watcher = require("./lib/watcher")
const socket = require("socket.io")

let config = {}

const setWatcher = () => {
  const watcher = new Watcher(this.config)
  watcher.watch()
}

const setSockets = () => {
  const io = new Server(3000, {
    cors: {
      origin: [],
    },
  })

  // Namespace for watcher
  const watcherSocket = io.of("/watcher")
  this.config.watcherSocket = watcherSocket

  watcherSocket.on("connection", (socket) => {
    const createFile = (data) => {}
    const deleteFile = (data) => {}
    const updateFile = (data) => {}

    socket.on("create-file", createFile)
    socket.on("delete-file", deleteFile)
    socket.on("update-file", updateFile)

    socket.on("disconnect", () => {
      socket.removeAllListeners()
      console.log(`watcher with socketId - ${socket.id} disconnected`)
    })
  })
}

setSockets()
setWatcher()
