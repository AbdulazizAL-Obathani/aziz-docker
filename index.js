const express = require('express');
const { Pool } = require('pg');
const redis = require('redis');
require('dotenv').config();  // Load environment variables

// Initialize app
const PORT = process.env.PORT || 4800;
const app = express();

// PostgreSQL connection configuration
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'test',
    password: process.env.DB_PASSWORD || '123',
    database: process.env.DB_NAME || 'mydatabase'
});

// Redis connection
const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = process.env.REDIS_PORT || 6379;
const redisClient = redis.createClient({
    host: redisHost,
    port: redisPort
});

redisClient.on('connect', () => {
    console.log('Connected to Redis');
});

redisClient.on('error', (err) => {
    console.error('Failed to connect to Redis', err);
});

// Test PostgreSQL connection
pool.connect()
    .then(client => {
        console.log('Connected to PostgreSQL');
        client.release();
    })
    .catch(err => {
        console.error('Failed to connect to PostgreSQL', err);
    });

// Define a route
app.get('/', (req, res) => {
    redisClient.get('welcome_message', (err, reply) => {
        if (err) {
            res.status(500).send('Error retrieving from Redis');
        } else if (reply) {
            res.send(`<h1>${reply}</h1>`);
        } else {
            const message = 'Hello, World! devops';
            redisClient.set('welcome_message', message);
            res.send(`<h1>${message}</h1>`);
        }
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`App is up and running on port: ${PORT}`);
});
