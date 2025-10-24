document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (data.success) {
            // Save user info to localStorage
            localStorage.setItem('user', JSON.stringify(data.user));
            
            showMessage('Login successful! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = 'search-trains.html';
            }, 1500);
        } else {
            showMessage(data.message, 'error');
        }

    } catch (error) {
        console.error('Error:', error);
        showMessage('Login failed. Please try again.', 'error');
    }
});

function showMessage(message, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
}