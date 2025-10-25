const express = require('express');
const router = express.Router();
const db = require('../config/db');


// GET all bookings (Admin only)
router.get('/all', async (req, res) => {
    try {
        const [bookings] = await db.query(
            `SELECT b.*, t.train_number, t.train_name, t.source_station, 
            t.destination_station, u.username, u.email
            FROM bookings b
            JOIN trains t ON b.train_id = t.train_id
            JOIN users u ON b.user_id = u.user_id
            ORDER BY b.created_at DESC`
        );

        res.json({
            success: true,
            bookings: bookings,
            count: bookings.length
        });

    } catch (error) {
        console.error('Error fetching all bookings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch bookings'
        });
    }
});


// CREATE new booking
router.post('/', async (req, res) => {
    try {
        const {
            user_id,
            train_id,
            journey_date,
            num_seats,
            total_price,
            seat_numbers,
            passenger_name,
            passenger_age,
            passenger_gender
        } = req.body;

        // Check if enough seats are available
        const [trains] = await db.query(
            'SELECT available_seats FROM trains WHERE train_id = ?',
            [train_id]
        );

        if (trains.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Train not found'
            });
        }

        if (trains[0].available_seats < num_seats) {
            return res.status(400).json({
                success: false,
                message: 'Not enough seats available'
            });
        }

        // Insert booking
        const [result] = await db.query(
            `INSERT INTO bookings 
            (user_id, train_id, booking_date, journey_date, num_seats, total_price, 
            seat_numbers, passenger_name, passenger_age, passenger_gender, status) 
            VALUES (?, ?, CURDATE(), ?, ?, ?, ?, ?, ?, ?, 'confirmed')`,
            [user_id, train_id, journey_date, num_seats, total_price, 
             seat_numbers, passenger_name, passenger_age, passenger_gender]
        );

        // Update available seats
        await db.query(
            'UPDATE trains SET available_seats = available_seats - ? WHERE train_id = ?',
            [num_seats, train_id]
        );

        res.status(201).json({
            success: true,
            message: 'Booking successful',
            bookingId: result.insertId
        });

    } catch (error) {
        console.error('Booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Booking failed'
        });
    }
});

// GET user bookings
router.get('/user/:userId', async (req, res) => {
    try {
        const [bookings] = await db.query(
            `SELECT b.*, t.train_number, t.train_name, t.source_station, 
            t.destination_station, t.departure_time, t.arrival_time
            FROM bookings b
            JOIN trains t ON b.train_id = t.train_id
            WHERE b.user_id = ?
            ORDER BY b.created_at DESC`,
            [req.params.userId]
        );

        res.json({
            success: true,
            bookings: bookings
        });

    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch bookings'
        });
    }
});

// CANCEL booking
router.delete('/:bookingId', async (req, res) => {
    try {
        const bookingId = req.params.bookingId;

        // Get booking details
        const [bookings] = await db.query(
            'SELECT * FROM bookings WHERE booking_id = ?',
            [bookingId]
        );

        if (bookings.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        const booking = bookings[0];

        // Update booking status
        await db.query(
            'UPDATE bookings SET status = "cancelled" WHERE booking_id = ?',
            [bookingId]
        );

        // Return seats to train
        await db.query(
            'UPDATE trains SET available_seats = available_seats + ? WHERE train_id = ?',
            [booking.num_seats, booking.train_id]
        );

        res.json({
            success: true,
            message: 'Booking cancelled successfully'
        });

    } catch (error) {
        console.error('Cancel booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to cancel booking'
        });
    }
});

module.exports = router;