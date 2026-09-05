// ==================== Authentication - LumaStay Theme ====================

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
function hideLoading(button, text) {
    button.disabled = false;
    button.classList.remove('loading');
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

        // Validate
        if (!isValidEmail(email)) {
            showAlert('Please enter a valid email address', 'danger');
            return;
        }

        // Show loading
        showLoading(loginBtn);

        // Simulate API call
        setTimeout(() => {
            // Demo mode - create demo user
            const demoUser = {
                id: 1,
                name: email.split('@')[0],
                email: email,
                role: email.includes('admin') ? 'ADMIN' : 'USER'
            };

            // Store credentials
            if (rememberMe) {
                localStorage.setItem('authToken', 'demo-token-' + Date.now());
                localStorage.setItem('user', JSON.stringify(demoUser));
            } else {
                sessionStorage.setItem('authToken', 'demo-token-' + Date.now());
                sessionStorage.setItem('user', JSON.stringify(demoUser));
            }

            showAlert('Welcome back! Redirecting...', 'success');

            setTimeout(() => {
                if (demoUser.role === 'ADMIN') {
                    window.location.href = 'admin/dashboard.html';
                } else {
                    window.location.href = 'index.html';
                }
            }, 1000);
        }, 1500);
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

        // Validate
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

        // Show loading
        showLoading(registerBtn);

        // Simulate API call
        setTimeout(() => {
            showAlert('Account created successfully! Redirecting to login...', 'success');

            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
        }, 1500);
    });

    // Real-time password match validation
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

        // Simulate API call
        setTimeout(() => {
            // Show success message
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

// ==================== Initialize ====================
document.addEventListener('DOMContentLoaded', function() {
    setupPasswordToggles();

    // Check if already logged in
    const authToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    const currentPage = window.location.pathname.split('/').pop();

    if (authToken && (currentPage === 'login.html' || currentPage === 'register.html')) {
        const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');

        if (user.role === 'ADMIN') {
            window.location.href = 'admin/dashboard.html';
        } else {
            window.location.href = 'index.html';
        }
    }
});
