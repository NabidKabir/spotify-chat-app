const express = require('express')
const router = express.Router()
const pool = require('../db')

//Add a user to the database
router.post('/users', async (req, res) => {
    try {
        const {email, display_name, spotify_token, current_song_id} = req.body
        const newUser = await pool.query(
            'INSERT INTO users (email, display_name, spotify_token, current_song_id) VALUES($1, $2, $3, $4) RETURNING *',
            [email, display_name, spotify_token, current_song_id]
        )

        res.status(201).json(newUser.rows[0])
        console.log('User added successfully:', newUser.rows[0])
    } catch (err) {
        console.error(err)
    }
})

//Get all users in database
router.get('/users', async (req, res) => {
    try {
        const allUsers = await pool.query("SELECT * FROM users")
        res.json(allUsers.rows)

        const users = allUsers.rows
        const emailList = users.map(user => user.email)
        console.log('Showing all users by email:', emailList)
    }
    catch(err){
        console.error(err)
    }
})

//Get a user by email
router.get('/users/:email', async (req, res) => {
    try {
        const {email} = req.params
        const user = await pool.query(
            'SELECT * from users WHERE email = $1',
            [email]
        )
        res.json(user.rows[0])
        console.log('Showing user: ', user.rows[0].email)
    } catch (err) {
        console.log('Could not find user by given email')
        //console.error(err)
    }
})

//Get threads that a user is apart of by email
//Returns thread_ids from participants
router.get('/users/:email/threads', async (req, res) => {
    try {
        const {email} = req.params
        const threads = await pool.query(
            `SELECT thread_id from participants WHERE 
            user_id = (SELECT user_id FROM users WHERE email = $1)`,
            [email]
        )
        res.json(threads.rows)

        console.log(`Showing all threads that ${email} is apart of: `, threads.rows)
    } catch (err) {
        console.error(err)
    }
})

//Update a user
//--------------DECIDE WHETHER OR NOT TO UPDATE ENTIRE USER OR HAVE TWO
//--------------SEPERATE PUT REQUESTS TO UPDATE BY spotify_token AND current_song_id
//--------------= PROBABLY GO WITH LADDER OPTION
router.put('/users/:email', async (req, res) => {
    try {
        const {email} = req.params
        const {spotify_token, current_song_id} = req.body

        query = 'UPDATE users SET'
        const queryParams = [email]

        if(spotify_token){
            query += ' spotify_token = $2,'
            queryParams.push(spotify_token)
        }

        if(current_song_id){
            query += ' current_song_id = $3,'
            queryParams.push(current_song_id)
        }
        query = query.slice(0, -1)
        query += ' WHERE email = $1 RETURNING *'

        const updateUser = await pool.query(query, queryParams)
        res.json(updateUser.rows[0])

        console.log(`Updated user ${email}`)
    } catch (err) {
        console.error(err)
    }
})

//Delete a user by email
router.delete('/users/:email', async (req, res) => {
    try {
        const {email} = req.params
        const deleteUser = await pool.query(
            'DELETE FROM users WHERE email = $1',
            [email]
        )
        res.json(`User ${email} was deleted`)
        console.log(`User ${email} was deleted`)
    } catch (err) {
        console.error(err)
    }
})



module.exports = router;