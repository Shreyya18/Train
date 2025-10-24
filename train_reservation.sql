create database train_reservation;
use train_reservation;

-- Users Table
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(15),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trains Table
CREATE TABLE trains (
    train_id INT PRIMARY KEY AUTO_INCREMENT,
    train_number VARCHAR(20) UNIQUE NOT NULL,
    train_name VARCHAR(100) NOT NULL,
    source_station VARCHAR(100) NOT NULL,
    destination_station VARCHAR(100) NOT NULL,
    departure_time TIME NOT NULL,
    arrival_time TIME NOT NULL,
    total_seats INT NOT NULL,
    available_seats INT NOT NULL,
    price_per_seat DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bookings Table
CREATE TABLE bookings (
    booking_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    train_id INT NOT NULL,
    booking_date DATE NOT NULL,
    journey_date DATE NOT NULL,
    num_seats INT NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    status ENUM('confirmed', 'cancelled', 'pending') DEFAULT 'confirmed',
    seat_numbers VARCHAR(255),
    passenger_name VARCHAR(100) NOT NULL,
    passenger_age INT NOT NULL,
    passenger_gender ENUM('male', 'female', 'other') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (train_id) REFERENCES trains(train_id)
);

desc bookings;

-- Insert Sample Trains
INSERT INTO trains (train_number, train_name, source_station, destination_station, departure_time, arrival_time, total_seats, available_seats, price_per_seat) VALUES
('12301', 'Rajdhani Express', 'New Delhi', 'Mumbai', '16:00:00', '08:00:00', 100, 100, 1500.00),
('12302', 'Shatabdi Express', 'Bangalore', 'Chennai', '06:00:00', '11:00:00', 80, 80, 800.00),
('12303', 'Duronto Express', 'Kolkata', 'New Delhi', '20:00:00', '10:00:00', 120, 120, 1800.00),
('12304', 'Garib Rath', 'Mumbai', 'Goa', '22:00:00', '08:00:00', 90, 90, 600.00),
('12305', 'Jan Shatabdi', 'Chennai', 'Hyderabad', '14:00:00', '20:00:00', 100, 100, 500.00);

select * from trains;