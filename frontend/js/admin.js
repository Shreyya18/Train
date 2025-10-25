// Check if user is logged in and is admin
const user = JSON.parse(localStorage.getItem('user'));

if (!user) {
    window.location.href = 'login.html';
} else if (!user.isAdmin) {
    alert('Access denied! Admin only.');
    window.location.href = 'index.html';
} else {
    document.getElementById('adminName').textContent = `Admin: ${user.username}`;
}

// Load data on page load
loadStats();
loadTrains();

// Tab switching
function switchTab(tab) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    if (tab === 'trains') {
        document.getElementById('trainsTab').classList.add('active');
    } else if (tab === 'bookings') {
        document.getElementById('bookingsTab').classList.add('active');
        loadAllBookings();
    }
}

// Load statistics
async function loadStats() {
    try {
        // Get trains count
        const trainsRes = await fetch('http://localhost:3000/api/trains');
        const trainsData = await trainsRes.json();
        document.getElementById('totalTrains').textContent = trainsData.trains?.length || 0;

        // Get bookings
        const bookingsRes = await fetch('http://localhost:3000/api/bookings/all');
        const bookingsData = await bookingsRes.json();
        
        const bookings = bookingsData.bookings || [];
        document.getElementById('totalBookings').textContent = bookings.length;
        
        const activeBookings = bookings.filter(b => b.status === 'confirmed');
        document.getElementById('activeBookings').textContent = activeBookings.length;
        
        const totalRevenue = activeBookings.reduce((sum, b) => sum + parseFloat(b.total_price), 0);
        document.getElementById('totalRevenue').textContent = `₹${totalRevenue.toFixed(2)}`;

    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Load all trains
async function loadTrains() {
    try {
        const response = await fetch('http://localhost:3000/api/trains');
        const data = await response.json();

        if (data.success) {
            displayTrains(data.trains);
        }
    } catch (error) {
        console.error('Error loading trains:', error);
        document.getElementById('trainsList').innerHTML = '<p>Error loading trains</p>';
    }
}

// Display trains in table
function displayTrains(trains) {
    const trainsList = document.getElementById('trainsList');
    
    if (trains.length === 0) {
        trainsList.innerHTML = '<p>No trains found</p>';
        return;
    }

    trainsList.innerHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Train No.</th>
                    <th>Name</th>
                    <th>Route</th>
                    <th>Time</th>
                    <th>Seats</th>
                    <th>Price</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${trains.map(train => `
                    <tr>
                        <td><strong>${train.train_number}</strong></td>
                        <td>${train.train_name}</td>
                        <td>${train.source_station} → ${train.destination_station}</td>
                        <td>${train.departure_time} - ${train.arrival_time}</td>
                        <td>${train.available_seats}/${train.total_seats}</td>
                        <td>₹${train.price_per_seat}</td>
                        <td>
                            <button class="action-btn btn-edit" onclick="editTrain(${train.train_id})">Edit</button>
                            <button class="action-btn btn-delete" onclick="deleteTrain(${train.train_id})">Delete</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Add new train
document.getElementById('addTrainForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const trainData = {
        train_number: document.getElementById('trainNumber').value,
        train_name: document.getElementById('trainName').value,
        source_station: document.getElementById('sourceStation').value,
        destination_station: document.getElementById('destinationStation').value,
        departure_time: document.getElementById('departureTime').value,
        arrival_time: document.getElementById('arrivalTime').value,
        total_seats: document.getElementById('totalSeats').value,
        price_per_seat: document.getElementById('pricePerSeat').value
    };

    try {
        const response = await fetch('http://localhost:3000/api/trains', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(trainData)
        });

        const data = await response.json();

        if (data.success) {
            showMessage('trainMessage', 'Train added successfully!', 'success');
            document.getElementById('addTrainForm').reset();
            loadTrains();
            loadStats();
        } else {
            showMessage('trainMessage', data.message, 'error');
        }

    } catch (error) {
        console.error('Error:', error);
        showMessage('trainMessage', 'Failed to add train', 'error');
    }
});

// Delete train
async function deleteTrain(trainId) {
    if (!confirm('Are you sure you want to delete this train?')) {
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/trains/${trainId}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
            alert('Train deleted successfully!');
            loadTrains();
            loadStats();
        } else {
            alert('Failed to delete train');
        }

    } catch (error) {
        console.error('Error:', error);
        alert('Failed to delete train');
    }
}

// Edit train (placeholder - you can enhance this)
function editTrain(trainId) {
    alert('Edit functionality coming soon! Train ID: ' + trainId);
    // You can add a modal or redirect to edit page
}

// Load all bookings
async function loadAllBookings() {
    try {
        const response = await fetch('http://localhost:3000/api/bookings/all');
        const data = await response.json();

        if (data.success) {
            displayBookings(data.bookings);
        }
    } catch (error) {
        console.error('Error loading bookings:', error);
        document.getElementById('bookingsList').innerHTML = '<p>Error loading bookings</p>';
    }
}

// Display bookings in table
function displayBookings(bookings) {
    const bookingsList = document.getElementById('bookingsList');
    
    if (bookings.length === 0) {
        bookingsList.innerHTML = '<p>No bookings found</p>';
        return;
    }

    bookingsList.innerHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Booking ID</th>
                    <th>User</th>
                    <th>Train</th>
                    <th>Passenger</th>
                    <th>Journey Date</th>
                    <th>Seats</th>
                    <th>Amount</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${bookings.map(booking => `
                    <tr>
                        <td><strong>#${booking.booking_id}</strong></td>
                        <td>${booking.username}<br><small>${booking.email}</small></td>
                        <td>${booking.train_number}<br><small>${booking.train_name}</small></td>
                        <td>${booking.passenger_name}<br><small>${booking.passenger_age}/${booking.passenger_gender}</small></td>
                        <td>${new Date(booking.journey_date).toLocaleDateString('en-IN')}</td>
                        <td>${booking.seat_numbers}</td>
                        <td><strong>₹${parseFloat(booking.total_price).toFixed(2)}</strong></td>
                        <td><span style="color: ${booking.status === 'confirmed' ? 'green' : 'red'}; font-weight: bold;">${booking.status.toUpperCase()}</span></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Show message
function showMessage(elementId, message, type) {
    const messageDiv = document.getElementById(elementId);
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';

    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

// Logout
function logout() {
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}