// Check if user is logged in
const user = JSON.parse(localStorage.getItem('user'));

if (!user) {
    // Redirect to login if not logged in
    window.location.href = 'login.html';
} else {
    // Display welcome message
    document.getElementById('welcomeUser').textContent = `Welcome, ${user.username}!`;
}

// Set minimum date to today
document.getElementById('date').min = new Date().toISOString().split('T')[0];

// Search form handler
document.getElementById('searchForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const source = document.getElementById('source').value;
    const destination = document.getElementById('destination').value;
    const date = document.getElementById('date').value;

    await searchTrains(source, destination, date);
});

// Search trains function
async function searchTrains(source, destination, date) {
    const resultsSection = document.getElementById('resultsSection');
    const trainsList = document.getElementById('trainsList');
    const trainCount = document.getElementById('trainCount');

    // Show loading
    trainsList.innerHTML = '<div class="loading">🔍 Searching trains...</div>';
    resultsSection.style.display = 'block';

    try {
        const response = await fetch('http://localhost:3000/api/trains/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ source, destination, date })
        });

        const data = await response.json();

        if (data.success && data.trains.length > 0) {
            trainCount.textContent = data.count;
            displayTrains(data.trains);
        } else {
            trainsList.innerHTML = `
                <div class="no-results">
                    <h3>😔 No trains found</h3>
                    <p>Try different source or destination</p>
                </div>
            `;
        }

    } catch (error) {
        console.error('Error:', error);
        trainsList.innerHTML = `
            <div class="no-results">
                <h3>❌ Error searching trains</h3>
                <p>Please try again later</p>
            </div>
        `;
    }
}

// Display trains
function displayTrains(trains) {
    const trainsList = document.getElementById('trainsList');
    
    trainsList.innerHTML = trains.map(train => `
        <div class="train-card">
            <div class="train-info">
                <div class="train-header">
                    <span class="train-number">${train.train_number}</span>
                    <span class="train-name">${train.train_name}</span>
                </div>
                <div class="train-route">
                    <span>${train.source_station}</span>
                    <span class="route-arrow">→</span>
                    <span>${train.destination_station}</span>
                </div>
                <div class="train-timing">
                    <span>🕐 Departure: ${train.departure_time}</span>
                    <span>🕐 Arrival: ${train.arrival_time}</span>
                </div>
            </div>
            <div class="train-details">
                <div class="price">₹${train.price_per_seat}</div>
                <div class="seats-available">
                    ${train.available_seats} seats available
                </div>
                <button class="book-btn" onclick="bookTrain(${train.train_id}, '${train.train_name}')">
                    Book Now
                </button>
            </div>
        </div>
    `).join('');
}

// Book train function (placeholder for now)
function bookTrain(trainId, trainName) {
    // Store selected train in localStorage
    const selectedTrain = {
        id: trainId,
        name: trainName
    };
    localStorage.setItem('selectedTrain', JSON.stringify(selectedTrain));
    
    // Redirect to booking page (we'll create this next)
    alert(`Booking page coming soon for train: ${trainName}`);
    // window.location.href = 'booking.html';
}

// Logout function
function logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('selectedTrain');
    window.location.href = 'login.html';
}