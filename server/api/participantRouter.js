const express = require('express')
const router = express.Router()
const pool = require('../db')

//Add a user to a thread
router.post('/participants', async (req, res) => {
    try {
        const {email, thread_id} = req.body

        //check if user and thread exist
        const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email])
        const threadExists = await pool.query('SELECT * FROM threads WHERE thread_id = $1', [thread_id])

        if(userExists.rows.length === 0 || threadExists.rows.length === 0){
            res.status(404).json({error: 'User or thread not found'})
            return
        }

        const user_id_result = await pool.query('SELECT user_id FROM users WHERE email = $1', [email])
        const user_id = user_id_result.rows[0].user_id

        //check if user is already in thread
        const existingParticipant = await pool.query(
            'SELECT * FROM participants WHERE user_id = $1 AND thread_id = $2',
            [user_id, thread_id]
        )

        if(existingParticipant.rows.length > 0){
            res.status(400).json({error: 'User is already a participant in thread'})
            return
        }

        //add user to thread
        const addUser = await pool.query(
            'INSERT INTO participants (user_id, thread_id) VALUES ($1, $2)',
            [user_id, thread_id]
        )

        res.json({message: 'User added to the thread'})
        console.log(`User ${email} was added to thread ${thread_id}`)
    } catch (err) {
        console.error(err)
    }
})

//Delete a user from a thread
//WILL DO LATER MUST THINK ABOUT HOW DATA WILL PASS THROUGH
//WHAT DATA WILL FRONT END PASS? EMAIL IS A GIVEN, BUT THREAD_ID OR SONG_ID?
//IS IT POSSIBLE FOR FRONT END TO KNOW A GIVEN THREAD_ID
//UPDATE: IT IS POSSIBLE BECAUSE YOU CAN CALL A GET REQUEST FOR SONG_ID TO GET THREAD_ID
router.delete('/participants/:threadID/:userID', async (req, res) => {
    const {threadID, userID} = req.params
    const deleteUserFromThread = await pool.query(
        'DELETE FROM participants WHERE thread_id = $1 AND user_id = $2',
        [threadID, userID]
    )

    res.json({message: `User ${userID} has been deleted from thread ${threadID}`})

    console.log(`User ${userID} has been deleted from thread ${threadID}`)
})


//Get all users in all threads (participants)
router.get('/participants', async (req, res) => {
    try {
        const allParticipants = await pool.query(
            `SELECT participants.participant_id, users.email, participants.thread_id 
            FROM participants INNER JOIN users ON participants.user_id = users.user_id`
        );

        const participantsWithDetails = allParticipants.rows.map(participant => ({
            participant_id: participant.participant_id,
            email: participant.email,
            thread_id: participant.thread_id
        }));

        res.json(participantsWithDetails);
    } catch (err) {
        console.error(err)
    }
})


//Get all users by a given thread_id
router.get('/participants/:threadID', async (req, res) => {
    try {
        const { threadID } = req.params;
        const threadParticipants = await pool.query(
            `SELECT participants.participant_id, users.email, participants.thread_id 
            FROM participants INNER JOIN users ON participants.user_id = users.user_id 
            WHERE participants.thread_id = $1`,
            [threadID]
        );

        const participantsWithDetails = threadParticipants.rows.map(participant => ({
            participant_id: participant.participant_id,
            email: participant.email,
            thread_id: participant.thread_id
        }));

        res.json(participantsWithDetails);
    } catch (err) {
        console.error(err)
    }
})

module.exports = router