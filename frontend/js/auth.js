// ==================== Configuration ====================
const API_BASE_URL = 'http://localhost:5000/api'; // Update with your backend URL

// ==================== Navigation Scroll Effect ====================
window.addEventListener('scroll', function() {
    const nav = document.getElementById('mainNav');
    if (window.scrollY > 50) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
});

// ==================== Password Toggle ====================
const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');

if (togglePassword && passwordInput) {
    togglePassword.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        // Toggle icon
        const icon = this.querySelector('i');
        icon.classList.toggle('fa-eye');
        icon.classList.toggle('fa-eye-slash');
    });
}

// ==================== Login Form Handler ====================
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe').checked;
        const loginBtn = document.getElementById('loginBtn');
        const alertContainer = document.getElementById('alertContainer');
        
        // Clear previous alerts
        alertContainer.innerHTML = '';
        
        // Validate inputs
        if (!email || !password) {
            showAlert('Please fill in all fields', 'danger', alertContainer);
            return;
        }
        
        // Validate email format
        if (!isValidEmail(email)) {
            showAlert('Please enter a valid email address', 'danger', alertContainer);
            return;
        }
        
        // Show loading state
        showLoading(loginBtn, 'Signing In...');
        
        try {
            // Make API call
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Store auth token
                if (rememberMe) {
                    localStorage.setItem('authToken', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                } else {
                    sessionStorage.setItem('authToken', data.token);
                    sessionStorage.setItem('user', JSON.stringify(data.user));
                }
                
                showAlert('Login successful! Redirecting...', 'success', alertContainer);
                
                // Redirect based on user role
                setTimeout(() => {
                    if (data.user.role === 'ADMIN') {
                        window.location.href = 'admin/dashboard.html';
                    } else {
                        // Redirect to previous page or home
                        const returnUrl = sessionStorage.getItem('returnUrl') || 'index.html';
                        sessionStorage.removeItem('returnUrl');
                        window.location.href = returnUrl;
                    }
                }, 1500);
                
            } else {
                showAlert(data.message || 'Invalid email or password', 'danger', alertContainer);
                hideLoading(loginBtn, '<i class="fas fa-sign-in-alt"></i> Sign In');
            }
            
        } catch (error) {
            console.error('Login error:', error);
            
            // Demo mode - simulate successful login
            if (email && password) {
                showAlert('Demo Mode: Login successful! Redirecting...', 'info', alertContainer);
                
                // Create demo user
                const demoUser = {
                    id: 1,
                    name: email.split('@')[0],
                    email: email,
                    role: email.includes('admin') ? 'ADMIN' : 'USER'
                };
                
                // Store demo credentials
                localStorage.setItem('authToken', 'demo-token-' + Date.now());
                localStorage.setItem('user', JSON.stringify(demoUser));
                
                setTimeout(() => {
                    if (demoUser.role === 'ADMIN') {
                        window.location.href = 'admin/dashboard.html';
                    } else {
                        window.location.href = 'index.html';
                    }
                }, 1500);
            } else {
                showAlert('Network error. Please try again.', 'danger', alertContainer);
                hideLoading(loginBtn, '<i class="fas fa-sign-in-alt"></i> Sign In');
            }
        }
    });
}

// ==================== Register Form Handler ====================
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const registerBtn = document.getElementById('registerBtn');
        const alertContainer = document.getElementById('alertContainer');
        
        // Clear previous alerts
        alertContainer.innerHTML = '';
        
        // Validate inputs
        if (!name || !email || !password || !confirmPassword) {
            showAlert('Please fill in all fields', 'danger', alertContainer);
            return;
        }
        
        // Validate email format
        if (!isValidEmail(email)) {
            showAlert('Please enter a valid email address', 'danger', alertContainer);
            return;
        }
        
        // Validate password strength
        if (password.length < 6) {
            showAlert('Password must be at least 6 characters long', 'danger', alertContainer);
            return;
        }
        
        // Check if passwords match
        if (password !== confirmPassword) {
            showAlert('Passwords do not match', 'danger', alertContainer);
            return;
        }
        
        // Show loading state
        showLoading(registerBtn, 'Creating Account...');
        
        try {
            // Make API call
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                showAlert('Registration successful! Redirecting to login...', 'success', alertContainer);
                
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
                
            } else {
                showAlert(data.message || 'Registration failed. Please try again.', 'danger', alertContainer);
                hideLoading(registerBtn, '<i class="fas fa-user-plus"></i> Create Account');
            }
            
        } catch (error) {
            console.error('Registration error:', error);
            
            // Demo mode - simulate successful registration
            showAlert('Demo Mode: Registration successful! Redirecting to login...', 'info', alertContainer);
            
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        }
    });
    
    // Real-time password match validation
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');
    
    if (confirmPassword) {
        confirmPassword.addEventListener('input', function() {
            if (this.value && password.value !== this.value) {
                this.setCustomValidity('Passwords do not match');
                this.classList.add('is-invalid');
            } else {
                this.setCustomValidity('');
                this.classList.remove('is-invalid');
            }
        });
    }
}

