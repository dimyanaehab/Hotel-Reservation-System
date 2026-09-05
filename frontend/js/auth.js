// ==================== Authentication - LumaStay Theme ====================
const authApiUrl = `${window.location.origin}/api/auth`;

async function authError(response, fallback) {
    const text = await response.text();
    if (!text) return fallback;

    try {
        const body = JSON.parse(text);
        return body.message || body.title || fallback;
    } catch {
        return text.replace(/^"|"$/g, '') || fallback;
    }
}

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
        
        try {
            const response = await fetch(`${authApiUrl}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                throw new Error(await authError(response, 'Sign in failed.'));
            }

            const result = await response.json();
            const otherStorage = rememberMe ? sessionStorage : localStorage;
            otherStorage.removeItem('authToken');
            otherStorage.removeItem('user');

            if (rememberMe) {
                localStorage.setItem('authToken', result.token);
                localStorage.setItem('user', JSON.stringify(result.user));
            } else {
                sessionStorage.setItem('authToken', result.token);
                sessionStorage.setItem('user', JSON.stringify(result.user));
            }

            showAlert('Welcome back! Redirecting...', 'success');
            setTimeout(() => {
                if (result.user.role === 'ADMIN') {
                    window.location.href = 'admin/dashboard.html';
                } else {
                    window.location.href = 'index.html';
                }
            }, 600);
        } catch (error) {
            hideLoading(loginBtn);
            showAlert(error.message, 'danger');
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
        
        try {
            const response = await fetch(`${authApiUrl}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });

            if (!response.ok) {
                throw new Error(await authError(response, 'Registration failed.'));
            }

            showAlert('Account created successfully! Redirecting to login...', 'success');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 800);
        } catch (error) {
            hideLoading(registerBtn);
            showAlert(error.message, 'danger');
        }
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
