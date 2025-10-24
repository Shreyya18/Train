document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    const messageDiv = document.getElementById('message');

    // Validate passwords match
    if (password !== confirmPassword) {
        showMessage('Passwords do not match', 'error');
        return;
    }

    // Validate password length
    if (password.length < 6) {
        showMessage('Password must be at least 6 characters', 'error');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, phone, password })
        });

        const data = await response.json();

        if (data.success) {
            showMessage('Registration successful! Redirecting to login...', 'success');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else {
            showMessage(data.message, 'error');
        }

    } catch (error) {
        console.error('Error:', error);
        showMessage('Registration failed. Please try again.', 'error');
    }
});

function showMessage(message, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
}