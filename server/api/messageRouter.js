const express = require('express')
const router = express.Router()
const pool = require('../db')

//Add a message to a thread
router.post('/messages', async (req, res) => {
    try {
        const {email, thread_id, content} = req.body

        const senderExists = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email])

        const threadExists = await pool.query(
            'SELECT * FROM threads WHERE thread_id = $1',
            [thread_id]
        )

        if(senderExists.rows.length === 0 || threadExists.rows.length === 0){
            res.status(404).json({error: "Sender or Thread does not exist"})
            return
        }

        const sender_id_result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        )

        const sender_id = sender_id_result.rows[0].user_id

        const message = await pool.query(
            'INSERT INTO messages (sender_id, thread_id, content) VALUES ($1, $2, $3)',
            [sender_id, thread_id, content]
        )

        res.json({message: `Message - ${content} - was added to the thread`})
    } catch (err) {
        console.error(err)
    }
    
})

//Get all messages
router.get('/messages', async (req, res) => {
    const allMessages = await pool.query(
        'SELECT * FROM messages'
    )

    res.json(allMessages.rows)
})

//Get all messages by a given thread_id
router.get('/messages/:threadID', async (req, res) => {
    const {threadID} = req.params
    const threadMessages = await pool.query(
        'SELECT * FROM messages WHERE thread_id = $1',
        [threadID]
    )

    res.json(threadMessages.rows)
})

//DEBATE WHETHER OR NOT TO ADD A DELETE FUNCTION
/*WOULD THIS DELETE BUTTON DELETE SINGLE MESSAGES? WOULD BE PRACTICAL BUT TOO
MUCH FOR THE SCOPE OF THIS PROJECT

WOULD THIS DELETE BUTTON DELETE EVERY MESSAGE FROM AN ENTIRE THREAD?
THAT WAY THREADS COULD BE FLUSHED AS A WAY TO SAVE SPACE?
IS THAT EVEN NEEDED? Theoretically this would only happen if a thread has no 
participants, but i may still want to save the messages in case in the future 
someone joins. 

LOT TO THINK ABOUT WITH THIS ONE...


BUT OTHERWISE WE ARE DONE WITH ALL DATABASE WORK WOOOOOOOO
*/
module.exports = router