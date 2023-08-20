const express = require('express')
const app = express()

const http = require('http')
const {Server} = require('socket.io')
const cors = require('cors')

const pool = require('./db')

app.use(cors())
app.use(express.json())


const server = http.createServer(app)

const userRouter = require('./api/userRouter')
const chatRouter = require('./api/chatRouter')
const participantRouter = require('./api/participantRouter')
app.use('/api', userRouter)
app.use('/api', chatRouter)
app.use('/api', participantRouter)

server.listen(5000, () => {
    console.log('server is running')
})