// ==================== Helper Functions ====================
function showAlert(message, type, container) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    if (container) {
        container.appendChild(alertDiv);
    } else {
        // Create alert at top of page
        alertDiv.style.cssText = 'position: fixed; top: 80px; right: 20px; z-index: 9999; min-width: 300px;';
        document.body.appendChild(alertDiv);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showLoading(button, text) {
    button.disabled = true;
    button.innerHTML = `
        <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        ${text}
    `;
}

function hideLoading(button, originalHTML) {
    button.disabled = false;
    button.innerHTML = originalHTML;
}

function showLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.add('active');
    }
}

function hideLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.remove('active');
    }
}

// ==================== Social Login Handlers ====================
const googleBtn = document.querySelector('.btn-google');
const facebookBtn = document.querySelector('.btn-facebook');

if (googleBtn) {
    googleBtn.addEventListener('click', function() {
        showAlert('Google login integration coming soon!', 'info');
    });
}

if (facebookBtn) {
    facebookBtn.addEventListener('click', function() {
        showAlert('Facebook login integration coming soon!', 'info');
    });
}

// ==================== Forgot Password Handler ====================
const forgotPasswordForm = document.getElementById('forgotPasswordForm');
if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const resetBtn = document.getElementById('resetBtn');
        const alertContainer = document.getElementById('alertContainer');
        
        // Clear previous alerts
        alertContainer.innerHTML = '';
        
        if (!isValidEmail(email)) {
            showAlert('Please enter a valid email address', 'danger', alertContainer);
            return;
        }
        
        showLoading(resetBtn, 'Sending...');
        
        try {
            const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Show success message
                document.querySelector('.auth-card').innerHTML = `
                    <div class="success-message">
                        <div class="success-icon">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <h3>Check Your Email</h3>
                        <p>We've sent password reset instructions to <strong>${email}</strong></p>
                        <p class="text-muted">Didn't receive the email? Check your spam folder or 
                           <a href="#" class="auth-link" onclick="location.reload()">try again</a>
                        </p>
                        <a href="login.html" class="btn btn-gold">Back to Login</a>
                    </div>
                `;
            } else {
                showAlert(data.message || 'Failed to send reset email', 'danger', alertContainer);
                hideLoading(resetBtn, '<i class="fas fa-paper-plane"></i> Send Reset Link');
            }
            
        } catch (error) {
            console.error('Forgot password error:', error);
            
            // Demo mode
            document.querySelector('.auth-card').innerHTML = `
                <div class="success-message">
                    <div class="success-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <h3>Check Your Email</h3>
                    <p>We've sent password reset instructions to <strong>${email}</strong></p>
                    <p class="text-muted">Demo Mode: Email functionality not yet implemented</p>
                    <a href="login.html" class="btn btn-gold">Back to Login</a>
                </div>
            `;
        }
    });
}

// ==================== Check if User is Already Logged In ====================
document.addEventListener('DOMContentLoaded', function() {
    const authToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    const currentPage = window.location.pathname.split('/').pop();
    
    // If user is logged in and on login/register page, redirect to home
    if (authToken && (currentPage === 'login.html' || currentPage === 'register.html')) {
        const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
        
        if (user.role === 'ADMIN') {
            window.location.href = 'admin/dashboard.html';
        } else {
            window.location.href = 'index.html';
        }
    }
});
