const express = require('express');
require('dotenv').config();


const app = express();
const port= 3000;

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static('frontend'));

//test database connection
const db = require('./config/db');

async function testDB() {
    try {
        const [results] = await db.query('SELECT 1');
        console.log('Database query succeeded', results);
    } catch (err) {
        console.log('Database query failed', err);
    }
}

testDB();


// API Routes
const authRoutes = require('./routes/auth');
const trainsRoutes= require('./routes/trains');
const bookingsRoutes= require('./routes/bookings');
app.use('/api/auth', authRoutes); 
app.use('/api/trains', trainsRoutes);
app.use('/api/bookings', bookingsRoutes);

app.get('/', (req,res) =>{
    res.send('Hello World!');
})

app.listen(port, ()=>{
    console.log(`Server is running on http://localhost:${port}`);
})