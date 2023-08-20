CREATE DATABASE songchatapp;

CREATE TABLE users(
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(100) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    spotify_token VARCHAR(200) NOT NULL,
    current_song_id VARCHAR(100) NOT NULL
);

CREATE TABLE threads(
    thread_id SERIAL PRIMARY KEY,
    song_id VARCHAR(100)
);

CREATE TABLE participants(
    participant_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id),
    thread_id INT REFERENCES threads(thread_id)
);

/* BE CAREFUL CODE IS WRITTEN SO THAT EMAIL MUST BE GIVEN AND NOT SENDER_ID*/
CREATE TABLE messages(
    message_id SERIAL PRIMARY KEY,
    sender_id INT REFERENCES users(user_id),
    thread_id INT REFERENCES threads(thread_id),
    content TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);