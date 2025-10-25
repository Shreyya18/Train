// Check if user is logged in
const user = JSON.parse(localStorage.getItem('user'));

if (!user) {
    window.location.href = 'login.html';
} else {
    document.getElementById('welcomeUser').textContent = `Welcome, ${user.username}!`;
}

// Load user bookings on page load
loadBookings();

async function loadBookings() {
    const bookingsList = document.getElementById('bookingsList');
    
    try {
        const response = await fetch(`http://localhost:3000/api/bookings/user/${user.id}`);
        const data = await response.json();

        if (data.success) {
            if (data.bookings.length === 0) {
                bookingsList.innerHTML = `
                    <div class="empty-state">
                        <h3>📭 No bookings yet</h3>
                        <p>You haven't booked any tickets yet.</p>
                        <a href="search-trains.html" class="search-new-btn">Search Trains</a>
                    </div>
                `;
            } else {
                displayBookings(data.bookings);
            }
        } else {
            bookingsList.innerHTML = `
                <div class="empty-state">
                    <h3>❌ Error loading bookings</h3>
                    <p>Please try again later</p>
                </div>
            `;
        }

    } catch (error) {
        console.error('Error:', error);
        bookingsList.innerHTML = `
            <div class="empty-state">
                <h3>❌ Error loading bookings</h3>
                <p>Please try again later</p>
            </div>
        `;
    }
}

function displayBookings(bookings) {
    const bookingsList = document.getElementById('bookingsList');
    
    bookingsList.innerHTML = bookings.map(booking => {
        const bookingDate = new Date(booking.booking_date).toLocaleDateString('en-IN');
        const journeyDate = new Date(booking.journey_date).toLocaleDateString('en-IN');
        const statusClass = booking.status.toLowerCase();
        
        return `
            <div class="ticket-card ${statusClass}">
                <div class="ticket-header">
                    <span class="booking-id">Booking ID: #${booking.booking_id}</span>
                    <span class="status-badge ${statusClass}">${booking.status.toUpperCase()}</span>
                </div>

                <div class="train-info">
                    <div class="train-title">
                        <span class="train-number">${booking.train_number}</span>
                        <span class="train-name">${booking.train_name}</span>
                    </div>
                    <div class="route-info">
                        <span><strong>${booking.source_station}</strong></span>
                        <span class="route-arrow">→</span>
                        <span><strong>${booking.destination_station}</strong></span>
                    </div>
                </div>

                <div class="journey-details">
                    <div class="detail-item">
                        <span class="detail-label">Passenger Name</span>
                        <span class="detail-value">${booking.passenger_name}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Age / Gender</span>
                        <span class="detail-value">${booking.passenger_age} / ${booking.passenger_gender}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Journey Date</span>
                        <span class="detail-value">${journeyDate}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Booked On</span>
                        <span class="detail-value">${bookingDate}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Seats</span>
                        <span class="detail-value">${booking.seat_numbers}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Total Fare</span>
                        <span class="detail-value price-tag">₹${parseFloat(booking.total_price).toFixed(2)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Departure</span>
                        <span class="detail-value">${booking.departure_time}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Arrival</span>
                        <span class="detail-value">${booking.arrival_time}</span>
                    </div>
                </div>

                ${booking.status === 'confirmed' ? `
                    <div class="ticket-actions">
                        <button class="cancel-btn" onclick="cancelBooking(${booking.booking_id})">
                            Cancel Booking
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

async function cancelBooking(bookingId) {
    if (!confirm('Are you sure you want to cancel this booking?')) {
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/bookings/${bookingId}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
            alert('✅ Booking cancelled successfully!');
            loadBookings(); // Reload bookings
        } else {
            alert('❌ Failed to cancel booking: ' + data.message);
        }

    } catch (error) {
        console.error('Error:', error);
        alert('❌ Failed to cancel booking. Please try again.');
    }
}

function logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('selectedTrain');
    window.location.href = 'login.html';
}