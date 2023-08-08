const express = require('express')
const app = express()

const http = require('http')
const {Server} = require('socket.io')
const cors = require('cors')

const pool = require('./db')

app.use(cors())
app.use(express.json())

const server = http.createServer(app)

server.listen(5000, () => {
    console.log('server is running')
})