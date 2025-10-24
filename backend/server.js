const express = require('express');
require('dotenv').config();
const authRoutes = require('./routes/auth');

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
app.use('/api/auth', authRoutes); 


app.get('/', (req,res) =>{
    res.send('Hello World!');
})

app.listen(port, ()=>{
    console.log(`Server is running on http://localhost:${port}`);
})