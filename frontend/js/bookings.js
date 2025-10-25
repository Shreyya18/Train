let currentSeats = 1;
let pricePerSeat = 0;
let maxSeats = 0;
let trainData = null;

// Check if user is logged in
const user = JSON.parse(localStorage.getItem('user'));
if (!user) {
    window.location.href = 'login.html';
}

// Get selected train from URL params
const urlParams = new URLSearchParams(window.location.search);
const trainId = urlParams.get('trainId');

if (!trainId) {
    alert('No train selected!');
    window.location.href = 'search-trains.html';
}

// Try to load from localStorage first (faster)
const cachedTrain = localStorage.getItem('selectedTrain');
if (cachedTrain) {
    trainData = JSON.parse(cachedTrain);
    displayTrainInfo(trainData);
}

// Load train details from API (as backup)
async function loadTrainDetails() {
    try {
        const response = await fetch(`http://localhost:3000/api/trains/${trainId}`);
        const data = await response.json();

        if (data.success) {
            trainData = data.train;
            displayTrainInfo(trainData);
        } else {
            alert('Failed to load train details');
            window.location.href = 'search-trains.html';
        }
    } catch (error) {
        console.error('Error:', error);
        // If cached train exists, continue with that
        if (!cachedTrain) {
            alert('Failed to load train details');
            window.location.href = 'search-trains.html';
        }
    }
}

// Display train info
function displayTrainInfo(train) {
    console.log('Displaying train:', train); // Debug log
    
    document.getElementById('trainNumber').textContent = train.train_number || '--';
    document.getElementById('trainName').textContent = train.train_name || '--';
    document.getElementById('sourceStation').textContent = train.source_station || '--';
    document.getElementById('destinationStation').textContent = train.destination_station || '--';
    document.getElementById('pricePerSeat').textContent = train.price_per_seat || '0';
    document.getElementById('maxSeats').textContent = train.available_seats || '0';

    pricePerSeat = parseFloat(train.price_per_seat) || 0;
    maxSeats = parseInt(train.available_seats) || 0;

    updatePrice();
}

// Set minimum date to today
document.getElementById('journeyDate').min = new Date().toISOString().split('T')[0];

// Change seats count
function changeSeats(delta) {
    const newSeats = currentSeats + delta;
    if (newSeats >= 1 && newSeats <= maxSeats) {
        currentSeats = newSeats;
        document.getElementById('seatsCount').textContent = currentSeats;
        document.getElementById('numSeatsDisplay').textContent = currentSeats;
        updatePrice();
    }
}

// Update total price
function updatePrice() {
    const total = currentSeats * pricePerSeat;
    document.getElementById('totalPrice').textContent = total.toFixed(2);
}

// Handle form submission
document.getElementById('bookingForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const journeyDate = document.getElementById('journeyDate').value;
    const passengerName = document.getElementById('passengerName').value;
    const passengerAge = document.getElementById('passengerAge').value;
    const passengerGender = document.getElementById('passengerGender').value;

    const bookingData = {
        user_id: user.id,
        train_id: trainId,
        journey_date: journeyDate,
        num_seats: currentSeats,
        total_price: (currentSeats * pricePerSeat).toFixed(2),
        seat_numbers: generateSeatNumbers(currentSeats),
        passenger_name: passengerName,
        passenger_age: passengerAge,
        passenger_gender: passengerGender
    };

    await submitBooking(bookingData);
});

// Submit booking
async function submitBooking(bookingData) {
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Processing...';

    try {
        const response = await fetch('http://localhost:3000/api/bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bookingData)
        });

        const data = await response.json();

        if (data.success) {
            showMessage('✅ Booking successful! Redirecting...', 'success');
            
            // Clear selected train
            localStorage.removeItem('selectedTrain');
            
            setTimeout(() => {
                window.location.href = 'my-tickets.html';
            }, 2000);
        } else {
            showMessage(data.message, 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Confirm Booking';
        }

    } catch (error) {
        console.error('Error:', error);
        showMessage('❌ Booking failed. Please try again.', 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Confirm Booking';
    }
}

// Generate seat numbers
function generateSeatNumbers(count) {
    const seats = [];
    for (let i = 1; i <= count; i++) {
        seats.push(`S${i}`);
    }
    return seats.join(', ');
}

// Show message
function showMessage(message, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
}

// Load train details on page load (as backup if localStorage is empty)
if (!cachedTrain) {
    loadTrainDetails();
}