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

// ADD new train (Admin only)
router.post('/', async (req, res) => {
    try {
        const {
            train_number,
            train_name,
            source_station,
            destination_station,
            departure_time,
            arrival_time,
            total_seats,
            price_per_seat
        } = req.body;

        const [result] = await db.query(
            `INSERT INTO trains 
            (train_number, train_name, source_station, destination_station, 
            departure_time, arrival_time, total_seats, available_seats, price_per_seat) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [train_number, train_name, source_station, destination_station,
             departure_time, arrival_time, total_seats, total_seats, price_per_seat]
        );

        res.status(201).json({
            success: true,
            message: 'Train added successfully',
            trainId: result.insertId
        });

    } catch (error) {
        console.error('Error adding train:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add train'
        });
    }
});

// UPDATE train (Admin only)
router.put('/:id', async (req, res) => {
    try {
        const {
            train_number,
            train_name,
            source_station,
            destination_station,
            departure_time,
            arrival_time,
            total_seats,
            available_seats,
            price_per_seat
        } = req.body;

        await db.query(
            `UPDATE trains SET 
            train_number = ?, train_name = ?, source_station = ?, 
            destination_station = ?, departure_time = ?, arrival_time = ?, 
            total_seats = ?, available_seats = ?, price_per_seat = ?
            WHERE train_id = ?`,
            [train_number, train_name, source_station, destination_station,
             departure_time, arrival_time, total_seats, available_seats, 
             price_per_seat, req.params.id]
        );

        res.json({
            success: true,
            message: 'Train updated successfully'
        });

    } catch (error) {
        console.error('Error updating train:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update train'
        });
    }
});

// DELETE train (Admin only)
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM trains WHERE train_id = ?', [req.params.id]);

        res.json({
            success: true,
            message: 'Train deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting train:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete train'
        });
    }
});


module.exports = router;