// ==================== Authentication - LumaStay Theme ====================

const API_BASE_URL = 'https://localhost:7228/api/auth';

// Password Toggle Functionality
function setupPasswordToggles() {
    const toggleButtons = document.querySelectorAll('.password-toggle');

    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const wrapper = this.parentElement;
            const input = wrapper.querySelector('input');
            const showText = this.querySelector('.show-text');
            const hideText = this.querySelector('.hide-text');

            if (input.type === 'password') {
                input.type = 'text';
                showText.style.display = 'none';
                hideText.style.display = 'inline';
            } else {
                input.type = 'password';
                showText.style.display = 'inline';
                hideText.style.display = 'none';
            }
        });
    });
}

// Show Alert
function showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alertContainer');
    if (!alertContainer) return;

    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    alertContainer.innerHTML = '';
    alertContainer.appendChild(alertDiv);

    // Auto remove after 5 seconds
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

// Validate Email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Show Loading State
function showLoading(button) {
    button.disabled = true;
    button.classList.add('loading');
}

// Hide Loading State
function hideLoading(button) {
    button.disabled = false;
    button.classList.remove('loading');
}

// Helper: Decode JWT to extract roles
function parseJwt(token) {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
}

// ==================== Login Form ====================
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe').checked;
        const loginBtn = document.getElementById('loginBtn');

        if (!isValidEmail(email)) {
            showAlert('Please enter a valid email address', 'danger');
            return;
        }

        showLoading(loginBtn);

        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                const data = await response.json();
                const token = data.token;
                const payload = parseJwt(token);
                
                // .NET ClaimTypes.Role maps to this schema string, or falls back to 'role'
                const role = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || payload.role || 'User';

                if (rememberMe) {
                    localStorage.setItem('authToken', token);
                    localStorage.setItem('userRole', role);
                } else {
                    sessionStorage.setItem('authToken', token);
                    sessionStorage.setItem('userRole', role);
                }

                showAlert('Welcome back! Redirecting...', 'success');

                setTimeout(() => {
                    if (role.toUpperCase() === 'ADMIN') {
                        window.location.href = 'admin/dashboard.html';
                    } else {
                        window.location.href = 'index.html';
                    }
                }, 1000);
            } else {
                hideLoading(loginBtn);
                showAlert('Invalid email or password', 'danger');
            }
        } catch (error) {
            hideLoading(loginBtn);
            showAlert('Network error. Ensure your backend server is running.', 'danger');
        }
    });
}

// ==================== Register Form ====================
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const agreeTerms = document.getElementById('agreeTerms').checked;
        const registerBtn = document.getElementById('registerBtn');

        if (!isValidEmail(email)) {
            showAlert('Please enter a valid email address', 'danger');
            return;
        }

        if (password.length < 6) {
            showAlert('Password must be at least 6 characters', 'danger');
            return;
        }

        if (password !== confirmPassword) {
            showAlert('Passwords do not match', 'danger');
            return;
        }

        if (!agreeTerms) {
            showAlert('Please agree to the terms and conditions', 'danger');
            return;
        }

        showLoading(registerBtn);

        try {
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });

            if (response.ok) {
                showAlert('Account created successfully! Redirecting to login...', 'success');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1500);
            } else {
                hideLoading(registerBtn);
                const errorData = await response.text();
                showAlert(errorData || 'Registration failed. User may already exist.', 'danger');
            }
        } catch (error) {
            hideLoading(registerBtn);
            showAlert('Network error. Ensure your backend server is running.', 'danger');
        }
    });

    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');

    if (confirmPassword) {
        confirmPassword.addEventListener('input', function() {
            if (this.value && password.value !== this.value) {
                this.setCustomValidity('Passwords do not match');
            } else {
                this.setCustomValidity('');
            }
        });
    }
}

// ==================== Forgot Password Form ====================
const forgotPasswordForm = document.getElementById('forgotPasswordForm');
if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const resetBtn = document.getElementById('resetBtn');

        if (!isValidEmail(email)) {
            showAlert('Please enter a valid email address', 'danger');
            return;
        }

        showLoading(resetBtn);

        setTimeout(() => {
            const authCard = document.querySelector('.auth-card');
            authCard.innerHTML = `
                <div class="success-message">
                    <div class="success-icon">✓</div>
                    <h3>Check your email</h3>
                    <p>We've sent password reset instructions to <strong>${email}</strong></p>
                    <p style="color: var(--muted); font-size: 14px;">
                        Didn't receive the email? Check your spam folder or
                        <a href="#" class="text-link" onclick="location.reload()">try again</a>
                    </p>
                    <a href="login.html" class="btn-primary" style="display: inline-block; text-decoration: none; margin-top: 10px;">
                        Back to Sign In
                    </a>
                </div>
            `;
        }, 1500);
    });
}

// ==================== Social Login Handlers ====================
const socialButtons = document.querySelectorAll('.btn-social');
socialButtons.forEach(button => {
    button.addEventListener('click', function(e) {
        e.preventDefault();
        const provider = this.textContent.trim();
        showAlert(`${provider} login coming soon!`, 'info');
    });
});

// ==================== Initialize & Navbar Logic ====================
document.addEventListener('DOMContentLoaded', function() {
    setupPasswordToggles();

    const authToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    const currentPage = window.location.pathname.split('/').pop();
    
    // Check if on login/register page but already authenticated
    if (authToken && (currentPage === 'login.html' || currentPage === 'register.html')) {
        const userRole = localStorage.getItem('userRole') || sessionStorage.getItem('userRole');
        if (userRole && userRole.toUpperCase() === 'ADMIN') {
            window.location.href = 'admin/dashboard.html';
        } else {
            window.location.href = 'index.html';
        }
    }

    // Dynamic Navbar Logout Toggle
    const hostLink = document.querySelector('.host-link');
    if (authToken && hostLink && hostLink.textContent.includes('Sign in')) {
        hostLink.textContent = 'Log out';
        hostLink.href = '#';
        hostLink.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('authToken');
            localStorage.removeItem('userRole');
            sessionStorage.removeItem('authToken');
            sessionStorage.removeItem('userRole');
            window.location.reload();
        });
    }
});