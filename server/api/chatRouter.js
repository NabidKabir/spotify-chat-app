const express = require('express')
const router = express.Router()
const pool = require('../db')


//------------------------------THREADS---------------------------------
//Create a thread based on given song_id
router.post('/chats', async (req, res) => {
    try {
        const { song_id } = req.body

        const threadExists = await pool.query('SELECT * FROM threads where song_id = $1', [song_id])
        if(threadExists.rows.length > 0){
            res.json({error: 'thread already exists with given songID'})
            return
        }

        const newThread = await pool.query(
            'INSERT INTO threads (song_id) VALUES ($1) RETURNING thread_id',
            [song_id]
        )

        const threadID = newThread.rows[0].thread_id

        res.status(201).json({thread_id: threadID})
        console.log(`New thread created! ThreadID - ${threadID}`)
        
    } catch (err) {
        console.error(err)
    }
})

//Get all threads
router.get('/chats', async (req, res) => {
    try {
        const allThreads = await pool.query(
            'SELECT * from threads'
        )
        res.json(allThreads.rows)
        const threads = allThreads.rows
        const songs = threads.map(thread => thread.song_id)
        console.log('Showing all threads by songID', songs)
    } catch (err) {
        console.error(err)
    }
})

//Get thread by songID
router.get('/chats/:songID', async (req, res) => {
    try {
        const {songID} = req.params
        const thread = await pool.query(
            'SELECT * FROM threads WHERE song_id = $1',
            [songID]
        )
        
        if(thread.rows.length > 0){
            res.json(thread.rows[0].thread_id)
            console.log('Showing thread by threadID', thread.rows[0].thread_id)
        }
        else{
            res.status(404).json({error: 'Thread not found with given song ID'})
            console.log('Thread was not found with given song ID')
        }
    } catch (err) {
        console.error(err)
    }
})

//Delete a thread by song_id
router.delete('/chats/:songID', async (req, res) => {
    try {
        const {songID} = req.params
        const deleteThread = await pool.query(
            'DELETE FROM threads WHERE song_id = $1',
            [songID]
        )
        res.json(`Chat with songID ${songID} was deleted`)
        console.log(`Chat with songID ${songID} was deleted`)
    } catch (err) {
        console.error(err)
    }
})

module.exports = router

