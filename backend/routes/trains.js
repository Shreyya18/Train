const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET all trains
router.get('/', async (req, res) => {
    try {
        const [trains] = await db.query('SELECT * FROM trains');
        res.json({
            success: true,
            trains: trains
        });
    } catch (error) {
        console.error('Error fetching trains:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch trains'
        });
    }
});

// SEARCH trains by source, destination, and date
router.post('/search', async (req, res) => {
    try {
        const { source, destination, date } = req.body;

        let query = 'SELECT * FROM trains WHERE 1=1';
        let params = [];

        if (source) {
            query += ' AND source_station LIKE ?';
            params.push(`%${source}%`);
        }

        if (destination) {
            query += ' AND destination_station LIKE ?';
            params.push(`%${destination}%`);
        }

        // You can add date filtering logic here if needed
        // For now, we'll show all matching trains

        const [trains] = await db.query(query, params);

        res.json({
            success: true,
            trains: trains,
            count: trains.length
        });

    } catch (error) {
        console.error('Error searching trains:', error);
        res.status(500).json({
            success: false,
            message: 'Search failed'
        });
    }
});

// GET train by ID
router.get('/:id', async (req, res) => {
    try {
        const [trains] = await db.query(
            'SELECT * FROM trains WHERE train_id = ?',
            [req.params.id]
        );

        if (trains.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Train not found'
            });
        }

        res.json({
            success: true,
            train: trains[0]
        });

    } catch (error) {
        console.error('Error fetching train:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch train'
        });
    }
});

module.exports = router;